import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, ArrowRight } from "lucide-react";
import { publicService } from "../../services/public.service";

const BlogPreview = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await publicService.getPosts();
        setPosts(response.blogs || []);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError("Could not load recent posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fallback data if API fails
  const fallbackPosts = [
    {
      _id: "1",
      title: "Understanding React Server Components",
      excerpt: "A deep dive into how RSC work and when to use them in production...",
      author: { userName: "rahul_kumar", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 42,
      commentsCount: 8,
    },
    {
      _id: "2",
      title: "Getting Started with Next.js 14",
      excerpt: "Learn about App Router, Server Components, and the new features...",
      author: { userName: "priya_sharma", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 89,
      commentsCount: 12,
    },
    {
      _id: "3",
      title: "Why I Left Big Tech",
      excerpt: "A personal story about work-life balance and mental health...",
      author: null, // anonymous
      createdAt: new Date().toISOString(),
      likes: 156,
      commentsCount: 34,
    },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary">Latest from the Community</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-surface-1 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-surface-2 rounded-full" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-surface-2 rounded mb-2" />
                    <div className="w-16 h-3 bg-surface-2 rounded" />
                  </div>
                </div>
                <div className="w-full h-6 bg-surface-2 rounded mb-3" />
                <div className="w-full h-4 bg-surface-2 rounded mb-2" />
                <div className="w-3/4 h-4 bg-surface-2 rounded mb-4" />
                <div className="flex gap-4">
                  <div className="w-12 h-6 bg-surface-2 rounded" />
                  <div className="w-12 h-6 bg-surface-2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && posts.length === 0) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-text-primary mb-10">Latest from the Community</h2>
          <div className="bg-surface-1 rounded-2xl p-12 text-center">
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-1/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10"
        >
          <h2 className="text-2xl font-bold text-text-primary">Latest from the Community</h2>
          <Link 
            to="/explore" 
            className="text-accent hover:text-accent-hover flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View all <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayPosts.slice(0, 3).map((post) => (
            <motion.div
              key={post._id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={`/post/${post._id}`} className="block h-full">
                <div className="bg-surface-1 border border-border-subtle rounded-2xl p-6 h-full hover:border-accent/40 transition-all duration-300 group">
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {post.author ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
                          <img className="w-11 h-11 rounded-4xl" src={post.author.avatar}/>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-text-primary font-medium text-sm">
                              @{post.author.userName}
                            </span>
                            {post.author.isVerifiedBadge && (
                              <span className="text-accent text-xs">✓</span>
                            )}
                          </div>
                          <span className="text-text-secondary text-xs">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center">
                          <span className="text-text-secondary text-lg">🕶️</span>
                        </div>
                        <div>
                          <span className="text-text-secondary font-medium text-sm">Anonymous</span>
                          <span className="text-text-secondary text-xs block">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Post Content */}
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Heart size={16} className="group-hover:text-accent transition-colors" />
                      <span className="text-sm">{post.likes.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle size={16} className="group-hover:text-accent transition-colors" />
                      <span className="text-sm">{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All (visible only on mobile) */}
        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/explore" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
          >
            Browse all posts <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;