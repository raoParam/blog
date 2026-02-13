import { publicAxios } from './axiosInstance'

export const register = async (userData) => {
  try {
    const response = await publicAxios.post('/auth/register', userData)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed'
    throw new Error(errorMessage)
  }
}

export const login = async (credentials) => {
  try {
    const response = await publicAxios.post('/auth/login', credentials)
    return response.data // Returns { token, status, message }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed'
    throw new Error(errorMessage)
  }
}