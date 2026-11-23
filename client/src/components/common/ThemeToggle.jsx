import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "", showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] p-2 text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--border-focus)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-heading)] ${className}`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        {isDark ? (
          <Sun size={17} className="text-amber-300 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon size={17} className="text-[var(--color-accent)] transition-transform duration-300 hover:-rotate-12" />
        )}
      </span>

      {showLabel && (
        <span className="text-xs font-medium text-[var(--text-body)]">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
