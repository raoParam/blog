import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative mt-0 overflow-hidden">

      {/* Soft Background Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/10 blur-3xl rounded-full pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge - Animated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-surface-1 border border-border-subtle rounded-full px-4 py-2 mb-6 md:mb-8 shadow-sm"
          >
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-accent rounded-full" 
            />
            <span className="text-text-secondary text-sm">
              Where Developers Think Aloud
            </span>
          </motion.div>

          {/* Main Heading - Staggered Animation */}
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4 md:mb-6 tracking-tight leading-tight"
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="block"
            >
              Write Freely.
            </motion.span>
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="block"
            >
              Connect Deeply.
            </motion.span>
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-accent relative inline-block mt-2"
            >
              Grow Together.
              <motion.svg
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,5 Q25,0 50,5 T100,5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.3"
                />
              </motion.svg>
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-text-secondary text-base md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            A minimalist space for developers to share ideas, 
            post anonymously, and build genuine connections 
            through thoughtful conversations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >

            {/* Primary CTA */}
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-medium px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 group text-sm md:text-base"
              >
                Start Writing
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </motion.button>
            </Link>

            {/* Secondary CTA */}
            <Link to="/explore" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-surface-1 hover:bg-surface-2 text-text-primary font-medium px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 border border-border-subtle text-sm md:text-base"
              >
                Explore Feed
              </motion.button>
            </Link>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;