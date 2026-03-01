import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Flag } from "lucide-react";
import api from "../../services/axiosInstance";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    emailId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.userName.trim()) {
      nextErrors.userName = "Username is required";
    } else if (formData.userName.trim().length < 5 || formData.userName.trim().length > 40) {
      nextErrors.userName = "Username must be 5 to 40 characters";
    }

    if (!formData.emailId.trim()) {
      nextErrors.emailId = "Email is required";
    } else if (!emailRegex.test(formData.emailId.trim())) {
      nextErrors.emailId = "Enter valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setServerError("");

    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post("/auth/register", {
        userName: formData.userName.trim(),
        emailId: formData.emailId.trim(),
        password: formData.password,
      });

      sessionStorage.setItem(
        "success_popup",
        JSON.stringify({
          title: "Registration Successful",
          message: "OTP has been sent to your email for verification.",
        })
      );
      navigate(`/verify-email?email=${encodeURIComponent(formData.emailId.trim())}`);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to create account";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-5"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-[#2B2B2B] bg-[#080808] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.75)]">
        <div className="mb-6 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#1E40AF] shadow-lg shadow-blue-500/25">
              <Flag size={18} className="text-white" />
            </span>
            <span className="text-xl font-bold tracking-wide text-[#F3F3F3]">Flagger</span>
          </Link>
          <h1 className="text-2xl font-semibold text-[#F4F4F4] mb-2">Create Account</h1>
          <p className="text-[#AFAFAF] text-sm">Sign up to start writing on Flagger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              Username
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm focus:border-[#E6E6E6] outline-none transition"
            />
            {errors.userName && <p className="text-red-400 text-xs mt-1">{errors.userName}</p>}
          </div>

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
            {errors.emailId && <p className="text-red-400 text-xs mt-1">{errors.emailId}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm pr-12 focus:border-[#E6E6E6] outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#BDBDBD] hover:text-white transition"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              <p className="text-red-400 text-xs text-center">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#F2F2F2] to-[#BFBFBF] py-2.5 text-sm font-semibold text-[#111111] hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-[#B8B8B8]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#F3F3F3] hover:text-white transition">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
