import { describe, it, before, after, mock } from 'node:test'
import assert from 'node:assert/strict'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()
import mongoose from 'mongoose'
import Post from '../src/models/post.js'
import User from '../src/models/user.js'
import Comment from '../src/models/comment.js'
import Category from '../src/models/category.js'
import { cloudinary } from '../src/middleware/uploadPost.js'
import {
    likePost,
    likeComment,
    deletePost,
    deletePostImages,
    executePostTombstoneCleanup,
    renewPostTombstoneLease,
    retryFailedPostCleanups,
    fetchTrendingPosts,
    fetchFollowingFeed,
    getPostsByCategoryName,
    fetchCommentsByPost,
    createNewComment,
    updatePostImages,
    updateCommentById,
    deleteCommentById
} from '../src/services/post.service.js'
import {
    deleteAnyPostById
} from '../src/services/admin.service.js'
import {
    followUserById,
    unfollowUserById,
    savePostById,
    unsavePostById,
    getSavedPostsList
} from '../src/services/user.service.js'
import {
    fetchPosts as publicFetchPosts,
    fetchPost as publicFetchPost
} from '../src/services/public.service.js'

describe('Batch 9: Database Consistency and Concurrency', () => {
    let testUsers = []
    let testCategory
    let adminUser
    let createdPostIds = []
    let createdCommentIds = []

    before(async () => {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URL)
        }

        // Create 12 test users for concurrency testing
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm']
        const runId = Math.random().toString(36).replace(/[^a-z]/g, '')
        const userDocs = []
        for (let i = 0; i < 12; i++) {
            const letter = letters[i]
            userDocs.push({
                firstName: `Testfirst_${letter}`,
                lastName: `Testlast_${letter}`,
                userName: `batchuser_${runId}_${letter}`,
                emailId: `batchuser_${runId}_${letter}@example.com`,
                password: 'HashedPassword123!',
                accountStatus: 'active'
            })
        }
        testUsers = await User.insertMany(userDocs)

        // Create an admin user for admin deletion testing
        adminUser = await User.create({
            firstName: 'Adminfirst',
            lastName: 'Adminlast',
            userName: `admin_${runId}`,
            emailId: `admin_${runId}@example.com`,
            password: 'HashedPassword123!',
            role: 'admin',
            accountStatus: 'active'
        })

        // Create a test category
        testCategory = await Category.create({
            name: `batch9-cat-${Date.now()}`,
            slug: `batch9-cat-${Date.now()}`,
            description: 'Batch 9 Category'
        })
    })

    after(async () => {
        // Cleanup all test data created
        if (testUsers.length > 0) {
            await User.deleteMany({ _id: { $in: testUsers.map(u => u._id) } })
        }
        if (adminUser) {
            await User.deleteOne({ _id: adminUser._id })
        }
        if (createdPostIds.length > 0) {
            await Post.deleteMany({ _id: { $in: createdPostIds } })
        }
        if (createdCommentIds.length > 0) {
            await Comment.deleteMany({ _id: { $in: createdCommentIds } })
        }
        if (testCategory) {
            await Category.deleteOne({ _id: testCategory._id })
        }
        await mongoose.disconnect()
    })

    describe('1. Atomic Like/Unlike Toggle via Pipeline Update', () => {
        it('should handle 3 simultaneous like toggles from the same user atomically and deterministically', async () => {
            const post = await Post.create({
                title: 'Atomic Like Concurrency Test',
                content: 'Testing atomic updates with MongoDB aggregation pipeline.',
                excerpt: 'Excerpt for atomic like',
                author: testUsers[0]._id,
                likes: []
            })
            createdPostIds.push(post._id)

            const targetUser = testUsers[1]

            // Launch 3 simultaneous toggle requests
            const results = await Promise.all([
                likePost(post._id, targetUser._id),
                likePost(post._id, targetUser._id),
                likePost(post._id, targetUser._id)
            ])

            assert.equal(results.length, 3)

            // Since user started unliked, an odd number of toggles (3) must end with the post LIKED
            const freshPost = await Post.findById(post._id).lean()
            assert.equal(freshPost.likes.length, 1)
            assert.equal(freshPost.likes[0].toString(), targetUser._id.toString())
        })

        it('should completely deduplicate pre-existing duplicate likes on toggle', async () => {
            const targetUser = testUsers[1]
            const post = await Post.create({
                title: 'Duplicate Likes Deduplication Test',
                content: 'Testing deduplication of dirty like arrays.',
                excerpt: 'Excerpt duplicate likes',
                author: testUsers[0]._id,
                likes: [targetUser._id, targetUser._id, targetUser._id]
            })
            createdPostIds.push(post._id)

            const res = await likePost(post._id, targetUser._id)
            assert.equal(res.isLikedByUser, false)
            assert.equal(res.totalLikes, 0)

            const freshPost = await Post.findById(post._id).lean()
            assert.equal(freshPost.likes.length, 0)
        })

        it('should handle concurrent likes from 10 distinct users with zero lost updates', async () => {
            const post = await Post.create({
                title: 'Zero Lost Updates Concurrent Likes',
                content: 'Testing 10 simultaneous likes from 10 distinct users.',
                excerpt: 'Excerpt zero lost updates',
                author: testUsers[0]._id,
                likes: []
            })
            createdPostIds.push(post._id)

            const likers = testUsers.slice(1, 11)
            await Promise.all(likers.map(u => likePost(post._id, u._id)))

            const freshPost = await Post.findById(post._id).lean()
            assert.equal(freshPost.likes.length, 10)
            for (const liker of likers) {
                assert.ok(
                    freshPost.likes.some(id => id.toString() === liker._id.toString()),
                    `Expected user ${liker._id} to be in likes array`
                )
            }
        })

        it('should atomicaly toggle likes on comments via aggregation pipeline', async () => {
            const post = await Post.create({
                title: 'Comment Like Concurrency Post',
                content: 'Testing comment likes.',
                author: testUsers[0]._id
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Great post!',
                author: testUsers[1]._id,
                post: post._id,
                likes: []
            })
            createdCommentIds.push(comment._id)

            const user = testUsers[2]

            const res1 = await likeComment(comment._id, user._id)
            assert.equal(res1.isLikedByUser, true)
            assert.equal(res1.totalLikes, 1)

            const res2 = await likeComment(comment._id, user._id)
            assert.equal(res2.isLikedByUser, false)
            assert.equal(res2.totalLikes, 0)
        })
    })

    describe('2. Symmetrical Transactional Follow / Unfollow', () => {
        it('should reject self-follow with 400 error', async () => {
            const user = testUsers[0]
            await assert.rejects(
                async () => {
                    await followUserById(user._id, user._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.match(err.message, /cannot follow yourself/i)
                    return true
                }
            )
        })

        it('should reject self-unfollow with 400 error', async () => {
            const user = testUsers[0]
            await assert.rejects(
                async () => {
                    await unfollowUserById(user._id, user._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.match(err.message, /cannot unfollow yourself/i)
                    return true
                }
            )
        })

        it('should reject follow when target account is not active (e.g. suspended)', async () => {
            const userA = testUsers[0]
            const cleanSuffix = Math.random().toString(36).replace(/[^a-z]/g, '')
            const suspendedUser = await User.create({
                firstName: 'Suspended_first',
                lastName: 'Suspended_last',
                userName: `suspended_user_${cleanSuffix}`,
                emailId: `suspended_${cleanSuffix}@example.com`,
                password: 'HashedPassword123!',
                accountStatus: 'suspended'
            })
            testUsers.push(suspendedUser)

            await assert.rejects(
                async () => {
                    await followUserById(userA._id, suspendedUser._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.match(err.message, /not active/i)
                    return true
                }
            )
        })

        it('should handle concurrent follow requests from the same user deterministically', async () => {
            const userA = testUsers[1]
            const userB = testUsers[2]

            // Clear any previous relationship
            await User.updateOne({ _id: userA._id }, { $set: { following: [] } })
            await User.updateOne({ _id: userB._id }, { $set: { followers: [] } })

            // Two concurrent follow requests from User A to User B
            const results = await Promise.allSettled([
                followUserById(userA._id, userB._id),
                followUserById(userA._id, userB._id)
            ])

            const fulfilled = results.filter(r => r.status === 'fulfilled')
            const rejected = results.filter(r => r.status === 'rejected')

            assert.equal(fulfilled.length, 1, 'Exactly one concurrent follow must succeed')
            assert.equal(rejected.length, 1, 'The duplicate follow must fail')
            assert.equal(rejected[0].reason?.statusCode, 400)

            // Symmetrical consistency check
            const freshA = await User.findById(userA._id).lean()
            const freshB = await User.findById(userB._id).lean()

            assert.equal(freshA.following.length, 1)
            assert.equal(freshB.followers.length, 1)
            assert.equal(freshA.following[0].toString(), userB._id.toString())
            assert.equal(freshB.followers[0].toString(), userA._id.toString())
        })

        it('should maintain strict symmetry across concurrent follow and unfollow requests', async () => {
            const userA = testUsers[3]
            const userB = testUsers[4]

            await User.updateOne({ _id: userA._id }, { $set: { following: [] } })
            await User.updateOne({ _id: userB._id }, { $set: { followers: [] } })

            // First follow to set initial relationship
            await followUserById(userA._id, userB._id)

            // Concurrent unfollow and follow
            await Promise.allSettled([
                unfollowUserById(userA._id, userB._id),
                followUserById(userA._id, userB._id)
            ])

            // Final state must remain completely symmetrical
            const freshA = await User.findById(userA._id).lean()
            const freshB = await User.findById(userB._id).lean()

            const aFollowsB = freshA.following.some(id => id.toString() === userB._id.toString())
            const bHasFollowerA = freshB.followers.some(id => id.toString() === userA._id.toString())

            assert.equal(aFollowsB, bHasFollowerA, 'User A following must match User B followers exactly')
        })
    })

    describe('3. Actual Save/Delete Concurrency & Write Contention', () => {
        it('should handle genuine concurrent savePostById and deletePost with Promise.all without dangling references', async () => {
            const author = testUsers[0]
            const savers = testUsers.slice(5, 10) // 5 concurrent savers

            const post = await Post.create({
                title: 'Concurrent Save and Delete Race Post',
                content: 'Testing true concurrent Promise.all save and delete contention.',
                excerpt: 'Excerpt concurrency test',
                author: author._id,
                status: 'published',
                coordinationVersion: 0
            })
            createdPostIds.push(post._id)

            // Concurrently run deletePost and 5 savePostById operations
            const operations = [
                deletePost(post._id, author._id),
                ...savers.map(s => savePostById(s._id, post._id))
            ]

            const results = await Promise.allSettled(operations)

            // deletePost operation must succeed
            const deleteResult = results[0]
            assert.equal(deleteResult.status, 'fulfilled')

            // After deletePost resolves, NO user in the database may contain the post ID in savedPosts!
            const usersInDb = await User.find({ _id: { $in: savers.map(s => s._id) } }).lean()
            for (const u of usersInDb) {
                assert.equal(
                    (u.savedPosts || []).some(id => id.toString() === post._id.toString()),
                    false,
                    `User ${u._id} must not have deleted post ${post._id} in savedPosts`
                )
            }

            // A retried save on the deleted post must fail with 404
            await assert.rejects(
                async () => {
                    await savePostById(savers[0]._id, post._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    return true
                }
            )
        })
    })

    describe('4. Deletion Cleanup Reliability, Cloudinary Failures & Lease Safety', () => {
        it('should treat already-missing asset (result: "not found" or 404) as successfully cleaned', async () => {
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
                if (publicId === 'already_missing_public_id') {
                    return { result: 'not found' }
                }
                const notFoundErr = new Error('Resource not found')
                notFoundErr.http_code = 404
                throw notFoundErr
            })

            try {
                const fakePost = {
                    _id: new mongoose.Types.ObjectId(),
                    imagePublicIds: ['already_missing_public_id', 'http_404_public_id']
                }

                const res = await deletePostImages(fakePost)
                assert.ok(res)
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should NOT treat network or DNS errors containing "not found" phrase as successful deletion', async () => {
            const author = testUsers[0]
            const post = await Post.create({
                title: 'DNS Error Not Found Post',
                content: 'Testing DNS ENOTFOUND error is not swallowed as missing asset.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'pending',
                imagePublicIds: ['dns_fail_asset_1']
            })
            createdPostIds.push(post._id)

            // Simulate DNS / network resolution failure containing "not found" in message
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async () => {
                const dnsErr = new Error('getaddrinfo ENOTFOUND api.cloudinary.com: host not found')
                dnsErr.code = 'ENOTFOUND'
                throw dnsErr
            })

            try {
                await assert.rejects(
                    async () => {
                        await executePostTombstoneCleanup(post._id)
                    },
                    (err) => {
                        assert.match(err.message, /ENOTFOUND/i)
                        return true
                    }
                )

                // Tombstone must be preserved with failed status and imagePublicIds intact for retry
                const tombstone = await Post.findById(post._id)
                assert.ok(tombstone, 'Post must NOT be deleted on DNS failure')
                assert.equal(tombstone.cleanupStatus, 'failed')
                assert.ok(tombstone.imagePublicIds.includes('dns_fail_asset_1'), 'Public IDs must be preserved')
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should propagate genuine Cloudinary API failure and preserve tombstone with imagePublicIds', async () => {
            const author = testUsers[0]
            const postWithImages = await Post.create({
                title: 'Cloudinary Failure Tombstone Post',
                content: 'Testing media failure handling.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'pending',
                imagePublicIds: ['failing_image_public_id_1']
            })
            createdPostIds.push(postWithImages._id)

            // Mock Cloudinary to throw a genuine network/server error
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async () => {
                const networkErr = new Error('Cloudinary 500 Internal Server Error')
                networkErr.http_code = 500
                throw networkErr
            })

            try {
                await assert.rejects(
                    async () => {
                        await executePostTombstoneCleanup(postWithImages._id)
                    },
                    (err) => {
                        assert.match(err.message, /Cloudinary 500/i)
                        return true
                    }
                )

                // The Post document must NOT be physically deleted while media cleanup remains unsuccessful!
                const tombstone = await Post.findById(postWithImages._id).lean()
                assert.ok(tombstone, 'Tombstone must be preserved on media failure')
                assert.equal(tombstone.cleanupStatus, 'failed')
                assert.ok(tombstone.imagePublicIds.includes('failing_image_public_id_1'), 'Public IDs must be retained for retry')
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should handle partial image deletion: clean succeeded assets from post and retry remaining', async () => {
            const author = testUsers[0]
            const post = await Post.create({
                title: 'Partial Image Deletion Post',
                content: 'Testing partial media deletion tracking.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'pending',
                imagePublicIds: ['img_succeed_1', 'img_fail_2']
            })
            createdPostIds.push(post._id)

            let attempt = 0
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
                attempt++
                if (publicId === 'img_succeed_1') {
                    return { result: 'ok' }
                }
                if (publicId === 'img_fail_2' && attempt <= 2) {
                    throw new Error('Connection timeout')
                }
                return { result: 'ok' }
            })

            try {
                // First cleanup attempt: img_succeed_1 succeeds, img_fail_2 fails
                await assert.rejects(
                    async () => {
                        await executePostTombstoneCleanup(post._id)
                    },
                    (err) => {
                        assert.match(err.message, /Connection timeout/i)
                        return true
                    }
                )

                // Check that img_succeed_1 was pulled from imagePublicIds, leaving only img_fail_2
                const postAfterFail = await Post.findById(post._id).lean()
                assert.ok(postAfterFail)
                assert.equal(postAfterFail.imagePublicIds.length, 1)
                assert.equal(postAfterFail.imagePublicIds[0], 'img_fail_2')

                // Second cleanup attempt: retry succeeds for the remaining asset
                const retryRes = await executePostTombstoneCleanup(post._id)
                assert.ok(retryRes?.success)

                // Tombstone is now permanently deleted
                const postAfterSuccess = await Post.findById(post._id)
                assert.equal(postAfterSuccess, null)
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should prevent an expired worker from finalizing a tombstone after another worker acquires it', async () => {
            const author = testUsers[0]
            const post = await Post.create({
                title: 'Fencing Lease Safety Post',
                content: 'Testing fencing token against expired worker finalizing tombstone.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'pending'
            })
            createdPostIds.push(post._id)

            // 1. Worker A acquires lease, but simulates taking too long so lease expires
            const workerAToken = 'worker_a_token_12345'
            await Post.updateOne(
                { _id: post._id },
                {
                    $set: {
                        cleanupStatus: 'in_progress',
                        cleanupLeaseExpiresAt: new Date(Date.now() - 5000), // expired lease!
                        cleanupLeaseOwner: workerAToken
                    }
                }
            )

            // 2. Worker B claims the expired tombstone using executePostTombstoneCleanup
            const workerBToken = 'worker_b_token_67890'
            const resultB = await executePostTombstoneCleanup(post._id, workerBToken)
            assert.ok(resultB?.success, 'Worker B must successfully clean up expired tombstone')

            // 3. Worker A wakes up and attempts to delete the Post with its expired token
            const deleteByA = await Post.deleteOne({
                _id: post._id,
                cleanupLeaseOwner: workerAToken
            })
            assert.equal(deleteByA.deletedCount, 0, 'Worker A must be fenced out and cannot delete Post')

            // 4. The Post document is confirmed deleted
            const postAfter = await Post.findById(post._id)
            assert.equal(postAfter, null)
        })

        it('should support safe lease renewal for long-running cleanup jobs', async () => {
            const author = testUsers[0]
            const leaseToken = 'token_for_renewal_test'
            const post = await Post.create({
                title: 'Lease Renewal Post',
                content: 'Testing lease renewal.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'in_progress',
                cleanupLeaseOwner: leaseToken,
                cleanupLeaseExpiresAt: new Date(Date.now() + 10000)
            })
            createdPostIds.push(post._id)

            const renewed = await renewPostTombstoneLease(post._id, leaseToken, 120000)
            assert.equal(renewed, true)

            const check = await Post.findById(post._id).lean()
            assert.ok(check.cleanupLeaseExpiresAt > new Date(Date.now() + 60000))

            // Non-matching token fails to renew
            const wrongRenew = await renewPostTombstoneLease(post._id, 'wrong_token', 120000)
            assert.equal(wrongRenew, false)
        })

        it('should exercise actual cleanup lease renewal during long-running executePostTombstoneCleanup', async () => {
            const author = testUsers[0]
            const post = await Post.create({
                title: 'Active Renewal Lifecycle Post',
                content: 'Testing active lease renewal heartbeat during cleanup.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'pending',
                imagePublicIds: ['long_running_asset_1']
            })
            createdPostIds.push(post._id)

            // Simulate long-running image deletion (250ms) exceeding initial 150ms lease
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async () => {
                await new Promise(resolve => setTimeout(resolve, 250))
                return { result: 'ok' }
            })

            try {
                // Initial lease is 150ms, but heartbeat every 60ms adds 500ms
                const res = await executePostTombstoneCleanup(post._id, null, {
                    leaseDurationMs: 150,
                    heartbeatIntervalMs: 60,
                    additionalLeaseMs: 500
                })
                assert.ok(res?.success, 'Long-running cleanup with heartbeat renewal must successfully finalize')

                // Post document is confirmed deleted
                const postAfter = await Post.findById(post._id)
                assert.equal(postAfter, null)
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should prevent a stale worker with an expired lease from deleting Post in Post.deleteOne', async () => {
            const author = testUsers[0]
            const workerToken = 'expired_worker_token_999'
            const post = await Post.create({
                title: 'Expired Lease Worker Guard Post',
                content: 'Testing that expired worker cannot finalize deletion.',
                author: author._id,
                status: 'deleted',
                cleanupStatus: 'in_progress',
                cleanupLeaseOwner: workerToken,
                cleanupLeaseExpiresAt: new Date(Date.now() - 5000) // expired in the past!
            })
            createdPostIds.push(post._id)

            // Final Post.deleteOne must verify matching lease owner AND unexpired lease
            const deleteRes = await Post.deleteOne({
                _id: post._id,
                cleanupLeaseOwner: workerToken,
                cleanupLeaseExpiresAt: { $gte: new Date() }
            })
            assert.equal(deleteRes.deletedCount, 0, 'Expired worker must not be able to delete the post')

            // The post tombstone must still exist
            const postAfter = await Post.findById(post._id)
            assert.ok(postAfter, 'Post must remain intact when deleteOne is guarded against expired lease')
        })
    })

    describe('5. Exclusion of Deleted Posts from Feeds and Lookups', () => {
        let activePost
        let deletedPost

        before(async () => {
            const author = testUsers[0]
            activePost = await Post.create({
                title: 'Active Feed Post',
                content: 'This post is active and should appear.',
                excerpt: 'Excerpt active',
                author: author._id,
                category: testCategory._id,
                visibility: 'public',
                status: 'published',
                createdAt: new Date()
            })
            createdPostIds.push(activePost._id)

            deletedPost = await Post.create({
                title: 'Deleted Feed Post',
                content: 'This post is marked deleted and must never appear.',
                excerpt: 'Excerpt deleted',
                author: author._id,
                category: testCategory._id,
                visibility: 'public',
                status: 'deleted',
                createdAt: new Date()
            })
            createdPostIds.push(deletedPost._id)
        })

        it('should exclude deleted posts from fetchTrendingPosts', async () => {
            const res = await fetchTrendingPosts(testUsers[1]._id, 1, 50)
            const ids = res.blogs.map(b => b._id.toString())
            assert.ok(ids.includes(activePost._id.toString()))
            assert.equal(ids.includes(deletedPost._id.toString()), false)
        })

        it('should exclude deleted posts from fetchFollowingFeed', async () => {
            await User.updateOne({ _id: testUsers[1]._id }, { $set: { following: [testUsers[0]._id] } })

            const res = await fetchFollowingFeed(testUsers[1]._id, 1, 50)
            const ids = res.blogs.map(b => b._id.toString())
            assert.ok(ids.includes(activePost._id.toString()))
            assert.equal(ids.includes(deletedPost._id.toString()), false)
        })

        it('should exclude deleted posts from getPostsByCategoryName', async () => {
            const res = await getPostsByCategoryName(testCategory.name, testUsers[1]._id, 1, 50)
            const ids = res.blogs.map(b => b._id.toString())
            assert.ok(ids.includes(activePost._id.toString()))
            assert.equal(ids.includes(deletedPost._id.toString()), false)
        })

        it('should exclude deleted posts from publicFetchPosts and publicFetchPost', async () => {
            const feed = await publicFetchPosts()
            const ids = feed.map(b => b._id.toString())
            assert.equal(ids.includes(deletedPost._id.toString()), false)

            await assert.rejects(
                async () => {
                    await publicFetchPost(deletedPost._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    return true
                }
            )
        })

        it('should reject fetching comments or creating comments on a deleted post with 404', async () => {
            await assert.rejects(
                async () => {
                    await fetchCommentsByPost(deletedPost._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    return true
                }
            )

            await assert.rejects(
                async () => {
                    await createNewComment(deletedPost._id, testUsers[1]._id, 'Comment on deleted post')
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    return true
                }
            )
        })
    })

    describe('6. Saved Posts Consistent Pagination and Anonymity', () => {
        it('should filter null entries and calculate totalSaved with non-deleted count of 2', async () => {
            const reader = testUsers[11]
            const anonAuthor = testUsers[0]
            const publicAuthor = testUsers[1]

            const postAnon = await Post.create({
                title: 'Anonymous Saved Post',
                content: 'Anonymous content in saved list.',
                author: anonAuthor._id,
                visibility: 'anonymous',
                status: 'published'
            })
            const postPublic = await Post.create({
                title: 'Public Saved Post',
                content: 'Public content in saved list.',
                author: publicAuthor._id,
                visibility: 'public',
                status: 'published'
            })
            const postDeleted = await Post.create({
                title: 'Deleted Saved Post',
                content: 'Deleted content in saved list.',
                author: publicAuthor._id,
                status: 'deleted'
            })
            createdPostIds.push(postAnon._id, postPublic._id, postDeleted._id)

            // Save all 3 to reader
            await User.updateOne(
                { _id: reader._id },
                { $set: { savedPosts: [postAnon._id, postPublic._id, postDeleted._id] } }
            )

            const res = await getSavedPostsList(reader._id, 1, 10)
            assert.ok(res)

            // Both returned records and totalSaved must reflect identical filtering rules (2 published posts)
            assert.equal(res.savedPosts.length, 2, 'Null entries must be filtered out so exactly 2 posts are returned')
            assert.equal(res.pagination.totalSaved, 2, 'Total saved must match non-deleted count of exactly 2')

            // Anonymity check: anon post author must be null
            const returnedAnon = res.savedPosts.find(p => p._id.toString() === postAnon._id.toString())
            assert.ok(returnedAnon)
            assert.equal(returnedAnon.author, null)

            // Public post author must remain populated
            const returnedPublic = res.savedPosts.find(p => p._id.toString() === postPublic._id.toString())
            assert.ok(returnedPublic)
            assert.notEqual(returnedPublic.author, null)
        })
    })

    describe('7. Saved Posts Multi-Page Independent Pagination (totalSaved)', () => {
        it('should maintain consistent totalSaved count across multiple pagination pages', async () => {
            const reader = testUsers[10]
            const author = testUsers[1]

            const post1 = await Post.create({
                title: 'MultiPage Post 1',
                content: 'Valid content for multipage post 1',
                author: author._id,
                status: 'published'
            })
            const post2 = await Post.create({
                title: 'MultiPage Post 2',
                content: 'Valid content for multipage post 2',
                author: author._id,
                status: 'published'
            })
            const post3 = await Post.create({
                title: 'MultiPage Post 3',
                content: 'Valid content for multipage post 3',
                author: author._id,
                status: 'published'
            })
            const postDeleted = await Post.create({
                title: 'MultiPage Post Deleted',
                content: 'Valid content for multipage post deleted',
                author: author._id,
                status: 'deleted'
            })
            createdPostIds.push(post1._id, post2._id, post3._id, postDeleted._id)

            // Save all 4 (3 published, 1 deleted)
            await User.updateOne(
                { _id: reader._id },
                { $set: { savedPosts: [post1._id, post2._id, post3._id, postDeleted._id] } }
            )

            // Page 1, limit 1: should return 1 post, but totalSaved must be 3
            const p1 = await getSavedPostsList(reader._id, 1, 1)
            assert.equal(p1.savedPosts.length, 1)
            assert.equal(p1.pagination.totalSaved, 3, 'Page 1 totalSaved must be 3')
            assert.equal(p1.pagination.totalPages, 3)
            assert.equal(p1.pagination.currentPage, 1)
            assert.equal(p1.pagination.hasNext, true)
            assert.equal(p1.pagination.hasPrev, false)

            // Page 2, limit 1: should return 1 post, and totalSaved must still be 3
            const p2 = await getSavedPostsList(reader._id, 2, 1)
            assert.equal(p2.savedPosts.length, 1)
            assert.notEqual(p2.savedPosts[0]._id.toString(), p1.savedPosts[0]._id.toString())
            assert.equal(p2.pagination.totalSaved, 3, 'Page 2 totalSaved must be 3 independently of page')
            assert.equal(p2.pagination.totalPages, 3)
            assert.equal(p2.pagination.currentPage, 2)
            assert.equal(p2.pagination.hasNext, true)
            assert.equal(p2.pagination.hasPrev, true)

            // Page 3, limit 1: should return 1 post (final post), and totalSaved must still be 3
            const p3 = await getSavedPostsList(reader._id, 3, 1)
            assert.equal(p3.savedPosts.length, 1)
            assert.equal(p3.pagination.totalSaved, 3, 'Page 3 totalSaved must be 3 independently of page')
            assert.equal(p3.pagination.totalPages, 3)
            assert.equal(p3.pagination.currentPage, 3)
            assert.equal(p3.pagination.hasNext, false)
            assert.equal(p3.pagination.hasPrev, true)

            // Page 4, limit 1: beyond total pages, should return 0 posts, totalSaved remains 3
            const p4 = await getSavedPostsList(reader._id, 4, 1)
            assert.equal(p4.savedPosts.length, 0)
            assert.equal(p4.pagination.totalSaved, 3, 'Page 4 totalSaved must be 3')
            assert.equal(p4.pagination.hasNext, false)
            assert.equal(p4.pagination.hasPrev, true)
        })
    })

    describe('8. Admin deleteAnyPostById Reliable Tombstone & Authorization Lifecycle', () => {
        it('should reject missing adminId with 400 error', async () => {
            const post = await Post.create({
                title: 'Missing AdminId Test Post',
                content: 'Test content for missing adminId',
                author: testUsers[1]._id,
                status: 'published'
            })
            createdPostIds.push(post._id)

            await assert.rejects(
                async () => {
                    await deleteAnyPostById(post._id, null)
                },
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.match(err.message, /Admin ID is required/i)
                    return true
                }
            )

            await assert.rejects(
                async () => {
                    await deleteAnyPostById(post._id, undefined)
                },
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.match(err.message, /Admin ID is required/i)
                    return true
                }
            )
        })

        it('should reject invalid adminId format with 400 error', async () => {
            const post = await Post.create({
                title: 'Invalid AdminId Test Post',
                content: 'Test content for invalid adminId',
                author: testUsers[1]._id,
                status: 'published'
            })
            createdPostIds.push(post._id)

            await assert.rejects(
                async () => {
                    await deleteAnyPostById(post._id, 'not-a-valid-admin-id')
                },
                (err) => {
                    assert.equal(err.statusCode, 400)
                    assert.match(err.message, /Admin ID is required/i)
                    return true
                }
            )
        })

        it('should reject non-admin user with 403 error', async () => {
            const nonAdmin = testUsers[0]
            const post = await Post.create({
                title: 'Admin Auth Test Post',
                content: 'Test content',
                author: testUsers[1]._id,
                status: 'published'
            })
            createdPostIds.push(post._id)

            await assert.rejects(
                async () => {
                    await deleteAnyPostById(post._id, nonAdmin._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 403)
                    assert.match(err.message, /Admin access required/i)
                    return true
                }
            )
        })

        it('should reject suspended admin with 403 error', async () => {
            const runId = Math.random().toString(36).replace(/[^a-z]/g, '')
            const suspendedAdmin = await User.create({
                firstName: 'Suspended',
                lastName: 'Admin',
                userName: `susp_admin_${runId}`,
                emailId: `susp_admin_${runId}@example.com`,
                password: 'HashedPassword123!',
                role: 'admin',
                accountStatus: 'suspended'
            })

            const post = await Post.create({
                title: 'Suspended Admin Test Post',
                content: 'Test content',
                author: testUsers[1]._id,
                status: 'published'
            })
            createdPostIds.push(post._id)

            try {
                await assert.rejects(
                    async () => {
                        await deleteAnyPostById(post._id, suspendedAdmin._id)
                    },
                    (err) => {
                        assert.equal(err.statusCode, 403)
                        assert.match(err.message, /Admin access required/i)
                        return true
                    }
                )
            } finally {
                await User.deleteOne({ _id: suspendedAdmin._id })
            }
        })

        it('should delete post, cascade comments, remove saved references, and execute tombstone cleanup', async () => {
            const author = testUsers[2]
            const commenter = testUsers[3]
            const reader = testUsers[4]

            const post = await Post.create({
                title: 'Admin Full Lifecycle Post',
                content: 'Admin deletion lifecycle test content',
                author: author._id,
                status: 'published',
                imagePublicIds: ['admin_cleanup_img_1']
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Comment to be cascaded by admin deletion',
                author: commenter._id,
                post: post._id
            })
            createdCommentIds.push(comment._id)

            await User.updateOne(
                { _id: reader._id },
                { $addToSet: { savedPosts: post._id } }
            )

            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
                return { result: 'ok' }
            })

            try {
                const result = await deleteAnyPostById(post._id, adminUser._id)
                assert.ok(result)
                assert.equal(result._id.toString(), post._id.toString())

                // 1. Comments cascaded
                const remainingComments = await Comment.find({ post: post._id })
                assert.equal(remainingComments.length, 0, 'Associated comments must be safely removed')

                // 2. Saved references cleaned
                const updatedReader = await User.findById(reader._id)
                const isStillSaved = (updatedReader.savedPosts || []).some(id => id.toString() === post._id.toString())
                assert.equal(isStillSaved, false, 'Saved post references must be removed from users')

                // 3. Post document finalized / cleaned up
                const remainingPost = await Post.findById(post._id)
                assert.equal(remainingPost, null, 'Post document must be deleted after successful media cleanup')
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should preserve tombstone with cleanupStatus failed if Cloudinary fails during admin deletion', async () => {
            const author = testUsers[2]
            const commenter = testUsers[3]
            const reader = testUsers[4]

            const post = await Post.create({
                title: 'Admin Cloudinary Fail Post',
                content: 'Cloudinary failure during admin deletion',
                author: author._id,
                status: 'published',
                imagePublicIds: ['admin_fail_img_network_err']
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Comment on failing post',
                author: commenter._id,
                post: post._id
            })
            createdCommentIds.push(comment._id)

            await User.updateOne(
                { _id: reader._id },
                { $addToSet: { savedPosts: post._id } }
            )

            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async () => {
                throw new Error('Cloudinary Service Unavailable')
            })

            try {
                const result = await deleteAnyPostById(post._id, adminUser._id)
                assert.ok(result)

                // Comments and saved references must STILL be safely cleaned in the transaction
                const remainingComments = await Comment.find({ post: post._id })
                assert.equal(remainingComments.length, 0, 'Comments must be deleted even if media cleanup fails')

                const updatedReader = await User.findById(reader._id)
                const isStillSaved = (updatedReader.savedPosts || []).some(id => id.toString() === post._id.toString())
                assert.equal(isStillSaved, false, 'Saved references must be removed even if media cleanup fails')

                // Post tombstone must be PRESERVED with failed status and imagePublicIds intact for retry worker
                const tombstone = await Post.findById(post._id)
                assert.ok(tombstone, 'Tombstone must be preserved when media cleanup fails')
                assert.equal(tombstone.status, 'deleted')
                assert.equal(tombstone.cleanupStatus, 'failed')
                assert.ok(tombstone.imagePublicIds.includes('admin_fail_img_network_err'))
            } finally {
                destroyMock.mock.restore()
            }
        })
    })

    describe('9. Post Deletion Comment Cascade & Parent Deletion Guarding', () => {
        it('should cascade comment deletion when author deletes post via deletePost', async () => {
            const author = testUsers[5]
            const commenter = testUsers[6]

            const post = await Post.create({
                title: 'Author Deletion Comment Cascade Test',
                content: 'Testing author deletePost cascades comments',
                author: author._id,
                status: 'published'
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Comment to be cascaded by author deletion',
                author: commenter._id,
                post: post._id
            })
            createdCommentIds.push(comment._id)

            await deletePost(post._id, author._id)

            const remainingComments = await Comment.find({ post: post._id })
            assert.equal(remainingComments.length, 0, 'Comments must be cascaded upon normal deletePost')
        })

        it('should prevent updateCommentById on comment whose parent post is deleted', async () => {
            const author = testUsers[5]
            const commenter = testUsers[6]

            const post = await Post.create({
                title: 'Parent Deleted Update Comment Test',
                content: 'Valid content for parent deleted comment test',
                author: author._id,
                status: 'published'
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Original comment text',
                author: commenter._id,
                post: post._id
            })
            createdCommentIds.push(comment._id)

            // Mark post as deleted
            await Post.updateOne({ _id: post._id }, { $set: { status: 'deleted' } })

            await assert.rejects(
                async () => {
                    await updateCommentById(comment._id, commenter._id, 'Attempted updated comment text')
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    assert.match(err.message, /Post not found/i)
                    return true
                }
            )
        })

        it('should prevent deleteCommentById on comment whose parent post is deleted', async () => {
            const author = testUsers[5]
            const commenter = testUsers[6]

            const post = await Post.create({
                title: 'Parent Deleted Delete Comment Test',
                content: 'Valid content for parent deleted delete comment test',
                author: author._id,
                status: 'deleted'
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Comment on deleted post',
                author: commenter._id,
                post: post._id
            })
            createdCommentIds.push(comment._id)

            await assert.rejects(
                async () => {
                    await deleteCommentById(comment._id, commenter._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    assert.match(err.message, /Post not found/i)
                    return true
                }
            )
        })

        it('should prevent likeComment on comment whose parent post is deleted', async () => {
            const author = testUsers[5]
            const commenter = testUsers[6]

            const post = await Post.create({
                title: 'Parent Deleted Like Comment Test',
                content: 'Valid content for parent deleted like comment test',
                author: author._id,
                status: 'deleted'
            })
            createdPostIds.push(post._id)

            const comment = await Comment.create({
                content: 'Comment on deleted post to like',
                author: commenter._id,
                post: post._id
            })
            createdCommentIds.push(comment._id)

            await assert.rejects(
                async () => {
                    await likeComment(comment._id, testUsers[7]._id)
                },
                (err) => {
                    assert.equal(err.statusCode, 404)
                    assert.match(err.message, /Post not found/i)
                    return true
                }
            )
        })
    })

    describe('10. updatePostImages Atomic DB-First Ordering & Failure Resilience', () => {
        it('should successfully update post images, save DB first, then destroy old Cloudinary assets', async () => {
            const author = testUsers[8]
            const post = await Post.create({
                title: 'Image Update Success Test',
                content: 'Testing DB-first image update ordering',
                author: author._id,
                status: 'published',
                images: ['https://cloudinary.example.com/old_img_1.jpg', 'https://cloudinary.example.com/old_img_2.jpg'],
                imagePublicIds: ['old_img_alpha', 'old_img_beta']
            })
            createdPostIds.push(post._id)

            const destroyedIds = []
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
                destroyedIds.push(publicId)
                return { result: 'ok' }
            })

            try {
                const newFiles = [
                    { path: 'https://cloudinary.example.com/new_img_gamma.jpg', filename: 'new_img_gamma' }
                ]

                const result = await updatePostImages(post._id, newFiles, author._id)
                assert.ok(result)
                assert.deepEqual(result.imagePublicIds, ['new_img_gamma'])

                // Verify DB was updated
                const postInDb = await Post.findById(post._id)
                assert.deepEqual(postInDb.imagePublicIds, ['new_img_gamma'])

                // Verify old images were destroyed
                assert.ok(destroyedIds.includes('old_img_alpha'))
                assert.ok(destroyedIds.includes('old_img_beta'))
                // Verify new image was NOT destroyed
                assert.equal(destroyedIds.includes('new_img_gamma'), false)
            } finally {
                destroyMock.mock.restore()
            }
        })

        it('should NOT delete existing Cloudinary assets if database save fails, and should clean up newly uploaded assets', async () => {
            const author = testUsers[8]
            const post = await Post.create({
                title: 'Image Update DB Fail Test',
                content: 'Testing DB failure does not destroy old assets',
                author: author._id,
                status: 'published',
                images: ['https://cloudinary.example.com/preserve_old_1.jpg', 'https://cloudinary.example.com/preserve_old_2.jpg'],
                imagePublicIds: ['preserve_old_1', 'preserve_old_2']
            })
            createdPostIds.push(post._id)

            const destroyedIds = []
            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async (publicId) => {
                destroyedIds.push(publicId)
                return { result: 'ok' }
            })

            // Mock Post.prototype.save to fail
            const saveMock = mock.method(Post.prototype, 'save', async function() {
                throw new Error('Database write failure: simulated DB crash')
            })

            try {
                const newFiles = [
                    { path: 'https://cloudinary.example.com/temp_new_asset.jpg', filename: 'temp_new_asset_orphan' }
                ]

                await assert.rejects(
                    async () => {
                        await updatePostImages(post._id, newFiles, author._id)
                    },
                    (err) => {
                        assert.match(err.message, /Database write failure/i)
                        return true
                    }
                )

                // Critical requirement: Old images in Cloudinary must NOT be destroyed!
                assert.equal(destroyedIds.includes('preserve_old_1'), false, 'Existing asset 1 must NOT be destroyed on DB failure')
                assert.equal(destroyedIds.includes('preserve_old_2'), false, 'Existing asset 2 must NOT be destroyed on DB failure')

                // Newly uploaded asset MUST be cleaned up so it does not leak orphaned storage
                assert.ok(destroyedIds.includes('temp_new_asset_orphan'), 'Newly uploaded asset must be destroyed on DB failure')

                // Post in DB must STILL have original images
                saveMock.mock.restore() // restore before querying DB
                const postInDb = await Post.findById(post._id)
                assert.deepEqual(postInDb.imagePublicIds, ['preserve_old_1', 'preserve_old_2'], 'Post in DB must retain old public IDs intact')
            } finally {
                destroyMock.mock.restore()
                try { saveMock.mock.restore() } catch (_) {}
            }
        })

        it('should handle Cloudinary destroy error gracefully without failing after DB save succeeds', async () => {
            const author = testUsers[8]
            const post = await Post.create({
                title: 'Image Update Cloudinary Warning Test',
                content: 'Cloudinary failure during old image delete should not crash update',
                author: author._id,
                status: 'published',
                images: ['https://cloudinary.example.com/old_resilient_1.jpg'],
                imagePublicIds: ['old_resilient_1']
            })
            createdPostIds.push(post._id)

            const destroyMock = mock.method(cloudinary.uploader, 'destroy', async () => {
                throw new Error('Cloudinary 503 Service Unavailable')
            })

            try {
                const newFiles = [
                    { path: 'https://cloudinary.example.com/new_resilient_2.jpg', filename: 'new_resilient_2' }
                ]

                const result = await updatePostImages(post._id, newFiles, author._id)
                assert.ok(result)
                assert.deepEqual(result.imagePublicIds, ['new_resilient_2'])

                const postInDb = await Post.findById(post._id)
                assert.deepEqual(postInDb.imagePublicIds, ['new_resilient_2'], 'Post in DB must be successfully updated with new images')
            } finally {
                destroyMock.mock.restore()
            }
        })
    })
})
