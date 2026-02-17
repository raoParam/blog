import { Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'

// Lazy load pages
const Landing = lazy(() => import('../pages/Landing'))
const Explore = lazy(() => import('../pages/Explore'))
const Home = lazy(() => import('../pages/Home'))
const SingleBlog = lazy(() => import('../pages/SingleBlog'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/ResetPassword'))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'))
const NotFound = lazy(() => import('../pages/NotFound'))

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - WITH Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Explore />} />
      </Route>
      
      {/* Auth Routes - WITHOUT Navbar & Footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Routes - Require Authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/post/:postId" element={<SingleBlog />} />
          {/* Add more protected routes here that need the main layout */}
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes