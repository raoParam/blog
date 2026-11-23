import {
  House,
  PenSquare,
  Hash,
  User,
  ChevronRight,
  ChevronDown,
  Copyright,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const HomeSidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onClearCategory,
  onCloseMenu,
  onHomeClick,
  onWriteClick,
  selectedMenuItem = "",
  hideCategories = false,
  className = "",
}) => {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <aside
      className={`flex h-[calc(100vh-4rem)] min-h-0 w-64 flex-col overflow-hidden border-r border-[var(--border-card)] bg-[var(--bg-surface)] p-4 transition-colors duration-200 ${className}`}
    >
      <div className="mb-5 space-y-2">
        <button
          type="button"
          onClick={() => {
            onClearCategory();
            onHomeClick?.();
            onCloseMenu?.();
          }}
          className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "home"
              ? "border-[var(--color-accent)] bg-[var(--bg-surface-hover)] text-[var(--text-heading)] font-semibold"
              : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-heading)]"
          }`}
          title="Home"
        >
          <House size={16} />
          Home
        </button>

        <button
          type="button"
          onClick={() => {
            onWriteClick?.();
            onCloseMenu?.();
          }}
          className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "write"
              ? "border-[var(--color-accent)] bg-[var(--bg-surface-hover)] text-[var(--text-heading)] font-semibold"
              : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-heading)]"
          }`}
          title="Write"
        >
          <PenSquare size={16} />
          Write
        </button>

        <Link
          to="/profile"
          onClick={onCloseMenu}
          className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "profile"
              ? "border-[var(--color-accent)] bg-[var(--bg-surface-hover)] text-[var(--text-heading)] font-semibold"
              : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-heading)]"
          }`}
          title="Profile"
        >
          <User size={16} />
          Profile
        </Link>
      </div>

      {!hideCategories && (
        <div className="mt-5 border-t border-[var(--divider)] pt-4">
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className="mb-2 flex w-full items-center justify-between rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] px-3 py-2 text-sm font-medium text-[var(--text-heading)] transition hover:border-[var(--border-focus)]"
          >
            <span className="flex items-center gap-2">
              <Hash size={16} />
              Categories
            </span>
            {showCategories ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showCategories && (
            <div className="space-y-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface-elevated)] p-2">
              {categories.map((category) => {
                const isActive = selectedCategory === category.name;
                return (
                  <button
                    key={category._id || category.name}
                    type="button"
                    onClick={() => {
                      onSelectCategory(category.name);
                      onCloseMenu?.();
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium uppercase transition ${
                      isActive
                        ? "border-[var(--color-accent)] bg-[var(--bg-surface-hover)] text-[var(--text-heading)] font-semibold"
                        : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-input)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-heading)]"
                    }`}
                    title={category.name}
                  >
                    {category.name}
                  </button>
                );
              })}

              {categories.length === 0 && (
                <p className="px-1 py-1 text-sm text-[var(--text-muted)]">No categories found.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto border-t border-[var(--divider)] pt-4">
        <p className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Copyright size={12} />
          <span>2026 Flagger</span>
        </p>
      </div>
    </aside>
  );
};

export default HomeSidebar;
