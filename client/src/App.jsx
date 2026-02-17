import { Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/common/Loader'
import { checkAuth, setUnauthenticated } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()

  // On app load, check if the user is authenticated via cookie
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // Global handler for 401 errors
  useEffect(() => {
    const handleAuthError = () => {
      dispatch(setUnauthenticated())
    }

    window.addEventListener('auth-error', handleAuthError)

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('auth-error', handleAuthError)
    }
  }, [dispatch])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#0A0A0A]"
      >
        <Suspense fallback={<Loader />}>
          <AppRoutes />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default App
