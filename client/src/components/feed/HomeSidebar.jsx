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
      className={`flex h-[calc(100vh-4rem)] min-h-0 w-64 flex-col overflow-hidden border-r border-border bg-background p-4 ${className}`}
    >
      <div className="mb-5 space-y-2">
        <button
          type="button"
          onClick={() => {
            onClearCategory();
            onHomeClick?.();
            onCloseMenu?.();
          }}
          className={`flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "home"
              ? "border-accent bg-surface text-text-primary"
              : "border-transparent text-text-primary hover:bg-surface-2"
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
          className={`flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[15px] font-medium transition ${
            selectedMenuItem === "write"
              ? "border-accent bg-surface text-text-primary"
              : "border-transparent text-text-primary hover:bg-surface-2"
          }`}
          title="Write"
        >
          <PenSquare size={16} />
          Write
        </button>

        <Link
          to="/profile"
          onClick={onCloseMenu}
          className={`flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[15px] transition ${
            selectedMenuItem === "profile"
              ? "border-accent bg-surface text-text-primary"
              : "border-transparent text-text-primary hover:bg-surface-2"
          }`}
          title="Profile"
        >
          <User size={16} />
          Profile
        </Link>
      </div>

      {!hideCategories && (
        <div className="mt-5 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className="mb-2 flex w-full items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-text-primary transition hover:border-accent"
          >
            <span className="flex items-center gap-2">
              <Hash size={16} />
              Categories
            </span>
            {showCategories ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showCategories && (
            <div className="space-y-2 rounded-xl border border-border bg-surface p-2">
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
                        ? "border-accent bg-surface-2 text-text-primary ring-1 ring-accent/15"
                        : "border-transparent text-text-body hover:border-border hover:bg-surface-2 hover:text-text-primary"
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

      <div className="mt-8 border-t border-border pt-6">
        <p className="inline-flex items-center gap-1 text-xs text-text-secondary">
          <Copyright size={12} />
          <span>2026 Flagger</span>
        </p>
      </div>
    </aside>
  );
};

export default HomeSidebar;
