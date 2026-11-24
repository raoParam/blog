import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { getProfile } from '../src/controllers/user.controller.js'
import { refreshToken } from '../src/controllers/auth.controller.js'
import { getSavedPostsList } from '../src/services/user.service.js'
import User from '../src/models/user.js'
import Post from '../src/models/post.js'
import RefreshToken from '../src/models/refreshToken.js'

function createMockRes() {
    const res = {
        statusCode: 200,
        body: null,
        cookies: {},
        status(code) {
            res.statusCode = code
            return res
        },
        json(data) {
            res.body = data
            return res
        },
        cookie(name, val, opts) {
            res.cookies[name] = { val, opts }
            return res
        }
    }
    return res
}

describe('Batch 4 Regression Tests', () => {
    describe('1. Profile Response Sanitization (getProfile)', () => {
        it('should strip password, refreshTokenVersion, and googleId from user profile response without mutating original user', async () => {
            const originalUser = {
                _id: '507f1f77bcf86cd799439011',
                userName: 'developer_john',
                emailId: 'john@example.com',
                firstName: 'John',
                lastName: 'Doe',
                bio: 'Staff Engineer',
                role: 'user',
                password: '$2b$10$hashedPassword1234567890',
                refreshTokenVersion: 4,
                googleId: 'google-oauth-sub-123456789',
                toObject() {
                    return { ...this }
                }
            }

            const req = { user: originalUser }
            const res = createMockRes()

            await getProfile(req, res, (err) => {
                if (err) throw err
            })

            assert.equal(res.statusCode, 200)
            assert.ok(res.body)
            assert.equal(res.body.Status, 'success')

            const responseUser = res.body.user
            assert.ok(responseUser)

            // Sensitive fields must be excluded
            assert.equal('password' in responseUser, false)
            assert.equal('refreshTokenVersion' in responseUser, false)
            assert.equal('googleId' in responseUser, false)

            // Ordinary fields must be intact
            assert.equal(responseUser._id, '507f1f77bcf86cd799439011')
            assert.equal(responseUser.userName, 'developer_john')
            assert.equal(responseUser.emailId, 'john@example.com')
            assert.equal(responseUser.firstName, 'John')
            assert.equal(responseUser.lastName, 'Doe')
            assert.equal(responseUser.bio, 'Staff Engineer')
            assert.equal(responseUser.role, 'user')

            // Original authenticated user document must NOT be mutated
            assert.equal(originalUser.password, '$2b$10$hashedPassword1234567890')
            assert.equal(originalUser.refreshTokenVersion, 4)
            assert.equal(originalUser.googleId, 'google-oauth-sub-123456789')
        })
    })

    describe('2. Refresh Token Response Sanitization (refreshToken)', () => {
        it('should strip password, refreshTokenVersion, and googleId from refreshed session user payload', async () => {
            if (!process.env.JWT_SECRET) {
                process.env.JWT_SECRET = 'test_jwt_secret_batch4_regression_12345'
            }

            const rawUser = {
                _id: '507f1f77bcf86cd799439022',
                userName: 'senior_coder',
                emailId: 'senior@example.com',
                accountStatus: 'active',
                password: '$2b$10$superSecretHashValue999',
                refreshTokenVersion: 7,
                googleId: 'google-uid-secret-987654',
                toObject() {
                    return { ...this }
                }
            }

            const validRefreshToken = jwt.sign(
                { _id: rawUser._id, version: rawUser.refreshTokenVersion },
                process.env.JWT_SECRET + rawUser.refreshTokenVersion,
                { expiresIn: '7d' }
            )

            const findOneAndUpdateMock = mock.method(RefreshToken, 'findOneAndUpdate', () => ({
                populate: () => Promise.resolve({
                    user: rawUser,
                    deviceInfo: 'Test Device',
                    ipAddress: '127.0.0.1'
                })
            }))

            const createMock = mock.method(RefreshToken, 'create', async () => ({
                _id: 'new_token_doc_id',
                token: 'mock_hashed_token'
            }))

            try {
                const req = {
                    body: { refreshToken: validRefreshToken }
                }
                const res = createMockRes()

                await refreshToken(req, res, (err) => {
                    if (err) throw err
                })

                assert.equal(res.statusCode, 200)
                assert.ok(res.body)
                assert.ok(res.body.accessToken)
                assert.ok(res.body.refreshToken)

                const returnedUser = res.body.user
                assert.ok(returnedUser)

                // Sensitive fields must be excluded
                assert.equal('password' in returnedUser, false)
                assert.equal('refreshTokenVersion' in returnedUser, false)
                assert.equal('googleId' in returnedUser, false)

                // Ordinary fields preserved
                assert.equal(returnedUser._id, '507f1f77bcf86cd799439022')
                assert.equal(returnedUser.userName, 'senior_coder')
                assert.equal(returnedUser.emailId, 'senior@example.com')
                assert.equal(returnedUser.accountStatus, 'active')
            } finally {
                findOneAndUpdateMock.mock.restore()
                createMock.mock.restore()
            }
        })
    })

    describe('3. Anonymous Saved-Post Author Redaction (getSavedPostsList)', () => {
        it('should redact author on anonymous saved posts while preserving author on public saved posts and handling nulls safely', async () => {
            const userId = '507f1f77bcf86cd799439033'
            const anonymousAuthor = {
                _id: '507f1f77bcf86cd799439099',
                userName: 'stealth_engineer',
                firstName: 'Stealth',
                lastName: 'Dev',
                avatar: 'https://example.com/avatar.jpg'
            }
            const publicAuthor = {
                _id: '507f1f77bcf86cd799439088',
                userName: 'open_engineer',
                firstName: 'Open',
                lastName: 'Source',
                avatar: 'https://example.com/open.jpg'
            }

            const mockUserWithSavedPosts = {
                _id: userId,
                savedPosts: [
                    {
                        _id: 'post_1_anon',
                        title: 'Confidential Production Outage Post-Mortem',
                        visibility: 'anonymous',
                        author: { ...anonymousAuthor }
                    },
                    {
                        _id: 'post_2_public',
                        title: 'Modern CSS Grid Patterns',
                        visibility: 'public',
                        author: { ...publicAuthor }
                    },
                    null // null/missing saved-post population edge case
                ]
            }

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    populate() {
                        return Promise.resolve(mockUserWithSavedPosts)
                    },
                    then(cb) {
                        return Promise.resolve(cb({ savedPosts: mockUserWithSavedPosts.savedPosts }))
                    }
                }
            })
            const countDocumentsMock = mock.method(Post, 'countDocuments', () => Promise.resolve(2))

            try {
                const result = await getSavedPostsList(userId, 1, 10)

                assert.ok(result)
                assert.ok(Array.isArray(result.savedPosts))
                assert.equal(result.savedPosts.length, 2, 'Null entries must be filtered out so total is 2')
                assert.equal(result.pagination.totalSaved, 2, 'Total saved must match non-deleted count of 2')

                // 1. Anonymous post must have author stripped to null
                const anonPost = result.savedPosts[0]
                assert.equal(anonPost._id, 'post_1_anon')
                assert.equal(anonPost.visibility, 'anonymous')
                assert.equal(anonPost.author, null, 'Anonymous post author must be redacted to null')

                // 2. Public post must have author intact
                const pubPost = result.savedPosts[1]
                assert.equal(pubPost._id, 'post_2_public')
                assert.equal(pubPost.visibility, 'public')
                assert.ok(pubPost.author)
                assert.equal(pubPost.author.userName, 'open_engineer')

                // 3. Null post edge case safely filtered without crashing
                assert.equal(result.savedPosts.some(p => p === null), false)
            } finally {
                findByIdMock.mock.restore()
                countDocumentsMock.mock.restore()
            }
        })
    })
})
