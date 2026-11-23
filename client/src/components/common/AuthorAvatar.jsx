import React, { useState } from "react";
import { ShieldCheck, EyeOff, User } from "lucide-react";

/**
 * Robust AuthorAvatar component with fallback support:
 * - If image fails to load (404/broken), smoothly falls back to initials
 * - If author is null/undefined, displays an Anonymous developer badge
 * - Displays verified writer badge when applicable
 */
const AuthorAvatar = ({ author, size = "md", showVerified = true, isAnonymous = false }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const getInitials = (user) => {
    if (!user) return "A";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.userName) return user.userName.slice(0, 2).toUpperCase();
    return "U";
  };

  const isVerified = Boolean(author?.isVerified || author?.isVerifiedBadge);
  const anonymous = isAnonymous || !author;

  if (anonymous) {
    return (
      <div className="relative inline-flex items-center">
        <div
          className={`${sizeClasses[size] || sizeClasses.md} rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-input)] flex items-center justify-center text-[var(--color-accent)] shadow-sm`}
          title="Anonymous Contributor"
        >
          <EyeOff size={iconSizes[size] || 16} />
        </div>
      </div>
    );
  }

  const hasAvatar = author?.avatar && !imageError;

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-lg bg-[var(--bg-surface-input)] border border-[var(--border-card)] flex items-center justify-center font-mono font-medium text-[var(--text-heading)] overflow-hidden shrink-0 select-none shadow-sm`}
      >
        {hasAvatar ? (
          <img
            src={author.avatar}
            alt={author.userName || "Author avatar"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <span>{getInitials(author)}</span>
        )}
      </div>

      {showVerified && isVerified && (
        <span
          className="absolute -bottom-1 -right-1 bg-[var(--bg-surface)] text-[var(--color-accent)] rounded-full p-0.5 shadow-sm border border-[var(--border-card)]"
          title="Verified Writer"
        >
          <ShieldCheck size={12} className="stroke-[2.5]" />
        </span>
      )}
    </div>
  );
};

export default AuthorAvatar;
