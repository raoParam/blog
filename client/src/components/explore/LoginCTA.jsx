import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const LoginCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="my-16"
    >
      <div className="relative max-w-2xl mx-auto">
        {/* Subtle border glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl blur opacity-30" />
        
        {/* Main Card */}
        <div className="relative bg-surface border border-border-subtle rounded-2xl p-10 text-center shadow-2xl">
          
          {/* Icon */}
          <div className="w-14 h-14 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-border-subtle">
            <span className="text-2xl">✨</span>
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            You've reached the end
          </h3>

          {/* Description */}
          <p className="text-text-secondary text-base mb-8 max-w-md mx-auto">
            Join thousands of developers reading and writing on Flagger. 
            Get access to all posts and join the conversation.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-accent-fg font-medium px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
              >
                Login to view more
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>

          {/* Sign up link */}
          <p className="text-text-secondary text-sm mt-6">
            New here?{" "}
            <Link to="/register" className="text-accent hover:text-accent-hover transition font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginCTA;