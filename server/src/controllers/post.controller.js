import validatePost from '../utils/postValidator.js'
import {createPost} from '../services/post.service.js'


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