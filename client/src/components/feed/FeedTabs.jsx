const tabs = [
  { id: "for-you", label: "For You" },
  { id: "trending", label: "Trending" },
  { id: "following", label: "Following" },
];

const FeedTabs = ({ activeTab, onChange }) => {
  return (
    <div className="w-full border-b border-border-subtle">
      <div className="flex gap-6 overflow-x-auto" role="tablist" aria-label="Feed">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`relative whitespace-nowrap py-3.5 text-sm font-medium transition ${
                isActive
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-body"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FeedTabs;
