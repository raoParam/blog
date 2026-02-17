import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from '../../services/authService'
import { getUserProfile } from '../../services/userService'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,
}

// Thunk to check if user is already logged in (via cookie)
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const user = await getUserProfile({ silent: true })
      return { user }
    } catch (error) {
      return rejectWithValue('No active session')
    }
  }
)

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { user } = await loginApi(credentials)
      toast.success('Login successful!')
      return { user }
    } catch (error) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerApi(userData)
      toast.success(response.message)
      return response // We don't log the user in, just show the message
    } catch (error) {
      toast.error(error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi()
      toast.success('Logged out successfully')
      return null
    } catch (error) {
      toast.error(error.message)
      return rejectWithValue(error.message)
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
    // This can be used to manually reset auth state if needed
    resetAuth: () => initialState,
    setUnauthenticated: (state) => {
      state.user = null
      state.status = 'unauthenticated'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
      })
      .addCase(checkAuth.rejected, (state) => {
        state.status = 'unauthenticated'
        state.user = null
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.error = action.payload
        state.user = null
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'unauthenticated' // User must verify email and log in
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'unauthenticated'
        state.error = action.payload
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.status = 'unauthenticated'
        state.error = null
      })
  },
})

export const { clearError, resetAuth, setUnauthenticated } = authSlice.actions
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated'
export const selectUser = (state) => state.auth.user
export const selectAuthStatus = (state) => state.auth.status

export default authSlice.reducer
