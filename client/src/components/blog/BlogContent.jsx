import { motion } from 'framer-motion'
import { User, Calendar, Clock } from 'lucide-react'

const BlogContent = ({ 
  blog, 
  isAnonymous, 
  authorName, 
  authorInitial, 
  formattedDate 
}) => {
  const { title, content, excerpt, createdAt } = blog

  // Calculate reading time
  const wordCount = content?.split(/\s+/).filter(word => word.length > 0).length || 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="max-w-3xl mx-auto"
    >
      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
        {title}
      </h1>

      {/* Author Bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
            {isAnonymous ? (
              <User className="w-6 h-6 text-white" />
            ) : (
              <span className="text-lg font-semibold text-white">{authorInitial}</span>
            )}
          </div>

          {/* Author Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-white">
                {authorName}
              </span>
              {isAnonymous && (
                <span className="px-2 py-0.5 bg-[#1E1E1E] rounded-full text-xs text-[#A1A1A1]">
                  Anonymous
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-[#A1A1A1] mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min read
              </span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button className="p-2 text-[#A1A1A1] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Excerpt (if available) */}
      {excerpt && (
        <div className="mb-8 p-5 bg-[#121212] border-l-4 border-[#3B82F6] rounded-r-xl">
          <p className="text-[#A1A1A1] italic text-lg leading-relaxed">
            "{excerpt}"
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-invert max-w-none">
        {content.split('\n').map((paragraph, index) => {
          if (paragraph.trim() === '') {
            return <div key={index} className="h-4" />
          }
          
          // Check if it's a heading (starts with #)
          if (paragraph.startsWith('# ')) {
            return (
              <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
                {paragraph.substring(2)}
              </h2>
            )
          }
          
          if (paragraph.startsWith('## ')) {
            return (
              <h3 key={index} className="text-xl font-semibold text-white mt-6 mb-3">
                {paragraph.substring(3)}
              </h3>
            )
          }

          // Regular paragraph
          return (
            <p key={index} className="text-base md:text-lg text-[#E5E7EB] leading-relaxed mb-6">
              {paragraph}
            </p>
          )
        })}
      </div>
    </motion.article>
  )
}

export default BlogContent