import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authInputClass, authLabelClass, authButtonClass } from "./AuthShell";

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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="login-email" className={authLabelClass}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.emailId}
          onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
          aria-invalid={Boolean(errors.emailId)}
          aria-describedby={errors.emailId ? "login-email-error" : undefined}
          className={authInputClass}
        />
        {errors.emailId && (
          <p id="login-email-error" role="alert" className="mt-1.5 text-sm text-danger">
            {errors.emailId}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className={authLabelClass}>
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className={`${authInputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-text-secondary transition hover:text-text-primary"
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" role="alert" className="mt-1.5 text-sm text-danger">
            {errors.password}
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <button type="submit" disabled={submitting} className={authButtonClass}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
