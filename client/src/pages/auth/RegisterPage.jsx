import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/auth.service";
import AuthShell, { authInputClass, authLabelClass, authButtonClass } from "../../components/auth/AuthShell";

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
    const nameRegex = /^[A-Za-z_]+$/;
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

    if (!formData.userName.trim()) {
      nextErrors.userName = "Username is required";
    } else if (formData.userName.trim().length < 5 || formData.userName.trim().length > 40) {
      nextErrors.userName = "Username must be 5 to 40 characters";
    } else if (!nameRegex.test(formData.userName.trim())) {
      nextErrors.userName = "Use only letters (a-z, A-Z) and underscore (_)";
    }

    if (!formData.emailId.trim()) {
      nextErrors.emailId = "Email is required";
    } else if (!emailRegex.test(formData.emailId.trim())) {
      nextErrors.emailId = "Enter valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (!strongPasswordRegex.test(formData.password)) {
      nextErrors.password =
        "Use at least 8 chars with uppercase, lowercase, number and symbol";
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
      await authService.register({
        userName: formData.userName.trim(),
        emailId: formData.emailId.trim(),
        password: formData.password,
      });

      sessionStorage.setItem(
        "success_popup",
        JSON.stringify({
          title: "Registration Successful",
          message: "Your account has been created. Please sign in to continue.",
        })
      );
      navigate("/login", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Unable to create account";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start writing on Flagger. It only takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent underline-offset-4 transition hover:text-accent-hover hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="register-username" className={authLabelClass}>
            Username
          </label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            placeholder="your_username"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            aria-invalid={Boolean(errors.userName)}
            aria-describedby={errors.userName ? "register-username-error" : undefined}
            className={authInputClass}
          />
          {errors.userName && (
            <p id="register-username-error" role="alert" className="mt-1.5 text-sm text-danger">
              {errors.userName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="register-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.emailId}
            onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
            aria-invalid={Boolean(errors.emailId)}
            aria-describedby={errors.emailId ? "register-email-error" : undefined}
            className={authInputClass}
          />
          {errors.emailId && (
            <p id="register-email-error" role="alert" className="mt-1.5 text-sm text-danger">
              {errors.emailId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="register-password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              aria-invalid={Boolean(errors.password)}
              aria-describedby="register-password-hint"
              className={`${authInputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-text-secondary transition hover:text-text-primary"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {errors.password ? (
            <p id="register-password-hint" role="alert" className="mt-1.5 text-sm text-danger">
              {errors.password}
            </p>
          ) : (
            <p id="register-password-hint" className="mt-1.5 text-sm text-text-secondary">
              At least 8 characters with uppercase, lowercase, a number and a symbol.
            </p>
          )}
        </div>

        {serverError && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5">
            <p className="text-sm text-danger">{serverError}</p>
          </div>
        )}

        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
