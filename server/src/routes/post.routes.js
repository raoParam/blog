import express from 'express'
import { createBlog , getBlogs } from '../controllers/post.controller.js'
import auth from '../middleware/auth.js'
const postRouter = express.Router()


// post blog
postRouter.post('/',auth,createBlog)
// get blogs
postRouter.get('/posts',auth,getBlogs)

export default postRouter