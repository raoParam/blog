import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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
      >

      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-body"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={formData.emailId}
          onChange={(e) =>
            setFormData({ ...formData, emailId: e.target.value })
          }
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-accent outline-none transition"
        />
        {errors.emailId && (
          <p className="text-danger text-xs mt-1">{errors.emailId}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-body"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm pr-12 focus:border-accent outline-none transition"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-body hover:text-text-primary transition"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        {errors.password && (
          <p className="text-danger text-xs mt-1">{errors.password}</p>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-2">
          <p className="text-danger text-xs text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-accent hover:bg-accent-hover py-2.5 text-sm font-semibold text-accent-fg hover:opacity-90 transition disabled:opacity-50"
      >
        {submitting ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-text-body">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-accent hover:text-accent-hover transition">
          Sign up
        </Link>
      </p>
      </form>
    </>
  );
};

export default LoginForm;
