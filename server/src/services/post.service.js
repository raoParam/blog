import crypto from 'crypto'
import mongoose from 'mongoose'
import Post from '../models/post.js'
import User from '../models/user.js'
import Category from '../models/category.js'
import Comment from '../models/comment.js'  //
import { validateUpdatedPost } from '../utils/postValidator.js'
import { cloudinary } from '../middleware/uploadPost.js'

export async function createPost(postData) {
    const post = await Post.create(postData)
    return post
}

export async function fetchPosts(postData, currentUserId) {
    const page = Number(postData.page) || 1
    const limit = 10
    
    const query = {
        author: { $ne: currentUserId },
        status: { $ne: 'deleted' }
    }
    
    const blogs = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName isVerifiedBadge')
    .lean()

    const sanitizedBlogs = blogs.map(blog => {
        if (blog.visibility === 'anonymous') {
            blog.author = null
        }
        return blog
    })

    const totalPosts = await Post.countDocuments(query)
    const totalPages = Math.ceil(totalPosts / limit)

    return {
        blogs: sanitizedBlogs,
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}

export async function fetchPost(postId) {
    const blog = await Post.findOne({ _id: postId, status: { $ne: 'deleted' } })
    .select('title content excerpt likes visibility createdAt images author')
    .populate({
        path : "author",
        select : "userName avatar firstName lastName isVerifiedBadge"
    })
    .lean()
    
    if(!blog) {
        const err = new Error("Blog not found")
        err.statusCode = 404
        throw err
    }
    if(blog.visibility === 'anonymous') {
        blog.author = null
    }
    return blog
}

export async function updatePost(postId,updatedPost,userId) {
    if (
       updatedPost.title === undefined &&
       updatedPost.content === undefined &&
       updatedPost.excerpt === undefined
    ) {
        const err = new Error("Please provide details that need to be updated")
        err.statusCode = 404
        throw err
    }
    validateUpdatedPost(updatedPost)
    const blog = await Post.findOne({ _id: postId, status: { $ne: 'deleted' } })
    if (!blog) {
        const err = new Error("Blog not found")
        err.statusCode = 404
        throw err
    }
    if (blog.author.toString() !== userId.toString()) {
        const err = new Error("Not authorized to update this blog")
        err.statusCode = 403
        throw err
    }
    if(updatedPost.title !== undefined) 
        blog.title = updatedPost.title
    if(updatedPost.content !== undefined) 
        blog.content = updatedPost.content
    if(updatedPost.excerpt !== undefined) 
        blog.excerpt = updatedPost.excerpt
    await blog.save()
    return blog
}

export async function deletePostImages(postOrId) {
    let post = postOrId
    if (!post || !post.imagePublicIds) {
        post = await Post.findById(postOrId)
    }

    if (!post || !post.imagePublicIds || post.imagePublicIds.length === 0) {
        return post || true
    }

    const successfullyDeleted = []

    for (const publicId of post.imagePublicIds) {
        try {
            const res = await cloudinary.uploader.destroy(publicId)
            if (res && (res.result === 'ok' || res.result === 'not found')) {
                successfullyDeleted.push(publicId)
            } else {
                const err = new Error(`Cloudinary destroy failed for ${publicId} with result: ${res?.result || 'unknown'}`)
                err.publicId = publicId
                throw err
            }
        } catch (destroyErr) {
            const isNotFound =
                destroyErr?.http_code === 404 ||
                destroyErr?.status === 404 ||
                destroyErr?.result === 'not found' ||
                destroyErr?.error?.http_code === 404

            if (isNotFound) {
                successfullyDeleted.push(publicId)
            } else {
                // If some images were already successfully deleted before this error,
                // pull them from the post document so subsequent retries only attempt the rest!
                if (successfullyDeleted.length > 0 && post._id) {
                    await Post.updateOne(
                        { _id: post._id },
                        { $pull: { imagePublicIds: { $in: successfullyDeleted } } }
                    ).catch(() => {})
                }
                throw destroyErr
            }
        }
    }

    // All images were successfully processed/confirmed deleted
    if (post._id && successfullyDeleted.length > 0) {
        await Post.updateOne(
            { _id: post._id },
            { $pull: { imagePublicIds: { $in: successfullyDeleted } } }
        ).catch(() => {})
        post.imagePublicIds = []
    }

    return post
}

export async function renewPostTombstoneLease(postId, leaseToken, additionalMs = 60000) {
    const newExpiresAt = new Date(Date.now() + additionalMs)
    const res = await Post.updateOne(
        {
            _id: postId,
            status: 'deleted',
            cleanupLeaseOwner: leaseToken,
            cleanupStatus: 'in_progress',
            cleanupLeaseExpiresAt: { $gte: new Date() }
        },
        {
            $set: { cleanupLeaseExpiresAt: newExpiresAt }
        }
    )
    return res.matchedCount > 0
}

export async function executePostTombstoneCleanup(postId, customLeaseOwner = null, options = {}) {
    const now = new Date()
    const leaseDurationMs = options.leaseDurationMs || 60000
    const leaseExpiration = new Date(now.getTime() + leaseDurationMs)
    const leaseToken = customLeaseOwner || crypto.randomUUID()

    const post = await Post.findOneAndUpdate(
        {
            _id: postId,
            status: 'deleted',
            $or: [
                { cleanupStatus: 'pending' },
                { cleanupStatus: 'none' },
                { cleanupStatus: 'failed' },
                { cleanupStatus: 'in_progress', cleanupLeaseExpiresAt: { $lt: now } }
            ]
        },
        {
            $set: {
                cleanupStatus: 'in_progress',
                cleanupLeaseExpiresAt: leaseExpiration,
                cleanupLeaseOwner: leaseToken
            }
        },
        { new: true }
    )

    if (!post) {
        return null
    }

    // Active lease renewal heartbeat for long-running cleanup
    const heartbeatIntervalMs = options.heartbeatIntervalMs || 15000
    const additionalLeaseMs = options.additionalLeaseMs || 60000
    let renewTimer = null
    if (options.autoRenew !== false) {
        renewTimer = setInterval(async () => {
            try {
                await renewPostTombstoneLease(postId, leaseToken, additionalLeaseMs)
            } catch (_) {}
        }, heartbeatIntervalMs)
        if (renewTimer.unref) renewTimer.unref()
    }

    try {
        await User.updateMany(
            { savedPosts: postId },
            { $pull: { savedPosts: postId } }
        )

        await Comment.deleteMany({ post: postId })

        // Propagate errors from image deletion: do NOT physically delete Post if media cleanup fails!
        await deletePostImages(post)

        if (renewTimer) {
            clearInterval(renewTimer)
            renewTimer = null
        }

        // Fencing check: verify this worker still holds the lease owner AND the lease has not expired
        const deleteRes = await Post.deleteOne({
            _id: postId,
            cleanupLeaseOwner: leaseToken,
            cleanupLeaseExpiresAt: { $gte: new Date() }
        })

        if (deleteRes.deletedCount === 0) {
            // Lease token was lost or lease expired before deletion could finalize
            return null
        }

        return { success: true }
    } catch (err) {
        if (renewTimer) {
            clearInterval(renewTimer)
            renewTimer = null
        }
        // Mark failed and allow immediate retry
        await Post.updateOne(
            { _id: postId, cleanupLeaseOwner: leaseToken },
            {
                $set: {
                    cleanupStatus: 'failed',
                    cleanupLeaseExpiresAt: new Date(0)
                }
            }
        ).catch(() => {})
        throw err
    }
}

export async function retryFailedPostCleanups() {
    const now = new Date()
    const eligiblePosts = await Post.find({
        status: 'deleted',
        $or: [
            { cleanupStatus: { $in: ['pending', 'failed', 'none'] } },
            { cleanupStatus: 'in_progress', cleanupLeaseExpiresAt: { $lt: now } }
        ]
    }).select('_id')

    let cleanedCount = 0
    for (const p of eligiblePosts) {
        try {
            const res = await executePostTombstoneCleanup(p._id)
            if (res?.success) {
                cleanedCount++
            }
        } catch (e) {
            console.error(`Retry cleanup failed for post ${p._id}:`, e)
        }
    }
    return cleanedCount
}

export async function deletePost(postId, userId) {
    const session = await mongoose.startSession()
    let blog
    try {
        await session.withTransaction(async () => {
            blog = await Post.findOne({ _id: postId, status: { $ne: 'deleted' } }).session(session)
            if (!blog) {
                const err = new Error("Blog not found")
                err.statusCode = 404
                throw err
            }
            if (blog.author.toString() !== userId.toString()) {
                const err = new Error("Not authorized to delete this blog")
                err.statusCode = 403
                throw err
            }

            blog.status = 'deleted'
            blog.deletedAt = new Date()
            blog.cleanupStatus = 'pending'
            blog.coordinationVersion = (blog.coordinationVersion || 0) + 1
            await blog.save({ session })

            await User.updateMany(
                { savedPosts: postId },
                { $pull: { savedPosts: postId } },
                { session }
            )

            await Comment.deleteMany(
                { post: postId },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }

    try {
        await executePostTombstoneCleanup(postId)
    } catch (cleanupErr) {
        console.error(`Tombstone cleanup failed immediately for ${postId}, deferred to retry worker:`, cleanupErr)
    }

    return blog
}

export async function updatePostImages(postId, newFiles, userId) {
    const blog = await Post.findOne({ _id: postId, status: { $ne: 'deleted' } })
    if (!blog) {
        const err = new Error("Blog not found")
        err.statusCode = 404
        throw err
    }
    if (blog.author.toString() !== userId.toString()) {
        const err = new Error("Not authorized to update this blog")
        err.statusCode = 403
        throw err
    }

    const oldPublicIds = [...(blog.imagePublicIds || [])]
    const newImages = newFiles && newFiles.length > 0 ? newFiles.map(file => file.path) : []
    const newPublicIds = newFiles && newFiles.length > 0 ? newFiles.map(file => file.filename) : []

    blog.images = newImages
    blog.imagePublicIds = newPublicIds

    try {
        await blog.save()
    } catch (saveErr) {
        // Failed database update must NOT delete existing Cloudinary assets.
        // Clean up newly uploaded files so they don't leak orphaned storage in Cloudinary.
        if (newPublicIds.length > 0) {
            for (const pubId of newPublicIds) {
                try {
                    await cloudinary.uploader.destroy(pubId)
                } catch (cleanupErr) {
                    console.error(`Failed to clean up newly uploaded image ${pubId} after DB error:`, cleanupErr)
                }
            }
        }
        throw saveErr
    }

    // Only delete old images AFTER the database update has successfully committed
    if (oldPublicIds.length > 0) {
        for (const publicId of oldPublicIds) {
            try {
                await cloudinary.uploader.destroy(publicId)
            } catch (error) {
                console.error(`Error deleting old image ${publicId} from Cloudinary:`, error)
            }
        }
    }

    return blog
}

export async function likePost(postId, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId)
    const postObjectId = new mongoose.Types.ObjectId(postId)

    const updated = await Post.findOneAndUpdate(
        { _id: postObjectId, status: { $ne: 'deleted' } },
        [
            {
                $set: {
                    likes: {
                        $cond: {
                            if: { $in: [userObjectId, { $ifNull: ["$likes", []] }] },
                            then: {
                                $filter: {
                                    input: { $ifNull: ["$likes", []] },
                                    as: "id",
                                    cond: { $ne: ["$$id", userObjectId] }
                                }
                            },
                            else: {
                                $concatArrays: [
                                    {
                                        $filter: {
                                            input: { $ifNull: ["$likes", []] },
                                            as: "id",
                                            cond: { $ne: ["$$id", userObjectId] }
                                        }
                                    },
                                    [userObjectId]
                                ]
                            }
                        }
                    }
                }
            }
        ],
        { updatePipeline: true, new: true, select: 'likes' }
    )

    if (!updated) {
        const err = new Error("Blog not found")
        err.statusCode = 404
        throw err
    }

    const isLikedByUser = (updated.likes || []).some(
        id => id.toString() === userId.toString()
    )

    return {
        totalLikes: (updated.likes || []).length,
        isLikedByUser
    }
}

export async function fetchTrendingPosts(currentUserId, page = 1, limit = 10) {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 20)
    
    const query = {
        author: { $ne: currentUserId },
        status: { $ne: 'deleted' },
        createdAt: { $gte: sevenDaysAgo }
    }
    
    const blogs = await Post.find(query)
    .sort({ likes: -1, createdAt: -1 })  // Most likes first, then newest
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName isVerifiedBadge')
    .lean()

    // Apply anonymous hiding (though trending only shows public)
    const sanitizedBlogs = blogs.map(blog => {
        if (blog.visibility === 'anonymous') {
            blog.author = null
        }
        return blog
    })

    const totalPosts = await Post.countDocuments(query)
    const totalPages = Math.ceil(totalPosts / limit)

    return {
        blogs: sanitizedBlogs,
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}

export async function fetchFollowingFeed(currentUserId, page = 1, limit = 10) {
    // Get users that current user follows
    const currentUser = await User.findById(currentUserId).select('following')
    const followingIds = currentUser?.following || []
    
    const query = {
        author: { $in: followingIds },  // Only from followed users
        visibility: 'public',  // Only public posts
        status: { $ne: 'deleted' }
    }
    
    const blogs = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName isVerifiedBadge')
    .lean()

    const sanitizedBlogs = blogs.map(blog => {
        if (blog.visibility === 'anonymous') {
            blog.author = null
        }
        return blog
    })

    const totalPosts = await Post.countDocuments(query)
    const totalPages = Math.ceil(totalPosts / limit)

    return {
        blogs: sanitizedBlogs,
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}

export async function getAllCategories() {
    const categories = await Category.find()
        .sort({ name: 1 })
        .select('name description slug')
        .lean()
    
    return categories
}

export async function getPostsByCategoryName(categoryName, currentUserId, page = 1, limit = 10) {
    // First find the category
    const category = await Category.findOne({ 
        $or: [
            { name: categoryName.toLowerCase() },
            { slug: categoryName.toLowerCase() }
        ]
    })
    
    if (!category) {
        const err = new Error('Category not found')
        err.statusCode = 404
        throw err
    }
    
    // Build query
    const query = {
        author: { $ne: currentUserId },
        status: { $ne: 'deleted' },
        category: category._id,
        visibility: 'public'
    }
    
    const blogs = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'userName avatar firstName lastName isVerifiedBadge')
        .populate('category', 'name slug')
        .lean()
    
    // Handle anonymous posts
    const sanitizedBlogs = blogs.map(blog => {
        if (blog.visibility === 'anonymous') {
            blog.author = null
        }
        return blog
    })
    
    const totalPosts = await Post.countDocuments(query)
    const totalPages = Math.ceil(totalPosts / limit)
    
    return {
        blogs: sanitizedBlogs,
        category: {
            _id: category._id,
            name: category.name,
            description: category.description,
            slug: category.slug
        },
        pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}

export async function createNewCategory({ name, description = '', adminId }) {
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
        $or: [
            { name: name.toLowerCase() },
            { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
        ]
    })
    
    if (existingCategory) {
        const err = new Error('Category already exists')
        err.statusCode = 409
        throw err
    }
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    // Create category
    const category = await Category.create({
        name: name.toLowerCase(),
        description,
        slug,
        createdBy: adminId
    })
    
    return category
}

export async function fetchCommentsByPost(postId, page = 1, limit = 20) {
    // Check if post exists
    const post = await Post.findOne({ _id: postId, status: { $ne: 'deleted' } })
    if (!post) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }

    const comments = await Comment.find({ post: postId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'userName avatar firstName lastName isVerifiedBadge')
        .lean()

    const totalComments = await Comment.countDocuments({ post: postId })
    const totalPages = Math.ceil(totalComments / limit)

    return {
        comments: comments.map(comment => ({
            _id: comment._id,
            content: comment.content,
            author: comment.author, // Contains user info
            likes: comment.likes?.length || 0,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
        })),
        pagination: {
            currentPage: page,
            totalPages,
            totalComments,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}

export async function createNewComment(postId, userId, content) {
    // Check if post exists
    const post = await Post.findOne({ _id: postId, status: { $ne: 'deleted' } })
    if (!post) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }

    const comment = await Comment.create({
        content,
        author: userId,
        post: postId
    })

    // Populate author info before returning
    await comment.populate('author', 'userName avatar firstName lastName isVerifiedBadge')

    return {
        _id: comment._id,
        content: comment.content,
        author: comment.author,
        likes: 0,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    }
}

export async function updateCommentById(commentId, userId, content) {
    const comment = await Comment.findById(commentId)

    if (!comment) {
        const err = new Error('Comment not found')
        err.statusCode = 404
        throw err
    }

    // Check parent post: must exist and not be deleted
    const parentPost = await Post.findOne({ _id: comment.post, status: { $ne: 'deleted' } })
    if (!parentPost) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }

    // Check if user is the author
    if (comment.author.toString() !== userId.toString()) {
        const err = new Error('Not authorized to update this comment')
        err.statusCode = 403
        throw err
    }

    comment.content = content
    await comment.save()

    await comment.populate('author', 'userName avatar firstName lastName isVerifiedBadge')

    return {
        _id: comment._id,
        content: comment.content,
        author: comment.author,
        likes: comment.likes?.length || 0,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    }
}

export async function deleteCommentById(commentId, userId) {
    const comment = await Comment.findById(commentId)

    if (!comment) {
        const err = new Error('Comment not found')
        err.statusCode = 404
        throw err
    }

    // Check parent post: must exist and not be deleted
    const parentPost = await Post.findOne({ _id: comment.post, status: { $ne: 'deleted' } })
    if (!parentPost) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }

    // Check if user is the author
    if (comment.author.toString() !== userId.toString()) {
        const err = new Error('Not authorized to delete this comment')
        err.statusCode = 403
        throw err
    }

    await comment.deleteOne()
    return true
}

export async function likeComment(commentId, userId) {
    const comment = await Comment.findById(commentId)
    if (!comment) {
        const err = new Error('Comment not found')
        err.statusCode = 404
        throw err
    }

    // Check parent post: must exist and not be deleted
    const parentPost = await Post.findOne({ _id: comment.post, status: { $ne: 'deleted' } })
    if (!parentPost) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)
    const commentObjectId = new mongoose.Types.ObjectId(commentId)

    const updated = await Comment.findOneAndUpdate(
        { _id: commentObjectId },
        [
            {
                $set: {
                    likes: {
                        $cond: {
                            if: { $in: [userObjectId, { $ifNull: ["$likes", []] }] },
                            then: {
                                $filter: {
                                    input: { $ifNull: ["$likes", []] },
                                    as: "id",
                                    cond: { $ne: ["$$id", userObjectId] }
                                }
                            },
                            else: {
                                $concatArrays: [
                                    {
                                        $filter: {
                                            input: { $ifNull: ["$likes", []] },
                                            as: "id",
                                            cond: { $ne: ["$$id", userObjectId] }
                                        }
                                    },
                                    [userObjectId]
                                ]
                            }
                        }
                    }
                }
            }
        ],
        { updatePipeline: true, new: true, select: 'likes' }
    )

    if (!updated) {
        const err = new Error('Comment not found')
        err.statusCode = 404
        throw err
    }

    const isLikedByUser = (updated.likes || []).some(
        id => id.toString() === userId.toString()
    )

    return {
        totalLikes: (updated.likes || []).length,
        isLikedByUser
    }
}
