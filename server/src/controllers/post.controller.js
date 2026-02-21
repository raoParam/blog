import validatePost from '../utils/postValidator.js'
import { 
    createPost, 
    fetchPosts, 
    fetchPost, 
    updatePost, 
    deletePost, 
    likePost,
    fetchTrendingPosts,
    fetchFollowingFeed,
    getAllCategories,
    getPostsByCategoryName,
    createNewCategory,
    fetchCommentsByPost,
    createNewComment,
    updateCommentById,
    deleteCommentById
} from '../services/post.service.js'


export async function createBlog(req, res, next) {
    try {

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

export async function getCategories(req, res, next) {
    try {
        const categories = await getAllCategories()
        
        res.status(200).json({
            categories,
            Status: "success",
            Message: "Categories fetched successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function getPostsByCategory(req, res, next) {
    try {
        const { name } = req.params
        const currentUserId = req.user._id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        
        const result = await getPostsByCategoryName(name, currentUserId, page, limit)
        
        res.status(200).json({
            blogs: result.blogs,
            category: result.category,
            pagination: result.pagination,
            Status: "success",
            Message: `Posts in category "${name}" fetched successfully`
        })
    } catch(err) {
        next(err)
    }
}

export async function createCategory(req, res, next) {
    try {
        const { name, description } = req.body
        const adminId = req.user._id  
        
        if (!name) {
            const err = new Error('Category name is required')
            err.statusCode = 400
            throw err
        }
        
        const category = await createNewCategory({ name, description, adminId })
        
        res.status(201).json({
            category,
            Status: "success",
            Message: "Category created successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function getComments(req, res, next) {
    try {
        const { postId } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        
        const result = await fetchCommentsByPost(postId, page, limit)
        
        res.status(200).json({
            blogId: postId,
            comments: result.comments,
            pagination: result.pagination,
            Status: "success",
            Message: "Comments fetched successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function addComment(req, res, next) {
    try {
        const { postId } = req.params
        const { content } = req.body
        const userId = req.user._id

        if (!content) {
            const err = new Error('Comment content is required')
            err.statusCode = 400
            throw err
        }

        const comment = await createNewComment(postId, userId, content)

        res.status(201).json({
            comment,
            Status: "success",
            Message: "Comment added successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function updateComment(req, res, next) {
    try {
        const { commentId } = req.params
        const { content } = req.body
        const userId = req.user._id

        if (!content) {
            const err = new Error('Comment content is required')
            err.statusCode = 400
            throw err
        }

        const updatedComment = await updateCommentById(commentId, userId, content)

        res.status(200).json({
            comment: updatedComment,
            Status: "success",
            Message: "Comment updated successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function deleteComment(req, res, next) {
    try {
        const { commentId } = req.params
        const userId = req.user._id

        await deleteCommentById(commentId, userId)

        res.status(200).json({
            Status: "success",
            Message: "Comment deleted successfully"
        })
    } catch(err) {
        next(err)
    }
}