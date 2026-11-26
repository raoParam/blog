const SuccessPopup = ({ isOpen, title, message, buttonText = "Continue", onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-popup-title"
        className="w-full max-w-sm rounded-xl border border-border bg-surface-1 p-6 shadow-pop"
      >
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-success/40 bg-success/15 text-success">
          <span className="text-lg leading-none" aria-hidden="true">✓</span>
        </div>
        <h2 id="success-popup-title" className="mb-2 text-center font-serif text-xl font-semibold text-text-primary">
          {title}
        </h2>
        <p className="mb-5 text-center text-sm text-text-secondary">{message}</p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
