import Post from '../models/post.js'

export async function createPost(postData) {
    postData.likes = 0
    const post = await Post.create(postData)
    return post
}