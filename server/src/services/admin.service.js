import User from '../models/user.js'
import Post from '../models/post.js'
import Comment from '../models/comment.js'
import Category from '../models/category.js'
import RefreshToken from '../models/refreshToken.js'
import { cloudinary } from '../middleware/uploadPost.js'
import { escapeRegex, normalizePagination, isValidObjectId, isValidDate } from '../utils/queryHelper.js'

// ========== DASHBOARD SERVICES ==========

/**
 * Get platform statistics for admin dashboard
 */
export async function getPlatformStatistics() {
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalPosts,
        publicPosts,
        anonymousPosts,
        totalComments,
        totalCategories,
        postsLast7Days,
        postsLast30Days,
        usersLast7Days,
        usersLast30Days,
        topAuthors,
        mostLikedPosts
    ] = await Promise.all([
        // User counts
        User.countDocuments(),
        User.countDocuments({ accountStatus: 'active' }),
        User.countDocuments({ accountStatus: 'suspended' }),
        
        // Post counts
        Post.countDocuments(),
        Post.countDocuments({ visibility: 'public' }),
        Post.countDocuments({ visibility: 'anonymous' }),
        
        // Comment counts
        Comment.countDocuments(),
        
        // Category counts
        Category.countDocuments(),
        
        // Posts over time
        Post.countDocuments({ createdAt: { $gte: last7Days } }),
        Post.countDocuments({ createdAt: { $gte: last30Days } }),
        
        // Users over time
        User.countDocuments({ createdAt: { $gte: last7Days } }),
        User.countDocuments({ createdAt: { $gte: last30Days } }),
        
        // Top authors (users with most posts)
        Post.aggregate([
            { $group: { _id: '$author', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },
            { $unwind: '$author' },
            { $project: { 'author.userName': 1, 'author.avatar': 1, count: 1 } }
        ]),
        
        // Most liked posts
        Post.find()
            .sort({ likes: -1 })
            .limit(5)
            .populate('author', 'userName avatar')
            .select('title likes visibility createdAt')
            .lean()
    ])
    
    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            newLast7Days: usersLast7Days,
            newLast30Days: usersLast30Days
        },
        posts: {
            total: totalPosts,
            public: publicPosts,
            anonymous: anonymousPosts,
            newLast7Days: postsLast7Days,
            newLast30Days: postsLast30Days,
            topAuthors,
            mostLiked: mostLikedPosts
        },
        comments: {
            total: totalComments
        },
        categories: {
            total: totalCategories
        }
    }
}

// ========== USER MANAGEMENT SERVICES ==========

/**
 * Fetch all users with filters and pagination
 */
export async function fetchAllUsers(filters) {
    const { page, limit, search, status, sort } = filters
    const { page: validPage, limit: validLimit, skip } = normalizePagination(page, limit, 20, 100)
    const query = {}
    
    // Filter by status
    if (status && ['active', 'suspended', 'deleted'].includes(status)) {
        query.accountStatus = status
    }
    
    // Safely search by username, email, or name with escaped regex
    if (search && typeof search === 'string') {
        const trimmed = search.trim()
        if (trimmed.length > 0) {
            const safeRegex = { $regex: escapeRegex(trimmed), $options: 'i' }
            query.$or = [
                { userName: safeRegex },
                { emailId: safeRegex },
                { firstName: safeRegex },
                { lastName: safeRegex }
            ]
        }
    }
    
    // Sorting
    let sortOption = { createdAt: -1 } // default: newest first
    if (sort === 'oldest') {
        sortOption = { createdAt: 1 }
    } else if (sort === 'username') {
        sortOption = { userName: 1 }
    } else if (sort === 'email') {
        sortOption = { emailId: 1 }
    }
    
    const users = await User.find(query)
        .select('-password -refreshTokenVersion')
        .sort(sortOption)
        .skip(skip)
        .limit(validLimit)
        .lean()
    
    // Add counts for each user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
        const postsCount = await Post.countDocuments({ author: user._id })
        const followersCount = user.followers?.length || 0
        const followingCount = user.following?.length || 0
        
        return {
            ...user,
            postsCount,
            followersCount,
            followingCount
        }
    }))
    
    const total = await User.countDocuments(query)
    const totalPages = Math.ceil(total / validLimit)
    
    return {
        users: usersWithCounts,
        pagination: {
            currentPage: validPage,
            totalPages,
            totalUsers: total,
            hasNext: validPage < totalPages,
            hasPrev: validPage > 1
        }
    }
}

/**
 * Fetch single user details by ID
 */
