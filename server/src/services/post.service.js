import Post from '../models/post.js'
import User from '../models/user.js'
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
        author: { $ne: currentUserId }
    }
    
    const blogs = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName')
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
    const blog = await Post.findById(postId)
    .select('title content excerpt likes visibility createdAt images')
    .populate({
        path : "author",
        select : "userName avatar firstName lastName"
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
    const blog = await Post.findById(postId)
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

export async function deletePostImages(postId) {
    try {
        // Get post to find image public_ids
        const post = await Post.findById(postId)
        
        if (post && post.imagePublicIds && post.imagePublicIds.length > 0) {
            // Delete each image from Cloudinary
            for (const publicId of post.imagePublicIds) {
                await cloudinary.uploader.destroy(publicId)
                console.log(`Deleted image: ${publicId}`)
            }
        }
    } catch (error) {
        console.error('Error deleting images from Cloudinary:', error)
        // Don't throw - continue with post deletion even if image delete fails
    }
}

export async function deletePost(postId, userId) {
    const blog = await Post.findById(postId)
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
    
    // Delete images from Cloudinary first
    await deletePostImages(postId)
    
    // Then delete the post
    await blog.deleteOne()
    return blog
}

export async function updatePostImages(postId, newFiles, userId) {
    const blog = await Post.findById(postId)
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
    
    // Delete old images
    if (blog.imagePublicIds && blog.imagePublicIds.length > 0) {
        for (const publicId of blog.imagePublicIds) {
            await cloudinary.uploader.destroy(publicId)
        }
    }
    
    // Add new images
    if (newFiles && newFiles.length > 0) {
        blog.images = newFiles.map(file => file.path)
        blog.imagePublicIds = newFiles.map(file => file.filename)
    } else {
        blog.images = []
        blog.imagePublicIds = []
    }
    
    await blog.save()
    return blog
}

export async function likePost(postId, userId) {

    const blog = await Post.findById(postId)
    if (!blog) {
        const err = new Error("Blog not found")
        err.statusCode = 404
        throw err
    }

    const alreadyLiked = blog.likes.some(
        id => id.toString() === userId.toString()
    )

    if (alreadyLiked) {
        blog.likes = blog.likes.filter(
            id => id.toString() !== userId.toString()
        )
    } else {
        blog.likes.push(userId)
    }

    await blog.save()

    return {
        totalLikes: blog.likes.length,
        isLikedByUser: !alreadyLiked
    }
}

export async function fetchTrendingPosts(currentUserId, page = 1, limit = 10) {
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 20)
    
    const query = {
        author: { $ne: currentUserId },
        createdAt: { $gte: sevenDaysAgo }
    }
    
    const blogs = await Post.find(query)
    .sort({ likes: -1, createdAt: -1 })  // Most likes first, then newest
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName')
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
        visibility: 'public'  // Only public posts
    }
    
    const blogs = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName')
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
