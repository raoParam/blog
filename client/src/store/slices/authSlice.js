import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { publicAxios } from '../../services/axiosInstance'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  token: localStorage.getItem('token') || null,
  status: localStorage.getItem('token') ? 'authenticated' : 'unauthenticated', // Changed from 'idle'
  error: null,
  isAuthenticated: !!localStorage.getItem('token')
}

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ emailId, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting login...')
      const response = await publicAxios.post('/auth/login', { emailId, password })
      const { token } = response.data
      
      localStorage.setItem('token', token)
      console.log('Login successful, token stored:', token.substring(0, 10) + '...')
      
      return { token }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Async thunk for register
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ userName, emailId, password }, { rejectWithValue }) => {
    try {
      const response = await publicAxios.post('/auth/register', { 
        userName, 
        emailId, 
        password 
      })
      toast.success('Account created successfully! Please login.')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('token')
      toast.success('Logged out successfully')
      return null
    } catch (error) {
      return rejectWithValue('Logout failed')
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetAuth: (state) => {
      state.token = null
      state.status = 'unauthenticated'
      state.error = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
        console.log('Auth state updated to authenticated')
        
        // Show success toast
        toast.success('Login successful!')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.error = action.payload
        state.isAuthenticated = false
        state.token = null
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'unauthenticated'
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.error = action.payload
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null
        state.status = 'unauthenticated'
        state.isAuthenticated = false
        state.error = null
        console.log('Logged out, auth state reset')
      })
  }
})

export const { clearError, resetAuth } = authSlice.actions
export default authSlice.reducer