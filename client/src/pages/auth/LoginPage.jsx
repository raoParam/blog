import React, { useState } from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm.jsx";
import AuthShell from "../../components/auth/AuthShell";
import SuccessPopup from "../../components/common/SuccessPopup";

// Reads the one-time message left by the register page (if any)
const readPopup = () => {
  try {
    const raw = sessionStorage.getItem("success_popup");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const [popup, setPopup] = useState(readPopup);

  const handleClosePopup = () => {
    setPopup(null);
    try {
      sessionStorage.removeItem("success_popup");
    } catch {
      // storage unavailable: nothing to clear
    }
  };

  return (
    <>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to continue writing and reading on Flagger."
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-accent underline-offset-4 transition hover:text-accent-hover hover:underline">
              Sign up
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>

      <SuccessPopup
        isOpen={Boolean(popup)}
        title={popup?.title || ""}
        message={popup?.message || ""}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default LoginPage;
