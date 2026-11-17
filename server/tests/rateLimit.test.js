import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { authLimiter } from '../src/routes/auth.routes.js'

describe('Authentication Rate Limiting', () => {
    it('should allow requests within limit and block with 429 once limit is exceeded', async () => {
        const app = express()
        app.use(express.json())

        app.post('/api/auth/login-test', authLimiter, (req, res) => {
            res.status(200).json({ status: 'success' })
        })

        const server = app.listen(0)
        const port = server.address().port

        try {
            let lastStatus = 200
            let lastBody = null

            // Send requests up to limit + 1
            for (let i = 0; i < 21; i++) {
                const response = await fetch(`http://127.0.0.1:${port}/api/auth/login-test`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emailId: 'test@example.com', password: 'pass' })
                })
                lastStatus = response.status
                lastBody = await response.json()
            }

            // The 21st request must trigger 429 Too Many Requests
            assert.equal(lastStatus, 429, 'Excess request must return status 429')
            assert.equal(lastBody.status, 'failed')
            assert.ok(lastBody.message.includes('Too many authentication attempts'))
        } finally {
            server.close()
        }
    })
})
