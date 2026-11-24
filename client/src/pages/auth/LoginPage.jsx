import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm.jsx";
import BrandMark from "../../components/common/BrandMark";

const LoginPage = () => {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 shadow-pop">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <BrandMark />
            <span className="text-xl font-bold tracking-wide text-text-primary">Flagger</span>
          </Link>

          <h1 className="text-2xl font-semibold text-text-primary mb-2">Welcome Back</h1>
          <p className="text-text-secondary text-sm">Sign in to continue</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
