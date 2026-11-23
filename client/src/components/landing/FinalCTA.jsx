import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenSquare, BookOpen, Check } from "lucide-react";
import { motion } from "framer-motion";

const FinalCTA = () => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[var(--bg-page-secondary)]/50">
      <div className="relative max-w-5xl mx-auto px-6">
        
        {/* Editorial Masthead Call Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-8 sm:p-12 lg:p-16 text-center shadow-sm relative overflow-hidden"
        >
          {/* Subtle Top Accent Rule */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--btn-primary-bg)]" />

          {/* Monospace Eyebrow */}
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            <span>Open Call For Contributors // Vol. 2026</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-heading)] tracking-tight leading-tight max-w-3xl mx-auto mb-6">
            The software industry needs your unvarnished experience.
          </h2>

          {/* Editorial Subtitle */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto mb-10">
            Whether you just spent 40 hours isolating a race condition, redesigned a high-throughput pipeline, or lived through a disastrous cloud migration—your story helps other developers write better software.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-medium px-8 py-4 rounded-xl transition-all shadow-sm group text-base">
                <PenSquare size={18} />
                <span>Publish Your First Dispatch</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link to="/explore" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[var(--border-card)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-heading)] font-medium px-8 py-4 rounded-xl transition-all text-base shadow-sm">
                <BookOpen size={18} className="text-[var(--color-accent)]" />
                <span>Explore The Archive</span>
              </button>
            </Link>
          </div>

          {/* Editorial Commitments Strip */}
          <div className="pt-8 border-t border-[var(--divider)] flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-[var(--color-accent)] stroke-[2.5]" />
              <span>Zero paywalls or reading meters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-[var(--color-accent)] stroke-[2.5]" />
              <span>Cryptographic anonymous posting option</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-[var(--color-accent)] stroke-[2.5]" />
              <span>Native Markdown & code formatting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={14} className="text-[var(--color-accent)] stroke-[2.5]" />
              <span>Free for developers forever</span>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
