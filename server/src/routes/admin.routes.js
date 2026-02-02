const express = require('express')
const {login,logout,getBlogs,deleteBlog} = require('../controllers/admin.controller')
const adminRoute = express.Router()

adminRoute.post('/login',login)
adminRoute.post('/logout',logout)
adminRoute.get('/getBlogs',getBlogs)
adminRoute.delete('/deleteBlog/:id',deleteBlog)
module.exports = adminRoute