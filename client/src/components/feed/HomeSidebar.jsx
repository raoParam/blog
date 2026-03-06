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
      className={`h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-[#D0D9E5]/20 bg-[#0B0E13] p-4 font-['Arial'] ${className}`}
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
              ? "border-[#5CA6FF] bg-[#101524] text-[#EEF3FA]"
              : "border-transparent text-[#D8DEE8] hover:bg-[#101927]"
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
              ? "border-[#5CA6FF] bg-[#101524] text-[#EEF3FA]"
              : "border-transparent text-[#D8DEE8] hover:bg-[#101927]"
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
              ? "border-[#5CA6FF] bg-[#101524] text-[#EEF3FA]"
              : "border-transparent text-[#D8DEE8] hover:bg-[#101927]"
          }`}
          title="Profile"
        >
          <User size={16} />
          Profile
        </Link>
      </div>

      {!hideCategories && (
        <div className="mt-5 border-t border-[#CCD6E4]/20 pt-4">
          <button
            type="button"
            onClick={() => setShowCategories((prev) => !prev)}
            className="mb-2 flex w-full items-center justify-between rounded-xl border border-[#D4DCE7]/20 bg-gradient-to-r from-[#141C2C] via-[#101722] to-[#0E131D] px-3 py-2 text-sm font-medium text-[#E8EEF9] transition hover:border-[#6D94E2]"
          >
            <span className="flex items-center gap-2">
              <Hash size={16} />
              Categories
            </span>
            {showCategories ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {showCategories && (
            <div className="space-y-2 rounded-xl border border-[#D2DBE6]/20 bg-[#0F141E] p-2">
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
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "border-[#6A90DA] bg-[#162238] text-[#F0F5FF] shadow-[0_0_0_1px_rgba(102,150,231,0.15)]"
                        : "border-transparent text-[#BBC5D3] hover:border-[#CFD8E4]/25 hover:bg-[#141C2A] hover:text-[#E2E8F3]"
                    }`}
                    title={category.name}
                  >
                    {category.name}
                  </button>
                );
              })}

              {categories.length === 0 && (
                <p className="px-1 text-sm text-[#8E9DAF]">No categories found.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 border-t border-[#CCD6E4]/20 pt-6">
        <p className="inline-flex items-center gap-1 text-xs text-[#98A6BA]">
          <Copyright size={12} />
          <span>2026 Flagger</span>
        </p>
      </div>
    </aside>
  );
};

export default HomeSidebar;
