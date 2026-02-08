import { fetchPost } from '../services/public.service.js'
export async function getPosts(req,res,next){
	try {
		const blogs = await fetchPost()
		res.status(200).json({
			blogs,
			Status : "Success",
			Message : "Blogs Fetched Successfully"
		})
	} catch(err) {
		next(err)
	}
}