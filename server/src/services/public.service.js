import Post from '../models/post.js'

export async function fetchPost(){
	const blogs = await Post.find()
	.sort({likes : -1 , createdAt:-1})
	.limit(10)
	.select('title excerpt likes author visibility')
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

