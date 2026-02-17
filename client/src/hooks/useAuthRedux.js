import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  loginUser, 
  registerUser, 
  logoutUser,
  clearError,
  selectIsAuthenticated,
  selectUser,
  selectAuthStatus
} from '../store/slices/authSlice'

export const useAuthRedux = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const status = useSelector(selectAuthStatus)
  const error = useSelector((state) => state.auth.error)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const login = async (credentials) => {
    // The component will react to the state change from the slice
    await dispatch(loginUser(credentials)).unwrap()
  }

  const register = async (userData) => {
    // The component will react, but we can navigate here after success
    await dispatch(registerUser(userData)).unwrap()
    navigate('/verify-email', { state: { emailId: userData.emailId } })
  }

  const logout = async () => {
    await dispatch(logoutUser()).unwrap()
    navigate('/')
  }

  return {
    status,
    error,
    isAuthenticated,
    user,
    login,
    register,
    logout,
    clearError: () => dispatch(clearError())
  }
}