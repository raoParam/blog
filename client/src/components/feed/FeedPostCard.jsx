import { Link } from "react-router-dom";
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
  const isAnonymous = !post.author;
  const authorName = !isAnonymous && post.author.userName ? post.author.userName : "Anonymous";
  const authorAvatar = !isAnonymous && post.author.avatar ? post.author.avatar.trim() : "";
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

  return (
    <Link to={`/blog/${post._id}`} className="block">
      <article className="rounded-2xl border border-[#0E1118] bg-[#03040A] p-4 transition hover:border-[#5CA6FF]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm text-[#BBC8DD]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1A1F2C] bg-[#04050C] text-[#E9EFF9]">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={authorName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <CircleUserRound size={16} />
                )}
              </span>
              <span className="font-semibold text-[#D9E1F2]">@{authorName}</span>
              {!isAnonymous && post.author.isVerifiedBadge && (
                <ShieldCheck size={14} className="text-[#5CA6FF]" />
              )}
              <span className="text-[#8A93A6]">·</span>
              <span className="text-[#8A93A6]">{formatRelativeTime(post.createdAt)}</span>
            </div>

            <h2 className="mt-2 text-lg font-semibold text-[#F7FAFF] line-clamp-2">{post.title}</h2>
            {previewText && (
              <p className="mt-1 text-sm leading-6 text-[#A7B0C1] line-clamp-2">{previewText}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#C4CCD9]">
              <span className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5">
                <Heart size={14} className={post.isLikedByCurrentUser ? "text-[#FF8EA4]" : "text-[#C4CCD9]"} />
                {post.likesCount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[#C4CCD9]">
                <MessageCircle size={14} />
                {post.commentsCount || 0}
              </span>
            </div>
          </div>

          {Array.isArray(post.images) && post.images.length > 0 && (
            <div className="h-24 w-full overflow-hidden rounded-xl border border-[#1A1F2C] bg-[#04050C] sm:w-32">
              <img src={post.images[0]} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleBookmark}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
              post.isSaved ? "border-[#5CA6FF] text-[#5CA6FF]" : "border-[#3F4D67] text-[#9DB0C6]"
            }`}
            aria-label={post.isSaved ? "Remove save" : "Save post"}
          >
            <Bookmark size={16} className="pointer-events-none" />
          </button>
        </div>
      </article>
    </Link>
  );
};

export default FeedPostCard;
