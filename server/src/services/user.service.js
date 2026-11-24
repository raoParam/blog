import mongoose from 'mongoose'
import Post from '../models/post.js'
import User from '../models/user.js'
import { cloudinary } from '../middleware/upload.js'

const NAME_REGEX = /^[A-Za-z_]+$/

export async function fetchPosts(userId, page = 1, limit = 10) {
    const blogs = await Post.find({ 
        author: userId,
        visibility: 'public',
        status: { $ne: 'deleted' }
    })
    .sort({createdAt : -1})
    .skip((page - 1) * limit)
    .limit(limit)
    return blogs
}


export async function getUserPublicProfile(username, currentUserId) {
    const user = await User.findOne({ 
        userName: username.toLowerCase(),
        accountStatus: 'active'
    }).select('firstName lastName userName avatar bio isVerifiedBadge followers following createdAt')

    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const followersCount = user.followers.length
    const followingCount = user.following.length

    // Check if current user follows this user
    const isFollowing = user.followers.some(
        followerId => followerId.toString() === currentUserId.toString()
    )

    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        avatar: user.avatar,
        bio: user.bio,
        isVerifiedBadge: user.isVerifiedBadge,
        followersCount,
        followingCount,
        isFollowing,
        joinedAt: user.createdAt
    }
}

export async function getUserPublicPosts(username, page, limit, currentUserId) {
    const user = await User.findOne({ 
        userName: username.toLowerCase(),
        accountStatus: 'active'
    })

    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const posts = await Post.find({ 
        author: user._id,
        visibility: 'public',
        status: { $ne: 'deleted' }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName')
    .lean()

    const totalPosts = await Post.countDocuments({ 
        author: user._id,
        visibility: 'public',
        status: { $ne: 'deleted' }
    })

    return {
        posts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            hasNext: page < Math.ceil(totalPosts / limit),
            hasPrev: page > 1
        }
    }
}

export async function updateUserProfile(userId, updates) {
    const user = await User.findById(userId)
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    // If avatar is being updated, delete old one from Cloudinary
    if (updates.avatar && user.avatar) {
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
            const urlParts = user.avatar.split('/')
            const publicIdWithExtension = urlParts[urlParts.length - 1]
            const imageId = publicIdWithExtension.split('.')[0]
            const currentPublicId = `flagger/avatars/${imageId}`
            const legacyPublicId = `flagged/avatars/${imageId}`

            await cloudinary.uploader.destroy(currentPublicId)
            await cloudinary.uploader.destroy(legacyPublicId)
            console.log('Old avatar deleted from Cloudinary')
        } catch (error) {
            console.error('Error deleting old avatar:', error)
            // Continue with update even if delete fails
        }
    }

    if (updates.firstName !== undefined) {
        const firstName = updates.firstName.trim()
        if (firstName && !NAME_REGEX.test(firstName)) {
            const err = new Error('First name can only contain letters (a-z, A-Z) and underscore (_)')
            err.statusCode = 400
            throw err
        }
        updates.firstName = firstName
    }

    if (updates.lastName !== undefined) {
        const lastName = updates.lastName.trim()
        if (lastName && !NAME_REGEX.test(lastName)) {
            const err = new Error('Last name can only contain letters (a-z, A-Z) and underscore (_)')
            err.statusCode = 400
            throw err
        }
        updates.lastName = lastName
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'bio', 'avatar']
    
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            user[field] = updates[field]
        }
    })

    await user.save()

    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        emailId: user.emailId,
        avatar: user.avatar,
        bio: user.bio,
        isVerifiedBadge: user.isVerifiedBadge,
        followersCount: user.followers.length,
        followingCount: user.following.length
    }
}

