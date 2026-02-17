import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Key, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../services/authService'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()
  const location = useLocation()
  const emailId = location.state?.emailId

  useEffect(() => {
    if (!emailId) {
      toast.error('No email address provided. Please start over.')
      navigate('/forgot-password')
    }
  }, [emailId, navigate])

  const validateForm = () => {
    const newErrors = {}
    if (!otp) newErrors.otp = 'OTP is required'
    if (!newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setErrors({})
    try {
      await resetPassword({ emailId, otp, newPassword, confirmPassword })
      toast.success('Password has been reset successfully!')
      navigate('/login')
    } catch (err) {
      setErrors({ api: err.message || 'Failed to reset password.' })
      toast.error(err.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
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
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-[#A1A1A1] text-sm">
              Enter the OTP sent to <span className="font-medium text-white">{emailId}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1A1] block">
                One-Time Password (OTP)
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit OTP"
                  className={`w-full h-12 pl-11 pr-4 bg-[#0A0A0A] border ${
                    errors.otp ? 'border-red-500/50' : 'border-[#1E1E1E]'
                  } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition-all`}
                />
              </div>
              {errors.otp && <p className="text-xs text-red-400 mt-1">{errors.otp}</p>}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1A1] block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className={`w-full h-12 pl-11 pr-12 bg-[#0A0A0A] border ${
                    errors.newPassword ? 'border-red-500/50' : 'border-[#1E1E1E]'
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
              {errors.newPassword && <p className="text-xs text-red-400 mt-1">{errors.newPassword}</p>}
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1A1] block">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={`w-full h-12 pl-11 pr-4 bg-[#0A0A0A] border ${
                    errors.confirmPassword ? 'border-red-500/50' : 'border-[#1E1E1E]'
                  } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition-all`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.api && <p className="text-xs text-red-400 mt-1">{errors.api}</p>}

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
                    Reset Password
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="text-xs text-[#666666] text-center mt-8">
            <Link to="/login" className="text-[#A1A1A1] hover:text-white transition-colors">
              Back to Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword
