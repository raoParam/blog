import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export default async function auth(req, res, next) {
    try {
        let token = req.cookies?.token
        
        if (!token) {
            const authHeader = req.headers.authorization

            if(!authHeader) {
                const err = new Error("Token not found")
                err.statusCode = 401
                throw err
            }  

            if(!authHeader.startsWith('Bearer ')) {
                const err = new Error("Invalid token format")
                err.statusCode = 401
                throw err
            }  

            token = authHeader.split(' ')[1]
        }
        
        if(!token) {
            const err = new Error("Token missing")
            err.statusCode = 401
            throw err
        }
        
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const { _id, version } = payload
        const user = await User.findById(_id)
        
        if(!user) {
            const err = new Error("User doesn't exist")
            err.statusCode = 404
            throw err
        }

        // Check if token version matches user's version
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
