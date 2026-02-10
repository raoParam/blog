import express from 'express'
import { createBlog , getBlogs , getBlog } from '../controllers/post.controller.js'
import auth from '../middleware/auth.js'
const postRouter = express.Router()


// post blog
postRouter.post('/',auth,createBlog)
// get blogs
postRouter.get('/posts',auth,getBlogs)
// get particular blog
postRouter.get('/:postId',auth,getBlog)

export default postRouter