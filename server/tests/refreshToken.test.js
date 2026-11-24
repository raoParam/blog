import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import {
    hashToken,
    generateRefreshToken,
    verifyRefreshToken,
    refreshAccessToken,
    logoutUser,
    loginUser
} from '../src/services/auth.service.js'
import RefreshToken from '../src/models/refreshToken.js'
import User from '../src/models/user.js'

describe('Refresh Token Hashing, Atomic Rotation & Account Status', () => {
    const TEST_SECRET = 'test_jwt_secret_refresh_key'
    const testUserId = new mongoose.Types.ObjectId()
    const otherUserId = new mongoose.Types.ObjectId()

    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET
        process.env.SALT_ROUNDS = '10'
    })

    describe('Hash at Rest', () => {
        it('should compute valid 64-character SHA-256 hex digest', () => {
            const raw = 'my-sample-refresh-token'
            const digest = hashToken(raw)

            assert.equal(typeof digest, 'string')
            assert.equal(digest.length, 64)
            assert.equal(/^[a-f0-9]{64}$/.test(digest), true)
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
                accountStatus: 'active',
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
            ])
            assert.equal(result.user, user)
        })

        it('should support legacy unhashed tokens for smooth migration of active sessions', async () => {
            const user = {
                _id: testUserId,
                accountStatus: 'active',
                refreshTokenVersion: 2
            }

            const rawLegacyToken = jwt.sign(
                { _id: user._id, version: user.refreshTokenVersion },
                TEST_SECRET + user.refreshTokenVersion
            )

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
    })

    describe('Atomic Refresh Token Rotation (Concurrency Control)', () => {
        it('should allow only one concurrent request to claim and rotate a refresh token', async () => {
            const user = {
                _id: testUserId,
                userName: 'concurrent_user',
                accountStatus: 'active',
                refreshTokenVersion: 0
            }

            const rawToken = jwt.sign(
                { _id: user._id, version: user.refreshTokenVersion },
                TEST_SECRET + user.refreshTokenVersion
            )

            let isClaimed = false

            // Mock findOneAndUpdate to simulate atomic document claim:
            // The first caller gets the record and marks isClaimed = true.
            // The second concurrent caller finds isClaimed === true and gets null.
            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', (query, update) => ({
                populate: async () => {
                    if (!isClaimed) {
                        isClaimed = true
                        return {
                            token: hashToken(rawToken),
                            user,
                            isValid: true,
                            deviceInfo: 'Device A',
                            ipAddress: '127.0.0.1'
                        }
                    }
                    return null // Already claimed!
                }
            }))

            const createMock = mock.method(RefreshToken, 'create', async (doc) => doc)

            // Trigger two concurrent refresh calls simultaneously
            const [call1, call2] = await Promise.allSettled([
                refreshAccessToken(rawToken),
                refreshAccessToken(rawToken)
            ])

            findOneAndUpdateMock.mock.restore()
            createMock.mock.restore()

            // Exactly one must succeed with 200/tokens, and the other must be rejected with 401
            const successes = [call1, call2].filter(c => c.status === 'fulfilled')
            const rejections = [call1, call2].filter(c => c.status === 'rejected')

            assert.equal(successes.length, 1, 'Exactly one concurrent request must succeed')
            assert.equal(rejections.length, 1, 'The losing concurrent request must be rejected')
            assert.equal(rejections[0].reason.statusCode, 401)
            assert.equal(rejections[0].reason.message, 'Invalid or expired refresh token')
        })

        it('should reject replayed rotation attempts on an already rotated token', async () => {
            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', () => ({
                populate: async () => null // Token already marked isValid: false
            }))

            let error = null
            try {
                await refreshAccessToken('already-used-refresh-token')
            } catch (err) {
                error = err
            }

            findOneAndUpdateMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 401)
        })

        it('should reject expired refresh token during atomic rotation', async () => {
            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', () => ({
                populate: async () => null // Query { expiresAt: { $gt: new Date() } } returns null for expired token
            }))

            let error = null
            try {
                await refreshAccessToken('expired-refresh-token')
            } catch (err) {
                error = err
            }

            findOneAndUpdateMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 401)
            assert.equal(error.message, 'Invalid or expired refresh token')
        })

        it('should safely handle database failure during atomic rotation without leaving inconsistent state', async () => {
            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', () => {
                throw new Error('Database connection failed')
            })

            let error = null
            try {
                await refreshAccessToken('valid-looking-token')
            } catch (err) {
                error = err
            }

            findOneAndUpdateMock.mock.restore()

            assert.ok(error)
            assert.equal(error.message, 'Database connection failed')
        })
    })

    describe('Logout Ownership', () => {
        it('should scope logout query strictly to the authenticated userId', async () => {
            const rawToken = 'sample-logout-token'
            let scopedQuery = null

            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', async (query) => {
                scopedQuery = query
                return { isValid: false }
            })

            await logoutUser(testUserId, rawToken)

            findOneAndUpdateMock.mock.restore()

            assert.ok(scopedQuery)
            assert.equal(scopedQuery.user, testUserId, 'Query MUST be scoped by user: userId')
            assert.deepEqual(scopedQuery.$or, [
                { token: hashToken(rawToken) },
                { token: rawToken }
            ])
        })

        it('should successfully invalidate token when userId matches ownership and return true', async () => {
            const rawToken = 'user-a-valid-token'

            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', async (query) => {
                if (query.user?.toString() === testUserId.toString()) {
                    return { user: testUserId, isValid: false }
                }
                return null
            })

            const result = await logoutUser(testUserId, rawToken)

            findOneAndUpdateMock.mock.restore()

            assert.equal(result, true, 'Logout must succeed when token belongs to user')
        })

        it('should not allow User A to invalidate User B token', async () => {
            const rawToken = 'user-b-refresh-token'

            // Mock database: token belongs to otherUserId
            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', async (query) => {
                // If query.user !== otherUserId, query matches nothing
                if (query.user?.toString() === otherUserId.toString()) {
                    return { user: otherUserId, isValid: false }
                }
                return null // User A cannot match User B's token
            })

            // User A tries to logout using User B's token
            const result = await logoutUser(testUserId, rawToken)

            findOneAndUpdateMock.mock.restore()

            assert.equal(result, false, 'Logout must fail when token does not belong to user')
        })

        it('should reject logout attempt when userId is missing with 400 error', async () => {
            let error = null
            try {
                await logoutUser(null, 'sample-token')
            } catch (err) {
                error = err
            }

            assert.ok(error)
            assert.equal(error.statusCode, 400)
            assert.equal(error.message, 'User ID is required for logout')
        })
    })

    describe('Account Status Checks (Login & Refresh)', () => {
        it('should reject suspended user during login with 403 Forbidden', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10)
            const suspendedUser = {
                _id: testUserId,
                emailId: 'suspended@example.com',
                password: hashedPassword,
                accountStatus: 'suspended'
            }

            const findOneMock = mock.method(User, 'findOne', () => ({
                select: () => suspendedUser
            }))

            let error = null
            try {
                await loginUser({ emailId: 'suspended@example.com', password: 'password123' })
            } catch (err) {
                error = err
            }

            findOneMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account is suspended')
        })

        it('should reject deleted user during login with 403 Forbidden', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10)
            const deletedUser = {
                _id: testUserId,
                emailId: 'deleted@example.com',
                password: hashedPassword,
                accountStatus: 'deleted'
            }

            const findOneMock = mock.method(User, 'findOne', () => ({
                select: () => deletedUser
            }))

            let error = null
            try {
                await loginUser({ emailId: 'deleted@example.com', password: 'password123' })
            } catch (err) {
                error = err
            }

            findOneMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account has been deleted')
        })

        it('should reject inactive/pending user during login with 403 Forbidden', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10)
            const inactiveUser = {
                _id: testUserId,
                emailId: 'inactive@example.com',
                password: hashedPassword,
                accountStatus: 'inactive'
            }

            const findOneMock = mock.method(User, 'findOne', () => ({
                select: () => inactiveUser
            }))

            let error = null
            try {
                await loginUser({ emailId: 'inactive@example.com', password: 'password123' })
            } catch (err) {
                error = err
            }

            findOneMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account is not active')
        })

        it('should reject suspended accounts during refresh token verification with 403 Forbidden', async () => {
            const suspendedUser = {
                _id: testUserId,
                accountStatus: 'suspended',
                refreshTokenVersion: 1
            }

            const rawToken = jwt.sign(
                { _id: suspendedUser._id, version: 1 },
                TEST_SECRET + 1
            )

            const findOneMock = mock.method(RefreshToken, 'findOne', () => ({
                populate: async () => ({
                    token: hashToken(rawToken),
                    user: suspendedUser,
                    isValid: true,
                    expiresAt: new Date(Date.now() + 10000)
                })
            }))

            let error = null
            try {
                await verifyRefreshToken(rawToken)
            } catch (err) {
                error = err
            }

            findOneMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account is suspended')
        })

        it('should reject deleted accounts during refresh token verification with 403 Forbidden', async () => {
            const deletedUser = {
                _id: testUserId,
                accountStatus: 'deleted',
                refreshTokenVersion: 1
            }

            const rawToken = jwt.sign(
                { _id: deletedUser._id, version: 1 },
                TEST_SECRET + 1
            )

            const findOneMock = mock.method(RefreshToken, 'findOne', () => ({
                populate: async () => ({
                    token: hashToken(rawToken),
                    user: deletedUser,
                    isValid: true,
                    expiresAt: new Date(Date.now() + 10000)
                })
            }))

            let error = null
            try {
                await verifyRefreshToken(rawToken)
            } catch (err) {
                error = err
            }

            findOneMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account has been deleted')
        })

        it('should reject suspended accounts during atomic refreshAccessToken with 403 Forbidden', async () => {
            const suspendedUser = {
                _id: testUserId,
                accountStatus: 'suspended',
                refreshTokenVersion: 1
            }

            const rawToken = jwt.sign(
                { _id: suspendedUser._id, version: 1 },
                TEST_SECRET + 1
            )

            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', () => ({
                populate: async () => ({
                    token: hashToken(rawToken),
                    user: suspendedUser,
                    isValid: true,
                    deviceInfo: '',
                    ipAddress: ''
                })
            }))

            let error = null
            try {
                await refreshAccessToken(rawToken)
            } catch (err) {
                error = err
            }

            findOneAndUpdateMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account is suspended')
        })

        it('should reject deleted accounts during atomic refreshAccessToken with 403 Forbidden', async () => {
            const deletedUser = {
                _id: testUserId,
                accountStatus: 'deleted',
                refreshTokenVersion: 1
            }

            const rawToken = jwt.sign(
                { _id: deletedUser._id, version: 1 },
                TEST_SECRET + 1
            )

            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', () => ({
                populate: async () => ({
                    token: hashToken(rawToken),
                    user: deletedUser,
                    isValid: true,
                    deviceInfo: '',
                    ipAddress: ''
                })
            }))

            let error = null
            try {
                await refreshAccessToken(rawToken)
            } catch (err) {
                error = err
            }

            findOneAndUpdateMock.mock.restore()

            assert.ok(error)
            assert.equal(error.statusCode, 403)
            assert.equal(error.message, 'Account has been deleted')
        })
    })
})
