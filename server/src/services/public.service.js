import Post from '../models/post.js'
import Category from '../models/category.js'

export async function fetchPosts() {
	const blogs = await Post.find()
		.sort({ likes: -1, createdAt: -1 })
		.limit(10)
		.select('title excerpt likes author visibility content createdAt images')
		.populate({
			path: 'author',
			select: 'userName avatar'
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
		.select('title content excerpt likes visibility createdAt author images')
		.populate({
			path: 'author',
			select: 'userName avatar'
		})
		.lean()

	if (!blog) {
		const err = new Error('Blog not found')
		err.statusCode = 404
		throw err
	}

	// Never disclose author identity for anonymous posts
	if (blog.visibility === 'anonymous') {
		blog.author = null
	}

	return blog
}

export async function getAllCategories() {
    const categories = await Category.find()
        .sort({ name: 1 })
        .select('name description slug')
        .lean()
    
    return categories
}
