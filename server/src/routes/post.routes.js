import express from 'express'
import { createBlog , getBlogs , getBlog , updateBlog , deleteBlog } from '../controllers/post.controller.js'
import auth from '../middleware/auth.js'
const postRouter = express.Router()


// post blog
postRouter.post('/',auth,createBlog)
// get blogs
postRouter.get('/posts',auth,getBlogs)
// get particular blog
postRouter.get('/:postId',auth,getBlog)
// update particular blog
postRouter.put('/:postId',auth,updateBlog)
// delete particular blog
postRouter.delete('/:postId',auth,deleteBlog)

export default postRouter