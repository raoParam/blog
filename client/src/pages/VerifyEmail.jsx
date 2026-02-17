import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Key, ArrowRight } from 'lucide-react'
import { verifyEmail, resendVerificationOTP } from '../services/authService'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendStatus, setResendStatus] = useState('idle') // idle | sending | sent
  const [errors, setErrors] = useState({})
  
  const navigate = useNavigate()
  const location = useLocation()
  const emailId = location.state?.emailId

  useEffect(() => {
    if (!emailId) {
      toast.error('No email address found. Please register again.')
      navigate('/register')
    }
  }, [emailId, navigate])

  const handleResendOTP = async () => {
    setResendStatus('sending')
    try {
      await resendVerificationOTP({ emailId })
      toast.success('A new OTP has been sent to your email.')
      setResendStatus('sent')
      // Optional: disable button for a while
      setTimeout(() => setResendStatus('idle'), 30000) 
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP.')
      setResendStatus('idle')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!otp) {
      setErrors({ otp: 'OTP is required.' })
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    try {
      await verifyEmail({ emailId, otp })
      toast.success('Email verified successfully! You can now log in.')
      navigate('/login')
    } catch (err) {
      setErrors({ api: err.message || 'Invalid or expired OTP.' })
      toast.error(err.message || 'Verification failed.')
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
              Verify Your Email
            </h1>
            <p className="text-[#A1A1A1] text-sm">
              An OTP has been sent to <span className="font-medium text-white">{emailId}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#A1A1A1] block">
                Verification Code
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  className={`w-full h-12 pl-11 pr-4 bg-[#0A0A0A] border ${
                    errors.otp || errors.api ? 'border-red-500/50' : 'border-[#1E1E1E]'
                  } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/20 transition-all`}
                />
              </div>
              {errors.otp && <p className="text-xs text-red-400 mt-1">{errors.otp}</p>}
              {errors.api && <p className="text-xs text-red-400 mt-1">{errors.api}</p>}
            </div>

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
                    Verify Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-[#A1A1A1]">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOTP}
                disabled={resendStatus !== 'idle'}
                className="font-medium text-[#3B82F6] hover:text-[#2563EB] disabled:text-[#666666] disabled:cursor-not-allowed transition-colors"
              >
                {resendStatus === 'sending' && 'Sending...'}
                {resendStatus === 'sent' && 'Sent!'}
                {resendStatus === 'idle' && 'Resend OTP'}
              </button>
            </p>
          </div>

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

export default VerifyEmail
