import React from "react";
import AuthShell from "../auth/AuthShell";

/** Kept for future auth pages (OTP, reset password): same API, new shared layout. */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <AuthShell title={title} subtitle={subtitle}>
      {children}
    </AuthShell>
  );
};

export default AuthLayout;
