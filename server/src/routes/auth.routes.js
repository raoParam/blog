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
    refreshToken  // Add this import
} from '../controllers/auth.controller.js'

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

export default authRouter