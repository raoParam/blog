import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '../common/Loader'

const ProtectedRoute = () => {
  const { isAuthenticated, token, status: authStatus } = useSelector((state) => state.auth)
  const { status: userStatus } = useSelector((state) => state.user)

  console.log('ProtectedRoute - Auth:', { isAuthenticated, token: !!token, authStatus })
  console.log('ProtectedRoute - User:', { userStatus })

  // If no token, redirect to login
  if (!token) {
    console.log('No token, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If auth is still loading, show loader
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  // If not authenticated after check, redirect
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If user profile is loading, show loader
  if (userStatus === 'loading' || userStatus === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  // If user profile failed, still allow access but show warning
  if (userStatus === 'failed') {
    console.log('User profile failed, but allowing access')
    return <Outlet />
  }

  // All good, render protected content
  console.log('All good, rendering protected content')
  return <Outlet />
}

export default ProtectedRoute