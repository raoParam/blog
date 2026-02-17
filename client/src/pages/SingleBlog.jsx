import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Home, 
  Bookmark, 
  User, 
  FileText, 
  Star, 
  Settings, 
  PenSquare, 
  ChevronRight 
} from 'lucide-react'
import { getSingleBlog, likeBlog } from '../services/blogService'
import BlogContent from '../components/blog/BlogContent'
import BlogActions from '../components/blog/BlogActions'
import Loader from '../components/common/Loader'
import { formatBlogDate } from '../utils/formatDate'

const SingleBlog = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiking, setIsLiking] = useState(false)

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const profile = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // Sidebar navigation items (same as Home)
  const navItems = [
    { name: 'Home', icon: Home, path: '/home', active: false },
    { name: 'Saved', icon: Bookmark, path: '/saved', active: false },
    { name: 'Profile', icon: User, path: '/profile', active: false },
    { type: 'divider' },
    { name: 'Your Stuff', icon: null, type: 'header' },
    { name: 'Drafts', icon: FileText, path: '/drafts', active: false },
    { name: 'Following', icon: Star, path: '/following', active: false },
    { type: 'divider' },
    { name: 'Settings', icon: Settings, path: '/settings', active: false },
  ]

  // 🔥 Fetch blog when postId changes
  useEffect(() => {
    if (postId) fetchBlog()
  }, [postId])

  // 🔥 Recalculate like state when profile loads later
  useEffect(() => {
    if (blog && profile?._id) {
      const userHasLiked =
        blog.likes?.some((id) => id.toString() === profile._id.toString()) || false

      setIsLiked(userHasLiked)
    }
  }, [profile, blog])

  const fetchBlog = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getSingleBlog(postId)
      setBlog(data)

      // Initialize likes count immediately
      setLikesCount(data.likes?.length || 0)

      // Safe like detection
      const userHasLiked =
        data.likes?.some((id) => id.toString() === profile?._id?.toString()) || false

      setIsLiked(userHasLiked)
    } catch (err) {
      setError(err.message || 'Failed to load blog post')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (isLiking) return

    const previousLikedState = isLiked
    const previousLikesCount = likesCount

    // Optimistic UI update
    const newLikedState = !isLiked
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1

    setIsLiked(newLikedState)
    setLikesCount(newLikesCount)
    setIsLiking(true)

    try {
      const result = await likeBlog(postId)

      // 🔥 FIX: backend wraps response inside "likes"
      setIsLiked(result.likes.isLikedByUser)
      setLikesCount(result.likes.totalLikes)
    } catch (error) {
      // revert on failure
      setIsLiked(previousLikedState)
      setLikesCount(previousLikesCount)
      console.error('Like error:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleBack = () => navigate(-1)

  const getUserInitial = () => {
    if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase()
    if (profile?.userName) return profile.userName.charAt(0).toUpperCase()
    return 'U'
  }

  const isAuthor = blog?.author?._id?.toString() === profile?._id?.toString()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3" />
            <div className="col-span-1 lg:col-span-9 flex justify-center py-20">
              <Loader />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3" />
            <div className="col-span-1 lg:col-span-9">
              <div className="text-center py-20 bg-[#121212] rounded-2xl border border-[#1E1E1E]">
                <p className="text-red-400 text-sm mb-4">{error || 'Blog post not found'}</p>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const authorName =
    blog.author?.userName ||
    [blog.author?.firstName, blog.author?.lastName].filter(Boolean).join(' ') ||
    blog.authorName ||
    blog.authorUserName ||
    null
  const isAnonymous = blog.visibility === 'anonymous' && !authorName
  const displayAuthorName = authorName || 'Anonymous'
  const authorInitial = displayAuthorName.charAt(0).toUpperCase()
  const formattedDate = formatBlogDate(blog.createdAt)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block lg:col-span-3"
          >
            <div className="sticky top-24 space-y-1">
              {navItems.map((item, index) => {
                if (item.type === 'divider') {
                  return <div key={index} className="border-t border-[#1E1E1E] my-4" />
                }
                
                if (item.type === 'header') {
                  return (
                    <div key={item.name} className="px-4 py-2">
                      <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                        {item.name}
                      </p>
                    </div>
                  )
                }

                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      item.active 
                        ? 'bg-[#1E1E1E] text-white border border-[#3B82F6]/30' 
                        : 'text-[#A1A1A1] hover:bg-[#1E1E1E]/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${item.active ? 'text-[#3B82F6]' : ''}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </motion.aside>

          {/* MAIN CONTENT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 lg:col-span-9"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#A1A1A1] hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Home</span>
            </button>

            <BlogContent
              blog={blog}
              isAnonymous={isAnonymous}
              authorName={displayAuthorName}
              authorInitial={authorInitial}
              formattedDate={formattedDate}
            />

            <div className="mt-8 pt-8 border-t border-[#1E1E1E]">
              <BlogActions
                blog={blog}
                isLiking={isLiking}
                onLike={handleLike}
                isAuthenticated={isAuthenticated}
                isAuthor={isAuthor}
                likesCount={likesCount}
                isLiked={isLiked}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SingleBlog
