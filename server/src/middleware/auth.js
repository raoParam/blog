import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export default async function auth(req, res, next) {
    try {
        let token = req.cookies?.token
        
        if (!token) {
            const authHeader = req.headers.authorization

            if (typeof authHeader !== 'string' || !authHeader) {
                const err = new Error("Token not found")
                err.statusCode = 401
                throw err
            }  

            const bearerMatch = authHeader.match(/^Bearer\s+(\S+)$/i)
            if (!bearerMatch) {
                const err = new Error("Invalid token format")
                err.statusCode = 401
                throw err
            }
            token = bearerMatch[1]
        }
        
        if (!token) {
            const err = new Error("Token missing")
            err.statusCode = 401
            throw err
        }

        if (!process.env.JWT_SECRET) {
            const err = new Error("Authentication configuration missing on server")
            err.statusCode = 500
            throw err
        }
        
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const { _id, version } = payload

        if (
            !_id ||
            !Number.isSafeInteger(version) ||
            version < 0
        ) {
            const err = new Error("Invalid token payload")
            err.statusCode = 401
            throw err
        }

        const user = await User.findById(_id)
        
        if (!user) {
            const err = new Error("User doesn't exist")
            err.statusCode = 401
            throw err
        }

        // Only explicitly active accounts may access protected routes.
        if (user.accountStatus !== 'active') {
            const err = new Error("Account is not active")
            err.statusCode = 403
            throw err
        }

        // Reject tokens issued before a password change or session invalidation.
        if (version !== user.refreshTokenVersion) {
            const err = new Error("Token has been invalidated")
            err.statusCode = 401
            throw err
        }
        
        req.token = token
        req.user = user
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            err.statusCode = 401
            err.message = 'jwt expired'
        } else if (err.name === 'JsonWebTokenError') {
            err.statusCode = 401
            err.message = 'Invalid token'
        }
        next(err)
    }
}
