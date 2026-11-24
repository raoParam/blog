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

  const hasImage = Array.isArray(post.images) && post.images.length > 0;

  return (
    <Link to={`/blog/${post._id}`} className="group block">
      <article className="border-b border-border-subtle py-7">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-text-secondary">
            {authorAvatar ? (
              <img src={authorAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <CircleUserRound size={14} aria-hidden="true" />
            )}
          </span>
          <button
            type="button"
            onClick={handleAuthorClick}
            disabled={isAnonymous}
            className={`max-w-[200px] truncate font-medium text-text-primary ${isAnonymous ? "" : "hover:underline hover:decoration-accent hover:underline-offset-4"}`}
            title={`@${safeAuthorName}`}
          >
            @{safeAuthorName}
          </button>
          {isAuthorVerified && (
            <ShieldCheck size={14} className="shrink-0 text-accent" aria-label="Verified writer" />
          )}
          {relativeTime && (
            <>
              <span className="text-text-muted" aria-hidden="true">·</span>
              <span className="text-text-secondary">{relativeTime}</span>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-semibold leading-snug tracking-tight text-text-primary line-clamp-2 sm:text-[1.4rem]">
              {post.title}
            </h2>
            {previewText && (
              <p className="mt-2 font-serif text-base leading-relaxed text-text-secondary line-clamp-2">
                {previewText}
              </p>
            )}
          </div>

          {hasImage && (
            <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-1 sm:h-28 sm:w-40">
              <img src={post.images[0]} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-5 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Heart
                size={16}
                aria-hidden="true"
                className={post.isLikedByCurrentUser ? "fill-current text-danger" : ""}
              />
              <span className="sr-only">Likes:</span>
              {post.likesCount || 0}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={16} aria-hidden="true" />
              <span className="sr-only">Comments:</span>
              {post.commentsCount || 0}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-surface-2 ${
              post.isSaved ? "text-accent" : "text-text-secondary hover:text-text-primary"
            }`}
            aria-label={post.isSaved ? "Remove save" : "Save post"}
          >
            <Bookmark size={17} className={`pointer-events-none ${post.isSaved ? "fill-current" : ""}`} />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default FeedPostCard;