export async function followUserById(currentUserId, targetUserId) {
    if (currentUserId.toString() === targetUserId.toString()) {
        const err = new Error("You cannot follow yourself")
        err.statusCode = 400
        throw err
    }

    const session = await mongoose.startSession()
    let updatedTargetUser
    try {
        await session.withTransaction(async () => {
            const targetUser = await User.findById(targetUserId).session(session)
            if (!targetUser) {
                const err = new Error("User not found")
                err.statusCode = 404
                throw err
            }

            if (targetUser.accountStatus !== 'active') {
                const err = new Error("User account is not active")
                err.statusCode = 400
                throw err
            }

            const currentUser = await User.findById(currentUserId).session(session)
            if (!currentUser) {
                const err = new Error("Current user not found")
                err.statusCode = 404
                throw err
            }

            const alreadyFollowing = (currentUser.following || []).some(
                id => id.toString() === targetUserId.toString()
            )

            if (alreadyFollowing) {
                const err = new Error("Already following this user")
                err.statusCode = 400
                throw err
            }

            await User.findByIdAndUpdate(
                currentUserId,
                { $addToSet: { following: targetUserId } },
                { session }
            )

            updatedTargetUser = await User.findByIdAndUpdate(
                targetUserId,
                { $addToSet: { followers: currentUserId } },
                { session, new: true }
            )
        })
    } finally {
        await session.endSession()
    }

    return {
        following: true,
        followersCount: updatedTargetUser.followers.length,
        message: "User followed successfully"
    }
}

export async function unfollowUserById(currentUserId, targetUserId) {
    if (currentUserId.toString() === targetUserId.toString()) {
        const err = new Error("You cannot unfollow yourself")
        err.statusCode = 400
        throw err
    }

    const session = await mongoose.startSession()
    let updatedTargetUser
    try {
        await session.withTransaction(async () => {
            const targetUser = await User.findById(targetUserId).session(session)
            if (!targetUser) {
                const err = new Error("User not found")
                err.statusCode = 404
                throw err
            }

            const currentUser = await User.findById(currentUserId).session(session)
            if (!currentUser) {
                const err = new Error("Current user not found")
                err.statusCode = 404
                throw err
            }

            const isFollowing = (currentUser.following || []).some(
                id => id.toString() === targetUserId.toString()
            )

            if (!isFollowing) {
                const err = new Error("You are not following this user")
                err.statusCode = 400
                throw err
            }

            await User.findByIdAndUpdate(
                currentUserId,
                { $pull: { following: targetUserId } },
                { session }
            )

            updatedTargetUser = await User.findByIdAndUpdate(
                targetUserId,
                { $pull: { followers: currentUserId } },
                { session, new: true }
            )
        })
    } finally {
        await session.endSession()
    }

    return {
        following: false,
        followersCount: updatedTargetUser.followers.length,
        message: "User unfollowed successfully"
    }
}

export async function getFollowersList(userId, page = 1, limit = 20, currentUserId = null) {
    const relationshipData = await User.findById(userId).select('followers').lean()

    if (!relationshipData) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const totalFollowers = relationshipData.followers?.length || 0

    const user = await User.findById(userId)
        .populate({
            path: 'followers',
            select: 'userName firstName lastName avatar bio isVerifiedBadge',
            options: {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { createdAt: -1 }
            }
        })

    const followersList = (user.followers || []).filter(Boolean)

    let followingSet = null
    if (currentUserId) {
        const currentUser = await User.findById(currentUserId).select('following').lean()
        followingSet = new Set((currentUser?.following || []).map((id) => id.toString()))
    }

    const followers = followersList.map((follower) => {
        const followerId = follower._id?.toString?.() || ''
        return {
            ...follower.toObject(),
            isFollowing: followingSet ? followingSet.has(followerId) : false
        }
    })

    return {
        followers,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalFollowers / limit),
            totalFollowers,
            hasNext: page < Math.ceil(totalFollowers / limit),
            hasPrev: page > 1
        }
    }
}

