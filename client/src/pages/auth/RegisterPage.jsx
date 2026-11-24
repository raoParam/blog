import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/auth.service";
import BrandMark from "../../components/common/BrandMark";

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
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4 py-5"
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-pop">
        <div className="mb-6 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <BrandMark />
            <span className="text-xl font-bold tracking-wide text-text-primary">Flagger</span>
          </Link>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary text-sm">Sign up to start writing on Flagger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="register-username"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-body"
            >
              Username
            </label>
            <input
              id="register-username"
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-accent outline-none transition"
            />
            {errors.userName && <p className="text-danger text-xs mt-1">{errors.userName}</p>}
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-body"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={formData.emailId}
              onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm focus:border-accent outline-none transition"
            />
            {errors.emailId && <p className="text-danger text-xs mt-1">{errors.emailId}</p>}
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-body"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary text-sm pr-12 focus:border-accent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-body hover:text-text-primary transition"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
            {!errors.password && (
              <p className="text-text-secondary text-xs mt-1">
                Min 8 chars with uppercase, lowercase, number, and symbol.
              </p>
            )}
          </div>

          {serverError && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-2">
              <p className="text-danger text-xs text-center">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent hover:bg-accent-hover py-2.5 text-sm font-semibold text-accent-fg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-text-body">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-accent hover:text-accent-hover transition">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
