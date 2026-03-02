import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";
import { authService } from "../../services/auth.service";

const ForgotPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [emailId, setEmailId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const allowFromState = location.state?.fromLogin === true;
    if (!allowFromState) {
      navigate("/login", { replace: true });
    }
  }, [location.state, navigate]);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailId.trim()) {
      setError("Email is required");
      return false;
    }
    if (!emailRegex.test(emailId.trim())) {
      setError("Enter valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    if (!validate()) return;

    try {
      setSubmitting(true);
      await authService.forgotPassword({ emailId: emailId.trim() });
      sessionStorage.setItem("allow_reset_password", emailId.trim().toLowerCase());
      navigate(`/reset-password?email=${encodeURIComponent(emailId.trim())}`);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to send OTP";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
          <h1 className="text-2xl font-semibold text-[#F4F4F4] mb-2">Forgot Password</h1>
          <p className="text-[#AFAFAF] text-sm">Enter your email to receive reset OTP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#F2F2F2] to-[#BFBFBF] py-2.5 text-sm font-semibold text-[#111111] hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-center text-sm text-[#B8B8B8]">
            Back to{" "}
            <Link to="/login" className="font-semibold text-[#F3F3F3] hover:text-white transition">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
