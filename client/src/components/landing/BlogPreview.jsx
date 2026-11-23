import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Heart, MessageCircle, ArrowRight, ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { publicService } from "../../services/public.service";
import AuthorAvatar from "../common/AuthorAvatar";

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
        setError("Could not load recent dispatches");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Curated fallback posts matching the developer publication tone
  const fallbackPosts = [
    {
      _id: "1",
      title: "Understanding React Server Components in Large-Scale Workloads",
      excerpt: "An architectural review of streaming SSR, serialization boundaries, and when client state should remain local.",
      author: {
        userName: "rahul_kumar",
        firstName: "Rahul",
        lastName: "Kumar",
        isVerifiedBadge: true,
        avatar: "", // Test empty avatar fallback
      },
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      likes: 42,
      commentsCount: 8,
      category: "Frontend Architecture",
    },
    {
      _id: "2",
      title: "Post-Mortem: Why We Left Big Tech to Build Open Infrastructure",
      excerpt: "On navigating promotion-driven development, gold-plating architectures, and rediscovering the joy of simple systems.",
      author: null, // anonymous developer
      createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
      likes: 156,
      commentsCount: 34,
      category: "Career & Culture",
    },
    {
      _id: "3",
      title: "Hard-Won Lessons Migrating 100M Rows to Distributed Postgres",
      excerpt: "Zero-downtime schema evolution, connection pooling bottlenecks, and how prepared statements almost caused an outage.",
      author: {
        userName: "priya_sharma",
        firstName: "Priya",
        lastName: "Sharma",
        isVerifiedBadge: true,
        avatar: "https://invalid-avatar-url-test.example.com/broken.jpg", // Test broken avatar fallback
      },
      createdAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
      likes: 89,
      commentsCount: 19,
      category: "Databases & Storage",
    },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateReadTime = (text) => {
    if (!text) return "4 min read";
    const words = text.split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 40));
    return `${minutes} min read`;
  };

  return (
    <section className="relative py-20 lg:py-24 border-b border-[var(--divider)]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[var(--divider)]">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              <BookOpen size={13} />
              <span>Section 03 // Dispatches From The Field</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-heading)] tracking-tight">
              Latest from the Community
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 max-w-xl">
              Unvarnished technical essays, architectural retrospectives, and anonymous developer memos.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-accent)] hover:underline whitespace-nowrap self-start md:self-auto"
          >
            <span>View All Public Dispatches</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface-hover)]" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-3 bg-[var(--bg-surface-hover)] rounded" />
                    <div className="w-16 h-2.5 bg-[var(--bg-surface-hover)] rounded" />
                  </div>
                </div>
                <div className="w-full h-5 bg-[var(--bg-surface-hover)] rounded mb-3" />
                <div className="w-3/4 h-5 bg-[var(--bg-surface-hover)] rounded mb-4" />
                <div className="w-full h-12 bg-[var(--bg-surface-hover)] rounded" />
              </div>
            ))}
          </div>
        ) : error && posts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-12 text-center text-[var(--text-secondary)] text-sm">
            <p>{error}</p>
          </div>
        ) : (
          /* Editorial Dispatches Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.slice(0, 3).map((post, index) => {
              const readTime = calculateReadTime(post.excerpt || post.title);
              const likesCount = Array.isArray(post.likes) ? post.likes.length : post.likes || 0;
              const commentsCount = post.commentsCount || 0;
              const isAnonymous = !post.author;
              const authorName = isAnonymous
                ? "Anonymous Contributor"
                : post.author?.firstName && post.author?.lastName
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.author?.userName
                ? `@${post.author.userName}`
                : "Developer";

              return (
                <Motion.div
                  key={post._id || index}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <Link
                    to={`/post/${post._id}`}
                    className="group flex flex-col justify-between h-full rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 lg:p-7 transition-all duration-200 hover:border-[var(--border-focus)] hover:shadow-md"
                  >
                    <div>
                      {/* Top Metadata Strip */}
                      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-5 pb-3 border-b border-[var(--divider)]">
                        <span className="uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                          {post.category || `Dispatch #0${index + 1}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{readTime}</span>
                        </div>
                      </div>

                      {/* Author Byline with Fallback Avatar */}
                      <div className="flex items-center gap-3 mb-4">
                        <AuthorAvatar author={post.author} size="md" />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-heading)] truncate">
                            <span className="truncate">{authorName}</span>
                          </div>

                          <div className="text-xs font-mono text-[var(--text-muted)]">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Post Title */}
                      <h3 className="text-lg lg:text-xl font-bold text-[var(--text-heading)] mb-3 leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                        {post.title}
                      </h3>

                      {/* Post Excerpt */}
                      {post.excerpt && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Engagement & Read Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)] text-xs font-mono text-[var(--text-muted)]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 hover:text-[var(--text-heading)] transition-colors">
                          <Heart size={14} className="text-[var(--text-muted)]" />
                          <span>{likesCount}</span>
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-[var(--text-heading)] transition-colors">
                          <MessageCircle size={14} className="text-[var(--text-muted)]" />
                          <span>{commentsCount}</span>
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[var(--color-accent)] font-sans font-medium group-hover:underline">
                        Read dispatch
                        <ArrowUpRight size={14} />
                      </span>
                    </div>

                  </Link>
                </Motion.div>
              );
            })}
          </div>
        )}

        {/* Mobile View All CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-heading)] hover:bg-[var(--bg-surface-hover)] transition-all"
          >
            <span>Browse All 300+ Dispatches</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BlogPreview;
