import {
    // Dashboard services
    getPlatformStatistics,
    
    // User services
    fetchAllUsers,
    fetchUserDetailsById,
    updateUserStatusById,
    toggleUserVerifiedBadge,
    
    // Post services
    fetchAllPosts,
    fetchReportedPosts,
    deleteAnyPostById,
    updatePostVisibilityById,
    
    // Category services
    fetchAllCategories,
    createNewCategory,
    updateCategoryById,
    deleteCategoryById,
    
    // System services
    fetchSystemLogs
} from '../services/admin.service.js'

// ========== DASHBOARD ==========

/**
 * Get platform statistics for admin dashboard
 */
export async function getDashboardStats(req, res, next) {
    try {
        const stats = await getPlatformStatistics()
        
        res.status(200).json({
            Status: "success",
            Message: "Dashboard stats fetched successfully",
            stats
        })
    } catch(err) {
        next(err)
    }
}

// ========== USER MANAGEMENT ==========

/**
 * Get all users with pagination and filters
 */
export async function getAllUsers(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const search = req.query.search || ''
        const status = req.query.status || ''
        const sort = req.query.sort || 'newest' // newest, oldest
        
        const result = await fetchAllUsers({ page, limit, search, status, sort })
        
        res.status(200).json({
            Status: "success",
            Message: "Users fetched successfully",
            users: result.users,
            pagination: result.pagination
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Get single user details by ID
 */
export async function getUserDetails(req, res, next) {
    try {
        const { userId } = req.params
        
        const user = await fetchUserDetailsById(userId)
        
        res.status(200).json({
            Status: "success",
            Message: "User details fetched successfully",
            user
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Update user account status (active/suspended/deleted)
 */
export async function updateUserStatus(req, res, next) {
    try {
        const { userId } = req.params
        const { status } = req.body // 'active', 'suspended', 'deleted'
        
        if (!status) {
            const err = new Error('Status is required')
            err.statusCode = 400
            throw err
        }
        
        if (!['active', 'suspended', 'deleted'].includes(status)) {
            const err = new Error('Invalid status. Must be active, suspended, or deleted')
            err.statusCode = 400
            throw err
        }
        
        const updatedUser = await updateUserStatusById(userId, status)
        
        res.status(200).json({
            Status: "success",
            Message: `User status updated to ${status}`,
            user: updatedUser
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Toggle verified badge for a user
 */
export async function toggleVerifiedBadge(req, res, next) {
    try {
        const { userId } = req.params
        const { verify } = req.body // boolean
        
        if (verify === undefined) {
            const err = new Error('verify field is required (true/false)')
            err.statusCode = 400
            throw err
        }
        
        const updatedUser = await toggleUserVerifiedBadge(userId, verify)
        
        res.status(200).json({
            Status: "success",
            Message: `Verified badge ${verify ? 'added to' : 'removed from'} user`,
            user: updatedUser
        })
    } catch(err) {
        next(err)
    }
}

// ========== POST MANAGEMENT ==========

/**
 * Get all posts with pagination and filters
 */
export async function getAllPosts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const visibility = req.query.visibility || ''
        const author = req.query.author || ''
        const startDate = req.query.startDate || ''
        const endDate = req.query.endDate || ''
        
        const result = await fetchAllPosts({ page, limit, visibility, author, startDate, endDate })
        
        res.status(200).json({
            Status: "success",
            Message: "Posts fetched successfully",
            posts: result.posts,
            pagination: result.pagination
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Get reported/flagged posts
 */
export async function getReportedPosts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        
        const result = await fetchReportedPosts(page, limit)
        
        res.status(200).json({
            Status: "success",
            Message: "Reported posts fetched successfully",
            reportedPosts: result.posts,
            pagination: result.pagination
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Delete any post (admin override)
 */
export async function deleteAnyPost(req, res, next) {
    try {
        const { postId } = req.params
        const adminId = req.user._id
        
        const deletedPost = await deleteAnyPostById(postId, adminId)
        
        res.status(200).json({
            Status: "success",
            Message: "Post deleted successfully by admin",
            post: {
                _id: deletedPost._id,
                title: deletedPost.title,
                author: deletedPost.author
            }
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Toggle post visibility (hide/unhide)
 * If hidden: true → set visibility to 'anonymous'
 * If hidden: false → set visibility to 'public'
 */
export async function togglePostVisibility(req, res, next) {
    try {
        const { postId } = req.params
        const { hidden } = req.body // boolean
        
        if (hidden === undefined) {
            const err = new Error('hidden field is required (true/false)')
            err.statusCode = 400
            throw err
        }
        
        const updatedPost = await updatePostVisibilityById(postId, hidden)
        
        res.status(200).json({
            Status: "success",
            Message: `Post ${hidden ? 'hidden' : 'unhidden'} successfully`,
            post: updatedPost
        })
    } catch(err) {
        next(err)
    }
}

// ========== CATEGORY MANAGEMENT ==========

/**
 * Get all categories
 */
export async function getAllCategories(req, res, next) {
    try {
        const categories = await fetchAllCategories()
        
        res.status(200).json({
            Status: "success",
            Message: "Categories fetched successfully",
            categories
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Create new category
 */
export async function createCategory(req, res, next) {
    try {
        const { name, description } = req.body
        const adminId = req.user._id
        
        if (!name) {
            const err = new Error('Category name is required')
            err.statusCode = 400
            throw err
        }
        
        const category = await createNewCategory({ name, description, adminId })
        
        res.status(201).json({
            Status: "success",
            Message: "Category created successfully",
            category
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Update category
 */
export async function updateCategory(req, res, next) {
    try {
        const { categoryId } = req.params
        const { name, description } = req.body
        
        if (!name && description === undefined) {
            const err = new Error('At least one field (name or description) is required')
            err.statusCode = 400
            throw err
        }
        
        const category = await updateCategoryById(categoryId, { name, description })
        
        res.status(200).json({
            Status: "success",
            Message: "Category updated successfully",
            category
        })
    } catch(err) {
        next(err)
    }
}

/**
 * Delete category
 */
export async function deleteCategory(req, res, next) {
    try {
        const { categoryId } = req.params
        
        const category = await deleteCategoryById(categoryId)
        
        res.status(200).json({
            Status: "success",
            Message: "Category deleted successfully",
            category
        })
    } catch(err) {
        next(err)
    }
}

// ========== SYSTEM ==========

/**
 * Get system logs
 */
export async function getSystemLogs(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 50
        const level = req.query.level || '' // error, warn, info
        
        const logs = await fetchSystemLogs(page, limit, level)
        
        res.status(200).json({
            Status: "success",
            Message: "System logs fetched successfully",
            logs
        })
    } catch(err) {
        next(err)
    }
}