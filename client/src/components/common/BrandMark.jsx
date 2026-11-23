const BrandMark = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-[var(--btn-primary-bg)] font-bold text-[var(--btn-primary-text)] shadow-sm ${sizeClass}`}
      aria-hidden="true"
    >
      F
    </span>
  );
};

export default BrandMark;
