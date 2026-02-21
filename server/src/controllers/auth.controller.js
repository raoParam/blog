import validate from '../utils/authValidator.js'
import validator from 'validator'
import { createUser , loginUser , verifyEmailOTP , sendEmailVerificationOTP , resendEmailVerificationOTP , sendPasswordResetOTP , resetUserPassword , changeUserPassword, refreshAccessToken, logoutUser} from '../services/auth.service.js'

export async function register(req, res, next) {
    try {
        validate(req.body)
        const user = await createUser(req.body)
        await sendEmailVerificationOTP(user.emailId)
        
        res.status(201).json({
            user: {
                _id: user._id,
                userName: user.userName,
                emailId: user.emailId,
                isEmailVerified: false
            },
            Status: "success",
            Message: "User registered successfully. Please verify your email."
        })
    } catch (err) {
        next(err)
    }
}

export async function login(req, res, next) {
    try {
        const deviceInfo = req.headers['user-agent'] || ''
        const ipAddress = req.ip || req.connection.remoteAddress

        const { accessToken, refreshToken, user } = await loginUser(req.body, deviceInfo, ipAddress)
        
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        })
        
        res.status(200).json({
            accessToken,
            refreshToken,
            user,
            Status: "success",
            Message: "User Login Successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function verifyEmail(req, res, next) {
    try {
        const { otp, emailId } = req.body

        if (!otp || !emailId) {
            const err = new Error('OTP and email are required')
            err.statusCode = 400
            throw err
        }

        const user = await verifyEmailOTP(emailId, otp)

        res.status(200).json({
            user: {
                _id: user._id,
                userName: user.userName,
                emailId: user.emailId,
                isEmailVerified: user.isEmailVerified,
                isVerifiedBadge: user.isVerifiedBadge
            },
            Status: "success",
            Message: "Email verified successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function resendVerificationOTP(req, res, next) {
    try {
        const { emailId } = req.body

        if (!emailId) {
            const err = new Error('Email is required')
            err.statusCode = 400
            throw err
        }

        await resendEmailVerificationOTP(emailId)

        res.status(200).json({
            expiresIn: '5 minutes',
            Status: "success",
            Message: "Verification OTP resent successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function forgotPassword(req, res, next) {
    try {
        const { emailId } = req.body

        if (!emailId) {
            const err = new Error('Email is required')
            err.statusCode = 400
            throw err
        }

        await sendPasswordResetOTP(emailId)

        res.status(200).json({
            expiresIn: '5 minutes',
            Status: "success",
            Message: "Password reset OTP sent to your email"
        })
    } catch (err) {
        next(err)
    }
}

export async function resetPassword(req, res, next) {
    try {
        const { emailId, otp, newPassword, confirmPassword } = req.body

        if (!emailId || !otp || !newPassword || !confirmPassword) {
            const err = new Error('All fields are required')
            err.statusCode = 400
            throw err
        }

        if (newPassword !== confirmPassword) {
            const err = new Error('Passwords do not match')
            err.statusCode = 400
            throw err
        }

        if (!validator.isStrongPassword(newPassword)) {
            const err = new Error('Password is not strong')
            err.statusCode = 400
            throw err
        }

        await resetUserPassword(emailId, otp, newPassword)

        res.status(200).json({
            Status: "success",
            Message: "Password reset successfully. You can now login with your new password."
        })
    } catch (err) {
        next(err)
    }
}

export async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body
        const userId = req.user._id

        if (!currentPassword || !newPassword || !confirmPassword) {
            const err = new Error('All fields are required')
            err.statusCode = 400
            throw err
        }

        if (newPassword !== confirmPassword) {
            const err = new Error('New passwords do not match')
            err.statusCode = 400
            throw err
        }

        if (!validator.isStrongPassword(newPassword)) {
            const err = new Error('Password is not strong')
            err.statusCode = 400
            throw err
        }

        await changeUserPassword(userId, currentPassword, newPassword)

        res.status(200).json({
            Status: "success",
            Message: "Password changed successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function logout(req, res, next) {
    try {
        if (!req.cookies?.token && !req.body.refreshToken) {
            const err = new Error("Already logged-out")
            err.statusCode = 400
            throw err
        }

        const { refreshToken } = req.body
        const userId = req.user?._id

        if (userId && refreshToken) {
            await logoutUser(userId, refreshToken)
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/' 
        })
        
        res.status(200).json({
            Status: "success",
            Message: "Logged out successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            const err = new Error('Refresh token is required')
            err.statusCode = 400
            throw err
        }

        const { accessToken, user } = await refreshAccessToken(refreshToken)

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        })

        res.status(200).json({
            accessToken,
            user,
            Status: "success",
            Message: "Token refreshed successfully"
        })
    } catch (err) {
        next(err)
    }
}