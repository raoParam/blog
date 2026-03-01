import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-[#3b6ff0] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <span className="font-bold text-white text-2xl">Flagger</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-[400px]">
        <div className="bg-[#12161C] border border-[#262B33] rounded-2xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
            {subtitle && (
              <p className="text-[#8B949E] text-sm">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;