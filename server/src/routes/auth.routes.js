import express from 'express'
import auth from '../middleware/auth.js'
import { register , login , logout } from '../controllers/auth.controller.js'

const authRouter = express.Router()

// register
authRouter.post('/register', register)
// login
authRouter.post('/login', login)
// logout
authRouter.post('/login',auth,logout)

export default authRouter
