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

// Verify Refresh Token - checks status, signature, and active account status
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

    // Reject non-active accounts during refresh-token verification
    if (user.accountStatus === 'suspended') {
        const err = new Error('Account is suspended')
        err.statusCode = 403
        throw err
    }
    if (user.accountStatus === 'deleted') {
        const err = new Error('Account has been deleted')
        err.statusCode = 403
        throw err
    }
    if (user.accountStatus !== 'active') {
        const err = new Error('Account is not active')
        err.statusCode = 403
        throw err
    }

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

// Atomically claim and rotate refresh token to prevent race conditions or replay attacks
export const refreshAccessToken = async (refreshTokenStr) => {
    if (!refreshTokenStr || typeof refreshTokenStr !== 'string') {
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }

    const tokenHash = hashToken(refreshTokenStr)

    // Atomically find and invalidate the active token record in a single DB operation.
    // If two concurrent requests attempt to rotate the same token, exactly one succeeds.
    const claimedToken = await RefreshToken.findOneAndUpdate(
        {
            $or: [
                { token: tokenHash },
                { token: refreshTokenStr }
            ],
            isValid: true,
            expiresAt: { $gt: new Date() }
        },
        { $set: { isValid: false } },
        { new: false } // return document before update
    ).populate('user')

    if (!claimedToken || !claimedToken.user) {
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }

    const user = claimedToken.user

    // Reject non-active accounts during refresh-token rotation
    if (user.accountStatus === 'suspended') {
        const err = new Error('Account is suspended')
        err.statusCode = 403
        throw err
    }
    if (user.accountStatus === 'deleted') {
        const err = new Error('Account has been deleted')
        err.statusCode = 403
        throw err
    }
    if (user.accountStatus !== 'active') {
        const err = new Error('Account is not active')
        err.statusCode = 403
        throw err
    }

    // Verify cryptographic signature and user version
    try {
        jwt.verify(refreshTokenStr, process.env.JWT_SECRET + user.refreshTokenVersion)
    } catch (jwtErr) {
        // Token was already marked invalid in DB by findOneAndUpdate
        const err = new Error('Invalid or expired refresh token')
        err.statusCode = 401
        throw err
    }

    // Generate new refresh token (hashed at rest)
    const newRefreshToken = await generateRefreshToken(
        user,
        claimedToken.deviceInfo || '',
        claimedToken.ipAddress || ''
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

// Login user and return raw tokens - rejects non-active accounts before issuing tokens
export async function loginUser(userData, deviceInfo = '', ipAddress = '') {
    const { emailId , password } = userData
    if (!emailId || !password) {
        const err = new Error('Required fields are missing')
        err.statusCode = 400
        throw err
    }
    const existingUser = await User.findOne({ emailId }).select('+password')
    if (!existingUser) {
        const err = new Error("Invalid Credentials")
        err.statusCode = 401
        throw err
    }
    let isValiduser = await bcrypt.compare(password, existingUser.password)
    if (!isValiduser) {
        const err = new Error("Invalid Credentials")
        err.statusCode = 401
        throw err
    }

    // Reject suspended and deleted accounts during login before issuing tokens
    if (existingUser.accountStatus === 'suspended') {
        const err = new Error("Account is suspended")
        err.statusCode = 403
        throw err
    }
    if (existingUser.accountStatus === 'deleted') {
        const err = new Error("Account has been deleted")
        err.statusCode = 403
        throw err
    }
    if (existingUser.accountStatus !== 'active') {
        const err = new Error("Account is not active")
        err.statusCode = 403
        throw err
    }

    if (!process.env.JWT_SECRET) {
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

// Logout user and invalidate token scoped strictly to user ownership
export async function logoutUser(userId, refreshToken) {
    if (!userId) {
        const err = new Error('User ID is required for logout')
        err.statusCode = 400
        throw err
    }

    if (refreshToken) {
        const tokenHash = hashToken(refreshToken)
        const updated = await RefreshToken.findOneAndUpdate(
            {
                user: userId, // Scoped strictly to the authenticated user ID
                $or: [
                    { token: tokenHash },
                    { token: refreshToken }
                ]
            },
            { isValid: false }
        )
        // If token belonged to another user, updated will be null
        return !!updated
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
    user.refreshTokenVersion += 1
    // Save the password and token version together so a partial update cannot leave old sessions valid.
    await user.save()

    // Invalidate all refresh tokens for security
    await RefreshToken.updateMany(
        { user: user._id, isValid: true },
        { isValid: false }
    )

    return true
}
