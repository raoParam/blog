import User from '../models/user.js'
import OTP from '../models/otp.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateOTP, saveOTP } from './otp.service.js'
import { sendOTPEmail } from './email.service.js'

export async function createUser(userData) {
    // Check if user exists
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

    // Hash password
    const hashedPassword = await bcrypt.hash(
        userData.password,
        Number(process.env.SALT_ROUNDS)
    )

    // Create user with isEmailVerified: false
    const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailId: userData.emailId,
        userName: userData.userName,
        password: hashedPassword,
        role: 'user',
        avatar: '',
        bio: 'Hey there! I am using Flagged',
        isEmailVerified: false,  
        isVerifiedBadge: false,
        accountStatus: 'active',
        followers: [],
        following: [],
        savedPosts: []
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
        err.statusCode = 401
        throw err
    }
    let isValiduser = await bcrypt.compare(password,existingUser.password)
    if(!isValiduser) {
        const err = new Error("Invalid Credentials")
        err.statusCode = 401
        throw err
    }
    if(!process.env.JWT_SECRET) {
        const err = new Error("Internal Server Error, jwt_secret not found")
        err.statusCode = 500
        throw err
    }
    const token = await jwt.sign({_id : existingUser._id , userName : existingUser.userName},process.env.JWT_SECRET,{expiresIn : '1h'})
    const user = {
        _id: existingUser._id,
        userName: existingUser.userName,
        emailId: existingUser.emailId,
        role: existingUser.role,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        avatar: existingUser.avatar,
        bio: existingUser.bio,
        isEmailVerified: existingUser.isEmailVerified,
        isVerifiedBadge : existingUser.isVerifiedBadge,
        accountStatus: existingUser.accountStatus,
        followers: existingUser.followers,
        following: existingUser.following,
        savedPosts: existingUser.savedPosts,
        createdAt: existingUser.createdAt
    }

    return { token, user }
}

export async function verifyEmailOTP(emailId, otp) {
    const otpRecord = await OTP.findOne({
        emailId,
        otp,
        type: 'email_verification',
        isUsed: false,
        expiresAt: { $gt: new Date() }
    })

    // Check if OTP exists and is valid
    if (!otpRecord) {
        const err = new Error('Invalid or expired OTP')
        err.statusCode = 400
        throw err
    }

    // Mark OTP as used
    otpRecord.isUsed = true
    await otpRecord.save()

    // Find and update user
    const user = await User.findOne({ emailId })
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    // Mark email as verified
    user.isEmailVerified = true
    await user.save()

    return user
}

export async function sendEmailVerificationOTP(emailId) {
    // Generate 6-digit OTP
    const otp = generateOTP()

    // Save to database
    await saveOTP(emailId, otp, 'email_verification')

    // Send email
    await sendOTPEmail(emailId, otp, 'email_verification')

    return true
}

export async function resendEmailVerificationOTP(emailId) {
    // Check if user exists
    const user = await User.findOne({ emailId })
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    // Check if already verified
    if (user.isEmailVerified) {
        const err = new Error('Email already verified')
        err.statusCode = 400
        throw err
    }

    // Generate new OTP
    const otp = generateOTP()

    // Save to database (this will automatically mark old OTPs as used)
    await saveOTP(emailId, otp, 'email_verification')

    // Send email
    await sendOTPEmail(emailId, otp, 'email_verification')

    return true
}

export async function sendPasswordResetOTP(emailId) {
    // Check if user exists
    const user = await User.findOne({ emailId })
    
    if (!user) {
        const err = new Error('User not found with this email')
        err.statusCode = 404
        throw err
    }

    // Generate OTP
    const otp = generateOTP()

    // Save to database (marks old unused password reset OTPs as used)
    await saveOTP(emailId, otp, 'password_reset')

    // Send email
    await sendOTPEmail(emailId, otp, 'password_reset')

    return true
}

export async function resetUserPassword(emailId, otp, newPassword) {
    // Find the OTP record
    const otpRecord = await OTP.findOne({
        emailId,
        otp,
        type: 'password_reset',
        isUsed: false,
        expiresAt: { $gt: new Date() }
    })

    // Check if OTP is valid
    if (!otpRecord) {
        const err = new Error('Invalid or expired OTP')
        err.statusCode = 400
        throw err
    }

    // Find user
    const user = await User.findOne({ emailId }).select('+password')
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(process.env.SALT_ROUNDS)
    )

    // Update password
    user.password = hashedPassword
    await user.save()

    otpRecord.isUsed = true
    await otpRecord.save()

    return true
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
    // Find user with password field
    const user = await User.findById(userId).select('+password')
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValidPassword) {
        const err = new Error('Current password is incorrect')
        err.statusCode = 401
        throw err
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(process.env.SALT_ROUNDS)
    )

    // Update password
    user.password = hashedPassword
    await user.save()

    return true
}