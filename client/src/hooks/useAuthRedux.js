import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  loginUser, 
  registerUser, 
  logoutUser,
  clearError
} from '../store/slices/authSlice'
import { resetUser } from '../store/slices/userSlice'

export const useAuthRedux = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const auth = useSelector((state) => state.auth)
  const user = useSelector((state) => state.user)

  const login = async (emailId, password) => {
    try {
      const result = await dispatch(loginUser({ emailId, password })).unwrap()
      console.log('Login result:', result)
      
      // Navigate immediately after successful login
      navigate('/home')
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error }
    }
  }

  const register = async (userName, emailId, password) => {
    try {
      await dispatch(registerUser({ userName, emailId, password })).unwrap()
      navigate('/login')
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      dispatch(resetUser())
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    token: auth.token,
    status: auth.status,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    profile: user.profile,
    userStatus: user.status,
    userError: user.error,
    login,
    register,
    logout,
    clearError: () => dispatch(clearError())
  }
}