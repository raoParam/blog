const express = require('express')
const {getProfile,getBlogs,updateProfile} = require('../controllers/user.controller')
const userRouter = express.Router()


// getProfile
userRouter.get('/profile',getProfile)
// blog
userRouter.get('/blogs',getBlogs)
userRouter.patch('/updateProfile',updateProfile)

module.exports = userRouter