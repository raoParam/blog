import validate from '../utils/authValidator.js'
import validator from 'validator'
import { createUser , loginUser , changeUserPassword, refreshAccessToken, logoutUser} from '../services/auth.service.js'

export async function register(req, res, next) {
    try {
        validate(req.body)
        const { user, isNewUser } = await createUser(req.body)
        
        res.status(isNewUser ? 201 : 200).json({
            user: {
                _id: user._id,
                userName: user.userName,
                emailId: user.emailId
            },
            isNewUser,
            Status: "success",
            Message: "User registered successfully"
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

        const { accessToken, refreshToken: newRefreshToken, user } = await refreshAccessToken(refreshToken)

        const safeUser = user.toObject()
        delete safeUser.password
        delete safeUser.refreshTokenVersion
        delete safeUser.googleId

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        })

        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken,
            user: safeUser,
            Status: "success",
            Message: "Token refreshed successfully"
        })
    } catch (err) {
        next(err)
    }
}
