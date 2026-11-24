import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";

const ExploreHero = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Compass className="w-7 h-7 text-accent" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Discover what developers
            <br />
            <span className="text-accent">are writing about</span>
          </h1>

          {/* Subheading */}
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Explore ideas, insights, and stories from the developer community. 
            Join thousands of readers and writers on Flagger.
          </p>

          {/* CTA Button */}
          <Link to="/register" className="inline-block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent hover:bg-accent-hover text-accent-fg font-medium px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              Join Flagger
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreHero;