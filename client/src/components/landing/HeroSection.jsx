import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** A static sample of what a published post looks like (not real data). */
const SamplePost = () => (
  <figure
    aria-hidden="true"
    className="rounded-2xl border border-border bg-surface-1 p-6 sm:p-8"
  >
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-text-primary">
        A
      </span>
      <span className="font-medium text-text-primary">@ada</span>
      <span className="text-text-muted">·</span>
      <span className="text-text-secondary">6 min read</span>
    </div>

    <h2 className="mt-6 font-serif text-2xl font-semibold leading-snug tracking-tight text-text-primary sm:text-[1.7rem]">
      Why I stopped over-engineering my side projects
    </h2>

    <p className="mt-3 font-serif text-base leading-relaxed text-text-body">
      Every weekend I would spend six hours choosing a stack. This is a note
      to my past self about shipping first and polishing later.
    </p>

    <pre className="mt-5 overflow-x-auto rounded-lg border border-border bg-background px-4 py-3 font-mono text-[12.5px] leading-6 text-text-primary">
      <code>const post = await publish(draft);</code>
    </pre>

    <figcaption className="mt-6 flex items-center justify-between border-t border-border-subtle pt-4 text-xs text-text-muted">
      <span>#webdev &nbsp;#career</span>
      <span className="uppercase tracking-[0.14em]">Sample post</span>
    </figcaption>
  </figure>
);

const HeroSection = () => {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-12 lg:gap-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7"
        >
          <motion.p
            variants={fadeUp}
            className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary"
          >
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Where developers think aloud
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
          >
            Write freely.
            <br />
            Connect deeply.
            <br />
            <span className="font-normal italic">Grow together.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-lg leading-relaxed text-text-secondary"
          >
            A minimalist space for developers to share ideas, post anonymously,
            and build genuine connections through thoughtful conversations.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-accent-fg transition hover:bg-accent-hover"
            >
              Start writing
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-lg border border-border-strong px-6 py-3.5 text-base font-medium text-text-primary transition hover:bg-surface-2"
            >
              Explore the feed
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-8 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-muted"
          >
            <span>Markdown editor</span>
            <span aria-hidden="true">·</span>
            <span>Anonymous posting</span>
            <span aria-hidden="true">·</span>
            <span>Verified writers</span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <SamplePost />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
