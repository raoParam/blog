import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import errorHandler from '../src/middleware/errorHandler.js'

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

describe('Centralized Error Handler (errorHandler.js)', () => {
    it('should format Mongoose ValidationError with 400 Bad Request', () => {
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

    it('should format Mongoose CastError with 400 Bad Request', () => {
        const castErr = new Error('Cast failed')
        castErr.name = 'CastError'
        castErr.path = 'postId'
        castErr.value = 'invalid_id_123'

        const res = createMockRes()
        errorHandler(castErr, { method: 'GET', originalUrl: '/api/post/invalid_id_123' }, res, () => {})

        assert.equal(res.statusCode, 400)
        assert.equal(res.body.status, 'failed')
        assert.equal(res.body.message, 'Invalid postId: invalid_id_123')
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

    it('should mask internal error message in production mode (500)', () => {
        const prevEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'production'

        const internalErr = new Error('MongoServerSelectionError: connection refused mongodb+srv://admin:secret@atlas')
        internalErr.statusCode = 500

        const res = createMockRes()
        errorHandler(internalErr, { method: 'GET', originalUrl: '/api/posts' }, res, () => {})

        process.env.NODE_ENV = prevEnv

        assert.equal(res.statusCode, 500)
        assert.equal(res.body.status, 'failed')
        assert.equal(res.body.message, 'Internal Server Error')
        // Ensure sensitive connection strings/passwords are NOT leaked to client
        assert.equal(res.body.message.includes('mongodb+srv'), false)
        assert.equal(res.body.message.includes('secret'), false)
    })
})
