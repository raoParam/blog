import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, PenSquare, ShieldCheck, Terminal, Flame, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import AuthorAvatar from "../common/AuthorAvatar";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden border-b border-[var(--divider)]">
      {/* Editorial Dispatch Ribbon / Masthead Ticker */}
      <div className="border-b border-[var(--border-card)] bg-[var(--bg-page-secondary)]/80 text-[var(--text-muted)] text-xs font-mono py-2.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[var(--text-heading)] tracking-wider">
              ISSUE № 42 // THE DEVELOPER GAZETTE
            </span>
            <span className="hidden sm:inline text-[var(--border-input)]">|</span>
            <span className="hidden sm:inline">CODE • ARCHITECTURE • ANONYMOUS TRUTHS</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-[var(--text-secondary)] font-medium">DISPATCH ARCHIVE ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Masthead Lead */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Category / Platform Tag */}
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-5">
              <Terminal size={14} />
              <span>Independent Engineering Publication</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-heading)] tracking-tight leading-[1.1] mb-6">
              Where software craft meets{" "}
              <span className="text-[var(--color-accent)] underline decoration-[var(--border-focus)]/50 underline-offset-8">
                unvarnished truth.
              </span>
            </h1>

            {/* Editorial Dek / Standfirst */}
            <p className="text-[var(--text-body)] text-lg lg:text-xl font-normal leading-relaxed mb-8 max-w-2xl">
              Flagger is an independent publication and writing space built for developers. Publish deep technical essays, dissect architectures, and share anonymous post-mortems without corporate PR or influencer noise.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5 mb-12">
              <Link to="/register">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-medium px-6 py-3.5 rounded-xl transition-all shadow-sm group">
                  <PenSquare size={17} />
                  <span>Start Writing Dispatches</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link to="/explore">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[var(--border-card)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-heading)] font-medium px-6 py-3.5 rounded-xl transition-all shadow-sm">
                  <BookOpen size={17} className="text-[var(--color-accent)]" />
                  <span>Explore The Archive</span>
                </button>
              </Link>
            </div>

            {/* Editorial Commitments (Micro-columns with hairline borders) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--divider)]">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-[var(--text-heading)] font-semibold flex items-center gap-1.5">
                  <span className="text-[var(--color-accent)]">01.</span> Dual Identity
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Real bylines or cryptographic anonymous mode for sensitive post-mortems.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-[var(--text-heading)] font-semibold flex items-center gap-1.5">
                  <span className="text-[var(--color-accent)]">02.</span> Pure Markdown
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  First-class syntax highlighting, tables, diagrams, and distraction-free formatting.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-[var(--text-heading)] font-semibold flex items-center gap-1.5">
                  <span className="text-[var(--color-accent)]">03.</span> Peer Signal
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Curated by engineers. Chronological feeds with zero algorithmic engagement bait.
                </p>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Lead Dispatch Broadside Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 sm:p-7 shadow-sm">
              
              {/* Broadside Header Bar */}
              <div className="flex items-center justify-between border-b border-[var(--divider)] pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-[var(--bg-surface-input)] text-[var(--color-accent)] border border-[var(--border-input)]">
                    Lead Dispatch
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    ARCHITECTURE // 7 MIN READ
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--color-accent)] flex items-center gap-1">
                  <Flame size={13} /> Trending
                </span>
              </div>

              {/* Lead Article Title */}
              <Link to="/explore" className="group block mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                  "Why We Dismantled Our 42 Microservices: A 3-Year Post-Mortem"
                </h2>
              </Link>

              {/* Author Byline */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <AuthorAvatar
                    author={{
                      userName: "vikram_sethi",
                      firstName: "Vikram",
                      lastName: "Sethi",
                      isVerifiedBadge: true,
                    }}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[var(--text-heading)]">Vikram Sethi</span>
                      <ShieldCheck size={14} className="text-[var(--color-accent)]" />
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      Staff Infrastructure Architect • 3h ago
                    </span>
                  </div>
                </div>
              </div>

              {/* Code Snippet / Architectural Evidence */}
              <div className="rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-code)] p-3.5 mb-5 font-mono text-xs overflow-x-auto text-[var(--text-heading)]">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-2 pb-2 border-b border-[var(--divider)]">
                  <span className="flex items-center gap-1.5">
                    <Code2 size={12} className="text-[var(--color-accent)]" />
                    infra-consolidation.ts
                  </span>
                  <span>TypeScript</span>
                </div>
                <pre className="text-[11px] leading-relaxed">
                  <span className="text-[var(--color-accent)]">interface</span> ArchitecturalShift {"{\n"}
                  {"  "}topology: <span className="text-emerald-400">"modular-monolith"</span>;{"\n"}
                  {"  "}latencyP99: <span className="text-emerald-400">"-340ms"</span>;{"\n"}
                  {"  "}cloudSpendMonthly: <span className="text-emerald-400">"-$38,500"</span>;{"\n"}
                  {"  "}onCallAlertFatigue: <span className="text-emerald-400">"negligible"</span>;{"\n"}
                  {"}"}
                </pre>
              </div>

              {/* Editorial Pull Excerpt */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic mb-5 pl-3 border-l-2 border-[var(--color-accent)]">
                "Every conference talk in 2021 convinced our team that monoliths couldn't scale. Three years later, we were spending 70% of engineering bandwidth troubleshooting distributed network traces..."
              </p>

              {/* Card Footer Status */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--divider)] text-xs text-[var(--text-muted)] font-mono">
                <div className="flex items-center gap-3">
                  <span>184 upvotes</span>
                  <span>•</span>
                  <span>49 engineering remarks</span>
                </div>
                <Link
                  to="/explore"
                  className="text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 font-sans font-medium"
                >
                  Read essay →
                </Link>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
