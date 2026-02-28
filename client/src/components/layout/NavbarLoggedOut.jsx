import React from "react";
import { Link } from "react-router-dom";

const NavbarLoggedOut = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-base/80 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Left Side - Logo + Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="hidden sm:block font-semibold text-text-primary text-lg">
              Flagger
            </span>
          </Link>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-text-secondary hover:text-accent transition font-medium hidden sm:block"
            >
              Sign In
            </Link>

            <Link to="/register">
              <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg">
                Sign Up
              </button>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default NavbarLoggedOut;