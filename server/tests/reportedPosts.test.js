import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { fetchReportedPosts } from '../src/services/admin.service.js'
import { getReportedPosts } from '../src/controllers/admin.controller.js'

describe('Reported Posts Feature Inspection & Handling', () => {
    it('should not return fake random report counts and clearly report that the feature is not implemented', async () => {
        const result = await fetchReportedPosts(1, 20)

        assert.equal(Array.isArray(result.posts), true)
        assert.equal(result.posts.length, 0, 'Must not invent fake reported posts')
        assert.equal(result.pagination.totalPosts, 0)
        assert.ok(result.message.includes('not implemented yet'))
    })

    it('should format controller response clearly indicating reporting is not implemented', async () => {
        const req = {
            query: { page: '1', limit: '20' }
        }

        let responseStatus = null
        let responseBody = null

        const res = {
            status(code) {
                responseStatus = code
                return res
            },
            json(data) {
                responseBody = data
                return res
            }
        }

        await getReportedPosts(req, res, () => {})

        assert.equal(responseStatus, 200)
        assert.equal(responseBody.Status, 'success')
        assert.ok(responseBody.Message.includes('not implemented yet'))
        assert.deepEqual(responseBody.reportedPosts, [])
        assert.equal(responseBody.pagination.totalPosts, 0)
    })
})
