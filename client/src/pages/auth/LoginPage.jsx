import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm.jsx";
import AuthShell from "../../components/auth/AuthShell";

const LoginPage = () => {
  return (
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
  );
};

export default LoginPage;