export async function fetchUserDetailsById(userId) {
    if (!isValidObjectId(userId)) {
        const err = new Error('Invalid user ID format')
        err.statusCode = 400
        throw err
    }

    const user = await User.findById(userId)
        .select('-password -refreshTokenVersion')
        .lean()
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }
    
    // Get additional stats
    const [postsCount, commentsCount, savedPostsCount, activeSessions] = await Promise.all([
        Post.countDocuments({ author: userId }),
        Comment.countDocuments({ author: userId }),
        user.savedPosts?.length || 0,
        RefreshToken.countDocuments({ user: userId, isValid: true })
    ])
    
    return {
        ...user,
        stats: {
            postsCount,
            commentsCount,
            savedPostsCount,
            activeSessions,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0
        }
    }
}

/**
 * Update user account status
 */
export async function updateUserStatusById(userId, status) {
    if (!isValidObjectId(userId)) {
        const err = new Error('Invalid user ID format')
        err.statusCode = 400
        throw err
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { accountStatus: status },
        { new: true }
    ).select('-password -refreshTokenVersion')
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }
    
    // If suspending or deleting, invalidate all refresh tokens
    if (status === 'suspended' || status === 'deleted') {
        await RefreshToken.updateMany(
            { user: userId, isValid: true },
            { isValid: false }
        )
    }
    
    return user
}

/**
 * Toggle verified badge for user
 */
export async function toggleUserVerifiedBadge(userId, verify) {
    if (!isValidObjectId(userId)) {
        const err = new Error('Invalid user ID format')
        err.statusCode = 400
        throw err
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { isVerifiedBadge: verify },
        { new: true }
    ).select('-password -refreshTokenVersion')
    
    if (!user) {
        const err = new Error('User not found')
        err.statusCode = 404
        throw err
    }
    
    return user
}

// ========== POST MANAGEMENT SERVICES ==========

/**
 * Fetch all posts with filters and pagination
 */
export async function fetchAllPosts(filters) {
    const { page, limit, visibility, author, startDate, endDate } = filters
    const { page: validPage, limit: validLimit, skip } = normalizePagination(page, limit, 20, 100)
    const query = {}
    
    if (visibility && ['public', 'anonymous'].includes(visibility)) {
        query.visibility = visibility
    }
    
    if (author) {
        if (!isValidObjectId(author)) {
            const err = new Error('Invalid author ID format')
            err.statusCode = 400
            throw err
        }
        query.author = author
    }
    
    if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) {
            if (!isValidDate(startDate)) {
                const err = new Error('Invalid startDate format')
                err.statusCode = 400
                throw err
            }
            query.createdAt.$gte = new Date(startDate)
        }
        if (endDate) {
            if (!isValidDate(endDate)) {
                const err = new Error('Invalid endDate format')
                err.statusCode = 400
                throw err
            }
            query.createdAt.$lte = new Date(endDate)
        }
    }
    
    const posts = await Post.find(query)
        .populate('author', 'userName emailId firstName lastName avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit)
        .lean()
    
    // Add comments count to each post
    const postsWithStats = await Promise.all(posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id })
        return {
            ...post,
            commentsCount
        }
    }))
    
    const total = await Post.countDocuments(query)
    const totalPages = Math.ceil(total / validLimit)
    
    return {
        posts: postsWithStats,
        pagination: {
            currentPage: validPage,
            totalPages,
            totalPosts: total,
            hasNext: validPage < totalPages,
            hasPrev: validPage > 1
        }
    }
}

/**
 * Fetch reported/flagged posts
 * Note: Platform currently does not have a reporting data model or report collection.
 * Returns empty array and reports that the feature is not implemented.
 */
export async function fetchReportedPosts(page, limit) {
    const { page: validPage } = normalizePagination(page, limit, 20, 100)

    return {
        posts: [],
        pagination: {
            currentPage: validPage,
            totalPages: 0,
            totalPosts: 0,
            hasNext: false,
            hasPrev: false
        },
        message: 'Post reporting feature is not implemented yet. No report data exists.'
    }
}

/**
 * Delete any post by ID (admin override)
 */
export async function deleteAnyPostById(postId, adminId) {
    if (!isValidObjectId(postId)) {
        const err = new Error('Invalid post ID format')
        err.statusCode = 400
        throw err
    }

    const post = await Post.findById(postId)
    
    if (!post) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }
    
    // Delete images from Cloudinary
    if (post.imagePublicIds && post.imagePublicIds.length > 0) {
        for (const publicId of post.imagePublicIds) {
            try {
                await cloudinary.uploader.destroy(publicId)
                console.log(`Admin ${adminId} deleted image: ${publicId}`)
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error)
            }
        }
    }
    
    // Delete the post
    await post.deleteOne()
    
    // Delete all comments on this post
    await Comment.deleteMany({ post: postId })
    
    // Remove post from users' saved lists
    await User.updateMany(
        { savedPosts: postId },
        { $pull: { savedPosts: postId } }
    )
    
    return post
}

