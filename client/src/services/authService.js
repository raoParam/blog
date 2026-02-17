import { publicAxios, protectedAxios } from './axiosInstance'

// Throw a standardized error
const throwError = (error) => {
  const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred'
  throw new Error(errorMessage)
}

/**
 * @param {{ userName, emailId, password }} userData
 */
export const register = async (userData) => {
  try {
    const response = await publicAxios.post('/auth/register', userData)
    return response.data
  } catch (error) {
    throwError(error)
  }
}

/**
 * @param {{ emailId, password }} credentials
 */
export const login = async (credentials) => {
  try {
    const response = await publicAxios.post('/auth/login', credentials)
    // The backend now sets an httpOnly cookie, so we just return user data
    return response.data 
  } catch (error) {
    throwError(error)
  }
}

export const logout = async () => {
  try {
    const response = await protectedAxios.post('/auth/logout')
    return response.data
  } catch (error) {
    throwError(error)
  }
}

/**
 * @param {{ emailId, otp }} data
 */
export const verifyEmail = async (data) => {
  try {
    const response = await publicAxios.post('/auth/verify-email', data)
    return response.data
  } catch (error) {
    throwError(error)
  }
}

/**
 * @param {{ emailId }} data
 */
export const resendVerificationOTP = async (data) => {
  try {
    const response = await publicAxios.post('/auth/resend-verification', data)
    return response.data
  } catch (error) {
    throwError(error)
  }
}

/**
 * @param {{ emailId }} data
 */
export const forgotPassword = async (data) => {
  try {
    const response = await publicAxios.post('/auth/forgot-password', data)
    return response.data
  } catch (error) {
    throwError(error)
  }
}

/**
 * @param {{ emailId, otp, newPassword, confirmPassword }} data
 */
export const resetPassword = async (data) => {
  try {
    const response = await publicAxios.post('/auth/reset-password', data)
    return response.data
  } catch (error) {
    throwError(error)
  }
}

/**
 * @param {{ currentPassword, newPassword, confirmPassword }} data
 */
export const changePassword = async (data) => {
  try {
    const response = await protectedAxios.patch('/auth/change-password', data)
    return response.data
  } catch (error) {
    throwError(error)
  }
}