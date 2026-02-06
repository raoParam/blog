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
        res.status(200).json({
            token,
            Status : "Success",
            Message : "User Login Successfully"
        })
    } catch(err) {
        next(err)
    }
}
