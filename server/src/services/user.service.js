import Post from '../models/post.js'

export async function fetchPosts(userId) {
	const blogs = await Post.find({author : userId})
	.sort({createdAt : -1})
	return blogs
}

export async function update_Post(postId,updates,userId) {
	let blog = await Post.findById( postId )
	if (!blog) {
		const err = new Error("Post not found")
		err.statusCode = 404
		throw err
	}
	if (blog.author.toString() !== userId.toString()) {
		const err = new Error("You're not able to update this post")
		err.statusCode = 403
		throw err
	}
	const allowedFields = ['title', 'content','excerpt']
	for (let key of allowedFields) {
		if (updates[key] !== undefined) {
			blog[key] = updates[key]
		}
	}
	await blog.save()
	return blog
}

