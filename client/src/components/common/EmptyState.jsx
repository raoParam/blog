import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const EmptyState = ({ 
  title = "No posts yet", 
  description = "Be the first one to share your thoughts!",
  showAction = true,
  actionText = "Write a blog",
  actionLink = "/write"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-[#121212] border border-[#1E1E1E] flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-[#A1A1A1]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#A1A1A1] text-center max-w-sm mb-6">
        {description}
      </p>
      {showAction && (
        <Link
          to={actionLink}
          className="px-5 py-2.5 bg-white text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-colors text-sm font-medium"
        >
          {actionText}
        </Link>
      )}
    </motion.div>
  )
}

export default EmptyState