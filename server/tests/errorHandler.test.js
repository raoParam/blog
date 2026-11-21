import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import errorHandler, { scrubSensitiveData } from '../src/middleware/errorHandler.js'

function createMockRes() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            res.statusCode = code
            return res
        },
        json(data) {
            res.body = data
            return res
        }
    }
    return res
}

describe('Centralized Error Handler & Sanitization (errorHandler.js)', () => {
    describe('scrubSensitiveData', () => {
        it('should redact values for password parameters', () => {
            assert.equal(scrubSensitiveData('/api/user?password=my_secret_pwd'), '/api/user?password=***')
            assert.equal(scrubSensitiveData('{"password": "confidential123"}'), '{"password": "***"}')
            assert.equal(scrubSensitiveData('new_password=another_pwd&currentPassword=old_pwd'), 'new_password=***&currentPassword=***')
        })

        it('should redact values for secret parameters', () => {
            assert.equal(scrubSensitiveData('/api/oauth?client_secret=top_secret_value'), '/api/oauth?client_secret=***')
            assert.equal(scrubSensitiveData('secret=my_app_secret'), 'secret=***')
            assert.equal(scrubSensitiveData('{"jwt_secret": "my_jwt_key"}'), '{"jwt_secret": "***"}')
        })

        it('should redact values for key parameters', () => {
            assert.equal(scrubSensitiveData('/api/data?key=sample_key_123'), '/api/data?key=***')
            assert.equal(scrubSensitiveData('apiKey=secret_api_key_456'), 'apiKey=***')
            assert.equal(scrubSensitiveData('{"api_key": "raw_secret_key"}'), '{"api_key": "***"}')
        })

        it('should redact values for token parameters', () => {
            assert.equal(scrubSensitiveData('/api/auth?token=raw_token_xyz'), '/api/auth?token=***')
            assert.equal(scrubSensitiveData('accessToken=acc_tok_123&refreshToken=ref_tok_456'), 'accessToken=***&refreshToken=***')
            assert.equal(scrubSensitiveData('{"csrf_token": "csrf_val_789"}'), '{"csrf_token": "***"}')
        })

        it('should redact values for auth parameters', () => {
            assert.equal(scrubSensitiveData('/api/webhook?auth=auth_code_999'), '/api/webhook?auth=***')
            assert.equal(scrubSensitiveData('authToken=bearer_val_111'), 'authToken=***')
            assert.equal(scrubSensitiveData('{"authorization": "basic_creds"}'), '{"authorization": "***"}')
        })

        it('should redact standard and opaque Bearer authorization tokens', () => {
            assert.equal(scrubSensitiveData('Authorization: Bearer eyJhbGciOi.eyJzdWIiOi.signature'), 'Authorization: Bearer ***')
            assert.equal(scrubSensitiveData('Bearer opaque_token_without_dots'), 'Bearer ***')
        })

        it('should redact standard and srv MongoDB connection string credentials', () => {
            assert.equal(scrubSensitiveData('mongodb+srv://admin:MyPass123!@cluster0.mongodb.net/prod_db'), 'mongodb+srv://***:***@cluster0.mongodb.net/prod_db')
            assert.equal(scrubSensitiveData('mongodb://user:pass@localhost:27017/blog'), 'mongodb://***:***@localhost:27017/blog')
        })

        it('should handle non-string and empty inputs gracefully', () => {
            assert.equal(scrubSensitiveData(null), '')
            assert.equal(scrubSensitiveData(undefined), '')
            assert.equal(scrubSensitiveData(12345), '')
        })
    })

    describe('errorHandler middleware', () => {
        it('should format Mongoose ValidationError with 400 Bad Request and clean field messages', () => {
            const valErr = new Error('Validation failed')
            valErr.name = 'ValidationError'
            valErr.errors = {
                title: { message: 'Title is required' },
                content: { message: 'Content must be at least 10 characters' }
            }

            const res = createMockRes()
            errorHandler(valErr, { method: 'POST', originalUrl: '/api/post' }, res, () => {})

            assert.equal(res.statusCode, 400)
            assert.equal(res.body.status, 'failed')
            assert.ok(res.body.message.includes('Title is required'))
            assert.ok(res.body.message.includes('Content must be at least 10 characters'))
        })

        it('should format Mongoose CastError with 400 Bad Request and clean resource identifier message', () => {
            const castErr = new Error('Cast to ObjectId failed')
            castErr.name = 'CastError'
            castErr.path = 'postId'
            castErr.value = 'invalid_id_123'

            const res = createMockRes()
            errorHandler(castErr, { method: 'GET', originalUrl: '/api/post/invalid_id_123' }, res, () => {})

            assert.equal(res.statusCode, 400)
            assert.equal(res.body.status, 'failed')
            assert.equal(res.body.message, 'Invalid identifier format for postId')
        })

        it('should format MongoDB duplicate key error (code 11000) with 409 Conflict', () => {
            const dupErr = new Error('E11000 duplicate key error')
            dupErr.code = 11000
            dupErr.keyValue = { emailId: 'test@example.com' }

            const res = createMockRes()
            errorHandler(dupErr, { method: 'POST', originalUrl: '/api/auth/register' }, res, () => {})

            assert.equal(res.statusCode, 409)
            assert.equal(res.body.status, 'failed')
            assert.equal(res.body.message, 'A record with this emailId already exists')
        })

        it('should format Multer LIMIT_FILE_SIZE error with 400 Bad Request', () => {
            const multerErr = new Error('File too large')
            multerErr.name = 'MulterError'
            multerErr.code = 'LIMIT_FILE_SIZE'

            const res = createMockRes()
            errorHandler(multerErr, { method: 'POST', originalUrl: '/api/post' }, res, () => {})

            assert.equal(res.statusCode, 400)
            assert.equal(res.body.status, 'failed')
            assert.equal(res.body.message, 'Uploaded file exceeds the maximum allowed size limit')
        })

        it('should format JSON SyntaxError parse error with 400 Bad Request', () => {
            const syntaxErr = new SyntaxError('Unexpected token in JSON')
            syntaxErr.status = 400
            syntaxErr.body = '{"bad": }'

            const res = createMockRes()
            errorHandler(syntaxErr, { method: 'POST', originalUrl: '/api/post' }, res, () => {})

            assert.equal(res.statusCode, 400)
            assert.equal(res.body.status, 'failed')
            assert.equal(res.body.message, 'Malformed JSON in request body')
        })

        it('should sanitize req.originalUrl before writing to server logs covering password, secret, key, token, and auth', () => {
            let loggedMessage = ''
            const originalConsoleError = console.error
            console.error = (...args) => {
                loggedMessage = args.join(' ')
            }

            try {
                const err = new Error('Something failed')
                err.statusCode = 400
                const req = {
                    method: 'GET',
                    originalUrl: '/api/auth/verify?token=leak_token_123&password=mysecretpassword&client_secret=sec_val&apiKey=key_val&auth=auth_val&safeParam=allowed'
                }
                const res = createMockRes()
                errorHandler(err, req, res, () => {})

                assert.ok(loggedMessage.includes('/api/auth/verify?token=***&password=***&client_secret=***&apiKey=***&auth=***&safeParam=allowed'))
                assert.equal(loggedMessage.includes('leak_token_123'), false)
                assert.equal(loggedMessage.includes('mysecretpassword'), false)
                assert.equal(loggedMessage.includes('sec_val'), false)
                assert.equal(loggedMessage.includes('key_val'), false)
                assert.equal(loggedMessage.includes('auth_val'), false)
                assert.ok(loggedMessage.includes('safeParam=allowed'))
            } finally {
                console.error = originalConsoleError
            }
        })

        it('should mask 500 internal errors in production mode (NODE_ENV=production)', () => {
            const prevEnv = process.env.NODE_ENV
            process.env.NODE_ENV = 'production'

            const internalErr = new Error('MongoServerSelectionError: connection refused mongodb+srv://admin:supersecret@atlas.cluster')
            internalErr.statusCode = 500

            const res = createMockRes()
            errorHandler(internalErr, { method: 'GET', originalUrl: '/api/posts' }, res, () => {})

            process.env.NODE_ENV = prevEnv

            assert.equal(res.statusCode, 500)
            assert.equal(res.body.status, 'failed')
            assert.equal(res.body.message, 'Internal Server Error')
            assert.equal(res.body.message.includes('mongodb+srv'), false)
            assert.equal(res.body.message.includes('supersecret'), false)
        })

        it('should scrub credentials from error messages even in development mode', () => {
            const prevEnv = process.env.NODE_ENV
            process.env.NODE_ENV = 'development'

            const devErr = new Error('Failed connecting to mongodb+srv://param:MySecretPassword123@cluster.mongodb.net/db')
            devErr.statusCode = 500

            const res = createMockRes()
            errorHandler(devErr, { method: 'GET', originalUrl: '/api/posts' }, res, () => {})

            process.env.NODE_ENV = prevEnv

            assert.equal(res.statusCode, 500)
            assert.equal(res.body.message.includes('MySecretPassword123'), false, 'Credentials must be scrubbed')
            assert.ok(res.body.message.includes('mongodb+srv://***:***@'))
        })
    })
})
