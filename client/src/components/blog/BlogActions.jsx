import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'

const BlogActions = ({
  blog,
  isLiking,
  onLike,
  isAuthenticated,
  isAuthor,
  likesCount,
  isLiked
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          disabled={isLiking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all disabled:opacity-50 ${
            isLiked 
              ? 'bg-[#F43F5E]/10 border-[#F43F5E] text-[#F43F5E]' 
              : 'bg-[#121212] border-[#1E1E1E] text-[#A1A1A1] hover:text-[#F43F5E] hover:border-[#F43F5E]/30'
          }`}
        >
          <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-[#F43F5E]' : ''}`} />
          <span className="text-sm font-medium">{likesCount}</span>
        </motion.button>

        {/* Comment Button - Static for now */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-[#1E1E1E] rounded-lg text-[#A1A1A1]">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{blog.comments?.length || 0}</span>
        </div>
      </div>

      {!isAuthenticated && (
        <Link to="/login" className="text-sm text-[#3B82F6] hover:underline">
          Sign in to like
        </Link>
      )}
    </div>
  )
}

export default BlogActions