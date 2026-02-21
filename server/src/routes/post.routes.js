import express from 'express'
import { 
    createBlog, 
    getBlogs, 
    getBlog, 
    updateBlog, 
    deleteBlog, 
    likeBlog,
    getTrendingBlogs,
    getFollowingFeed
} from '../controllers/post.controller.js'
import { uploadPostImages } from '../middleware/uploadPost.js'
import auth from '../middleware/auth.js'

const postRouter = express.Router()

postRouter.post('/', auth, uploadPostImages, createBlog)
postRouter.get('/posts', auth, getBlogs)
postRouter.get('/trending', auth, getTrendingBlogs)
postRouter.get('/following', auth, getFollowingFeed)

postRouter.get('/:postId', auth, getBlog)
postRouter.put('/:postId', auth, updateBlog)
postRouter.delete('/:postId', auth, deleteBlog)
postRouter.post('/:postId/like', auth, likeBlog)

export default postRouter