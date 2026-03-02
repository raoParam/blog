import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.service";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.emailId.trim()) {
      newErrors.emailId = "Email is required";
    } else if (!emailRegex.test(formData.emailId)) {
      newErrors.emailId = "Enter valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    setSubmitting(true);
    const result = await login(formData.emailId.trim(), formData.password);
    setSubmitting(false);
    if (result.success) {
      sessionStorage.setItem(
        "success_popup",
        JSON.stringify({
          title: "Login Successful",
          message: "You are now logged in to Flagger.",
        })
      );
      navigate("/home");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        style={{ fontFamily: "Arial, sans-serif" }}
      >

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
          Email
        </label>
        <input
          type="email"
          value={formData.emailId}
          onChange={(e) =>
            setFormData({ ...formData, emailId: e.target.value })
          }
          className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm focus:border-[#E6E6E6] outline-none transition"
        />
        {errors.emailId && (
          <p className="text-red-400 text-xs mt-1">{errors.emailId}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#B8B8B8]">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[#F1F1F1] text-sm pr-12 focus:border-[#E6E6E6] outline-none transition"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#BDBDBD] hover:text-white transition"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          state={{ fromLogin: true }}
          className="text-xs font-medium text-[#B8B8B8] hover:text-[#F3F3F3] transition"
        >
          Forgot password?
        </Link>
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
        {submitting ? "Signing in..." : "Sign In"}
      </button>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#333333] bg-[#0B0B0B] py-2.5 text-sm font-medium text-[#EAEAEA] hover:bg-[#111111] transition"
      >
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.3 35.1 26.8 36 24 36c-5.1 0-9.5-3.3-11.1-7.9l-6.6 5.1C9.6 39.7 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.5-2.4 4.6-4.6 6.1l.1-.1 6.2 5.2C36.6 39.6 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-[#B8B8B8]">
        Not account ?{" "}
        <Link to="/register" className="font-semibold text-[#F3F3F3] hover:text-white transition">
          Signup
        </Link>
      </p>
      </form>
    </>
  );
};

export default LoginForm;
