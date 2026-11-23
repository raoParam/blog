import React from "react";
import {
  Lock,
  PenSquare,
  Award,
  Users,
  Compass,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  return (
    <section className="relative py-20 lg:py-24 border-b border-[var(--divider)]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-3">
            <Compass size={14} />
            <span>Section 02 // Architectural Pillars</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-heading)] tracking-tight leading-tight mb-4">
            Engineered for honest technical writing, not algorithm gaming.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Mainstream social platforms optimize for viral hot takes and engagement bait. Flagger is built around the authentic realities of building software.
          </p>
        </div>

        {/* Feature Layout 1: The Wide Asymmetric Split (Pillar 01: Anonymous Haven) */}
        <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-7 lg:p-10 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                <Lock size={13} />
                <span>Pillar 01 // The Anonymous Dispatch</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-heading)] tracking-tight">
                Speak the truth your LinkedIn profile won’t allow you to say.
              </h3>

              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                Real software engineering is messy: failed multi-million dollar cloud migrations, broken on-call culture, toxic management, and architectural debt. Flagger provides a native anonymous posting mode with zero identity leakage so you can share transparent post-mortems and compensation reality without fear of career reprisal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[var(--text-body)]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>Masked author byline with verified domain verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span>Database-level separation of identity and post content</span>
                </div>
              </div>
            </div>

            {/* Right Visual Dispatch Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-code)] p-5 text-xs font-mono shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--divider)] mb-3">
                  <div className="flex items-center gap-2 text-[var(--color-accent)]">
                    <EyeOff size={14} />
                    <span className="font-semibold">[MASKED_ENGINEER_#942]</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--danger-bg)] text-[var(--danger-text)] border border-[var(--danger-border)]">
                    Confidential Post-Mortem
                  </span>
                </div>

                <div className="font-sans font-bold text-sm text-[var(--text-heading)] mb-2">
                  "Our $1.2M Multi-Cloud Strategy Was a Vanity Project"
                </div>

                <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed italic mb-4">
                  "No one on our leadership team would admit it publicly on social media, but our multi-cloud deployment didn’t improve reliability—it quadrupled our egress costs and doubled deploy times..."
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--divider)] text-[11px] text-[var(--text-muted)]">
                  <span>Domain: Fintech Infrastructure</span>
                  <span>Verified L6 Staff Engineer</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Layout 2: Two Asymmetrical Columns (Pillars 02 & 03) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Pillar 02: Markdown & Code */}
          <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-7 lg:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--color-accent)] font-semibold mb-3">
                <FileCode size={14} />
                <span>Pillar 02 // Pure Formatting</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] mb-3 tracking-tight">
                First-class Markdown & native syntax fidelity.
              </h3>

              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                Code blocks with accurate language highlighting, LaTeX math, GFM tables, and collapsible logs. No blurry screenshots of IDEs or broken formatting tags.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-code)] p-4 font-mono text-xs text-[var(--text-body)]">
              <div className="text-[11px] text-[var(--text-muted)] mb-2 flex items-center justify-between pb-1.5 border-b border-[var(--divider)]">
                <span>markdown-preview.md</span>
                <span>GFM v4.0</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <span className="text-[var(--color-accent)]">### Architectural Constraint</span>
                <p className="text-[var(--text-secondary)] pl-2 border-l border-[var(--border-focus)]">
                  "Zero external tracking cookies. Clean HTML rendering."
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 03: Reputation & Badges */}
          <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-7 lg:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--color-accent)] font-semibold mb-3">
                <Award size={14} />
                <span>Pillar 03 // Peer Signal</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] mb-3 tracking-tight">
                Reputation earned by substance, not follow counts.
              </h3>

              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                Verified writer badges indicate verified domain mastery and peer-reviewed contributions. Discussion threads prioritize depth, code reviews, and nuanced debate.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--btn-primary-bg)] flex items-center justify-center text-[var(--btn-primary-text)] font-mono font-bold text-sm">
                  FL
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-heading)] flex items-center gap-1.5">
                    Verified Technical Contributor
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">
                    Awarded for peer-validated systems guides
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Layout 3: Editorial Commitments Band */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-page-secondary)]/70">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[var(--color-accent)] font-semibold">
              01 // Chronological
            </div>
            <h4 className="text-sm font-semibold text-[var(--text-heading)]">Chronological Feeds</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Read essays in the order they are written, without black-box engagement algorithms.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[var(--color-accent)] font-semibold">
              02 // Distraction-Free
            </div>
            <h4 className="text-sm font-semibold text-[var(--text-heading)]">Zero Paywalls or Popups</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              No 10-article monthly limits, no intrusive email popups, no blocking paywalls.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[var(--color-accent)] font-semibold">
              03 // Communities
            </div>
            <h4 className="text-sm font-semibold text-[var(--text-heading)]">Working Groups</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Join focused public groups and private cohorts dedicated to specific technical domains.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-[var(--color-accent)] font-semibold">
              04 // The Commons
            </div>
            <h4 className="text-sm font-semibold text-[var(--text-heading)]">Free For Every Builder</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Built as open infrastructure for the worldwide software engineering commons.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
