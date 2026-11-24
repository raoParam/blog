import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="relative pb-28 overflow-hidden">
      {/* Deep background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface-0/50" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)] opacity-20" />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-surface-0/80 backdrop-blur-sm border border-border-subtle rounded-3xl p-12 md:p-16 shadow-2xl"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="w-8 h-8 text-accent" />
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Ready to Share Your
            <br />
            <span className="text-accent">Voice with the World?</span>
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers who are already writing, 
            learning, and growing together on Flagger.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-accent-fg font-medium px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 group text-lg"
              >
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link to="/explore" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-surface-1 hover:bg-surface-2 text-text-primary font-medium px-8 py-4 rounded-xl transition-all duration-300 border border-border-subtle text-lg"
              >
                Browse Feed
              </motion.button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-text-primary">
            <div className="flex items-center gap-2 text-text-muted">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              No credit card required
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              Free forever
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              Cancel anytime
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;