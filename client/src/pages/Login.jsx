import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthRedux } from '../hooks/useAuthRedux'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Github, Chrome } from 'lucide-react'

const Login = () => {
  const [emailId, setEmailId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { login, status, error, clearError, isAuthenticated } = useAuthRedux()
  const navigate = useNavigate()
  const isSubmitting = status === 'loading'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home')
    }
  }, [isAuthenticated, navigate])

  const validateForm = () => {
    const newErrors = {}
    if (!emailId) {
      newErrors.emailId = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(emailId)) {
      newErrors.emailId = 'Email is invalid'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
        clearError()
        return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    try {
      await login({ emailId, password })
    } catch (err) {
      // Error is already handled by the slice and displayed via the `error` state
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFFMUUxRSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-[#121212] border border-[#1E1E1E] rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 group">
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 border border-[#3B82F6]/30 flex items-center justify-center group-hover:border-[#3B82F6]/50 transition-all">
                    <span className="text-2xl font-bold text-white">F</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-[#121212] animate-pulse" />
                </div>
                <span className="text-2xl font-bold text-white">
                  Flagged<span className="text-[#3B82F6]">.</span>
                </span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-[#A1A1A1] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1A1] block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => {
                    setEmailId(e.target.value)
                    if (error) clearError()
                  }}
                  placeholder="Enter your email"
                  className={`w-full h-12 pl-11 pr-4 bg-[#0A0A0A] border ${
                    errors.emailId ? 'border-red-500/50' : 'border-[#1E1E1E]'
                  } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition-all`}
                />
              </div>
              {errors.emailId && (
                <p className="text-xs text-red-400 mt-1">{errors.emailId}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#A1A1A1] block">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-[#666666] hover:text-[#3B82F6] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) clearError()
                  }}
                  placeholder="Enter your password"
                  className={`w-full h-12 pl-11 pr-12 bg-[#0A0A0A] border ${
                    errors.password || error ? 'border-red-500/50' : 'border-[#1E1E1E]'
                  } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#A1A1A1] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Error message */}
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 mt-2 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.p>
              )}
              
              {errors.password && !error && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Rest of the component remains same */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E1E1E]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#121212] text-[#666666]">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-12 px-4 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl text-[#A1A1A1] hover:text-white hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all">
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-12 px-4 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl text-[#A1A1A1] hover:text-white hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all">
              <Chrome className="w-5 h-5" />
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>

          <p className="text-xs text-[#666666] text-center mt-8">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-[#A1A1A1] hover:text-white transition-colors">
              Terms
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-[#A1A1A1] hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login