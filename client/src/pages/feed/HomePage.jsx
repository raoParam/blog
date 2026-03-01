import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import SuccessPopup from "../../components/common/SuccessPopup";

const HomePage = () => {
  const { user, logout } = useAuth();
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const rawPopup = sessionStorage.getItem("success_popup");
    if (!rawPopup) return;
    try {
      setPopup(JSON.parse(rawPopup));
    } catch {
      setPopup(null);
    }
  }, []);

  const handleClosePopup = () => {
    setPopup(null);
    sessionStorage.removeItem("success_popup");
  };

  return (
    <>
      <div className="min-h-screen bg-[#0b0f14] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#11161c] p-8">
          <h1 className="text-2xl font-semibold mb-2">Home</h1>
          <p className="text-gray-300 mb-6">
            Logged in as {user?.name || user?.emailId || "User"}.
          </p>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition"
          >
            Logout
          </button>
        </div>
      </div>
      <SuccessPopup
        isOpen={Boolean(popup)}
        title={popup?.title || ""}
        message={popup?.message || ""}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default HomePage;
