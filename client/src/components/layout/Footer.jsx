import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, MessageCircle, Heart, Copyright } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border-subtle bg-surface-0 pt-16 pb-8 font-['Arial']">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="group mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent shadow-md transition group-hover:scale-105">
                <span className="text-sm font-bold text-white">F</span>
              </div>
              <span className="text-lg font-semibold text-text-primary">Flagger</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-text-secondary">
              A modern platform for developers to write, share ideas,
              and grow together through meaningful discussions.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-1 text-text-secondary transition-all hover:border-accent/30 hover:text-accent"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-1 text-text-secondary transition-all hover:border-accent/30 hover:text-accent"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-1 text-text-secondary transition-all hover:border-accent/30 hover:text-accent"
                aria-label="Discord"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-primary">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/explore" className="text-sm text-text-secondary transition hover:text-accent">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/topics" className="text-sm text-text-secondary transition hover:text-accent">
                  Topics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-text-secondary transition hover:text-accent">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-text-secondary transition hover:text-accent">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-primary">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/guidelines" className="text-sm text-text-secondary transition hover:text-accent">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-text-secondary transition hover:text-accent">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-text-secondary transition hover:text-accent">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-sm text-text-secondary transition hover:text-accent">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-primary">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-text-secondary transition hover:text-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-text-secondary transition hover:text-accent">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-text-secondary transition hover:text-accent">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 md:flex-row">
          <p className="inline-flex items-center gap-1 text-xs text-text-secondary">
            <Copyright size={12} />
            <span>{currentYear} Flagger. All rights reserved.</span>
          </p>

          <div className="flex items-center gap-1 text-xs text-text-secondary">
            Built with <Heart size={12} className="mx-1 text-accent" /> for developers
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-text-secondary transition hover:text-accent">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-text-secondary transition hover:text-accent">
              Terms
            </Link>
            <Link to="/cookies" className="text-xs text-text-secondary transition hover:text-accent">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
