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
      className={`flex h-[calc(100vh-4rem)] min-h-0 w-64 flex-col overflow-hidden border-r border-border-subtle bg-background px-3 py-5 ${className}`}
    >
      <nav aria-label="Primary" className="mb-5 space-y-1">
        <button
          type="button"
          onClick={() => {
            onClearCategory();
            onHomeClick?.();
            onCloseMenu?.();
          }}
          className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "home"
              ? "bg-surface-2 text-text-primary"
              : "text-text-secondary hover:bg-surface-1 hover:text-text-primary"
          }`}
          title="Home"
        >
          {selectedMenuItem === "home" && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />}
          <House size={17} />
          Home
        </button>

        <button
          type="button"
          onClick={() => {
            onWriteClick?.();
            onCloseMenu?.();
          }}
          className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "write"
              ? "bg-surface-2 text-text-primary"
              : "text-text-secondary hover:bg-surface-1 hover:text-text-primary"
          }`}
          title="Write"
        >
          {selectedMenuItem === "write" && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />}
          <PenSquare size={17} />
          Write
        </button>

        <Link
          to="/profile"
          onClick={onCloseMenu}
          className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "profile"
              ? "bg-surface-2 text-text-primary"
              : "text-text-secondary hover:bg-surface-1 hover:text-text-primary"
          }`}
          title="Profile"
        >
          {selectedMenuItem === "profile" && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />}
          <User size={17} />
          Profile
        </Link>
      </nav>

      {!hideCategories && (
        <div className="mt-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            aria-expanded={showCategories}
            className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition hover:bg-surface-1 hover:text-text-primary"
          >
            <span className="flex items-center gap-2">
              <Hash size={14} aria-hidden="true" />
              Categories
            </span>
            {showCategories ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showCategories && (
            <div className="min-h-0 max-h-[40vh] space-y-0.5 overflow-y-auto">
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
                    aria-pressed={isActive}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "bg-surface-2 font-semibold text-text-primary"
                        : "text-text-secondary hover:bg-surface-1 hover:text-text-primary"
                    }`}
                    title={category.name}
                  >
                    {category.name}
                  </button>
                );
              })}

              {categories.length === 0 && (
                <p className="px-1 text-sm text-text-secondary">No categories found.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto border-t border-border-subtle px-3 pt-5">
        <p className="inline-flex items-center gap-1 text-xs text-text-muted">
          <Copyright size={12} />
          <span>2026 Flagger</span>
        </p>
      </div>
    </aside>
  );
};

export default HomeSidebar;
