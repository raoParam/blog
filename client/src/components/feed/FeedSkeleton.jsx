const FeedSkeleton = () => {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse border-b border-border-subtle py-7">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-surface-2" />
            <div className="h-3 w-24 rounded bg-surface-2" />
            <div className="h-3 w-10 rounded bg-surface-2" />
          </div>
          <div className="mt-4 h-6 w-3/4 rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full rounded bg-surface-2" />
          <div className="mt-2 h-4 w-5/6 rounded bg-surface-2" />
          <div className="mt-5 flex gap-5">
            <div className="h-4 w-10 rounded bg-surface-2" />
            <div className="h-4 w-10 rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedSkeleton;
