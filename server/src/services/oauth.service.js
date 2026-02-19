import User from '../models/user.js'
import RefreshToken from '../models/refreshToken.js'
import { generateAccessToken, generateRefreshToken } from './auth.service.js'

export const handleOAuthLogin = async (user, deviceInfo = '', ipAddress = '') => {
    // Generate tokens using existing functions from auth.service
    const accessToken = generateAccessToken(user)
    const refreshToken = await generateRefreshToken(user, deviceInfo, ipAddress)

    const userData = {
        _id: user._id,
        userName: user.userName,
        emailId: user.emailId,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
        isVerifiedBadge: user.isVerifiedBadge,
        accountStatus: user.accountStatus,
        followers: user.followers,
        following: user.following,
        savedPosts: user.savedPosts,
        createdAt: user.createdAt
    }

    return { accessToken, refreshToken, user: userData }
}