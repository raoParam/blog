const BrandMark = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] font-bold text-white shadow-lg shadow-blue-500/25 ${sizeClass}`}
      aria-hidden="true"
    >
      F
    </span>
  );
};

export default BrandMark;
