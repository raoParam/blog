import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login as loginApi, register as registerApi } from '../services/authService'
import { getUserProfile } from '../services/userService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    // Only fetch profile if we have a token and we're on a protected route
    const protectedRoutes = ['/home', '/profile', '/write', '/saved', '/settings']
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route))
    
    if (isProtectedRoute) {
      fetchUserProfile()
    } else {
      setIsLoading(false)
    }
  }, [location.pathname])

  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile()
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (emailId, password) => {
    try {
      const response = await loginApi({ emailId, password })
      const { token } = response
      
      // Store token
      localStorage.setItem('token', token)
      
      // Navigate to home first
      navigate('/home')
      
      // Small delay to ensure navigation completes
      setTimeout(() => {
        window.location.reload() // Force a reload to trigger new auth state
      }, 100)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Invalid credentials'
      }
    }
  }, [navigate])

  const register = useCallback(async (userName, emailId, password) => {
    try {
      await registerApi({ userName, emailId, password })
      toast.success('Account created successfully! Please sign in.')
      navigate('/login')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed'
      }
    }
  }, [navigate])

  const logout = useCallback(async () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/')
  }, [navigate])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}