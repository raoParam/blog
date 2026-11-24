import { fetchPosts, fetchPost, getAllCategories } from '../services/public.service.js'
import { isValidObjectId } from '../utils/queryHelper.js'

export async function getPosts(req, res, next) {
	try {
		const blogs = await fetchPosts()
		res.status(200).json({
			blogs,
			Status: "success",
			Message: "Blogs Fetched Successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function getPost(req, res, next) {
	try {
		const { postId } = req.params
		if (!isValidObjectId(postId)) {
			const err = new Error('Blog not found')
			err.statusCode = 404
			throw err
		}

		const post = await fetchPost(postId)
		res.status(200).json({
			post,
			Status: "success",
			Message: "Blog fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function getCategories(req, res, next) {
	try {
		const categories = await getAllCategories()
		res.status(200).json({
			categories,
			Status: "success",
			Message: "Categories fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}
