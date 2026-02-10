import Post from '../models/post.js'

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
