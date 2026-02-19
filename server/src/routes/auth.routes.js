import express from 'express'
import auth from '../middleware/auth.js'
import { 
    register, 
    login, 
    logout,
    verifyEmail,
    resendVerificationOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken  
} from '../controllers/auth.controller.js'
import { googleAuth, googleAuthCallback, handleOAuthCallback } from '../controllers/oauth.controller.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/verify-email', verifyEmail)
authRouter.post('/resend-verification', resendVerificationOTP)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)
authRouter.post('/refresh-token', refreshToken)  // New route (no auth needed)
authRouter.patch('/change-password', auth, changePassword)
authRouter.post('/logout', auth, logout)
authRouter.get('/google', googleAuth)
authRouter.get('/google/callback', googleAuthCallback)
authRouter.get('/oauth/callback', handleOAuthCallback)

export default authRouter