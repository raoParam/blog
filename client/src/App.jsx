import { Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/common/Loader'
import { fetchUserProfile } from './store/slices/userSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token, status: authStatus } = useSelector((state) => state.auth)
  const { status: userStatus } = useSelector((state) => state.user)

  // Fetch user profile when authenticated
  useEffect(() => {
    console.log('App - Auth state:', { isAuthenticated, token: !!token, authStatus })
    
    if (isAuthenticated && token && userStatus === 'idle') {
      console.log('App - Fetching user profile...')
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, token, userStatus, dispatch, authStatus])

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