import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";

const PublicPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get initial for avatar fallback
  const getInitial = (author) => {
    if (!author) return "?";
    if (author.firstName) return author.firstName[0].toUpperCase();
    if (author.userName) return author.userName[0].toUpperCase();
    return "U";
  };

  // Handle card click - redirect to login
  const handleCardClick = () => {
    window.location.href = "/login";
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-full bg-[#0E0F14] border border-[#26292E] rounded-2xl p-6 transition-all duration-300 hover:border-[#3b6ff0] hover:shadow-xl group">
        
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          {post.author ? (
            <>
              <div className="w-10 h-10 rounded-full bg-[#1A1D24] flex items-center justify-center text-sm text-[#E8E9EA] overflow-hidden">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-medium">{getInitial(post.author)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E8E9EA] font-medium text-sm">
                    @{post.author.userName}
                  </span>
                  {post.author.isVerifiedBadge && (
                    <span className="text-[#3b6ff0] text-xs">✓</span>
                  )}
                </div>
                <span className="text-[#8B8F96] text-xs">
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-[#1A1D24] flex items-center justify-center text-lg">
                🕶️
              </div>
              <div>
                <span className="text-[#E8E9EA] text-sm">Anonymous</span>
                <div className="text-[#8B8F96] text-xs">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-[#E8E9EA] mb-3 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[#8B8F96] text-sm mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Engagement Stats - Always visible */}
        <div className="flex items-center gap-4 text-[#8B8F96] mt-2">
          <div className="flex items-center gap-1.5">
            <Heart size={16} className="text-[#8B8F96]" />
            <span className="text-xs">
              {Array.isArray(post.likes) ? post.likes.length : post.likes || 0}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle size={16} className="text-[#8B8F96]" />
            <span className="text-xs">{post.commentsCount || 0}</span>
          </div>
        </div>

        {/* Subtle indicator that card is clickable */}
        <div className="mt-4 text-[#8B8F96] text-xs opacity-0 group-hover:opacity-100 transition">
          Click to read →
        </div>
      </div>
    </motion.div>
  );
};

export default PublicPostCard;