import { describe, it, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import auth from '../src/middleware/auth.js'
import User from '../src/models/user.js'

describe('Authentication Middleware (auth.js)', () => {
    const TEST_SECRET = 'test_jwt_secret_key_12345'
    const testUserId = new mongoose.Types.ObjectId().toString()

    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET
    })

    it('should reject requests with missing token (401)', async () => {
        const req = { cookies: {}, headers: {} }
        let errorResult = null

        await auth(req, {}, (err) => {
            errorResult = err
        })

        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 401)
        assert.equal(errorResult.message, 'Token not found')
    })

    it('should reject malformed Authorization header (401)', async () => {
        const req = { cookies: {}, headers: { authorization: 'Basic 12345' } }
        let errorResult = null

        await auth(req, {}, (err) => {
            errorResult = err
        })

        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 401)
        assert.equal(errorResult.message, 'Invalid token format')
    })

    it('should reject invalid JWT signature (401)', async () => {
        const req = { cookies: { token: 'invalid.token.signature' }, headers: {} }
        let errorResult = null

        await auth(req, {}, (err) => {
            errorResult = err
        })

        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 401)
        assert.equal(errorResult.message, 'Invalid token')
    })

    it('should reject expired JWT (401)', async () => {
        const expiredToken = jwt.sign(
            { _id: testUserId, version: 0 },
            TEST_SECRET,
            { expiresIn: '-1s' }
        )
        const req = { cookies: { token: expiredToken }, headers: {} }
        let errorResult = null

        await auth(req, {}, (err) => {
            errorResult = err
        })

        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 401)
        assert.equal(errorResult.message, 'jwt expired')
    })

    it('should reject if JWT_SECRET is missing from server configuration (500)', async () => {
        delete process.env.JWT_SECRET
        const validToken = jwt.sign({ _id: testUserId, version: 0 }, TEST_SECRET)
        const req = { cookies: { token: validToken }, headers: {} }
        let errorResult = null

        await auth(req, {}, (err) => {
            errorResult = err
        })

        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 500)
    })

    it('should reject if user is not found in database (401)', async () => {
        const validToken = jwt.sign({ _id: testUserId, version: 0 }, TEST_SECRET)
        const req = { cookies: { token: validToken }, headers: {} }
        let errorResult = null

        const findByIdMock = mock.method(User, 'findById', async () => null)

        await auth(req, {}, (err) => {
            errorResult = err
        })

        findByIdMock.mock.restore()
        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 401)
        assert.equal(errorResult.message, "User doesn't exist")
    })

    it('should reject suspended user account with 403 Forbidden', async () => {
        const validToken = jwt.sign({ _id: testUserId, version: 0 }, TEST_SECRET)
        const req = { cookies: { token: validToken }, headers: {} }
        let errorResult = null

        const suspendedUser = {
            _id: testUserId,
            userName: 'suspended_user',
            accountStatus: 'suspended',
            refreshTokenVersion: 0
        }

        const findByIdMock = mock.method(User, 'findById', async () => suspendedUser)

        await auth(req, {}, (err) => {
            errorResult = err
        })

        findByIdMock.mock.restore()
        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 403)
        assert.equal(errorResult.message, 'Account is suspended')
    })

    it('should reject deleted user account with 403 Forbidden', async () => {
        const validToken = jwt.sign({ _id: testUserId, version: 0 }, TEST_SECRET)
        const req = { cookies: { token: validToken }, headers: {} }
        let errorResult = null

        const deletedUser = {
            _id: testUserId,
            userName: 'deleted_user',
            accountStatus: 'deleted',
            refreshTokenVersion: 0
        }

        const findByIdMock = mock.method(User, 'findById', async () => deletedUser)

        await auth(req, {}, (err) => {
            errorResult = err
        })

        findByIdMock.mock.restore()
        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 403)
        assert.equal(errorResult.message, 'Account has been deleted')
    })

    it('should reject token with mismatched refreshTokenVersion (401)', async () => {
        const oldToken = jwt.sign({ _id: testUserId, version: 1 }, TEST_SECRET)
        const req = { cookies: { token: oldToken }, headers: {} }
        let errorResult = null

        const updatedUser = {
            _id: testUserId,
            userName: 'active_user',
            accountStatus: 'active',
            refreshTokenVersion: 2 // Version bumped, e.g. after password change
        }

        const findByIdMock = mock.method(User, 'findById', async () => updatedUser)

        await auth(req, {}, (err) => {
            errorResult = err
        })

        findByIdMock.mock.restore()
        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 401)
        assert.equal(errorResult.message, 'Token has been invalidated')
    })

    it('should allow active user with valid token and attach user to req', async () => {
        const validToken = jwt.sign({ _id: testUserId, version: 1 }, TEST_SECRET)
        const req = { cookies: { token: validToken }, headers: {} }
        let nextCalled = false
        let errorResult = null

        const activeUser = {
            _id: testUserId,
            userName: 'active_user',
            accountStatus: 'active',
            refreshTokenVersion: 1
        }

        const findByIdMock = mock.method(User, 'findById', async () => activeUser)

        await auth(req, {}, (err) => {
            if (err) errorResult = err
            else nextCalled = true
        })

        findByIdMock.mock.restore()
        assert.equal(errorResult, null)
        assert.equal(nextCalled, true)
        assert.equal(req.user, activeUser)
        assert.equal(req.token, validToken)
    })
})
