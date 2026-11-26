/** Underline tabs; `tabs` is a list of ids like "posts", "saved", "about". */
const ProfileTabs = ({ tabs, active, onChange }) => {
  return (
    <div className="border-b border-border-subtle">
      <div className="flex gap-6 overflow-x-auto" role="tablist" aria-label="Profile sections">
        {tabs.map((tab) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={`relative whitespace-nowrap py-3.5 text-sm font-medium transition ${
                isActive ? "text-text-primary" : "text-text-muted hover:text-text-body"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
