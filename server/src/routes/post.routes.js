import express from 'express'
import { 
    createBlog, 
    getBlogs, 
    getBlog, 
    updateBlog, 
    deleteBlog, 
    likeBlog,
    getTrendingBlogs,
    getFollowingFeed,
    getCategories,
    getPostsByCategory,
    createCategory,
    getComments,
    addComment,
    updateComment,
    deleteComment
} from '../controllers/post.controller.js'
import { uploadPostImages } from '../middleware/uploadPost.js'
import auth from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const postRouter = express.Router()

// Blog routes
postRouter.post('/', auth, uploadPostImages, createBlog)
postRouter.get('/posts', auth, getBlogs)
postRouter.get('/trending', auth, getTrendingBlogs)
postRouter.get('/following', auth, getFollowingFeed)

// Category routes
postRouter.get('/categories', auth, getCategories)
postRouter.get('/category/:name', auth, getPostsByCategory)
postRouter.post('/category', auth, adminAuth, createCategory)

// Comment routes
postRouter.get('/:postId/comments', auth, getComments)      // Get all comments for a post
postRouter.post('/:postId/comments', auth, addComment)      // Add comment to post
postRouter.put('/comments/:commentId', auth, updateComment) // Update comment
postRouter.delete('/comments/:commentId', auth, deleteComment) // Delete comment

// Parameterized routes (keep at end)
postRouter.get('/:postId', auth, getBlog)
postRouter.put('/:postId', auth, updateBlog)
postRouter.delete('/:postId', auth, deleteBlog)
postRouter.post('/:postId/like', auth, likeBlog)

export default postRouter