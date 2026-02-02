const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const app = express()


app.use(express.json())

// importing routes
const authRouter = require('./routes/auth.routes')
const userRouter = require('./routes/user.routes')
const adminRouter = require('./routes/admin.routes')

// routes
app.use('/auth',authRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)


app.get('/apilist',apilist)
function apilist(req,res) {
    res.json({"/auth/register" : "user register",
                "/auth/login" : "user login",
                "/auth/logout" : "user logout",
                "/user/profile" : "fetch user profile",
                "/user/blog" : "give all the blog made by user",
                "/user/updateProfile" : "user can update profile from here",
                "/admin/login" : "admin login",
                "/admin/logout" : "admin logout",
                "/admin/getBlogs" : "give all blogs",
                "/admin/deleteBlog/:id" : "delete particular blog"}
            )
}

module.exports = app