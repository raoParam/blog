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
      <article className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 sm:p-5 transition hover:border-[var(--border-focus)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-input)] bg-[var(--bg-surface-elevated)] text-[var(--text-heading)] overflow-hidden">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={safeAuthorName} className="h-full w-full object-cover" />
                ) : (
                  <CircleUserRound size={15} />
                )}
              </span>
              <button
                type="button"
                onClick={handleAuthorClick}
                disabled={isAnonymous}
                className={`max-w-[180px] truncate font-medium ${isAnonymous ? "text-[var(--text-secondary)]" : "text-[var(--text-heading)] hover:text-[var(--color-accent)] transition"}`}
                title={`@${safeAuthorName}`}
              >
                @{safeAuthorName}
              </button>
              {isAuthorVerified && <ShieldCheck size={13} className="text-[var(--color-accent)]" />}
              {relativeTime && (
                <>
                  <span className="text-[var(--text-muted)]">&bull;</span>
                  <span className="text-[var(--text-muted)]">{relativeTime}</span>
                </>
              )}
            </div>

            <h2 className="mt-2 text-base sm:text-lg font-semibold text-[var(--text-heading)] line-clamp-2 leading-snug">
              {post.title}
            </h2>
            {previewText && (
              <p className="mt-1 text-sm leading-6 text-[var(--text-body)] line-clamp-2">
                {previewText}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1">
                <Heart size={14} className={post.isLikedByCurrentUser ? "text-[var(--danger-text)] fill-current" : "text-[var(--text-muted)]"} />
                {post.likesCount}
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                <MessageCircle size={14} />
                {post.commentsCount || 0}
              </span>
            </div>
          </div>

          {Array.isArray(post.images) && post.images.length > 0 && (
            <div className="h-24 w-full overflow-hidden rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-elevated)] sm:w-32 shrink-0">
              <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleBookmark}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
              post.isSaved
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--border-input)] text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:text-[var(--text-heading)]"
            }`}
            aria-label={post.isSaved ? "Remove save" : "Save post"}
          >
            <Bookmark size={15} className={`pointer-events-none ${post.isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default FeedPostCard;
