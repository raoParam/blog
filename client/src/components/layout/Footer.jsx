import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, MessageCircle, Heart, Copyright } from "lucide-react";
import BrandMark from "../common/BrandMark";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border-card)] bg-[var(--bg-page-secondary)] pt-14 pb-8 transition-colors duration-200">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="group mb-4 flex items-center gap-2">
              <BrandMark size="sm" />
              <span className="text-lg font-semibold text-[var(--text-heading)]">Flagger</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              A modern platform for developers and writers to share ideas,
              stories, and thoughtful discussions.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-focus)] hover:text-[var(--text-heading)]"
                aria-label="Twitter"
              >
                <Twitter size={15} />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-focus)] hover:text-[var(--text-heading)]"
                aria-label="GitHub"
              >
                <Github size={15} />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-focus)] hover:text-[var(--text-heading)]"
                aria-label="Discord"
              >
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)]">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/explore" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/topics" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Topics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)]">Community</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/guidelines" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)]">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-heading)]">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--divider)] pt-6 md:flex-row">
          <p className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Copyright size={12} />
            <span>{currentYear} Flagger. All rights reserved.</span>
          </p>

          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            Built with <Heart size={12} className="mx-1 text-[var(--color-accent)] fill-current" /> for developers & writers
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-[var(--text-muted)] transition hover:text-[var(--text-heading)]">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-[var(--text-muted)] transition hover:text-[var(--text-heading)]">
              Terms
            </Link>
            <Link to="/cookies" className="text-xs text-[var(--text-muted)] transition hover:text-[var(--text-heading)]">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
