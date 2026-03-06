import User from '../models/user.js'
import OTP from '../models/otp.js'
import RefreshToken from '../models/refreshToken.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { generateOTP, saveOTP } from './otp.service.js'
import { sendOTPEmail } from './email.service.js'

const RESEND_COOLDOWN_SECONDS = 30
const MAX_RESEND_ATTEMPTS = 3

// Generate Access Token (short-lived)
export const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            _id: user._id, 
            userName: user.userName,
            version: user.refreshTokenVersion 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // 15 minutes
    )
}

// Generate Refresh Token (long-lived)
export const generateRefreshToken = async (user, deviceInfo = '', ipAddress = '') => {
    // Create unique token
    const token = jwt.sign(
        { 
            _id: user._id,
            version: user.refreshTokenVersion,
            jti: randomUUID()
        },
        process.env.JWT_SECRET + user.refreshTokenVersion, // Extra security
        { expiresIn: '7d' } // 7 days
    )

    // Save to database
    const refreshToken = await RefreshToken.create({
        token,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        deviceInfo,
        ipAddress
    })

    return refreshToken.token
}

// Verify Refresh Token
export const verifyRefreshToken = async (token) => {
    const refreshToken = await RefreshToken.findOne({ 
        token, 
        isValid: true,
        expiresAt: { $gt: new Date() }
    }).populate('user')

    if (!refreshToken) {
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }

    const user = refreshToken.user
    try {
        jwt.verify(token, process.env.JWT_SECRET + user.refreshTokenVersion)
        return { user, refreshToken }
    } catch (error) {
        // If token verification fails, invalidate it
        refreshToken.isValid = false
        await refreshToken.save()
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }
}

// Get new access token using refresh token
export const refreshAccessToken = async (refreshTokenStr) => {
    const { user, refreshToken } = await verifyRefreshToken(refreshTokenStr)

    // Rotate refresh token on every refresh call for better security.
    refreshToken.isValid = false
    await refreshToken.save()
    const newRefreshToken = await generateRefreshToken(
        user,
        refreshToken.deviceInfo || '',
        refreshToken.ipAddress || ''
    )

    // Generate new access token
    const accessToken = generateAccessToken(user)

    return { accessToken, refreshToken: newRefreshToken, user }
}

// Invalidate all refresh tokens for a user (logout from all devices)
export const invalidateAllUserTokens = async (userId) => {
    await RefreshToken.updateMany(
        { user: userId, isValid: true },
        { isValid: false }
    )
}

// Update loginUser function
export async function loginUser(userData, deviceInfo = '', ipAddress = '') {
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

    // Generate tokens
    const accessToken = generateAccessToken(existingUser)
    const refreshToken = await generateRefreshToken(existingUser, deviceInfo, ipAddress)

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

    return { accessToken, refreshToken, user }
}

// Update logout function
export async function logoutUser(userId, refreshToken) {
    if (refreshToken) {
        await RefreshToken.findOneAndUpdate(
            { token: refreshToken },
            { isValid: false }
        )
    }
    return true
}

// Rest of your existing functions remain the same...
export async function createUser(userData) {
    const normalizedEmail = userData.emailId?.trim().toLowerCase()
    const normalizedUserName = userData.userName?.trim()

    // Check if user exists
    const existingUser = await User.findOne({
        $or: [
            { emailId: normalizedEmail },
            { userName: normalizedUserName }
        ]
    })

    if (existingUser) {
        // Existing account with unverified email should continue verification flow.
        if (existingUser.emailId === normalizedEmail && !existingUser.isEmailVerified) {
            return { user: existingUser, requiresEmailVerification: true, isNewUser: false }
        }

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
        emailId: normalizedEmail,
        userName: normalizedUserName,
        password: hashedPassword,
        role: 'user',
        avatar: '',
        bio: 'Hey there! I am using Flagger',
        isEmailVerified: false,  
        isVerifiedBadge: false,
        accountStatus: 'active',
        followers: [],
        following: [],
        savedPosts: [],
        refreshTokenVersion: 0
    })

    return { user, requiresEmailVerification: false, isNewUser: true }
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

    // Enforce cooldown between requests.
    const latestOtp = await OTP.findOne({
        emailId,
        type: 'email_verification'
    }).sort({ createdAt: -1 })

    if (latestOtp) {
        const secondsSinceLastOtp = Math.floor((Date.now() - latestOtp.createdAt.getTime()) / 1000)
        if (secondsSinceLastOtp < RESEND_COOLDOWN_SECONDS) {
            const waitSeconds = RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp
            const err = new Error(`Please wait ${waitSeconds}s before requesting a new OTP`)
            err.statusCode = 429
            throw err
        }
    }

    // Allow initial OTP + max 3 resends within active OTP window (10 minutes).
    const activeWindowStart = new Date(Date.now() - 10 * 60 * 1000)
    const sentOtpCountInWindow = await OTP.countDocuments({
        emailId,
        type: 'email_verification',
        createdAt: { $gte: activeWindowStart }
    })

    if (sentOtpCountInWindow >= MAX_RESEND_ATTEMPTS + 1) {
        const err = new Error('Maximum resend attempts reached. Please try again later.')
        err.statusCode = 429
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
    const normalizedEmail = emailId.trim().toLowerCase()

    // Check if user exists
    const user = await User.findOne({ emailId: normalizedEmail })
    
    if (!user) {
        const err = new Error('User not found with this email')
        err.statusCode = 404
        throw err
    }

    // Enforce cooldown between requests.
    const latestOtp = await OTP.findOne({
        emailId: normalizedEmail,
        type: 'password_reset'
    }).sort({ createdAt: -1 })

    if (latestOtp) {
        const secondsSinceLastOtp = Math.floor((Date.now() - latestOtp.createdAt.getTime()) / 1000)
        if (secondsSinceLastOtp < RESEND_COOLDOWN_SECONDS) {
            const waitSeconds = RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp
            const err = new Error(`Please wait ${waitSeconds}s before requesting a new OTP`)
            err.statusCode = 429
            throw err
        }
    }

    // Allow initial OTP + max 3 resends within active OTP window (10 minutes).
    const activeWindowStart = new Date(Date.now() - 10 * 60 * 1000)
    const sentOtpCountInWindow = await OTP.countDocuments({
        emailId: normalizedEmail,
        type: 'password_reset',
        createdAt: { $gte: activeWindowStart }
    })

    if (sentOtpCountInWindow >= MAX_RESEND_ATTEMPTS + 1) {
        const err = new Error('Maximum resend attempts reached. Please try again later.')
        err.statusCode = 429
        throw err
    }

    // Generate OTP
    const otp = generateOTP()

    // Save to database (marks old unused password reset OTPs as used)
    await saveOTP(normalizedEmail, otp, 'password_reset')

    // Send email
    await sendOTPEmail(normalizedEmail, otp, 'password_reset')

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

    // Increment refresh token version to invalidate all existing refresh tokens
    user.refreshTokenVersion += 1
    await user.save()

    // Invalidate all refresh tokens for security
    await RefreshToken.updateMany(
        { user: user._id, isValid: true },
        { isValid: false }
    )

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

    // Increment refresh token version to invalidate all existing refresh tokens
    user.refreshTokenVersion += 1
    await user.save()

    // Invalidate all refresh tokens for security
    await RefreshToken.updateMany(
        { user: user._id, isValid: true },
        { isValid: false }
    )

    return true
}
