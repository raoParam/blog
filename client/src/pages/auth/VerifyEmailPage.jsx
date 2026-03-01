import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Flag } from "lucide-react";
import api from "../../services/axiosInstance";
import SuccessPopup from "../../components/common/SuccessPopup";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";

  const [emailId, setEmailId] = useState(prefilledEmail);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
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

  const validate = () => {
    if (!emailId.trim()) {
      setError("Email is required");
      return false;
    }
    if (!otp.trim()) {
      setError("OTP is required");
      return false;
    }
    return true;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setInfo("");

    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post("/auth/verify-email", {
        emailId: emailId.trim(),
        otp: otp.trim(),
      });
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to verify email";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resending || !emailId.trim()) {
      if (!emailId.trim()) {
        setError("Enter email first to resend OTP");
      }
      return;
    }

    setError("");
    setInfo("");

    try {
      setResending(true);
      await api.post("/auth/resend-verification", {
        emailId: emailId.trim(),
      });
      setInfo("OTP sent again. Please check your email.");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to resend OTP";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-10"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="w-full max-w-md rounded-3xl border border-[#2B2B2B] bg-[#080808] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.75)]">
          <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] shadow-lg shadow-blue-500/25">
              <Flag size={18} className="text-white" />
            </span>
            <span className="text-xl font-bold tracking-wide text-[#F3F3F3]">Flagger</span>
          </Link>
          <h1 className="text-2xl font-semibold text-[#F4F4F4] mb-2">Verify Your Email</h1>
          <p className="text-[#AFAFAF] text-sm">
            Enter your email and OTP to activate your account
          </p>
        </div>

          <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              Email
            </label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm focus:border-[#E6E6E6] outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm focus:border-[#E6E6E6] outline-none transition tracking-[0.3em]"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          {info && (
            <div className="bg-white/5 border border-white/20 rounded-lg p-2">
              <p className="text-[#D9D9D9] text-xs text-center">{info}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#F2F2F2] to-[#BFBFBF] py-2.5 text-sm font-semibold text-[#111111] hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify Email"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full rounded-xl border border-[#333333] bg-[#0B0B0B] py-2.5 text-sm font-medium text-[#EAEAEA] hover:bg-[#111111] transition disabled:opacity-50"
          >
            {resending ? "Resending OTP..." : "Resend OTP"}
          </button>

            <p className="text-center text-sm text-[#B8B8B8]">
              Back to{" "}
              <Link
                to="/login"
                className="font-semibold text-[#F3F3F3] hover:text-white transition"
              >
                Sign In
              </Link>
            </p>
          </form>
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

export default VerifyEmailPage;
