import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Bookmark, MoreHorizontal, User } from 'lucide-react'
import { formatBlogDate } from '../../utils/formatDate'

const BlogCard = ({ post }) => {
  const {
    _id,
    title,
    content,
    author,
    visibility,
    likes = [],
    comments = [], // Will be added later
    saves = [], // Will be added later
    createdAt,
  } = post

  // Strip HTML tags and create excerpt
  const plainText = content.replace(/<[^>]*>/g, '')
  const excerpt = plainText.length > 180 
    ? plainText.substring(0, 180) + '...' 
    : plainText

  const formattedDate = formatBlogDate(createdAt)
  
  const isAnonymous = visibility === 'anonymous'
  const authorName = isAnonymous 
    ? 'Anonymous' 
    : author?.userName || 'Anonymous'
  const authorInitial = authorName.charAt(0).toUpperCase()

  // Reading time calculation (average reading speed: 200 words per minute)
  const wordCount = plainText.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group w-full"
    >
      <Link to={`/post/${_id}`} className="block w-full">
        <div className="w-full bg-[#121212] border border-[#1E1E1E] rounded-xl p-6 hover:border-[#3B82F6]/30 transition-all duration-300">
          
          {/* Author Row - Medium Style */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#3B82F6]/20 flex items-center justify-center overflow-hidden">
                {isAnonymous ? (
                  <User className="w-4 h-4 text-[#A1A1A1]" />
                ) : (
                  <span className="text-sm font-medium text-white">{authorInitial}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-white hover:text-[#3B82F6] transition-colors">
                  {authorName}
                </span>
                <span className="text-[#A1A1A1]">·</span>
                <span className="text-[#A1A1A1] text-sm">
                  {formattedDate}
                </span>
              </div>
            </div>
            
            {isAnonymous && (
              <span className="px-2.5 py-1 bg-[#1E1E1E] rounded-full text-xs text-[#A1A1A1] border border-[#2A2A2A]">
                Anonymous
              </span>
            )}
          </div>

          {/* Content Row - Title & Excerpt */}
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#3B82F6] transition-colors line-clamp-2">
              {title}
            </h2>
            <p className="text-[#A1A1A1] text-base leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          </div>

          {/* Metadata Row - Reading Time & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#A1A1A1]">
                {readingTime} min read
              </span>
              
              {/* Like Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement like functionality
                }}
                className="flex items-center gap-1.5 text-[#A1A1A1] hover:text-[#F43F5E] transition-colors group/btn"
              >
                <Heart className="w-4 h-4 group-hover/btn:fill-[#F43F5E] group-hover/btn:text-[#F43F5E]" />
                <span className="text-sm">{likes?.length || 0}</span>
              </button>

              {/* Comment Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement comment functionality
                }}
                className="flex items-center gap-1.5 text-[#A1A1A1] hover:text-[#3B82F6] transition-colors group/btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{comments?.length || 0}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Save Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement save functionality
                }}
                className="p-2 text-[#A1A1A1] hover:text-[#3B82F6] rounded-lg hover:bg-[#1E1E1E] transition-colors"
              >
                <Bookmark className="w-4 h-4" />
              </button>
              
              {/* More Options */}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement more options
                }}
                className="p-2 text-[#A1A1A1] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default BlogCard