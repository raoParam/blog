const tabs = [
  { id: "for-you", label: "For You" },
  { id: "trending", label: "Trending" },
  { id: "following", label: "Following" },
];

const FeedTabs = ({ activeTab, onChange }) => {
  return (
    <div className="border-b border-[var(--border-card)] w-full">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "text-[var(--text-heading)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--color-accent)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FeedTabs;
