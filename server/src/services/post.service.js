import Post from '../models/post.js'
import { validateUpdatedPost } from '../utils/postValidator.js'

export async function createPost(postData) {
    postData.likes = 0
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
    .populate({
        path: 'author',
        select: 'firstName lastName userName bio'
      })
    .lean()

    const sanitizedBlogs = blogs.map(blog => {
        if (blog.visibility === 'anonymous') {
            blog.author = null
        }
        return blog
    })

    return sanitizedBlogs
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
