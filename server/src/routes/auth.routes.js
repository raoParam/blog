import express from 'express'
import rateLimit from 'express-rate-limit'
import auth from '../middleware/auth.js'
import {
    register,
    login,
    logout,
    changePassword,
    refreshToken
} from '../controllers/auth.controller.js'

const authRouter = express.Router()

// Rate limiter for authentication endpoints to protect against brute-force and credential stuffing
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // max 20 requests per IP per window
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 'failed',
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
})

authRouter.post('/register', authLimiter, register)
authRouter.post('/login', authLimiter, login)
authRouter.post('/refresh-token', authLimiter, refreshToken)
authRouter.patch('/change-password', auth, changePassword)
authRouter.post('/logout', auth, logout)

export default authRouter
