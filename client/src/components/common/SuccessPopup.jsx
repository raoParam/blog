const SuccessPopup = ({ isOpen, title, message, buttonText = "Continue", onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-[#2B2B2B] bg-[#080808] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.75)]"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <h2 className="text-xl font-semibold text-[#F4F4F4] text-center mb-2">{title}</h2>
        <p className="text-sm text-[#B8B8B8] text-center mb-5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-gradient-to-r from-[#F2F2F2] to-[#BFBFBF] py-2.5 text-sm font-semibold text-[#111111] hover:opacity-90 transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
