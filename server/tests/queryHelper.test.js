import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { escapeRegex, normalizePagination, isValidObjectId, isValidDate } from '../src/utils/queryHelper.js'

describe('Query and Pagination Helpers', () => {
    describe('escapeRegex', () => {
        it('should escape dangerous regex metacharacters', () => {
            const input = '.*+?^${}()|[]\\'
            const escaped = escapeRegex(input)
            assert.equal(escaped, '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\')
        })

        it('should return empty string for non-string inputs', () => {
            assert.equal(escapeRegex(null), '')
            assert.equal(escapeRegex(undefined), '')
            assert.equal(escapeRegex(123), '')
            assert.equal(escapeRegex({}), '')
        })

        it('should allow normal alphanumeric strings unchanged', () => {
            assert.equal(escapeRegex('john_doe123'), 'john_doe123')
        })
    })

    describe('normalizePagination (Hardened Edge Cases)', () => {
        it('should return defaults for undefined or null inputs', () => {
            const res = normalizePagination(undefined, undefined, 10, 50)
            assert.equal(res.page, 1)
            assert.equal(res.limit, 10)
            assert.equal(res.skip, 0)

            const resNull = normalizePagination(null, null, 15, 60)
            assert.equal(resNull.page, 1)
            assert.equal(resNull.limit, 15)
            assert.equal(resNull.skip, 0)
        })

        it('should handle malformed non-numeric types gracefully', () => {
            const res1 = normalizePagination('abc', 'xyz', 10, 50)
            assert.equal(res1.page, 1)
            assert.equal(res1.limit, 10)
            assert.equal(res1.skip, 0)

            const res2 = normalizePagination({}, [], 10, 50)
            assert.equal(res2.page, 1)
            assert.equal(res2.limit, 10)
            assert.equal(res2.skip, 0)
        })

        it('should normalize negative or zero page and limit to safe defaults', () => {
            const res1 = normalizePagination(-5, -20, 10, 50)
            assert.equal(res1.page, 1)
            assert.equal(res1.limit, 10)
            assert.equal(res1.skip, 0)

            const res2 = normalizePagination(0, 0, 10, 50)
            assert.equal(res2.page, 1)
            assert.equal(res2.limit, 10)
            assert.equal(res2.skip, 0)
        })

        it('should truncate decimal inputs to safe integers', () => {
            const res1 = normalizePagination('2.9', '15.7', 10, 50)
            assert.equal(res1.page, 2)
            assert.equal(res1.limit, 15)
            assert.equal(res1.skip, 15) // (2 - 1) * 15

            const res2 = normalizePagination(4.99, 20.1, 10, 50)
            assert.equal(res2.page, 4)
            assert.equal(res2.limit, 20)
            assert.equal(res2.skip, 60) // (4 - 1) * 20
        })

        it('should bound extremely large limit to maxLimit', () => {
            const res = normalizePagination(2, 999999999, 10, 50)
            assert.equal(res.page, 2)
            assert.equal(res.limit, 50)
            assert.equal(res.skip, 50)
        })

        it('should bound extremely large page numbers to maxPage to prevent BSON overflow', () => {
            const res = normalizePagination(999999999, 10, 10, 50, 1000)
            assert.equal(res.page, 1000)
            assert.equal(res.limit, 10)
            assert.equal(res.skip, 9990)
        })

        it('should handle Infinity and -Infinity safely', () => {
            const res = normalizePagination(Infinity, -Infinity, 10, 50)
            assert.equal(res.page, 1)
            assert.equal(res.limit, 10)
            assert.equal(res.skip, 0)
        })

        it('should correctly calculate skip for valid page and limit', () => {
            const res = normalizePagination('5', '20', 10, 100)
            assert.equal(res.page, 5)
            assert.equal(res.limit, 20)
            assert.equal(res.skip, 80)
        })
    })

    describe('isValidObjectId', () => {
        it('should return true for valid 24-char hex ObjectIds', () => {
            const validId = new mongoose.Types.ObjectId().toString()
            assert.equal(isValidObjectId(validId), true)
        })

        it('should return false for malformed or non-ObjectId values', () => {
            assert.equal(isValidObjectId('not-an-id'), false)
            assert.equal(isValidObjectId('12345'), false)
            assert.equal(isValidObjectId('zzzzzzzzzzzzzzzzzzzzzzzz'), false)
            assert.equal(isValidObjectId(null), false)
            assert.equal(isValidObjectId(undefined), false)
            assert.equal(isValidObjectId({}), false)
        })
    })

    describe('isValidDate', () => {
        it('should return true for valid ISO date strings', () => {
            assert.equal(isValidDate('2026-01-01'), true)
            assert.equal(isValidDate('2026-03-15T12:00:00.000Z'), true)
            assert.equal(isValidDate(new Date()), true)
        })

        it('should return false for invalid date strings', () => {
            assert.equal(isValidDate('not-a-date'), false)
            assert.equal(isValidDate(''), false)
            assert.equal(isValidDate(null), false)
            assert.equal(isValidDate(undefined), false)
        })
    })
})
