import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectAuthStatus } from '../../store/slices/authSlice'
import Loader from '../common/Loader'

const ProtectedRoute = () => {
  const authStatus = useSelector(selectAuthStatus)

  if (authStatus === 'idle' || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // authStatus is 'authenticated'
  return <Outlet />
}

export default ProtectedRoute