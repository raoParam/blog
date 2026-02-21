import validatePost from '../utils/postValidator.js'
import { 
    createPost, 
    fetchPosts, 
    fetchPost, 
    updatePost, 
    deletePost, 
    likePost,
    fetchTrendingPosts,
    fetchFollowingFeed
} from '../services/post.service.js'


export async function createBlog(req, res, next) {
    try {
        console.log('========== CLOUDINARY UPLOAD ==========')
        console.log('req.body:', req.body)
        console.log('req.files count:', req.files?.length)
        console.log('=======================================')

        const { title, content, excerpt, visibility } = req.body

        if (!title || !content) {
            const err = new Error('Title and content are required')
            err.statusCode = 400
            throw err
        }

        const postData = {
            title,
            content,
            excerpt: excerpt || '',
            visibility: visibility || 'public',
            author: req.user._id,
            images: [],
            imagePublicIds: []
        }

        // ✅ Add Cloudinary image URLs and public_ids
        if (req.files && req.files.length > 0) {
            postData.images = req.files.map(file => file.path)
            postData.imagePublicIds = req.files.map(file => file.filename)
        }

        // Validate post data
        validatePost(postData)
        
        const blog = await createPost(postData)

        res.status(201).json({
            blog,
            Status: "success",
            Message: "Blog created successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function getBlogs(req, res, next) {
    try {
        const currentUserId = req.user._id  
        const result = await fetchPosts(req.query, currentUserId)
        
        res.status(200).json({
            blogs: result.blogs,
            pagination: result.pagination,
            Status: "success",
            Message: "Blogs fetched successfully"
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
			Status : "success",
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
			Status : "success",
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
			Status : "success",
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
			Status : "success",
			Message : "Blog liked successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function getTrendingBlogs(req, res, next) {
    try {
        const currentUserId = req.user._id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        
        const result = await fetchTrendingPosts(currentUserId, page, limit)
        
        res.status(200).json({
            blogs: result.blogs,
            pagination: result.pagination,
            Status: "success",
            Message: "Trending blogs fetched successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function getFollowingFeed(req, res, next) {
    try {
        const currentUserId = req.user._id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        
        const result = await fetchFollowingFeed(currentUserId, page, limit)
        
        res.status(200).json({
            blogs: result.blogs,
            pagination: result.pagination,
            Status: "success",
            Message: "Following feed fetched successfully"
        })
    } catch(err) {
        next(err)
    }
}

