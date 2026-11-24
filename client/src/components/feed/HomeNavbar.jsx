import { useEffect, useRef, useState } from "react";
import { LogOut, Search, ChevronDown, Menu, User, PenSquare, ShieldCheck, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import BrandMark from "../common/BrandMark";

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
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1366px] items-center gap-3 px-4 sm:px-6">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-body transition hover:bg-surface-2 hover:text-text-primary"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
        )}

        <Link to="/home" className="flex items-center gap-2" aria-label="Flagger home">
          <BrandMark size="sm" />
          <span className="font-serif text-xl font-bold tracking-tight text-text-primary">Flagger</span>
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="relative mx-auto max-w-[450px]">
            <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              aria-label="Search articles and authors"
              placeholder="Search articles, authors..."
              className="w-full rounded-lg border border-border-subtle bg-surface-1 py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted transition focus:border-border-strong focus:outline-none"
            />
          </div>
        </div>

        <div className="relative ml-auto flex items-center gap-3" ref={profileRef}>
          <button
            type="button"
            onClick={onWrite}
            className="hidden items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover sm:inline-flex"
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
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2 text-text-primary transition hover:border-border-strong">
              {avatar ? (
                <img src={avatar} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{fallbackInitial}</span>
              )}
            </span>
            <span className="hidden items-center text-text-secondary sm:inline-flex">
              <ChevronDown size={14} />
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-surface-1 p-2 shadow-pop">
              <div className="border-b border-border px-2 py-2">
                <p className="truncate text-base font-semibold text-text-primary">{displayName}</p>
                <p className="flex items-center gap-1 text-sm text-text-secondary">
                  <span>{displayUserName}</span>
                  {isVerifiedUser && <ShieldCheck size={13} className="text-accent" />}
                </p>
              </div>
              <Link
                to="/profile"
                className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-body hover:bg-surface-2 transition"
                onClick={() => setProfileOpen(false)}
              >
                <User size={14} />
                My Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-body hover:bg-surface-2 transition"
                onClick={() => setProfileOpen(false)}
              >
                <Settings size={14} />
                Settings
              </Link>
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-body hover:bg-surface-2 transition"
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
