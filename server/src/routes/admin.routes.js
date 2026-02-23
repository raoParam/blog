import express from 'express'
import auth from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'
import {
    // Dashboard
    getDashboardStats,
    
    // User Management
    getAllUsers,
    getUserDetails,
    updateUserStatus,
    toggleVerifiedBadge,
    
    // Post Management
    getAllPosts,
    getReportedPosts,
    deleteAnyPost,
    togglePostVisibility,
    
    // Category Management
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // System
    getSystemLogs
} from '../controllers/admin.controller.js'

const adminRouter = express.Router()

// All admin routes require both auth and adminAuth
adminRouter.use(auth, adminAuth)

// ========== DASHBOARD ==========
adminRouter.get('/dashboard/stats', getDashboardStats)

// ========== USER MANAGEMENT ==========
adminRouter.get('/users', getAllUsers)
adminRouter.get('/users/:userId', getUserDetails)
adminRouter.patch('/users/:userId/status', updateUserStatus)
adminRouter.patch('/users/:userId/verify-badge', toggleVerifiedBadge)

// ========== POST MANAGEMENT ==========
adminRouter.get('/posts', getAllPosts)
adminRouter.get('/posts/reported', getReportedPosts)
adminRouter.delete('/posts/:postId', deleteAnyPost)
adminRouter.patch('/posts/:postId/visibility', togglePostVisibility)

// ========== CATEGORY MANAGEMENT ==========
adminRouter.get('/categories', getAllCategories)
adminRouter.post('/categories', createCategory)
adminRouter.put('/categories/:categoryId', updateCategory)
adminRouter.delete('/categories/:categoryId', deleteCategory)

// ========== SYSTEM ==========
adminRouter.get('/logs', getSystemLogs)

export default adminRouter