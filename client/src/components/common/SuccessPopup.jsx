const SuccessPopup = ({ isOpen, title, message, buttonText = "Continue", onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm rounded-2xl border border-[#9FE2BE26] bg-[linear-gradient(160deg,#080808_0%,#0B1711_72%,#D7DEE314_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.72)]"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#90D7B355] bg-[#193729] text-[#C9E6D6]">
          <span className="text-lg leading-none">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-[#E5ECE8] text-center mb-2">{title}</h2>
        <p className="text-sm text-[#C5D0CA] text-center mb-5">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-[#B9C4CC55] bg-[linear-gradient(140deg,#1A3124_0%,#2B4D39_55%,#C8D1D866_100%)] py-2.5 text-sm font-semibold text-[#E8EEEA] hover:brightness-110 transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
