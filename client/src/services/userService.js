import { protectedAxios } from './axiosInstance'

export const getUserProfile = async ({ silent = false } = {}) => {
  try {
    const response = await protectedAxios.get('/user/me', {
      skipAuthError: silent,
    })
    return response.data.user
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user profile' }
  }
}

export const getUserPosts = async () => {
  try {
    const response = await protectedAxios.get('/user/posts')
    return response.data.blogs
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user posts' }
  }
}
