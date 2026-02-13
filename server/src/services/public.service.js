import Post from '../models/post.js'

export async function fetchPosts(){
	const blogs = await Post.find()
	.sort({likes : -1 , createdAt:-1})
	.limit(10)
	.select('title excerpt likes author visibility content createdAt')
	.populate({
		path : 'author',
		select : 'userName'
	})
	.lean()

	const sanitizedBlogs = blogs.map(blog => {
		if(blog.visibility === 'anonymous') {
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
		const err = new Error('Blog not found')
		err.statusCode = 404
		throw err
	}
	return blog
}
