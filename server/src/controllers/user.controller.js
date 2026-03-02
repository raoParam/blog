import { 
    fetchPosts, 
    getUserPublicProfile, 
    getUserPublicPosts, 
    updateUserProfile,
    getFollowersList,
    getFollowingList,
    followUserById,
    unfollowUserById,
    savePostById,
    unsavePostById,
    getSavedPostsList
} from '../services/user.service.js'

export async function getProfile(req,res,next){
	try {
		const {user} = req
		res.status(200).json({
			user,
			Status: "success",
			Message: "User profile fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function getPosts(req,res,next) {
	try {
		const { user } = req
		const blogs = await fetchPosts(user._id)
		res.status(200).json({
			blogs,
			Status: "success",
			Message: "User blogs fetched successfully"
		})
	} catch (err) {
		next(err)
	}
}

export async function getUserByUsername(req, res, next) {
    try {
        const { username } = req.params
        const currentUserId = req.user?._id // Optional, for follow status

        if (username.toLowerCase() === req.user.userName.toLowerCase()) {
            const err = new Error("Cannot search for yourself")
            err.statusCode = 400
            throw err
        }        

        const userProfile = await getUserPublicProfile(username, currentUserId)

        res.status(200).json({
            user: userProfile,
            Status: "success",
            Message: "User profile fetched successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function getUserPostsByUsername(req, res, next) {
    try {
        const { username } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        if (username.toLowerCase() === req.user.userName.toLowerCase()) {
            const err = new Error("Use /user/posts to view your own posts")
            err.statusCode = 400
            throw err
        }

        const result = await getUserPublicPosts(username, page, limit)

        res.status(200).json({
            posts: result.posts,
            pagination: result.pagination,
            Status: "success",
            Message: "User posts fetched successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function updateProfile(req, res, next) {
    try {
        const userId = req.user._id
        const updates = req.body

        // If file was uploaded, add avatar URL
        if (req.file) {
            updates.avatar = req.file.path
        }

        // Remove undefined fields
        Object.keys(updates).forEach(key => 
            updates[key] === undefined && delete updates[key]
        )

        // Allowed fields to update
        const allowedFields = ['firstName', 'lastName', 'bio', 'avatar']
        const filteredUpdates = {}
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field]
            }
        })

        if (Object.keys(filteredUpdates).length === 0) {
            const err = new Error('No valid fields to update')
            err.statusCode = 400
            throw err
        }

        const updatedUser = await updateUserProfile(userId, filteredUpdates)

        res.status(200).json({
            user: updatedUser,
            Status: "success",
            Message: "Profile updated successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function followUser(req, res, next) {
    try {
        const currentUserId = req.user._id
        const targetUserId = req.params.userId

        // Prevent self-follow
        if (currentUserId.toString() === targetUserId.toString()) {
            const err = new Error("You cannot follow yourself")
            err.statusCode = 400
            throw err
        }

        const result = await followUserById(currentUserId, targetUserId)

        res.status(200).json({
            following: result.following,
            followersCount: result.followersCount,
            Status: "success",
            Message: result.message
        })
    } catch (err) {
        next(err)
    }
}

export async function unfollowUser(req, res, next) {
    try {
        const currentUserId = req.user._id
        const targetUserId = req.params.userId

        // Prevent self-unfollow
        if (currentUserId.toString() === targetUserId.toString()) {
            const err = new Error("Invalid operation")
            err.statusCode = 400
            throw err
        }

        const result = await unfollowUserById(currentUserId, targetUserId)

        res.status(200).json({
            following: result.following,
            followersCount: result.followersCount,
            Status: "success",
            Message: result.message
        })
    } catch (err) {
        next(err)
    }
}

export async function getFollowers(req, res, next) {
    try {
        const userId = req.user._id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20

        const result = await getFollowersList(userId, page, limit, req.user?._id)

        res.status(200).json({
            followers: result.followers,
            pagination: result.pagination,
            Status: "success",
            Message: "Followers fetched successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function getFollowing(req, res, next) {
    try {
        const userId = req.user._id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20

        const result = await getFollowingList(userId, page, limit, req.user?._id)

        res.status(200).json({
            following: result.following,
            pagination: result.pagination,
            Status: "success",
            Message: "Following list fetched successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function savePost(req, res, next) {
    try {
        const userId = req.user._id
        const postId = req.params.postId

        const result = await savePostById(userId, postId)

        res.status(200).json({
            saved: true,
            savedCount: result.savedCount,
            Status: "success",
            Message: "Post saved successfully"
        })
    } catch (err) {
        next(err)
    }
}

export async function unsavePost(req, res, next) {
    try {
        const userId = req.user._id
        const postId = req.params.postId

        const result = await unsavePostById(userId, postId)

        res.status(200).json({
            saved: false,
            savedCount: result.savedCount,
            Status: "success",
            Message: "Post removed from saved"
        })
    } catch (err) {
        next(err)
    }
}

export async function getSavedPosts(req, res, next) {
    try {
        const userId = req.user._id
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const result = await getSavedPostsList(userId, page, limit)

        res.status(200).json({
            savedPosts: result.savedPosts,
            pagination: result.pagination,
            Status: "success",
            Message: "Saved posts fetched successfully"
        })
    } catch (err) {
        next(err)
    }
}
