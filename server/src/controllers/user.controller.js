import { fetchPosts , update_Post } from '../services/user.service.js'

export async function getProfile(req,res,next){
	try {
		const {user} = req
		res.status(200).json({
			user,
			Status : "Success",
			Message : "User profile fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function getPosts(req,res,next) {
	try {
		const { user } = req
		const blogs = await fetchPosts(user._id)
		res.status(200).json({
			blogs,
			Status : "Success",
			Message : "User blogs fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function updatePost(req,res,next) {
	try {
		const _id  = req.params.postId
		const updates = req.body
		const updatedPost = await update_Post(_id,updates,req.user._id)
		res.status(200).json({
			updatedPost,
			Status : "Success",
			Message : "Post updated successfully"
		})
	} catch (err) {
		next(err)
	}
}