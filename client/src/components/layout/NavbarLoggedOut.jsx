import React from "react";
import { Link } from "react-router-dom";
import BrandMark from "../common/BrandMark";
import ThemeToggle from "../common/ThemeToggle";

const NavbarLoggedOut = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[var(--navbar-bg)] border-b border-[var(--border-card)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Left Side - Logo + Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <BrandMark size="sm" />
            <span className="font-semibold text-[var(--text-heading)] text-lg tracking-wide">
              Flagger
            </span>
          </Link>

          {/* Right Side - Theme Toggle + Auth Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/login"
              className="text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition font-medium hidden sm:block px-3 py-1.5"
            >
              Sign In
            </Link>

            <Link to="/register">
              <button className="bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
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