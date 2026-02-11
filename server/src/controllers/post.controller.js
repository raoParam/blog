import validatePost from '../utils/postValidator.js'
import { createPost , fetchPosts , fetchPost , updatePost , deletePost , likePost } from '../services/post.service.js'


export async function createBlog(req,res,next){
	try {
		req.body.author = req.user._id
		validatePost(req.body)
		const blog = await createPost(req.body)
		res.status(201).json({
			blog,
			Status : "Success",
			Message : "Blog created successfully"
		})
	} catch(err) {
		next(err)
	}
}

export async function getBlogs(req,res,next) {
	try {
		const blogs = await fetchPosts(req.query)
		res.status(200).json({
			blogs,
			Status : "Success",
			Message : "Blogs Fetched Successfully"
		})
	} catch(err) {
		next(err)
	}
}

export async function getBlog(req,res,next) {
	try {
		const blog = await fetchPost(req.params.postId)
		res.status(200).json({
			blog,
			Status : "Success",
			Message : "Blog fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function updateBlog(req,res,next) {
	try {
		const { postId } = req.params
		const updatedBlog = await updatePost(postId,req.body,req.user._id)
		res.status(200).json({
			updatedBlog,
			Status : "Success",
			Message : "Blog updated successfully"
		})
	} catch(err) {
		next(err)
	}
}

export async function deleteBlog(req,res,next) {
	try {
		const { postId } = req.params
		const deletedBlog = await deletePost(postId,req.user._id)
		res.status(200).json({
			deletedBlog,
			Status : "Success",
			Message : "Blog deleted successfully"
		})
	} catch(err) {
		next(err)
	}
}

export async function likeBlog(req,res,next) {
	try {
		const { postId } = req.params
		const likes = await likePost(postId,req.user._id)
		res.status(200).json({
			likes,
			Status : "Success",
			Message : "Blog liked successfully"
		})
	} catch (err) {
		next(err)
	}
}