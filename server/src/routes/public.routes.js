import express from 'express'
import { getPosts } from '../controllers/public.controller.js'

const publicRouter = express.Router()

// first 10 posts
publicRouter.get('/posts', getPosts)

export default publicRouter