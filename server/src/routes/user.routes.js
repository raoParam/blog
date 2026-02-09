import express from 'express'
import auth from '../middleware/auth.js'
import { getProfile , getPosts , updatePost } from '../controllers/user.controller.js'
const userRouter = express.Router()

// getProfile
userRouter.get('/me',auth,getProfile)
// getPosts
userRouter.get('/posts',auth,getPosts)
// updatePost
userRouter.patch('/:postId',auth,updatePost)


export default userRouter