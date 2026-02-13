import { publicAxios, protectedAxios } from './axiosInstance'

// PUBLIC APIS
export const getPublicPosts = async () => {
  try {
    const response = await publicAxios.get('/public/posts')
    return response.data.posts || []
  } catch (error) {
    // Only log in development
    if (import.meta.env.DEV) {
      console.error('Error fetching public posts:', error)
    }
    return []
  }
}

export const getPublicPost = async (postId) => {
  try {
    const response = await publicAxios.get(`/public/posts/${postId}`)
    return response.data.post || null
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching public post:', error)
    }
    return null
  }
}

// PROTECTED APIS
export const getAllBlogs = async (page = 1) => {
  try {
    const response = await protectedAxios.get(`/post/posts?page=${page}`)
    return response.data.blogs || []
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching all blogs:', error)
    }
    return []
  }
}

// Get single blog
export const getSingleBlog = async (postId) => {
  try {
    const response = await protectedAxios.get(`/post/${postId}`)
    return response.data.blog || null
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch blog' }
  }
}

export const createBlog = async (blogData) => {
  try {
    const response = await protectedAxios.post('/posts/', blogData)
    return response.data.blog || null
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create blog' }
  }
}

export const updateBlog = async (postId, blogData) => {
  try {
    const response = await protectedAxios.put(`/posts/${postId}`, blogData)
    return response.data.blog || null
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update blog' }
  }
}

export const deleteBlog = async (postId) => {
  try {
    const response = await protectedAxios.delete(`/posts/${postId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete blog' }
  }
}

// Like blog - Returns proper response for optimistic updates
export const likeBlog = async (postId) => {
  try {
    const response = await protectedAxios.post(`/post/${postId}/like`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: 'Failed to like blog' }
  }
}