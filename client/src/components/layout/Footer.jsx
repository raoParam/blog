import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, MessageCircle, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-surface-0 border-t border-border-subtle pt-16 pb-8 overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-text-primary text-lg">Flagger</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              A modern platform for developers to write, share ideas, 
              and grow together through meaningful discussions.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-surface-1 flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 border border-border-subtle transition-all"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-surface-1 flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 border border-border-subtle transition-all"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-full bg-surface-1 flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 border border-border-subtle transition-all"
                aria-label="Discord"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/explore" className="text-text-secondary hover:text-accent transition text-sm">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/topics" className="text-text-secondary hover:text-accent transition text-sm">
                  Topics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-text-secondary hover:text-accent transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-text-secondary hover:text-accent transition text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/guidelines" className="text-text-secondary hover:text-accent transition text-sm">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-text-secondary hover:text-accent transition text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-text-secondary hover:text-accent transition text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-text-secondary hover:text-accent transition text-sm">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-text-secondary hover:text-accent transition text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-secondary hover:text-accent transition text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-text-secondary hover:text-accent transition text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-xs">
            © {currentYear} Flagger. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1 text-text-secondary text-xs">
            Built with <Heart size={12} className="text-accent mx-1" /> for developers
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-text-secondary hover:text-accent transition text-xs">
              Privacy
            </Link>
            <Link to="/terms" className="text-text-secondary hover:text-accent transition text-xs">
              Terms
            </Link>
            <Link to="/cookies" className="text-text-secondary hover:text-accent transition text-xs">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;