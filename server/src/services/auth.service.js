import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function createUser(userData) {
    const existingUser = await User.findOne({
        $or: [
            { emailId: userData.emailId },
            { userName: userData.userName }
        ]
    })

    if (existingUser) {
        const err = new Error('User already exists')
        err.statusCode = 409
        throw err
    }

    const hashedPassword = await bcrypt.hash(
        userData.password,
        Number(process.env.SALT_ROUNDS)
    )

    const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: 'user'
    })

    return user
}

export async function loginUser(userData) {
    const { emailId , password } = userData
    if(!emailId || !password) {
        const err = new Error('Required fields are missing')
        err.statusCode = 400
        throw err
    }
    const existingUser = await User.findOne({emailId}).select('+password')
    if(!existingUser) {
        const err = new Error("Invalid Credentials")
        err.statusCode = 404
        throw err
    }
    let isValiduser = await bcrypt.compare(password,existingUser.password)
    if(!isValiduser) {
        const err = new Error("Invalid Credentials")
        err.statusCode = 400
        throw err
    }
    const token = await jwt.sign({_id : existingUser._id , userName : existingUser.userName},process.env.JWT_SECRET,{expiresIn : '1h'})
    return {token}
}
