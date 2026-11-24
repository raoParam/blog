const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-[3px]",
};

const LoaderRing = ({ size = "md", className = "" }) => {
  const ringSize = sizeMap[size] || sizeMap.md;
  return (
    <span
      className={`inline-block animate-spin rounded-full border-accent border-t-transparent ${ringSize} ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
};

export default LoaderRing;
