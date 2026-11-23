import { useEffect, useRef, useState } from "react";
import { LogOut, Search, ChevronDown, Menu, User, PenSquare, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "../common/BrandMark";
import ThemeToggle from "../common/ThemeToggle";

const HomeNavbar = ({ user, onLogout, onToggleMobileMenu, onWrite }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const avatar = user?.avatar?.trim();
  const fallbackInitial = user?.firstName?.trim()?.charAt(0)?.toUpperCase() || "U";
  const displayName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const displayUserName = user?.userName ? `@${user.userName}` : "@user";
  const isVerifiedUser = Boolean(user?.isVerified || user?.isVerifiedBadge);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-card)] bg-[var(--navbar-bg)] backdrop-blur transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-[1366px] items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-input)] bg-[var(--bg-surface-input)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition"
          aria-label="Toggle menu"
        >
          <Menu size={15} />
        </button>

        <Link to="/home" className="flex items-center gap-2">
          <BrandMark size="sm" />
          <span className="text-lg font-semibold tracking-wide text-[var(--text-heading)]">Flagger</span>
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="relative mx-auto max-w-[450px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search articles, authors..."
              className="w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] py-2 pl-9 pr-4 text-sm text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition"
            />
          </div>
        </div>

        <div className="relative ml-auto flex items-center gap-2.5" ref={profileRef}>
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <button
            type="button"
            onClick={onWrite}
            className="hidden items-center gap-1.5 rounded-xl bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:bg-[var(--btn-primary-hover)] sm:inline-flex"
          >
            <PenSquare size={15} />
            Write
          </button>

          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="inline-flex items-center gap-1"
            aria-label="Open profile menu"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--border-input)] bg-[var(--bg-surface-elevated)] text-[var(--text-heading)] hover:border-[var(--border-focus)] transition">
              {avatar ? (
                <img src={avatar} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{fallbackInitial}</span>
              )}
            </span>
            <span className="hidden items-center text-[var(--text-secondary)] sm:inline-flex">
              <ChevronDown size={14} />
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface-elevated)] p-2 shadow-[var(--shadow-dropdown)] transition-colors">
              <div className="border-b border-[var(--border-card)] px-2 py-2">
                <p className="text-base font-semibold text-[var(--text-heading)]">{displayName}</p>
                <p className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <span>{displayUserName}</span>
                  {isVerifiedUser && <ShieldCheck size={13} className="text-[var(--color-accent)]" />}
                </p>
              </div>
              <Link
                to="/profile"
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-body)] hover:bg-[var(--bg-surface-hover)] transition"
                onClick={() => setProfileOpen(false)}
              >
                <User size={14} />
                My Profile
              </Link>
              <div className="my-1 border-t border-[var(--border-card)]" />
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--danger-text)] hover:bg-[var(--danger-bg)] transition"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
