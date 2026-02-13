import validate from '../utils/authValidator.js'
import { createUser , loginUser } from '../services/auth.service.js'

export async function register(req, res, next) {
    try {
        validate(req.body)

        const user = await createUser(req.body)

        res.status(201).json({
            status: 'Success',
            message: 'User registered successfully',
            userName: user.userName,
            id: user._id
        })
    } catch (err) {
        next(err) // 
    }
}

export async function login(req, res, next) {
    try {
        const { token } = await loginUser(req.body)
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production', 
        //     sameSite: 'strict',
        //     maxAge: 60 * 60 * 1000 
        // })
        
        res.status(200).json({
            token,
            status: "Success",
            message: "User Login Successfully"
        })
    } catch(err) {
        next(err)
    }
}

export async function logout(req, res, next) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        
        res.status(200).json({
            status: "Success",
            message: "Logged out successfully"
        })
    } catch(err) {
        next(err)
    }
}
