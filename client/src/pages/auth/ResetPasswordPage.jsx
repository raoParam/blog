import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Flag } from "lucide-react";
import { authService } from "../../services/auth.service";
import SuccessPopup from "../../components/common/SuccessPopup";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    emailId: prefilledEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const maxResendAttempts = 3;

  useEffect(() => {
    const allowedEmail = sessionStorage.getItem("allow_reset_password");
    if (!allowedEmail) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    if (
      formData.emailId.trim() &&
      allowedEmail !== formData.emailId.trim().toLowerCase()
    ) {
      navigate("/forgot-password", { replace: true });
    }
  }, [formData.emailId, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validate = () => {
    if (!formData.emailId.trim()) return "Email is required";
    if (!formData.otp.trim()) return "OTP is required";
    if (!formData.newPassword) return "New password is required";
    if (!formData.confirmPassword) return "Confirm password is required";
    if (formData.newPassword !== formData.confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setInfo("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      await authService.resetPassword({
        emailId: formData.emailId.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      sessionStorage.removeItem("allow_reset_password");
      setShowSuccessPopup(true);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to reset password";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resending) return;
    if (!formData.emailId.trim()) {
      setError("Enter email first to resend OTP");
      return;
    }
    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown}s before requesting again.`);
      return;
    }
    if (resendCount >= maxResendAttempts) {
      setError("You have reached the maximum resend attempts (3).");
      return;
    }

    setError("");
    setInfo("");

    try {
      setResending(true);
      await authService.forgotPassword({
        emailId: formData.emailId.trim(),
      });
      const nextCount = resendCount + 1;
      const attemptsLeft = Math.max(0, maxResendAttempts - nextCount);
      setResendCount(nextCount);
      setResendCooldown(30);
      setInfo(
        attemptsLeft > 0
          ? `A new OTP has been sent. You can resend ${attemptsLeft} more time${attemptsLeft > 1 ? "s" : ""}.`
          : "A new OTP has been sent. You have used all resend attempts."
      );
    } catch (err) {
      const message = err.response?.data?.message || "Unable to resend OTP";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-4"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-[#2B2B2B] bg-[#080808] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.75)]">
        <div className="mb-6 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] shadow-lg shadow-blue-500/25">
              <Flag size={18} className="text-white" />
            </span>
            <span className="text-xl font-bold tracking-wide text-[#F3F3F3]">Flagger</span>
          </Link>
          <h1 className="text-2xl font-semibold text-[#F4F4F4] mb-2">Reset Password</h1>
          <p className="text-[#AFAFAF] text-sm">Verify OTP and set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              Email
            </label>
            <input
              type="email"
              value={formData.emailId}
              onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
              className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm focus:border-[#E6E6E6] outline-none transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              OTP
            </label>
            <input
              type="text"
              maxLength={6}
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm focus:border-[#E6E6E6] outline-none transition tracking-[0.3em]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm pr-12 focus:border-[#E6E6E6] outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#BDBDBD] hover:text-white transition"
              >
                {showNewPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm pr-12 focus:border-[#E6E6E6] outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#BDBDBD] hover:text-white transition"
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
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
            {submitting ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendCooldown > 0 || resendCount >= maxResendAttempts}
            className="w-full rounded-xl border border-[#333333] bg-[#0B0B0B] py-2.5 text-sm font-medium text-[#EAEAEA] hover:bg-[#111111] transition disabled:opacity-50"
          >
            {resending
              ? "Resending OTP..."
              : resendCount >= maxResendAttempts
                ? "Resend limit reached"
                : resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : "Resend OTP"}
          </button>

          <p className="text-center text-xs text-[#AFAFAF]">
            Resend available after 30 seconds. Max 3 times.
          </p>

          <p className="text-center text-sm text-[#B8B8B8]">
            Back to{" "}
            <Link to="/login" className="font-semibold text-[#F3F3F3] hover:text-white transition">
              Sign In
            </Link>
          </p>
        </form>
      </div>
      <SuccessPopup
        isOpen={showSuccessPopup}
        title="Password Reset Successful"
        message="Your password has been updated. Please sign in with your new password."
        onClose={() => navigate("/login")}
      />
    </div>
  );
};

export default ResetPasswordPage;
