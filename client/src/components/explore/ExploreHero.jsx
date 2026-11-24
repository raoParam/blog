import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const ExploreHero = () => {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Explore
          </p>

          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-5xl">
            What developers are{" "}
            <span className="font-normal italic">writing about</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Ideas, notes and stories from the Flagger community. Read a few
            below, then join to read the rest and join the conversation.
          </p>

          <div className="mt-8">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-accent-fg transition hover:bg-accent-hover"
            >
              Join Flagger
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreHero;
