const SuccessPopup = ({ isOpen, title, message, buttonText = "Continue", onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-border bg-surface-1 p-6 shadow-pop"
      >
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-success/40 bg-success/15 text-success">
          <span className="text-lg leading-none">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-text-primary text-center mb-2">{title}</h2>
        <p className="text-sm text-text-secondary text-center mb-5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-fg hover:bg-accent-hover transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
