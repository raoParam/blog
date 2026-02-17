import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getAllBlogs } from '../services/blogService'
import { useAuthRedux } from '../hooks/useAuthRedux'
import BlogCard from '../components/blog/BlogCard'
import Loader from '../components/common/Loader'
import { 
  Home, 
  Bookmark, 
  User, 
  FileText, 
  Star, 
  Settings,
  ChevronRight,
  Sparkles,
  PenSquare
} from 'lucide-react'

const HomePage = () => {
  const { user, logout } = useAuthRedux()
  
  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['homeBlogs'],
    queryFn: () => getAllBlogs(),
    staleTime: 5 * 60 * 1000,
    enabled: !!user, // Only fetch blogs if the user is loaded
  })

  // Sidebar navigation items
  const navItems = [
    { name: 'Home', icon: Home, path: '/home', active: true },
    { name: 'Saved', icon: Bookmark, path: '/saved', active: false },
    { name: 'Profile', icon: User, path: '/profile', active: false },
    { type: 'divider' },
    { name: 'Your Stuff', icon: null, type: 'header' },
    { name: 'Drafts', icon: FileText, path: '/drafts', active: false },
    { name: 'Following', icon: Star, path: '/following', active: false },
    { type: 'divider' },
    { name: 'Settings', icon: Settings, path: '/settings', active: false },
  ]

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.userName) return user.userName.charAt(0).toUpperCase()
    return 'U'
  }

  // ProtectedRoute handles the main loading/error state for the user.
  // We only need to handle the loading state for the blogs query.

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR - Navigation */}
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
                    {item.active && (
                      <ChevronRight className="w-4 h-4 ml-auto text-[#3B82F6]" />
                    )}
                  </Link>
                )
              })}

              {/* Quick Write Button */}
              <div className="pt-6 mt-6 border-t border-[#1E1E1E]">
                <Link
                  to="/write"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Write a story</span>
                </Link>
              </div>

              {/* User Profile Card at bottom */}
              <div className="mt-6 pt-6 border-t border-[#1E1E1E]">
                <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1E1E1E]/50 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
                    <span className="text-lg font-semibold text-white">
                      {getUserInitial()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.userName || 'User'}
                    </p>
                    <p className="text-xs text-[#666666] truncate">
                      View your profile
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* MAIN CONTENT - Blog Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 lg:col-span-9"
          >
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back, {user?.userName || 'Friend'}! 👋
              </h1>
              <p className="text-[#A1A1A1]">
                Discover new stories from the community
              </p>
            </div>

            {/* Feed Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-[#1E1E1E]">
              <button className="px-1 pb-3 text-white border-b-2 border-white text-sm font-semibold">
                For you
              </button>
              <button className="px-1 pb-3 text-[#A1A1A1] hover:text-white text-sm font-medium transition-colors">
                Following
              </button>
              <button className="px-1 pb-3 text-[#A1A1A1] hover:text-white text-sm font-medium transition-colors">
                Latest
              </button>
            </div>

            {/* Feed Stats */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm text-[#A1A1A1]">
                <span className="font-medium text-white">{blogs.length}</span> stories for you
              </span>
            </div>

            {/* Blog Feed */}
            {blogsLoading ? (
              <div className="flex justify-center py-20">
                <Loader />
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.length > 0 ? (
                  blogs.map(blog => (
                    <BlogCard key={blog._id} post={blog} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-[#121212] rounded-2xl border border-[#1E1E1E]">
                    <p className="text-[#A1A1A1]">No blogs yet. Follow some topics to get started!</p>
                    <Link
                      to="/explore"
                      className="inline-block mt-4 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors text-sm"
                    >
                      Explore topics
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HomePage