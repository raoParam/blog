import React from "react";
import { Heart, MessageCircle, ShieldCheck } from "lucide-react";

const PublicPostCard = ({ post }) => {
  const isAuthorVerified = Boolean(post.author?.isVerified || post.author?.isVerifiedBadge);

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

  const getInitial = (author) => {
    if (!author) return "?";
    if (author.firstName) return author.firstName[0].toUpperCase();
    if (author.userName) return author.userName[0].toUpperCase();
    return "U";
  };

  const handleCardClick = () => {
    window.location.href = "/login";
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  const authorLabel = post.author ? `@${post.author.userName}` : "Anonymous";

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`${post.title} by ${authorLabel}. Sign in to read.`}
      className="group cursor-pointer border-b border-border-subtle py-7 outline-none focus-visible:bg-surface-1"
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-[11px] font-semibold text-text-secondary">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            getInitial(post.author)
          )}
        </span>
        <span className="font-medium text-text-primary">{authorLabel}</span>
        {isAuthorVerified && (
          <ShieldCheck size={14} className="shrink-0 text-accent" aria-label="Verified writer" />
        )}
        <span className="text-text-muted" aria-hidden="true">·</span>
        <span className="text-text-secondary">{formatDate(post.createdAt)}</span>
      </div>

      <h2 className="mt-3 font-serif text-xl font-semibold leading-snug tracking-tight text-text-primary line-clamp-2 group-hover:underline group-hover:decoration-accent group-hover:decoration-2 group-hover:underline-offset-4 sm:text-[1.4rem]">
        {post.title}
      </h2>

      {post.excerpt && (
        <p className="mt-2 font-serif text-base leading-relaxed text-text-secondary line-clamp-2">
          {post.excerpt}
        </p>
      )}

      <div className="mt-5 flex items-center gap-5 text-sm text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Heart size={16} aria-hidden="true" />
          <span className="sr-only">Likes:</span>
          {Array.isArray(post.likes) ? post.likes.length : post.likes || 0}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle size={16} aria-hidden="true" />
          <span className="sr-only">Comments:</span>
          {post.commentsCount || 0}
        </span>
      </div>
    </article>
  );
};

export default PublicPostCard;
