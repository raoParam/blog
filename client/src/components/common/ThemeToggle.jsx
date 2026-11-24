import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const OPTIONS = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/** Segmented System / Light / Dark control. */
const ThemeToggle = ({ className = "" }) => {
  const { preference, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex rounded-xl border border-border bg-surface-1 p-1 ${className}`}
    >
      {OPTIONS.map((opt) => {
        const active = preference === opt.value;
        const Icon = opt.Icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              active
                ? "bg-surface-3 text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
