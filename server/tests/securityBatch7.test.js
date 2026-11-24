import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import errorHandler, { scrubSensitiveData } from '../src/middleware/errorHandler.js'

function mockResponse() {
    return {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this },
        json(body) { this.body = body; return this }
    }
}

describe('Batch 7: error handling and secret sanitization', () => {
    it('redacts escaped quotes and backslashes in JSON string values without leaking suffixes', () => {
        const input = String.raw`{"password":"pass\"word\\with\\backslashes","role":"admin"}`
        const output = scrubSensitiveData(input)
        assert.equal(output, String.raw`{"password":"***","role":"admin"}`)
        assert.equal(output.includes('backslashes'), false)
    })

    it('redacts multiple sensitive JSON properties on one line and preserves ordinary fields', () => {
        const input = '{"id":101,"password":"first secret","apiKey":"second secret","author":"Param","role":"admin"}'
        const output = scrubSensitiveData(input)
        assert.equal(output, '{"id":101,"password":"***","apiKey":"***","author":"Param","role":"admin"}')
    })

    it('redacts quoted multi-word assignments in logs', () => {
        assert.equal(
            scrubSensitiveData('password="my secret phrase" authToken=\'bearer token with spaces\''),
            'password="***" authToken=\'***\''
        )
    })

    it('redacts URL-encoded keys case-insensitively without consuming adjacent parameters', () => {
        const input = '/route?token%3dsuperSecret%26scope%3dpublic%26apiKey%3dmyKey%26page%3d1'
        const output = scrubSensitiveData(input)
        assert.equal(output, '/route?token%3d***%26scope%3dpublic%26apiKey%3d***%26page%3d1')
    })

    it('redacts ordinary query assignments and preserves following parameters', () => {
        assert.equal(scrubSensitiveData('/route?accessToken=abc123&scope=public&page=1'), '/route?accessToken=***&scope=public&page=1')
    })

    it('redacts MongoDB credentials and bearer tokens', () => {
        assert.equal(scrubSensitiveData('mongodb+srv://user:pass@host/db'), 'mongodb+srv://***:***@host/db')
        assert.equal(scrubSensitiveData('Authorization: Bearer abc.def.ghi'), 'Authorization: Bearer ***')
    })

    it('does not redact ordinary author or authority fields', () => {
        const input = '{"author":"Alice","authority":"moderator","authenticate":true}'
        assert.equal(scrubSensitiveData(input), input)
    })

    it('handles null, undefined, and primitive errors without throwing', () => {
        for (const err of [null, undefined, 42, 'database password=secret']) {
            const res = mockResponse()
            assert.doesNotThrow(() => errorHandler(err, {}, res, () => {}))
            assert.equal(res.statusCode, 500)
            assert.equal(res.body.status, 'failed')
        }
    })

    it('falls back to 500 for invalid status codes', () => {
        const err = new Error('bad status')
        err.statusCode = 9999
        const res = mockResponse()
        errorHandler(err, {}, res, () => {})
        assert.equal(res.statusCode, 500)
    })

    it('redacts standalone key and auth parameters while preserving ordinary author fields', () => {
        assert.equal(scrubSensitiveData('/api/data?key=sample_key_123'), '/api/data?key=***')
        assert.equal(scrubSensitiveData('/api/webhook?auth=auth_code_999'), '/api/webhook?auth=***')
        assert.equal(scrubSensitiveData('/api/data?apiKey=abc&client_key=def&authToken=ghi&auth_token=jkl'), '/api/data?apiKey=***&client_key=***&authToken=***&auth_token=***')
        assert.equal(scrubSensitiveData('author=Param authority=admin authenticate=true'), 'author=Param authority=admin authenticate=true')
    })

    it('does not allow unmatched quotes to cross literal newline boundaries and consume subsequent log lines', () => {
        const input = 'level=error password="unmatched-quote-without-closing\nlevel=info user="alice" status="active"'
        const output = scrubSensitiveData(input)
        assert.ok(output.includes('level=info user="alice" status="active"'), 'Subsequent log line must be preserved')
        assert.ok(output.includes('unmatched-quote-without-closing'), 'Unmatched quote cannot match across newline')
    })

    it('preserves escaped \\n and \\r sequences inside strings and redacts accurately', () => {
        const input = String.raw`{"password":"secret\nwith\rescape","role":"user"}`
        const output = scrubSensitiveData(input)
        assert.equal(output, String.raw`{"password":"***","role":"user"}`)
    })
})
