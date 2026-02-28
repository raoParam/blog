import express from 'express'
import { getPosts , getPost , getCategories } from '../controllers/public.controller.js'

const publicRouter = express.Router()

// first 10 posts
publicRouter.get('/posts', getPosts)
// post_info
publicRouter.get('/posts/:postId', getPost)
// categories
publicRouter.get('/categories', getCategories)
export default publicRouter