/**
 * Update post visibility (hide/unhide)
 * If hidden: true → set visibility to 'anonymous'
 * If hidden: false → set visibility to 'public'
 */
export async function updatePostVisibilityById(postId, hidden) {
    if (!isValidObjectId(postId)) {
        const err = new Error('Invalid post ID format')
        err.statusCode = 400
        throw err
    }

    const post = await Post.findById(postId)
    
    if (!post) {
        const err = new Error('Post not found')
        err.statusCode = 404
        throw err
    }
    
    // Corrected typo from post.visiblity to post.visibility
    if (hidden === true) { 
        post.visibility = 'anonymous'
    } else {
        post.visibility = 'public'
    }
    
    await post.save()
    
    // Populate author info before returning
    await post.populate('author', 'userName firstName lastName avatar')
    
    return {
        _id: post._id,
        title: post.title,
        visibility: post.visibility,
        author: post.author ? {
            _id: post.author._id,
            userName: post.author.userName,
            firstName: post.author.firstName,
            lastName: post.author.lastName,
            avatar: post.author.avatar
        } : null,
        updatedAt: post.updatedAt
    }
}

// ========== CATEGORY MANAGEMENT SERVICES ==========

/**
 * Fetch all categories
 */
export async function fetchAllCategories() {
    const categories = await Category.find()
        .sort({ name: 1 })
        .populate('createdBy', 'userName')
        .lean()
    
    // Get post count for each category
    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
        const postsCount = await Post.countDocuments({ category: category._id })
        return {
            ...category,
            postsCount
        }
    }))
    
    return categoriesWithCounts
}

/**
 * Create new category
 */
export async function createNewCategory({ name, description = '', adminId }) {
    const trimmedName = name ? name.trim() : ''
    if (!trimmedName) {
        const err = new Error('Category name is required')
        err.statusCode = 400
        throw err
    }

    const generatedSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
        $or: [
            { name: trimmedName.toLowerCase() },
            { slug: generatedSlug }
        ]
    })
    
    if (existingCategory) {
        const err = new Error('Category already exists')
        err.statusCode = 409
        throw err
    }
    
    // Create category
    const category = await Category.create({
        name: trimmedName.toLowerCase(),
        description,
        slug: generatedSlug,
        createdBy: adminId
    })
    
    return category
}

/**
 * Update category by ID
 */
export async function updateCategoryById(categoryId, { name, description }) {
    if (!isValidObjectId(categoryId)) {
        const err = new Error('Invalid category ID format')
        err.statusCode = 400
        throw err
    }

    const category = await Category.findById(categoryId)
    
    if (!category) {
        const err = new Error('Category not found')
        err.statusCode = 404
        throw err
    }
    
    if (name) {
        const trimmedName = name.trim()
        const newSlug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

        // Check if new name conflicts with existing category
        const existingCategory = await Category.findOne({
            _id: { $ne: categoryId },
            $or: [
                { name: trimmedName.toLowerCase() },
                { slug: newSlug }
            ]
        })
        
        if (existingCategory) {
            const err = new Error('Category name already exists')
            err.statusCode = 409
            throw err
        }
        
        category.name = trimmedName.toLowerCase()
        category.slug = newSlug
    }
    
    if (description !== undefined) {
        category.description = description
    }
    
    await category.save()
    return category
}

/**
 * Delete category by ID
 */
export async function deleteCategoryById(categoryId) {
    if (!isValidObjectId(categoryId)) {
        const err = new Error('Invalid category ID format')
        err.statusCode = 400
        throw err
    }

    const category = await Category.findById(categoryId)
    
    if (!category) {
        const err = new Error('Category not found')
        err.statusCode = 404
        throw err
    }
    
    // Check if any posts use this category
    const postsInCategory = await Post.countDocuments({ category: categoryId })
    if (postsInCategory > 0) {
        const err = new Error(`Cannot delete category with ${postsInCategory} existing posts. Reassign posts first.`)
        err.statusCode = 400
        throw err
    }
    
    await category.deleteOne()
    return category
}

// ========== SYSTEM SERVICES ==========

/**
 * Fetch system logs
 */
export async function fetchSystemLogs(page, limit, level) {
    const { page: validPage, limit: validLimit } = normalizePagination(page, limit, 50, 100)

    return {
        logs: [
            {
                timestamp: new Date(),
                level: level || 'info',
                message: 'System started',
                user: 'system'
            }
        ],
        pagination: {
            currentPage: validPage,
            totalPages: 1,
            totalLogs: 1
        }
    }
}
