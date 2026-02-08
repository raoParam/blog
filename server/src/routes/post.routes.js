import express from 'express'
import { createBlog } from '../controllers/post.controller.js'
import auth from '../middleware/auth.js'
const postRouter = express.Router()


// post blog
postRouter.post('/new',auth,createBlog)

export default postRouter