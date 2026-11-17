import User from '../models/user.js'
import RefreshToken from '../models/refreshToken.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { randomUUID } from 'crypto'

const NAME_REGEX = /^[A-Za-z_]+$/

/**
 * Computes a secure SHA-256 digest of a token for storage at rest.
 * @param {string} token 
 * @returns {string}
 */
export const hashToken = (token) => {
    if (!token || typeof token !== 'string') return ''
    return crypto.createHash('sha256').update(token).digest('hex')
}

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

// Generate Refresh Token (long-lived) - saves SHA-256 hash at rest in MongoDB
export const generateRefreshToken = async (user, deviceInfo = '', ipAddress = '') => {
    // Create unique raw JWT token
    const rawToken = jwt.sign(
        { 
            _id: user._id,
            version: user.refreshTokenVersion,
            jti: randomUUID()
        },
        process.env.JWT_SECRET + user.refreshTokenVersion, // Extra security
        { expiresIn: '7d' } // 7 days
    )

    // Hash token at rest
    const tokenHash = hashToken(rawToken)

    // Save hashed token to database
    await RefreshToken.create({
        token: tokenHash,
        user: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        deviceInfo,
        ipAddress
    })

    // Return the raw token only to the client
    return rawToken
}

// Verify Refresh Token - looks up by SHA-256 hash (or raw token for backward-compatible migration)
export const verifyRefreshToken = async (rawToken) => {
    if (!rawToken || typeof rawToken !== 'string') {
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }

    const tokenHash = hashToken(rawToken)

    const refreshToken = await RefreshToken.findOne({ 
        $or: [
            { token: tokenHash },
            { token: rawToken } // Safe migration for existing pre-hash sessions
        ],
        isValid: true,
        expiresAt: { $gt: new Date() }
    }).populate('user')

    if (!refreshToken || !refreshToken.user) {
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }

    const user = refreshToken.user
    try {
        jwt.verify(rawToken, process.env.JWT_SECRET + user.refreshTokenVersion)
        return { user, refreshToken }
    } catch (error) {
        // If token verification fails, invalidate the record
        refreshToken.isValid = false
        await refreshToken.save()
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }
}

// Get new access token using refresh token (rotates token and stores new token hashed)
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

// Login user and return raw tokens
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
        isVerifiedBadge : existingUser.isVerifiedBadge,
        accountStatus: existingUser.accountStatus,
        followers: existingUser.followers,
        following: existingUser.following,
        savedPosts: existingUser.savedPosts,
        createdAt: existingUser.createdAt
    }

    return { accessToken, refreshToken, user }
}

// Logout user and invalidate token using hash
export async function logoutUser(userId, refreshToken) {
    if (refreshToken) {
        const tokenHash = hashToken(refreshToken)
        await RefreshToken.findOneAndUpdate(
            {
                $or: [
                    { token: tokenHash },
                    { token: refreshToken }
                ]
            },
            { isValid: false }
        )
    }
    return true
}

export async function createUser(userData) {
    const normalizedEmail = userData.emailId?.trim().toLowerCase()
    const normalizedUserName = userData.userName?.trim()
    const normalizedFirstName = userData.firstName?.trim()
    const normalizedLastName = userData.lastName?.trim()

    if (!NAME_REGEX.test(normalizedUserName)) {
        const err = new Error('Username can only contain letters (a-z, A-Z) and underscore (_)')
        err.statusCode = 400
        throw err
    }

    if (normalizedFirstName && !NAME_REGEX.test(normalizedFirstName)) {
        const err = new Error('First name can only contain letters (a-z, A-Z) and underscore (_)')
        err.statusCode = 400
        throw err
    }

    if (normalizedLastName && !NAME_REGEX.test(normalizedLastName)) {
        const err = new Error('Last name can only contain letters (a-z, A-Z) and underscore (_)')
        err.statusCode = 400
        throw err
    }

    // Check if user exists
    const existingUser = await User.findOne({
        $or: [
            { emailId: normalizedEmail },
            { userName: normalizedUserName }
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

    const user = await User.create({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        emailId: normalizedEmail,
        userName: normalizedUserName,
        password: hashedPassword,
        role: 'user',
        avatar: '',
        bio: 'Hey there! I am using Flagger',
        isVerifiedBadge: false,
        accountStatus: 'active',
        followers: [],
        following: [],
        savedPosts: [],
        refreshTokenVersion: 0
    })

    return { user, isNewUser: true }
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password')
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValidPassword) {
        const err = new Error('Current password is incorrect')
        err.statusCode = 401
        throw err
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(process.env.SALT_ROUNDS)
    )

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
