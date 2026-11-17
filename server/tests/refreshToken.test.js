import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { 
    hashToken, 
    generateRefreshToken, 
    verifyRefreshToken, 
    logoutUser 
} from '../src/services/auth.service.js'
import RefreshToken from '../src/models/refreshToken.js'

describe('Refresh Token Hashing at Rest', () => {
    const TEST_SECRET = 'test_jwt_secret_refresh_key'
    const testUserId = new mongoose.Types.ObjectId()

    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET
    })

    it('should compute valid 64-character SHA-256 hex digest', () => {
        const raw = 'my-sample-refresh-token'
        const digest = hashToken(raw)

        assert.equal(typeof digest, 'string')
        assert.equal(digest.length, 64)
        assert.equal(/^[a-f0-9]{64}$/.test(digest), true)
        // Deterministic digest
        assert.equal(digest, hashToken(raw))
    })

    it('should store SHA-256 digest in database and return raw token to client', async () => {
        const user = {
            _id: testUserId,
            refreshTokenVersion: 1
        }

        let savedDoc = null
        const createMock = mock.method(RefreshToken, 'create', async (doc) => {
            savedDoc = doc
            return doc
        })

        const rawToken = await generateRefreshToken(user, 'Chrome on Windows', '127.0.0.1')

        createMock.mock.restore()

        assert.ok(rawToken, 'Must return raw token string to caller')
        assert.ok(savedDoc, 'Must save document to DB')
        assert.notEqual(savedDoc.token, rawToken, 'Saved token in DB must NOT match raw token')
        assert.equal(savedDoc.token, hashToken(rawToken), 'Saved token in DB must be the SHA-256 digest')
        assert.equal(savedDoc.token.length, 64)
    })

    it('should lookup token by SHA-256 digest in verifyRefreshToken', async () => {
        const user = {
            _id: testUserId,
            refreshTokenVersion: 1
        }

        const rawToken = jwt.sign(
            { _id: user._id, version: user.refreshTokenVersion },
            TEST_SECRET + user.refreshTokenVersion
        )

        let queryUsed = null
        const mockRecord = {
            token: hashToken(rawToken),
            user,
            isValid: true,
            expiresAt: new Date(Date.now() + 100000),
            save: async () => {}
        }

        const findOneMock = mock.method(RefreshToken, 'findOne', (query) => {
            queryUsed = query
            return {
                populate: async () => mockRecord
            }
        })

        const result = await verifyRefreshToken(rawToken)

        findOneMock.mock.restore()

        assert.ok(queryUsed)
        assert.deepEqual(queryUsed.$or, [
            { token: hashToken(rawToken) },
            { token: rawToken }
        ], 'Query must look up by hash with backward-compatibility for unhashed tokens')
        assert.equal(result.user, user)
    })

    it('should support legacy unhashed tokens for smooth migration of active sessions', async () => {
        const user = {
            _id: testUserId,
            refreshTokenVersion: 2
        }

        const rawLegacyToken = jwt.sign(
            { _id: user._id, version: user.refreshTokenVersion },
            TEST_SECRET + user.refreshTokenVersion
        )

        // Simulate an existing session created before hashing was enabled
        const legacyRecord = {
            token: rawLegacyToken,
            user,
            isValid: true,
            expiresAt: new Date(Date.now() + 100000),
            save: async () => {}
        }

        const findOneMock = mock.method(RefreshToken, 'findOne', () => ({
            populate: async () => legacyRecord
        }))

        const result = await verifyRefreshToken(rawLegacyToken)

        findOneMock.mock.restore()

        assert.equal(result.user, user)
        assert.equal(result.refreshToken.token, rawLegacyToken)
    })

    it('should invalidate token by hash on logout', async () => {
        const rawToken = 'sample-logout-token'
        let updateQuery = null

        const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', async (query) => {
            updateQuery = query
            return { isValid: false }
        })

        await logoutUser(testUserId, rawToken)

        findOneAndUpdateMock.mock.restore()

        assert.ok(updateQuery)
        assert.deepEqual(updateQuery.$or, [
            { token: hashToken(rawToken) },
            { token: rawToken }
        ])
    })
})
