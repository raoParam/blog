import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getPublicPosts } from '../services/blogService'
import BlogList from '../components/blog/BlogList'
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  PenSquare,
  Bookmark,
  Sliders,
  ChevronRight,
  Code,
  Palette,
  Rocket,
  Brain,
  Globe,
  Coffee,
  Film,
  Trophy,
  Camera,
  Gamepad2,
  Heart,
  Users,
  Hash
} from 'lucide-react'

const Explore = () => {
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['publicPosts'],
    queryFn: getPublicPosts,
    staleTime: 5 * 60 * 1000,
  })

  // Topic categories with icons
  const topics = [
    { name: 'For You', icon: Heart, path: '/for-you', isActive: true },
    { name: 'Following', icon: Users, path: '/following', isActive: false },
    { type: 'divider' },
    { name: 'Programming', icon: Code, count: '1.2k', path: '/topic/programming' },
    { name: 'Design', icon: Palette, count: '892', path: '/topic/design' },
    { name: 'Startup', icon: Rocket, count: '567', path: '/topic/startup' },
    { name: 'Productivity', icon: Brain, count: '445', path: '/topic/productivity' },
    { name: 'Travel', icon: Globe, count: '389', path: '/topic/travel' },
    { name: 'Food', icon: Coffee, count: '234', path: '/topic/food' },
    { name: 'Movies', icon: Film, count: '198', path: '/topic/movies' },
    { name: 'Sports', icon: Trophy, count: '156', path: '/topic/sports' },
    { name: 'Photography', icon: Camera, count: '143', path: '/topic/photography' },
    { name: 'Gaming', icon: Gamepad2, count: '121', path: '/topic/gaming' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navbar is already outside this component */}
      
      {/* Desktop Header */}
      <div className="hidden lg:block bg-[#0A0A0A] border-b border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 border border-[#3B82F6]/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Explore
              </h1>
            </div>
            <p className="text-lg text-[#A1A1A1] max-w-3xl leading-relaxed">
              Discover stories, tutorials, and thoughts from developers around the world.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-[#0A0A0A] border-b border-[#1E1E1E] px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 border border-[#3B82F6]/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Explore
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT SIDEBAR */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block lg:col-span-3"
          >
            <div className="sticky top-24 space-y-8">
              {/* Topics Navigation */}
              <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Hash className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Discover Topics
                  </h2>
                </div>
                
                <nav className="space-y-2">
                  {topics.map((topic, index) => (
                    topic.type === 'divider' ? (
                      <div key={index} className="border-t border-[#1E1E1E] my-4" />
                    ) : (
                      <Link
                        key={topic.name}
                        to={topic.path}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                          topic.isActive 
                            ? 'bg-[#1E1E1E] text-white border border-[#3B82F6]/30 shadow-lg shadow-[#3B82F6]/5' 
                            : 'text-[#A1A1A1] hover:bg-[#1E1E1E]/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <topic.icon className={`w-5 h-5 ${topic.isActive ? 'text-[#3B82F6]' : 'text-[#666666] group-hover:text-[#A1A1A1]'}`} />
                          <span className="text-sm font-medium">{topic.name}</span>
                        </div>
                        {topic.count && (
                          <span className="text-xs text-[#666666] font-medium">{topic.count}</span>
                        )}
                      </Link>
                    )
                  ))}
                </nav>

                <button className="w-full mt-6 px-4 py-3 text-sm text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#3B82F6]/5 rounded-xl transition-all flex items-center justify-center gap-2 font-medium">
                  Show more topics
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Your Topics */}
              <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bookmark className="w-5 h-5 text-[#3B82F6]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Your Topics
                  </h2>
                </div>
                <p className="text-sm text-[#666666] mb-4 leading-relaxed">
                  Topics you follow will appear here
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-full text-sm text-[#A1A1A1] cursor-pointer transition-colors">
                    <Hash className="w-3.5 h-3.5 mr-1.5" />
                    Programming
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* MAIN CONTENT - Blog Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 lg:col-span-6"
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-8 border-b border-[#1E1E1E] pb-1">
              <button className="px-1 pb-3 text-white border-b-2 border-white text-sm font-semibold transition-all">
                Latest
              </button>
              <button className="px-1 pb-3 text-[#A1A1A1] hover:text-white text-sm font-medium transition-all">
                Popular
              </button>
              <button className="px-1 pb-3 text-[#A1A1A1] hover:text-white text-sm font-medium transition-all">
                Following
              </button>
            </div>

            {/* Stats Bar - Subtle */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-sm text-[#A1A1A1]">
                  <span className="font-semibold text-white">{blogs?.length || 0}</span> stories published today
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#666666]" />
                <span className="text-sm text-[#666666]">
                  Updated
                </span>
              </div>
            </div>

            {/* Blog Feed - More spacing like Medium */}
            <div className="space-y-12">
              <BlogList posts={blogs} isLoading={isLoading} error={error} />
            </div>
          </motion.div>

          {/* RIGHT SIDEBAR */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block lg:col-span-3"
          >
            <div className="sticky top-24 space-y-8">
              
              {/* Start Writing CTA */}
              <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6 hover:border-[#3B82F6]/30 transition-all">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 border border-[#3B82F6]/30 flex items-center justify-center flex-shrink-0">
                    <PenSquare className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Start writing</h3>
                    <p className="text-sm text-[#A1A1A1] leading-relaxed">Share your story with the world</p>
                  </div>
                </div>
                <Link
                  to="/write"
                  className="flex items-center justify-between w-full px-5 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-all text-sm font-semibold group shadow-lg shadow-[#3B82F6]/20"
                >
                  <span>Write a blog</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Reading List CTA */}
              <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6 hover:border-[#1E1E1E]/80 transition-all">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-6 h-6 text-[#666666]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Reading list</h3>
                    <p className="text-sm text-[#A1A1A1] leading-relaxed">0 stories saved</p>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="flex items-center justify-between w-full px-5 py-3 bg-[#1E1E1E] text-[#A1A1A1] rounded-xl hover:bg-[#2A2A2A] hover:text-white transition-all text-sm font-medium group"
                >
                  <span>Sign in to save</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Customize Feed CTA */}
              <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6 hover:border-[#1E1E1E]/80 transition-all">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                    <Sliders className="w-6 h-6 text-[#666666]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Customize feed</h3>
                    <p className="text-sm text-[#A1A1A1] leading-relaxed">Choose topics you love</p>
                  </div>
                </div>
                <Link
                  to="/onboarding"
                  className="flex items-center justify-between w-full px-5 py-3 bg-[#1E1E1E] text-[#A1A1A1] rounded-xl hover:bg-[#2A2A2A] hover:text-white transition-all text-sm font-medium group"
                >
                  <span>Get started</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Become a Member */}
              <div className="bg-gradient-to-br from-[#1E1E1E] via-[#1A1A1A] to-[#121212] border border-[#3B82F6]/20 rounded-2xl p-6 hover:border-[#3B82F6]/40 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Become a member</h3>
                    <p className="text-sm text-[#A1A1A1] leading-relaxed">Support writers and get perks</p>
                  </div>
                </div>
                <Link
                  to="/membership"
                  className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors flex items-center gap-1.5 font-medium group"
                >
                  Learn more
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Footer Links - Medium-style */}
              <div className="pt-6 border-t border-[#1E1E1E]">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#666666]">
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">Help</a>
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">About</a>
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">Press</a>
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">API</a>
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">Jobs</a>
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">Privacy</a>
                  <a href="#" className="hover:text-[#A1A1A1] transition-colors">Terms</a>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}

export default Explore