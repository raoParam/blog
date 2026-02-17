import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Public instance
export const publicAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
})

// Protected instance
export const protectedAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
})

// Interceptor to handle responses
const responseInterceptor = (response) => response

const errorInterceptor = (error) => {
  const status = error.response?.status
  const config = error.config || {}
  const url = config.url || ''

  const shouldSkipAuthError =
    config.skipAuthError === true || url.includes('/auth/logout')

  if (status === 401 && !shouldSkipAuthError) {
    // Dispatch a custom event to log the user out globally
    window.dispatchEvent(new Event('auth-error'))
    toast.error('Session expired. Please login again.')
  }
  return Promise.reject(error)
}

// Apply interceptors to protected instance
protectedAxios.interceptors.response.use(
  responseInterceptor,
  errorInterceptor
)
