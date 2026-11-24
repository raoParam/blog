const tabs = [
  { id: "for-you", label: "For You" },
  { id: "trending", label: "Trending" },
  { id: "following", label: "Following" },
];

const FeedTabs = ({ activeTab, onChange }) => {
  return (
    <div className="border-b border-border">
      <div className="flex gap-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative px-4 py-3 text-base font-medium transition ${
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
