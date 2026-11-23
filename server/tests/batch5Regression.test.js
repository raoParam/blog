import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { getFollowersList, getFollowingList } from '../src/services/user.service.js'
import User from '../src/models/user.js'

function generateMockUsers(count, prefix = 'user') {
    return Array.from({ length: count }, (_, i) => ({
        _id: `507f1f77bcf86cd7994390${String(i + 1).padStart(2, '0')}`,
        userName: `${prefix}_${i + 1}`,
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        avatar: `https://example.com/${prefix}_${i + 1}.jpg`,
        bio: `Bio of ${prefix} ${i + 1}`,
        isVerifiedBadge: i % 2 === 0,
        toObject() {
            return {
                _id: this._id,
                userName: this.userName,
                firstName: this.firstName,
                lastName: this.lastName,
                avatar: this.avatar,
                bio: this.bio,
                isVerifiedBadge: this.isVerifiedBadge
            }
        }
    }))
}

describe('Batch 5 Regression Tests — Followers and Following Pagination', () => {
    const targetUserId = '507f1f77bcf86cd799439099'
    const currentViewerId = '507f1f77bcf86cd799439000'

    describe('getFollowersList', () => {
        it('should verify total count reflects complete relationship list (45), not just current page slice (20)', async () => {
            const all45FollowerIds = Array.from({ length: 45 }, (_, i) => `follower_id_${i + 1}`)
            const page1Followers = generateMockUsers(20, 'follower')

            let capturedPopulateOpts = null
            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ followers: all45FollowerIds })
                        }
                    },
                    populate(popOpts) {
                        capturedPopulateOpts = popOpts
                        return Promise.resolve({
                            followers: page1Followers
                        })
                    }
                }
            })

            try {
                const result = await getFollowersList(targetUserId, 1, 20)

                assert.ok(result)
                assert.equal(result.followers.length, 20, 'Current page should contain 20 items')
                assert.equal(result.pagination.totalFollowers, 45, 'Total followers must reflect complete relationship list, not current page size')
                assert.equal(result.pagination.totalPages, 3, '45 items with limit 20 must produce 3 total pages')
                assert.equal(result.pagination.currentPage, 1)
                assert.equal(result.pagination.hasNext, true)
                assert.equal(result.pagination.hasPrev, false)

                // Verify populate options passed to Mongoose
                assert.equal(capturedPopulateOpts.options.skip, 0)
                assert.equal(capturedPopulateOpts.options.limit, 20)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify page 1 and page 2 return correct users and skip/limit options across multiple pages', async () => {
            const all45FollowerIds = Array.from({ length: 45 }, (_, i) => `follower_id_${i + 1}`)
            const page1Followers = generateMockUsers(20, 'p1_follower')
            const page2Followers = generateMockUsers(20, 'p2_follower')

            let requestedPage = 1
            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ followers: all45FollowerIds })
                        }
                    },
                    populate(popOpts) {
                        if (popOpts.options.skip === 0) {
                            return Promise.resolve({ followers: page1Followers })
                        } else if (popOpts.options.skip === 20) {
                            return Promise.resolve({ followers: page2Followers })
                        }
                        return Promise.resolve({ followers: [] })
                    }
                }
            })

            try {
                // Page 1
                const resPage1 = await getFollowersList(targetUserId, 1, 20)
                assert.equal(resPage1.pagination.currentPage, 1)
                assert.equal(resPage1.followers[0].userName, 'p1_follower_1')
                assert.equal(resPage1.pagination.hasNext, true)
                assert.equal(resPage1.pagination.hasPrev, false)

                // Page 2
                const resPage2 = await getFollowersList(targetUserId, 2, 20)
                assert.equal(resPage2.pagination.currentPage, 2)
                assert.equal(resPage2.followers[0].userName, 'p2_follower_1')
                assert.equal(resPage2.pagination.hasNext, true)
                assert.equal(resPage2.pagination.hasPrev, true)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify pagination metadata on the final page (page 3)', async () => {
            const all45FollowerIds = Array.from({ length: 45 }, (_, i) => `follower_id_${i + 1}`)
            const page3Followers = generateMockUsers(5, 'p3_follower')

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ followers: all45FollowerIds })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ followers: page3Followers })
                    }
                }
            })

            try {
                const result = await getFollowersList(targetUserId, 3, 20)
                assert.equal(result.followers.length, 5)
                assert.equal(result.pagination.currentPage, 3)
                assert.equal(result.pagination.totalPages, 3)
                assert.equal(result.pagination.totalFollowers, 45)
                assert.equal(result.pagination.hasNext, false, 'Final page must have hasNext: false')
                assert.equal(result.pagination.hasPrev, true, 'Final page must have hasPrev: true')
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify behavior when the relationship list is empty', async () => {
            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ followers: [] })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ followers: [] })
                    }
                }
            })

            try {
                const result = await getFollowersList(targetUserId, 1, 20)
                assert.deepEqual(result.followers, [])
                assert.equal(result.pagination.totalFollowers, 0)
                assert.equal(result.pagination.totalPages, 0)
                assert.equal(result.pagination.currentPage, 1)
                assert.equal(result.pagination.hasNext, false)
                assert.equal(result.pagination.hasPrev, false)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify behavior when requested page is beyond the last page', async () => {
            const all45FollowerIds = Array.from({ length: 45 }, (_, i) => `follower_id_${i + 1}`)

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ followers: all45FollowerIds })
                        }
                    },
                    populate(popOpts) {
                        // Beyond page 3, database returns empty array
                        return Promise.resolve({ followers: [] })
                    }
                }
            })

            try {
                const result = await getFollowersList(targetUserId, 5, 20)
                assert.deepEqual(result.followers, [])
                assert.equal(result.pagination.currentPage, 5)
                assert.equal(result.pagination.totalPages, 3)
                assert.equal(result.pagination.totalFollowers, 45)
                assert.equal(result.pagination.hasNext, false)
                assert.equal(result.pagination.hasPrev, true)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify handling of missing or deleted referenced user documents consistently without crashing', async () => {
            const validUser1 = generateMockUsers(1, 'valid1')[0]
            const validUser2 = generateMockUsers(1, 'valid2')[0]
            // Simulates deleted users whose reference returns null after populate
            const populatedWithDanglingReferences = [validUser1, null, undefined, validUser2]

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ followers: ['id1', 'id2', 'id3', 'id4'] })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ followers: populatedWithDanglingReferences })
                    }
                }
            })

            try {
                const result = await getFollowersList(targetUserId, 1, 20)
                assert.equal(result.followers.length, 2, 'Null/undefined dangling references should be filtered out')
                assert.equal(result.followers[0].userName, 'valid1_1')
                assert.equal(result.followers[1].userName, 'valid2_1')
                assert.equal(result.pagination.totalFollowers, 4)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should correctly determine isFollowing flag when currentUserId is provided', async () => {
            const followers = generateMockUsers(2, 'user')
            const followedId = followers[0]._id

            const findByIdMock = mock.method(User, 'findById', (id) => {
                if (id === currentViewerId) {
                    return {
                        select: () => ({
                            lean: async () => ({ following: [followedId] })
                        })
                    }
                }
                return {
                    select: () => ({
                        lean: async () => ({ followers: [followers[0]._id, followers[1]._id] })
                    }),
                    populate: async () => ({ followers })
                }
            })

            try {
                const result = await getFollowersList(targetUserId, 1, 20, currentViewerId)
                assert.equal(result.followers[0].isFollowing, true)
                assert.equal(result.followers[1].isFollowing, false)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should throw 404 error if user does not exist', async () => {
            const findByIdMock = mock.method(User, 'findById', () => ({
                select: () => ({
                    lean: async () => null
                })
            }))

            try {
                await assert.rejects(
                    async () => await getFollowersList('non_existent_id', 1, 20),
                    (err) => {
                        assert.equal(err.statusCode, 404)
                        assert.equal(err.message, 'User not found')
                        return true
                    }
                )
            } finally {
                findByIdMock.mock.restore()
            }
        })
    })

    describe('getFollowingList', () => {
        it('should verify total count reflects complete relationship list (50), not just current page slice (20)', async () => {
            const all50FollowingIds = Array.from({ length: 50 }, (_, i) => `following_id_${i + 1}`)
            const page1Following = generateMockUsers(20, 'following')

            let capturedPopulateOpts = null
            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ following: all50FollowingIds })
                        }
                    },
                    populate(popOpts) {
                        capturedPopulateOpts = popOpts
                        return Promise.resolve({
                            following: page1Following
                        })
                    }
                }
            })

            try {
                const result = await getFollowingList(targetUserId, 1, 20)

                assert.ok(result)
                assert.equal(result.following.length, 20, 'Current page should contain 20 items')
                assert.equal(result.pagination.totalFollowing, 50, 'Total following must reflect complete relationship list, not current page size')
                assert.equal(result.pagination.totalPages, 3, '50 items with limit 20 must produce 3 total pages')
                assert.equal(result.pagination.currentPage, 1)
                assert.equal(result.pagination.hasNext, true)
                assert.equal(result.pagination.hasPrev, false)

                assert.equal(capturedPopulateOpts.options.skip, 0)
                assert.equal(capturedPopulateOpts.options.limit, 20)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify page 1 and page 2 return correct users and skip/limit options across multiple pages', async () => {
            const all50FollowingIds = Array.from({ length: 50 }, (_, i) => `following_id_${i + 1}`)
            const page1Following = generateMockUsers(20, 'p1_following')
            const page2Following = generateMockUsers(20, 'p2_following')

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ following: all50FollowingIds })
                        }
                    },
                    populate(popOpts) {
                        if (popOpts.options.skip === 0) {
                            return Promise.resolve({ following: page1Following })
                        } else if (popOpts.options.skip === 20) {
                            return Promise.resolve({ following: page2Following })
                        }
                        return Promise.resolve({ following: [] })
                    }
                }
            })

            try {
                const resPage1 = await getFollowingList(targetUserId, 1, 20)
                assert.equal(resPage1.pagination.currentPage, 1)
                assert.equal(resPage1.following[0].userName, 'p1_following_1')
                assert.equal(resPage1.pagination.hasNext, true)
                assert.equal(resPage1.pagination.hasPrev, false)

                const resPage2 = await getFollowingList(targetUserId, 2, 20)
                assert.equal(resPage2.pagination.currentPage, 2)
                assert.equal(resPage2.following[0].userName, 'p2_following_1')
                assert.equal(resPage2.pagination.hasNext, true)
                assert.equal(resPage2.pagination.hasPrev, true)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify pagination metadata on the final page (page 3)', async () => {
            const all50FollowingIds = Array.from({ length: 50 }, (_, i) => `following_id_${i + 1}`)
            const page3Following = generateMockUsers(10, 'p3_following')

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ following: all50FollowingIds })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ following: page3Following })
                    }
                }
            })

            try {
                const result = await getFollowingList(targetUserId, 3, 20)
                assert.equal(result.following.length, 10)
                assert.equal(result.pagination.currentPage, 3)
                assert.equal(result.pagination.totalPages, 3)
                assert.equal(result.pagination.totalFollowing, 50)
                assert.equal(result.pagination.hasNext, false)
                assert.equal(result.pagination.hasPrev, true)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify behavior when the following relationship list is empty', async () => {
            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ following: [] })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ following: [] })
                    }
                }
            })

            try {
                const result = await getFollowingList(targetUserId, 1, 20)
                assert.deepEqual(result.following, [])
                assert.equal(result.pagination.totalFollowing, 0)
                assert.equal(result.pagination.totalPages, 0)
                assert.equal(result.pagination.currentPage, 1)
                assert.equal(result.pagination.hasNext, false)
                assert.equal(result.pagination.hasPrev, false)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify behavior when requested page is beyond the last page', async () => {
            const all50FollowingIds = Array.from({ length: 50 }, (_, i) => `following_id_${i + 1}`)

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ following: all50FollowingIds })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ following: [] })
                    }
                }
            })

            try {
                const result = await getFollowingList(targetUserId, 8, 20)
                assert.deepEqual(result.following, [])
                assert.equal(result.pagination.currentPage, 8)
                assert.equal(result.pagination.totalPages, 3)
                assert.equal(result.pagination.totalFollowing, 50)
                assert.equal(result.pagination.hasNext, false)
                assert.equal(result.pagination.hasPrev, true)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should verify handling of missing or deleted referenced user documents consistently without crashing', async () => {
            const validUser1 = generateMockUsers(1, 'valid1')[0]
            const validUser2 = generateMockUsers(1, 'valid2')[0]
            const populatedWithDanglingReferences = [null, validUser1, undefined, validUser2, null]

            const findByIdMock = mock.method(User, 'findById', (id) => {
                return {
                    select(fields) {
                        return {
                            lean: async () => ({ following: ['id1', 'id2', 'id3', 'id4', 'id5'] })
                        }
                    },
                    populate(popOpts) {
                        return Promise.resolve({ following: populatedWithDanglingReferences })
                    }
                }
            })

            try {
                const result = await getFollowingList(targetUserId, 1, 20)
                assert.equal(result.following.length, 2, 'Null/undefined dangling references should be filtered out')
                assert.equal(result.following[0].userName, 'valid1_1')
                assert.equal(result.following[1].userName, 'valid2_1')
                assert.equal(result.pagination.totalFollowing, 5)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should correctly determine isFollowing flag when currentUserId is provided', async () => {
            const followingUsers = generateMockUsers(2, 'following_user')
            const alreadyFollowedId = followingUsers[1]._id

            const findByIdMock = mock.method(User, 'findById', (id) => {
                if (id === currentViewerId) {
                    return {
                        select: () => ({
                            lean: async () => ({ following: [alreadyFollowedId] })
                        })
                    }
                }
                return {
                    select: () => ({
                        lean: async () => ({ following: [followingUsers[0]._id, followingUsers[1]._id] })
                    }),
                    populate: async () => ({ following: followingUsers })
                }
            })

            try {
                const result = await getFollowingList(targetUserId, 1, 20, currentViewerId)
                assert.equal(result.following[0].isFollowing, false)
                assert.equal(result.following[1].isFollowing, true)
            } finally {
                findByIdMock.mock.restore()
            }
        })

        it('should throw 404 error if user does not exist', async () => {
            const findByIdMock = mock.method(User, 'findById', () => ({
                select: () => ({
                    lean: async () => null
                })
            }))

            try {
                await assert.rejects(
                    async () => await getFollowingList('non_existent_id', 1, 20),
                    (err) => {
                        assert.equal(err.statusCode, 404)
                        assert.equal(err.message, 'User not found')
                        return true
                    }
                )
            } finally {
                findByIdMock.mock.restore()
            }
        })
    })
})
