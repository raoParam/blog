import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { protectedAxios } from '../../services/axiosInstance'

// Initial state
const initialState = {
  profile: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
}

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState()
      if (!auth.token) {
        return rejectWithValue('No token found')
      }
      
      console.log('Fetching user profile with token:', auth.token.substring(0, 10) + '...')
      const response = await protectedAxios.get('/user/me')
      console.log('Profile response:', response.data)
      return response.data.user
    } catch (error) {
      console.error('Profile fetch error:', error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile')
    }
  }
)

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null
    },
    resetUser: (state) => {
      state.profile = null
      state.status = 'idle'
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.profile = action.payload
        state.error = null
        console.log('Profile loaded successfully:', action.payload)
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
        state.profile = null
        console.log('Profile fetch failed:', action.payload)
      })
  }
})

export const { clearUserError, resetUser } = userSlice.actions
export default userSlice.reducer