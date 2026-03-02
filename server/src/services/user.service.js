import Post from '../models/post.js'
import User from '../models/user.js'
import { cloudinary } from '../middleware/upload.js'

export async function fetchPosts(userId, page = 1, limit = 10) {
    const blogs = await Post.find({ 
        author: userId,
        visibility: 'public' 
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
        visibility: 'public'
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('author', 'userName avatar firstName lastName')
    .lean()

    const totalPosts = await Post.countDocuments({ 
        author: user._id,
        visibility: 'public'
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
            const publicId = `flagged/avatars/${publicIdWithExtension.split('.')[0]}`
            
            await cloudinary.uploader.destroy(publicId)
            console.log('Old avatar deleted from Cloudinary')
        } catch (error) {
            console.error('Error deleting old avatar:', error)
            // Continue with update even if delete fails
        }
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
    // Check if target user exists
    const targetUser = await User.findById(targetUserId)
    if (!targetUser) {
        const err = new Error("User not found")
        err.statusCode = 404
        throw err
    }

    // Check if already following
    const currentUser = await User.findById(currentUserId)
    const alreadyFollowing = currentUser.following.some(
        id => id.toString() === targetUserId.toString()
    )

    if (alreadyFollowing) {
        const err = new Error("Already following this user")
        err.statusCode = 400
        throw err
    }

    // Add to following array of current user
    await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId }
    })

    // Add to followers array of target user
    await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId }
    })

    // Get updated counts
    const updatedTargetUser = await User.findById(targetUserId)
    const updatedCurrentUser = await User.findById(currentUserId)

    return {
        following: true,
        followersCount: updatedTargetUser.followers.length,
        message: "User followed successfully"
    }
}

export async function unfollowUserById(currentUserId, targetUserId) {
    // Check if target user exists
    const targetUser = await User.findById(targetUserId)
    if (!targetUser) {
        const err = new Error("User not found")
        err.statusCode = 404
        throw err
    }

    // Check if actually following
    const currentUser = await User.findById(currentUserId)
    const isFollowing = currentUser.following.some(
        id => id.toString() === targetUserId.toString()
    )

    if (!isFollowing) {
        const err = new Error("You are not following this user")
        err.statusCode = 400
        throw err
    }

    // Remove from following array of current user
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId }
    })

    // Remove from followers array of target user
    await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId }
    })

    // Get updated counts
    const updatedTargetUser = await User.findById(targetUserId)

    return {
        following: false,
        followersCount: updatedTargetUser.followers.length,
        message: "User unfollowed successfully"
    }
}

export async function getFollowersList(userId, page = 1, limit = 20, currentUserId = null) {
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

    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const followersList = (user.followers || []).filter(Boolean)
    const totalFollowers = followersList.length

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

    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const followingList = (user.following || []).filter(Boolean)
    const totalFollowing = followingList.length

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
    // Check if post exists
    const post = await Post.findById(postId)
    if (!post) {
        const err = new Error("Post not found")
        err.statusCode = 404
        throw err
    }

    // Check if already saved
    const user = await User.findById(userId)
    const alreadySaved = user.savedPosts.some(
        id => id.toString() === postId.toString()
    )

    if (alreadySaved) {
        const err = new Error("Post already saved")
        err.statusCode = 400
        throw err
    }

    // Add to savedPosts array
    await User.findByIdAndUpdate(userId, {
        $addToSet: { savedPosts: postId }
    })

    // Get updated count
    const updatedUser = await User.findById(userId)
    
    return {
        saved: true,
        savedCount: updatedUser.savedPosts.length
    }
}

export async function unsavePostById(userId, postId) {
    // Check if post exists
    const post = await Post.findById(postId)
    if (!post) {
        const err = new Error("Post not found")
        err.statusCode = 404
        throw err
    }

    // Check if actually saved
    const user = await User.findById(userId)
    const isSaved = user.savedPosts.some(
        id => id.toString() === postId.toString()
    )

    if (!isSaved) {
        const err = new Error("Post not in saved list")
        err.statusCode = 400
        throw err
    }

    // Remove from savedPosts array
    await User.findByIdAndUpdate(userId, {
        $pull: { savedPosts: postId }
    })

    // Get updated count
    const updatedUser = await User.findById(userId)
    
    return {
        saved: false,
        savedCount: updatedUser.savedPosts.length
    }
}

export async function getSavedPostsList(userId, page = 1, limit = 10) {
    const user = await User.findById(userId)
        .populate({
            path: 'savedPosts',
            populate: {
                path: 'author',
                select: 'userName avatar firstName lastName'
            },
            options: {
                skip: (page - 1) * limit,
                limit: limit,
                sort: { createdAt: -1 }
            }
        })

    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }

    const totalSaved = await User.findById(userId).then(u => u.savedPosts.length)

    return {
        savedPosts: user.savedPosts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalSaved / limit),
            totalSaved,
            hasNext: page < Math.ceil(totalSaved / limit),
            hasPrev: page > 1
        }
    }
}
