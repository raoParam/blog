import express from 'express'
import auth from '../middleware/auth.js'
import { uploadAvatar } from '../middleware/upload.js'
import { 
    getProfile, 
    getPosts, 
    getUserByUsername, 
    getUserPostsByUsername,
    updateProfile,
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser,
    savePost,
    unsavePost,
    getSavedPosts
} from '../controllers/user.controller.js'
const userRouter = express.Router()

// Profile routes
userRouter.get('/me', auth, getProfile)
userRouter.patch('/profile', auth, uploadAvatar, updateProfile)

// User's own posts
userRouter.get('/posts', auth, getPosts)

// Social routes
userRouter.get('/followers', auth, getFollowers)
userRouter.get('/following', auth, getFollowing)
userRouter.post('/follow/:userId', auth, followUser)      
userRouter.delete('/unfollow/:userId', auth, unfollowUser) 

// Saved posts routes 
userRouter.post('/save/:postId', auth, savePost)
userRouter.delete('/unsave/:postId', auth, unsavePost)
userRouter.get('/saved', auth, getSavedPosts)

// Public profile routes
userRouter.get('/:username', auth, getUserByUsername)
userRouter.get('/:username/posts', auth, getUserPostsByUsername)

export default userRouter

