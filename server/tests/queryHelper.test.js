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
        })

        it('should allow normal alphanumeric strings unchanged', () => {
            assert.equal(escapeRegex('john_doe123'), 'john_doe123')
        })
    })

    describe('normalizePagination', () => {
        it('should return defaults for undefined or invalid inputs', () => {
            const res = normalizePagination(undefined, undefined, 10, 50)
            assert.equal(res.page, 1)
            assert.equal(res.limit, 10)
            assert.equal(res.skip, 0)
        })

        it('should normalize negative or zero page to 1', () => {
            const res1 = normalizePagination(-5, 10, 10, 50)
            assert.equal(res1.page, 1)
            assert.equal(res1.skip, 0)

            const res2 = normalizePagination(0, 10, 10, 50)
            assert.equal(res2.page, 1)
            assert.equal(res2.skip, 0)
        })

        it('should clamp limit to maxLimit when exceeded', () => {
            const res = normalizePagination(2, 999999, 10, 50)
            assert.equal(res.page, 2)
            assert.equal(res.limit, 50)
            assert.equal(res.skip, 50)
        })

        it('should correctly calculate skip for valid page and limit', () => {
            const res = normalizePagination('3', '20', 10, 50)
            assert.equal(res.page, 3)
            assert.equal(res.limit, 20)
            assert.equal(res.skip, 40)
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
