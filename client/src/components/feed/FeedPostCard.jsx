import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, ShieldCheck, CircleUserRound } from "lucide-react";

const formatRelativeTime = (dateString) => {
  const createdAt = new Date(dateString).getTime();
  if (Number.isNaN(createdAt)) return "";
  const diffMs = Date.now() - createdAt;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const FeedPostCard = ({ post, onBookmarkClick }) => {
  const navigate = useNavigate();
  const isAnonymous = !post.author;
  const authorName = !isAnonymous && post.author.userName ? post.author.userName : "Anonymous";
  const safeAuthorName = String(authorName || "Anonymous").trim() || "Anonymous";
  const relativeTime = formatRelativeTime(post.createdAt);
  const authorAvatar = !isAnonymous && post.author.avatar ? post.author.avatar.trim() : "";
  const isAuthorVerified = !isAnonymous && Boolean(post.author?.isVerified || post.author?.isVerifiedBadge);
  const previewText =
    post.excerpt?.trim() ||
    post.summary?.trim() ||
    (post.content?.trim() ? `${post.content.trim().slice(0, 150)}...` : "");

  const handleBookmark = (event) => {
    if (!onBookmarkClick) return;
    event.preventDefault();
    event.stopPropagation();
    onBookmarkClick(post);
  };

  const handleAuthorClick = (event) => {
    if (isAnonymous || !safeAuthorName) return;
    event.preventDefault();
    event.stopPropagation();
    navigate(`/profile/${safeAuthorName}`);
  };

  return (
    <Link to={`/blog/${post._id}`} className="block">
      <article className="rounded-2xl border border-border-subtle bg-background p-4 transition hover:border-accent">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm text-text-body">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-background text-text-primary">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={safeAuthorName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <CircleUserRound size={16} />
                )}
              </span>
              <button
                type="button"
                onClick={handleAuthorClick}
                disabled={isAnonymous}
                className={`max-w-[180px] truncate font-semibold ${isAnonymous ? "text-text-primary" : "text-text-primary hover:text-accent-hover"}`}
                title={`@${safeAuthorName}`}
              >
                @{safeAuthorName}
              </button>
              {isAuthorVerified && <ShieldCheck size={14} className="text-accent" />}
              {relativeTime && (
                <>
                  <span className="text-text-secondary">.</span>
                  <span className="text-text-secondary">{relativeTime}</span>
                </>
              )}
            </div>

            <h2 className="mt-2 text-lg font-semibold text-text-primary line-clamp-2">{post.title}</h2>
            {previewText && <p className="mt-1 text-sm leading-6 text-text-secondary line-clamp-2">{previewText}</p>}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-body">
              <span className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5">
                <Heart size={14} className={post.isLikedByCurrentUser ? "text-danger" : "text-text-body"} />
                {post.likesCount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-text-body">
                <MessageCircle size={14} />
                {post.commentsCount || 0}
              </span>
            </div>
          </div>

          {Array.isArray(post.images) && post.images.length > 0 && (
            <div className="h-24 w-full overflow-hidden rounded-xl border border-border-subtle bg-background sm:w-32">
              <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleBookmark}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
              post.isSaved ? "border-accent text-accent" : "border-border-strong text-text-secondary"
            }`}
            aria-label={post.isSaved ? "Remove save" : "Save post"}
          >
            <Bookmark size={16} className={`pointer-events-none ${post.isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default FeedPostCard;
