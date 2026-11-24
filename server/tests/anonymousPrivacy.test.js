import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { fetchPost, fetchPosts } from '../src/services/public.service.js'
import Post from '../src/models/post.js'

describe('Anonymous Post Privacy (public.service.js)', () => {
    const mockAuthor = {
        _id: new mongoose.Types.ObjectId(),
        userName: 'secret_dev',
        avatar: 'https://cdn.example.com/secret_dev.jpg'
    }

    const mockPostId = new mongoose.Types.ObjectId().toString()

    it('should strip author identity (set author to null) for anonymous single post', async () => {
        const anonymousPost = {
            _id: mockPostId,
            title: 'An Anonymous Security Confession',
            content: 'Sensitive story...',
            excerpt: 'Preview snippet',
            likes: [],
            visibility: 'anonymous',
            author: mockAuthor,
            createdAt: new Date()
        }

        const findByIdMock = mock.method(Post, 'findById', () => ({
            select: () => ({
                populate: () => ({
                    lean: async () => ({ ...anonymousPost })
                })
            })
        }))

        const result = await fetchPost(mockPostId)

        findByIdMock.mock.restore()

        assert.equal(result.visibility, 'anonymous')
        assert.equal(result.author, null, 'Author must be null for anonymous posts')
        assert.equal(result.title, 'An Anonymous Security Confession')
    })

    it('should retain author identity for public single post', async () => {
        const publicPost = {
            _id: mockPostId,
            title: 'Public Architectural Blueprint',
            content: 'Public content...',
            excerpt: 'Preview snippet',
            likes: [],
            visibility: 'public',
            author: mockAuthor,
            createdAt: new Date()
        }

        const findByIdMock = mock.method(Post, 'findById', () => ({
            select: () => ({
                populate: () => ({
                    lean: async () => ({ ...publicPost })
                })
            })
        }))

        const result = await fetchPost(mockPostId)

        findByIdMock.mock.restore()

        assert.equal(result.visibility, 'public')
        assert.notEqual(result.author, null)
        assert.equal(result.author.userName, 'secret_dev')
    })

    it('should strip author identity across public multi-post feed for anonymous posts', async () => {
        const feedPosts = [
            {
                _id: 'post1',
                title: 'Public Post',
                visibility: 'public',
                author: { userName: 'public_author' }
            },
            {
                _id: 'post2',
                title: 'Anonymous Post',
                visibility: 'anonymous',
                author: { userName: 'hidden_author' }
            }
        ]

        const findMock = mock.method(Post, 'find', () => ({
            sort: () => ({
                limit: () => ({
                    select: () => ({
                        populate: () => ({
                            lean: async () => feedPosts.map(p => ({ ...p }))
                        })
                    })
                })
            })
        }))

        const results = await fetchPosts()

        findMock.mock.restore()

        assert.equal(results[0].visibility, 'public')
        assert.equal(results[0].author.userName, 'public_author')

        assert.equal(results[1].visibility, 'anonymous')
        assert.equal(results[1].author, null, 'Feed must strip anonymous author')
    })

    it('should throw 404 if post does not exist', async () => {
        const findByIdMock = mock.method(Post, 'findById', () => ({
            select: () => ({
                populate: () => ({
                    lean: async () => null
                })
            })
        }))

        let errorResult = null
        try {
            await fetchPost(mockPostId)
        } catch (err) {
            errorResult = err
        }

        findByIdMock.mock.restore()

        assert.ok(errorResult)
        assert.equal(errorResult.statusCode, 404)
        assert.equal(errorResult.message, 'Blog not found')
    })
})
