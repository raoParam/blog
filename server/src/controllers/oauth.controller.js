import passport from 'passport'
import { handleOAuthLogin } from '../services/oauth.service.js'

const fallbackClientUrl = 'https://flagger-fawn.vercel.app'
const clientUrlFromEnv = process.env.CLIENT_URL
const clientUrl =
  process.env.NODE_ENV === 'production' && clientUrlFromEnv?.includes('localhost')
    ? fallbackClientUrl
    : clientUrlFromEnv || fallbackClientUrl

// Initiate Google OAuth login
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
})

// Google OAuth callback
export const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user, info) => {
        try {
            if (err || !user) {
                return res.redirect(`${clientUrl}/login?error=oauth_failed`)
            }

            // Get device info
            const deviceInfo = req.headers['user-agent'] || ''
            const ipAddress = req.ip || req.connection.remoteAddress

            // Generate tokens
            const { accessToken, refreshToken, user: userData } = await handleOAuthLogin(user, deviceInfo, ipAddress)

            // Set cookie
            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            // Redirect to frontend with tokens
            const redirectUrl = `${clientUrl}/oauth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
            res.redirect(redirectUrl)

        } catch (error) {
            next(error)
        }
    })(req, res, next)
}

// Handle OAuth callback from frontend (after redirect)
export const handleOAuthCallback = async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = req.query

        if (!accessToken || !refreshToken) {
            const err = new Error('Missing tokens')
            err.statusCode = 400
            throw err
        }

        // Verify refresh token to get user
        const { verifyRefreshToken } = await import('../services/auth.service.js')
        const { user } = await verifyRefreshToken(refreshToken)

        res.status(200).json({
            status: 'success',
            message: 'OAuth login successful',
            accessToken,
            refreshToken,
            user
        })
    } catch (err) {
        next(err)
    }
}
