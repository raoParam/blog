import Post from '../models/post.js'
import { validateUpdatedPost } from '../utils/postValidator.js'

export async function createPost(postData) {
    const post = await Post.create(postData)
    return post
}

export async function fetchPosts(postData) {
    const page = Number(postData.page) || 1
    const limit = 10
    
    const blogs = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName')  // Simpler populate syntax
    .lean()

    // Don't modify anything, just return
    return blogs
}
export async function fetchPost(postId) {
    const blog = await Post.findById(postId)
    .select('title content excerpt likes visibility createdAt')
    .populate({
        path : "author",
        select : "userName"
    })
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

export async function deletePost(postId,userId) {
    const blog = await Post.findById(postId)
    if(!blog) {
        const err = new Error("Blog not found")
        err.statusCode = 404
        throw err
    }
    if (blog.author.toString() !== userId.toString()) {
        const err = new Error("Not authorized to delete this blog")
        err.statusCode = 403
        throw err
    }
    await blog.deleteOne()
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

