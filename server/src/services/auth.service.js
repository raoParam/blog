import User from '../models/user.js'
import bcrypt from 'bcrypt'

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
