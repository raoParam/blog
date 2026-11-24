const FeedSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-border bg-surface p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-surface-2" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-surface-2" />
              <div className="h-2.5 w-16 rounded bg-surface-2" />
            </div>
          </div>
          <div className="mb-3 h-5 w-3/4 rounded bg-surface-2" />
          <div className="mb-2 h-3.5 w-full rounded bg-surface-2" />
          <div className="mb-4 h-3.5 w-5/6 rounded bg-surface-2" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-lg bg-surface-2" />
            <div className="h-8 w-16 rounded-lg bg-surface-2" />
            <div className="h-8 w-16 rounded-lg bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;

