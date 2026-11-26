import { useState } from "react";

/** Flagger logo mark. Uses /favicon.png, with a plain "F" tile if the file fails to load. */
const BrandMark = ({ size = "md" }) => {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  if (failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-accent font-serif font-bold text-accent-fg ${sizeClass} ${size === "sm" ? "text-sm" : "text-base"}`}
        aria-hidden="true"
      >
        F
      </span>
    );
  }

  return (
    <img
      src="/favicon.png"
      alt=""
      aria-hidden="true"
      width={size === "sm" ? 32 : 40}
      height={size === "sm" ? 32 : 40}
      onError={() => setFailed(true)}
      className={`shrink-0 ${sizeClass}`}
    />
  );
};

export default BrandMark;
