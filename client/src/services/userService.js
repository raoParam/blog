import { protectedAxios } from './axiosInstance'

export const getUserProfile = async () => {
  try {
    const response = await protectedAxios.get('/user/me')
    return response.data.user
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user profile' }
  }
}

export const getUserPosts = async () => {
  try {
    const response = await protectedAxios.get('/user/posts')
    return response.data.posts
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user posts' }
  }
}