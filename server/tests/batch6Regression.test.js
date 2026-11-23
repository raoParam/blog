import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import {
    toggleVerifiedBadge,
    togglePostVisibility,
    getAllUsers,
    getAllPosts,
    getSystemLogs
} from '../src/controllers/admin.controller.js'
import { normalizePagination } from '../src/utils/queryHelper.js'
import User from '../src/models/user.js'
import Post from '../src/models/post.js'

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

describe('Batch 6 Regression Tests', () => {
    describe('1. Admin Boolean Validation', () => {
        const testUserId = '507f1f77bcf86cd799439011'
        const testPostId = '507f1f77bcf86cd799439022'

        describe('toggleVerifiedBadge', () => {
            it('should accept actual boolean true and call underlying model update', async () => {
                let updateCalled = false
                let updateArgs = null

                const findByIdAndUpdateMock = mock.method(User, 'findByIdAndUpdate', (id, update, opts) => {
                    updateCalled = true
                    updateArgs = { id, update }
                    return {
                        select: () => Promise.resolve({
                            _id: id,
                            userName: 'test_user',
                            isVerifiedBadge: update.isVerifiedBadge
                        })
                    }
                })

                try {
                    const req = {
                        params: { userId: testUserId },
                        body: { verify: true }
                    }
                    const res = createMockRes()

                    await toggleVerifiedBadge(req, res, () => {})

                    assert.equal(res.statusCode, 200)
                    assert.equal(res.body.Status, 'success')
                    assert.equal(res.body.user.isVerifiedBadge, true)
                    assert.equal(updateCalled, true)
                    assert.equal(updateArgs.update.isVerifiedBadge, true)
                } finally {
                    findByIdAndUpdateMock.mock.restore()
                }
            })

            it('should accept actual boolean false and call underlying model update', async () => {
                let updateCalled = false
                let updateArgs = null

                const findByIdAndUpdateMock = mock.method(User, 'findByIdAndUpdate', (id, update, opts) => {
                    updateCalled = true
                    updateArgs = { id, update }
                    return {
                        select: () => Promise.resolve({
                            _id: id,
                            userName: 'test_user',
                            isVerifiedBadge: update.isVerifiedBadge
                        })
                    }
                })

                try {
                    const req = {
                        params: { userId: testUserId },
                        body: { verify: false }
                    }
                    const res = createMockRes()

                    await toggleVerifiedBadge(req, res, () => {})

                    assert.equal(res.statusCode, 200)
                    assert.equal(res.body.Status, 'success')
                    assert.equal(res.body.user.isVerifiedBadge, false)
                    assert.equal(updateCalled, true)
                    assert.equal(updateArgs.update.isVerifiedBadge, false)
                } finally {
                    findByIdAndUpdateMock.mock.restore()
                }
            })

            const invalidTestCases = [
                { label: 'string "true"', value: 'true' },
                { label: 'string "false"', value: 'false' },
                { label: 'number 1', value: 1 },
                { label: 'number 0', value: 0 },
                { label: 'null', value: null },
                { label: 'undefined / missing', value: undefined },
                { label: 'empty string ""', value: '' },
                { label: 'object {}', value: {} },
                { label: 'array []', value: [] }
            ]

            for (const { label, value } of invalidTestCases) {
                it(`should reject ${label} with 400 error and NOT invoke underlying service or modify data`, async () => {
                    let updateCalled = false
                    const findByIdAndUpdateMock = mock.method(User, 'findByIdAndUpdate', () => {
                        updateCalled = true
                        return { select: () => Promise.resolve({}) }
                    })

                    try {
                        const req = {
                            params: { userId: testUserId },
                            body: value === undefined ? {} : { verify: value }
                        }
                        const res = createMockRes()
                        let caughtError = null

                        await toggleVerifiedBadge(req, res, (err) => {
                            caughtError = err
                        })

                        assert.ok(caughtError, `Expected error for invalid verify input: ${label}`)
                        assert.equal(caughtError.statusCode, 400)
                        assert.equal(caughtError.message, 'verify must be a boolean (true or false)')
                        assert.equal(updateCalled, false, 'Database/service must NOT be called on invalid input')
                    } finally {
                        findByIdAndUpdateMock.mock.restore()
                    }
                })
            }
        })

        describe('togglePostVisibility', () => {
            it('should accept actual boolean true and call underlying model update', async () => {
                let postFindCalled = false
                const mockPost = {
                    _id: testPostId,
                    title: 'Post Title',
                    visibility: 'public',
                    author: { _id: 'author1', userName: 'auth_user' },
                    save: async () => {},
                    populate: async () => {}
                }

                const findByIdMock = mock.method(Post, 'findById', (id) => {
                    postFindCalled = true
                    return Promise.resolve(mockPost)
                })

                try {
                    const req = {
                        params: { postId: testPostId },
                        body: { hidden: true }
                    }
                    const res = createMockRes()

                    await togglePostVisibility(req, res, () => {})

                    assert.equal(res.statusCode, 200)
                    assert.equal(res.body.Status, 'success')
                    assert.equal(postFindCalled, true)
                    assert.equal(mockPost.visibility, 'anonymous')
                } finally {
                    findByIdMock.mock.restore()
                }
            })

            it('should accept actual boolean false and call underlying model update', async () => {
                let postFindCalled = false
                const mockPost = {
                    _id: testPostId,
                    title: 'Post Title',
                    visibility: 'anonymous',
                    author: { _id: 'author1', userName: 'auth_user' },
                    save: async () => {},
                    populate: async () => {}
                }

                const findByIdMock = mock.method(Post, 'findById', (id) => {
                    postFindCalled = true
                    return Promise.resolve(mockPost)
                })

                try {
                    const req = {
                        params: { postId: testPostId },
                        body: { hidden: false }
                    }
                    const res = createMockRes()

                    await togglePostVisibility(req, res, () => {})

                    assert.equal(res.statusCode, 200)
                    assert.equal(res.body.Status, 'success')
                    assert.equal(postFindCalled, true)
                    assert.equal(mockPost.visibility, 'public')
                } finally {
                    findByIdMock.mock.restore()
                }
            })

            const invalidHiddenCases = [
                { label: 'string "true"', value: 'true' },
                { label: 'string "false"', value: 'false' },
                { label: 'number 1', value: 1 },
                { label: 'number 0', value: 0 },
                { label: 'null', value: null },
                { label: 'undefined / missing', value: undefined },
                { label: 'empty string ""', value: '' },
                { label: 'object {}', value: {} },
                { label: 'array []', value: [] }
            ]

            for (const { label, value } of invalidHiddenCases) {
                it(`should reject ${label} with 400 error and NOT invoke underlying service or modify data`, async () => {
                    let postFindCalled = false
                    const findByIdMock = mock.method(Post, 'findById', () => {
                        postFindCalled = true
                        return Promise.resolve({})
                    })

                    try {
                        const req = {
                            params: { postId: testPostId },
                            body: value === undefined ? {} : { hidden: value }
                        }
                        const res = createMockRes()
                        let caughtError = null

                        await togglePostVisibility(req, res, (err) => {
                            caughtError = err
                        })

                        assert.ok(caughtError, `Expected error for invalid hidden input: ${label}`)
                        assert.equal(caughtError.statusCode, 400)
                        assert.equal(caughtError.message, 'hidden must be a boolean (true or false)')
                        assert.equal(postFindCalled, false, 'Database/service must NOT be called on invalid input')
                    } finally {
                        findByIdMock.mock.restore()
                    }
                })
            }
        })
    })

    describe('2. Admin Pagination Normalization', () => {
        describe('getAllUsers (defaults: page 1, limit 20, maxLimit 100)', () => {
            function mockUserFindQuery() {
                let captured = { skip: null, limit: null }
                const findMock = mock.method(User, 'find', () => ({
                    select: () => ({
                        sort: () => ({
                            skip: (s) => ({
                                limit: (l) => {
                                    captured.skip = s
                                    captured.limit = l
                                    return {
                                        lean: async () => []
                                    }
                                }
                            })
                        })
                    })
                }))
                const countMock = mock.method(User, 'countDocuments', async () => 0)
                return { captured, restore: () => { findMock.mock.restore(); countMock.mock.restore() } }
            }

            it('should use default page 1 and limit 20 when parameters are missing', async () => {
                const { captured, restore } = mockUserFindQuery()
                try {
                    const req = { query: {} }
                    const res = createMockRes()
                    await getAllUsers(req, res, () => {})
                    assert.equal(captured.limit, 20)
                    assert.equal(captured.skip, 0)
                    assert.equal(res.body.pagination.currentPage, 1)
                } finally {
                    restore()
                }
            })

            it('should accept valid positive integer values (page 3, limit 45)', async () => {
                const { captured, restore } = mockUserFindQuery()
                try {
                    const req = { query: { page: '3', limit: '45' } }
                    const res = createMockRes()
                    await getAllUsers(req, res, () => {})
                    assert.equal(captured.limit, 45)
                    assert.equal(captured.skip, 90) // (3 - 1) * 45
                    assert.equal(res.body.pagination.currentPage, 3)
                } finally {
                    restore()
                }
            })

            it('should safely fall back to default page 1 and limit 20 when given invalid strings', async () => {
                const { captured, restore } = mockUserFindQuery()
                try {
                    const req = { query: { page: 'not_a_number', limit: 'bad_limit' } }
                    const res = createMockRes()
                    await getAllUsers(req, res, () => {})
                    assert.equal(captured.limit, 20)
                    assert.equal(captured.skip, 0)
                    assert.equal(res.body.pagination.currentPage, 1)
                } finally {
                    restore()
                }
            })

            it('should safely fall back to default page 1 and limit 20 when given zero or negative values', async () => {
                const { captured, restore } = mockUserFindQuery()
                try {
                    const req = { query: { page: '0', limit: '-15' } }
                    const res = createMockRes()
                    await getAllUsers(req, res, () => {})
                    assert.equal(captured.limit, 20)
                    assert.equal(captured.skip, 0)
                    assert.equal(res.body.pagination.currentPage, 1)
                } finally {
                    restore()
                }
            })

            it('should truncate decimal values to safe integers (page 2.8, limit 15.9 -> page 2, limit 15)', async () => {
                const { captured, restore } = mockUserFindQuery()
                try {
                    const req = { query: { page: '2.8', limit: '15.9' } }
                    const res = createMockRes()
                    await getAllUsers(req, res, () => {})
                    assert.equal(captured.limit, 15)
                    assert.equal(captured.skip, 15) // (2 - 1) * 15
                    assert.equal(res.body.pagination.currentPage, 2)
                } finally {
                    restore()
                }
            })

            it('should cap limits exceeding the maximum (limit: 500 -> capped at 100)', async () => {
                const { captured, restore } = mockUserFindQuery()
                try {
                    const req = { query: { page: '1', limit: '500' } }
                    const res = createMockRes()
                    await getAllUsers(req, res, () => {})
                    assert.equal(captured.limit, 100, 'Limit exceeding maxLimit 100 must be capped at 100')
                    assert.equal(captured.skip, 0)
                } finally {
                    restore()
                }
            })
        })

        describe('getAllPosts (defaults: page 1, limit 20, maxLimit 100)', () => {
            function mockPostFindQuery() {
                let captured = { skip: null, limit: null }
                const findMock = mock.method(Post, 'find', () => ({
                    populate: () => ({
                        populate: () => ({
                            sort: () => ({
                                skip: (s) => ({
                                    limit: (l) => {
                                        captured.skip = s
                                        captured.limit = l
                                        return {
                                            lean: async () => []
                                        }
                                    }
                                })
                            })
                        })
                    })
                }))
                const countMock = mock.method(Post, 'countDocuments', async () => 0)
                return { captured, restore: () => { findMock.mock.restore(); countMock.mock.restore() } }
            }

            it('should use default page 1 and limit 20 when parameters are missing', async () => {
                const { captured, restore } = mockPostFindQuery()
                try {
                    const req = { query: {} }
                    const res = createMockRes()
                    await getAllPosts(req, res, () => {})
                    assert.equal(captured.limit, 20)
                    assert.equal(captured.skip, 0)
                    assert.equal(res.body.pagination.currentPage, 1)
                } finally {
                    restore()
                }
            })

            it('should accept valid positive integer values (page 2, limit 35)', async () => {
                const { captured, restore } = mockPostFindQuery()
                try {
                    const req = { query: { page: '2', limit: '35' } }
                    const res = createMockRes()
                    await getAllPosts(req, res, () => {})
                    assert.equal(captured.limit, 35)
                    assert.equal(captured.skip, 35) // (2 - 1) * 35
                    assert.equal(res.body.pagination.currentPage, 2)
                } finally {
                    restore()
                }
            })

            it('should safely fall back when given invalid strings', async () => {
                const { captured, restore } = mockPostFindQuery()
                try {
                    const req = { query: { page: 'foo', limit: 'bar' } }
                    const res = createMockRes()
                    await getAllPosts(req, res, () => {})
                    assert.equal(captured.limit, 20)
                    assert.equal(captured.skip, 0)
                    assert.equal(res.body.pagination.currentPage, 1)
                } finally {
                    restore()
                }
            })

            it('should safely fall back when given zero or negative values', async () => {
                const { captured, restore } = mockPostFindQuery()
                try {
                    const req = { query: { page: '-3', limit: '0' } }
                    const res = createMockRes()
                    await getAllPosts(req, res, () => {})
                    assert.equal(captured.limit, 20)
                    assert.equal(captured.skip, 0)
                    assert.equal(res.body.pagination.currentPage, 1)
                } finally {
                    restore()
                }
            })

            it('should truncate decimal values to safe integers (page 3.14, limit 30.5 -> page 3, limit 30)', async () => {
                const { captured, restore } = mockPostFindQuery()
                try {
                    const req = { query: { page: '3.14', limit: '30.5' } }
                    const res = createMockRes()
                    await getAllPosts(req, res, () => {})
                    assert.equal(captured.limit, 30)
                    assert.equal(captured.skip, 60) // (3 - 1) * 30
                    assert.equal(res.body.pagination.currentPage, 3)
                } finally {
                    restore()
                }
            })

            it('should cap limits exceeding maximum at 100 (limit: 250 -> 100)', async () => {
                const { captured, restore } = mockPostFindQuery()
                try {
                    const req = { query: { page: '1', limit: '250' } }
                    const res = createMockRes()
                    await getAllPosts(req, res, () => {})
                    assert.equal(captured.limit, 100)
                    assert.equal(captured.skip, 0)
                } finally {
                    restore()
                }
            })
        })

        describe('getSystemLogs (defaults: page 1, limit 50, maxLimit 100)', () => {
            it('should use default page 1 and limit 50 when parameters are missing', async () => {
                const req = { query: {} }
                const res = createMockRes()
                await getSystemLogs(req, res, () => {})
                assert.equal(res.statusCode, 200)
                assert.equal(res.body.logs.pagination.currentPage, 1)

                // Direct helper verification
                const normalized = normalizePagination(req.query.page, req.query.limit, 50, 100)
                assert.equal(normalized.page, 1)
                assert.equal(normalized.limit, 50)
                assert.equal(normalized.skip, 0)
            })

            it('should accept valid positive integer values (page 4, limit 80)', async () => {
                const req = { query: { page: '4', limit: '80' } }
                const res = createMockRes()
                await getSystemLogs(req, res, () => {})
                assert.equal(res.statusCode, 200)
                assert.equal(res.body.logs.pagination.currentPage, 4)

                const normalized = normalizePagination(req.query.page, req.query.limit, 50, 100)
                assert.equal(normalized.page, 4)
                assert.equal(normalized.limit, 80)
                assert.equal(normalized.skip, 240) // (4 - 1) * 80
            })

            it('should safely fall back when given invalid strings', async () => {
                const req = { query: { page: 'invalid', limit: 'bad' } }
                const res = createMockRes()
                await getSystemLogs(req, res, () => {})
                assert.equal(res.statusCode, 200)
                assert.equal(res.body.logs.pagination.currentPage, 1)

                const normalized = normalizePagination(req.query.page, req.query.limit, 50, 100)
                assert.equal(normalized.page, 1)
                assert.equal(normalized.limit, 50)
                assert.equal(normalized.skip, 0)
            })

            it('should safely fall back when given zero or negative values', async () => {
                const req = { query: { page: '-2', limit: '-10' } }
                const res = createMockRes()
                await getSystemLogs(req, res, () => {})
                assert.equal(res.statusCode, 200)
                assert.equal(res.body.logs.pagination.currentPage, 1)

                const normalized = normalizePagination(req.query.page, req.query.limit, 50, 100)
                assert.equal(normalized.page, 1)
                assert.equal(normalized.limit, 50)
                assert.equal(normalized.skip, 0)
            })

            it('should truncate decimal values (page 2.7, limit 65.4 -> page 2, limit 65)', async () => {
                const req = { query: { page: '2.7', limit: '65.4' } }
                const res = createMockRes()
                await getSystemLogs(req, res, () => {})
                assert.equal(res.statusCode, 200)
                assert.equal(res.body.logs.pagination.currentPage, 2)

                const normalized = normalizePagination(req.query.page, req.query.limit, 50, 100)
                assert.equal(normalized.page, 2)
                assert.equal(normalized.limit, 65)
                assert.equal(normalized.skip, 65)
            })

            it('should cap limits exceeding maximum at 100 (limit: 1000 -> 100)', async () => {
                const req = { query: { page: '1', limit: '1000' } }
                const res = createMockRes()
                await getSystemLogs(req, res, () => {})
                assert.equal(res.statusCode, 200)

                const normalized = normalizePagination(req.query.page, req.query.limit, 50, 100)
                assert.equal(normalized.limit, 100, 'Limit exceeding maxLimit 100 must be capped at 100')
                assert.equal(normalized.skip, 0)
            })
        })
    })
})
