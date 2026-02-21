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
        category: category._id,
        visibility: 'public'
    }
    
    const blogs = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'userName avatar firstName lastName')
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
    const post = await Post.findById(postId)
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
    const post = await Post.findById(postId)
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

    const alreadyLiked = comment.likes.some(
        id => id.toString() === userId.toString()
    )

    if (alreadyLiked) {
        comment.likes = comment.likes.filter(
            id => id.toString() !== userId.toString()
        )
    } else {
        comment.likes.push(userId)
    }

    await comment.save()

    return {
        totalLikes: comment.likes.length,
        isLikedByUser: !alreadyLiked
    }
}