import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '../components/common/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold gradient-text">404</h1>
        <h2 className="text-2xl font-semibold text-white mt-4 mb-2">Page Not Found</h2>
        <p className="text-[#9CA3AF] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/home">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound