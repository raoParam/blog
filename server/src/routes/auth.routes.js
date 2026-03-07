import express from 'express'
import auth from '../middleware/auth.js'
import { 
    register, 
    login, 
    logout,
    changePassword,
    refreshToken  
} from '../controllers/auth.controller.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh-token', refreshToken) 
authRouter.patch('/change-password', auth, changePassword)
authRouter.post('/logout', auth, logout)

export default authRouter
