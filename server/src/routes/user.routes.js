import express from 'express'
import auth from '../middleware/auth.js'
import { getProfile } from '../controllers/user.controller.js'
const userRouter = express.Router()

// getProfile
userRouter.get('/me',auth,getProfile)


export default userRouter