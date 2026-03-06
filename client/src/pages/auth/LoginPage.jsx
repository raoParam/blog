import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm.jsx";
import BrandMark from "../../components/common/BrandMark";

const LoginPage = () => {
  return (
    <div
      className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="w-full max-w-md rounded-3xl border border-[#2B2B2B] bg-[#080808] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.75)]">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-2">
            <BrandMark />
            <span className="text-xl font-bold tracking-wide text-[#F3F3F3]">Flagger</span>
          </Link>

          <h1 className="text-2xl font-semibold text-[#F4F4F4] mb-2">Welcome Back</h1>
          <p className="text-[#AFAFAF] text-sm">Sign in to continue</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