export async function getFollowingList(userId, page = 1, limit = 20, currentUserId = null) {
    const relationshipData = await User.findById(userId).select('following').lean()

    if (!relationshipData) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const totalFollowing = relationshipData.following?.length || 0

    const user = await User.findById(userId)
        .populate({
            path: 'following',
            select: 'userName firstName lastName avatar bio isVerifiedBadge',
            options: {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { createdAt: -1 }
            }
        })

    const followingList = (user.following || []).filter(Boolean)

    let followingSet = null
    if (currentUserId) {
        const currentUser = await User.findById(currentUserId).select('following').lean()
        followingSet = new Set((currentUser?.following || []).map((id) => id.toString()))
    }

    const following = followingList.map((followedUser) => {
        const followedUserId = followedUser._id?.toString?.() || ''
        return {
            ...followedUser.toObject(),
            isFollowing: followingSet ? followingSet.has(followedUserId) : false
        }
    })

    return {
        following,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalFollowing / limit),
            totalFollowing,
            hasNext: page < Math.ceil(totalFollowing / limit),
            hasPrev: page > 1
        }
    }
}

export async function savePostById(userId, postId) {
    const session = await mongoose.startSession()
    let updatedUser
    try {
        await session.withTransaction(async () => {
            const post = await Post.findOneAndUpdate(
                { _id: postId, status: { $ne: 'deleted' } },
                { $inc: { coordinationVersion: 1 } },
                { session, new: true }
            )
            if (!post) {
                const err = new Error("Post not found")
                err.statusCode = 404
                throw err
            }

            const user = await User.findById(userId).session(session)
            if (!user) {
                const err = new Error("User not found")
                err.statusCode = 404
                throw err
            }

            const alreadySaved = (user.savedPosts || []).some(
                id => id.toString() === postId.toString()
            )

            if (alreadySaved) {
                const err = new Error("Post already saved")
                err.statusCode = 400
                throw err
            }

            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { savedPosts: postId } },
                { session, new: true }
            )
        })
    } finally {
        await session.endSession()
    }

    return {
        saved: true,
        savedCount: updatedUser.savedPosts.length
    }
}

export async function unsavePostById(userId, postId) {
    const session = await mongoose.startSession()
    let updatedUser
    try {
        await session.withTransaction(async () => {
            await Post.findOneAndUpdate(
                { _id: postId },
                { $inc: { coordinationVersion: 1 } },
                { session }
            )

            const user = await User.findById(userId).session(session)
            if (!user) {
                const err = new Error("User not found")
                err.statusCode = 404
                throw err
            }

            const isSaved = (user.savedPosts || []).some(
                id => id.toString() === postId.toString()
            )

            if (!isSaved) {
                const err = new Error("Post not in saved list")
                err.statusCode = 400
                throw err
            }

            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { savedPosts: postId } },
                { session, new: true }
            )
        })
    } finally {
        await session.endSession()
    }

    return {
        saved: false,
        savedCount: updatedUser.savedPosts.length
    }
}

export async function getSavedPostsList(userId, page = 1, limit = 10) {
    const rawUser = await User.findById(userId)
    if (!rawUser) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const allSavedIds = (rawUser.savedPosts || []).map(p => p?._id || p).filter(Boolean)
    const totalSaved = await Post.countDocuments({
        _id: { $in: allSavedIds },
        status: { $ne: 'deleted' }
    })

    const user = await User.findById(userId)
        .populate({
            path: 'savedPosts',
            match: { status: { $ne: 'deleted' } },
            populate: {
                path: 'author',
                select: 'userName avatar firstName lastName isVerifiedBadge'
            },
            options: {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { createdAt: -1 }
            }
        })

    const savedPosts = (user?.savedPosts || []).filter(Boolean).map(post => {
        if (post && post.visibility === 'anonymous') {
            post.author = null
        }
        return post
    })

    const totalPages = Math.ceil(totalSaved / limit)

    return {
        savedPosts,
        pagination: {
            currentPage: page,
            totalPages,
            totalSaved,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    }
}
