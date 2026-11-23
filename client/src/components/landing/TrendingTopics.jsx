import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Hash, ArrowUpRight, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { publicService } from "../../services/public.service";

const TrendingTopics = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await publicService.getCategories();
        setCategories(response.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Could not load topics");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Curated fallback topics with editorial metadata
  const fallbackTopics = [
    { name: "systems-architecture", count: "3.4k", domain: "Infra" },
    { name: "typescript", count: "2.8k", domain: "Language" },
    { name: "react", count: "2.3k", domain: "Frontend" },
    { name: "database-internals", count: "1.9k", domain: "Data" },
    { name: "nextjs", count: "1.8k", domain: "Fullstack" },
    { name: "anonymous-confessions", count: "1.6k", domain: "Culture" },
    { name: "distributed-systems", count: "1.4k", domain: "Backend" },
    { name: "cloud-costs", count: "1.1k", domain: "DevOps" },
    { name: "performance", count: "980", domain: "Optimization" },
    { name: "career-reality", count: "890", domain: "Workplace" },
    { name: "security", count: "740", domain: "SecOps" },
    { name: "nodejs", count: "1.2k", domain: "Runtime" },
  ];

  const rawTopics = categories.length > 0 ? categories : fallbackTopics;
  
  // Normalize topic objects
  const displayTopics = rawTopics.map((topic, idx) => {
    if (typeof topic === "string") {
      return { name: topic, count: null, domain: "Topic" };
    }
    return {
      name: topic.name || `topic-${idx}`,
      count: topic.count || null,
      domain: topic.domain || "Engineering",
    };
  });

  return (
    <section className="relative py-16 lg:py-20 border-b border-[var(--divider)] bg-[var(--bg-page-secondary)]/40">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Masthead */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[var(--divider)]">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              <Layers size={13} />
              <span>Section 01 // Classified Index</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-heading)] tracking-tight">
              Topics of Inquiry
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
              From distributed state and low-level runtimes to developer culture, compensation, and post-mortems.
            </p>
          </div>

          <Link
            to="/topics"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--color-accent)] hover:underline whitespace-nowrap"
          >
            Browse Full Taxonomic Index
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-3 animate-pulse"
              >
                <div className="w-12 h-3 bg-[var(--bg-surface-hover)] rounded mb-2" />
                <div className="w-20 h-4 bg-[var(--bg-surface-hover)] rounded" />
              </div>
            ))}
          </div>
        ) : error && categories.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {displayTopics.slice(0, 12).map((topic, index) => (
              <motion.div
                key={topic.name || index}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  to={`/topic/${topic.name}`}
                  className="group flex flex-col justify-between h-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-3.5 transition-all duration-200 hover:border-[var(--border-focus)] hover:bg-[var(--bg-surface-hover)] shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-2">
                    <span className="uppercase tracking-wider">{topic.domain}</span>
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 text-[var(--color-accent)] transition-opacity"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 font-semibold text-sm text-[var(--text-heading)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                      <Hash size={13} className="text-[var(--text-muted)] shrink-0" />
                      <span className="truncate">{topic.name}</span>
                    </div>

                    {topic.count && (
                      <span className="block mt-1 text-[11px] font-mono text-[var(--text-muted)]">
                        {topic.count} dispatches
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default TrendingTopics;
