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
          whileTap={{ scale: 0.96 }}
          onClick={onLike}
          disabled={isLiking}
          className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all disabled:opacity-50 ${
            isLiked 
              ? 'bg-gradient-to-r from-[#F43F5E]/20 to-[#F43F5E]/5 border-[#F43F5E]/60 text-[#F43F5E] shadow-[0_0_0_1px_rgba(244,63,94,0.2)]' 
              : 'bg-[#121212] border-[#1E1E1E] text-[#A1A1A1] hover:text-[#F43F5E] hover:border-[#F43F5E]/30'
          }`}
        >
          <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-[#F43F5E]' : 'group-hover:text-[#F43F5E]'}`} />
          <span className="text-sm font-semibold">{likesCount}</span>
          <span className="text-xs text-[#A1A1A1] group-hover:text-[#F43F5E]">
            {isLiked ? 'Liked' : 'Like'}
          </span>
        </motion.button>

        {/* Comment Button - Static for now */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#121212] border border-[#1E1E1E] rounded-full text-[#A1A1A1]">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{blog.comments?.length || 0}</span>
          <span className="text-xs text-[#666666]">Comments</span>
        </div>
      </div>

      {!isAuthenticated && (
        <Link to="/login" className="text-sm text-[#3B82F6] hover:text-white transition-colors">
          Sign in to like
        </Link>
      )}
    </div>
  )
}

export default BlogActions
