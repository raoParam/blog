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
        <div className="relative bg-[#0E0F14] border border-[#26292E] rounded-2xl p-10 text-center shadow-2xl">
          
          {/* Icon */}
          <div className="w-14 h-14 bg-[#1A1D24] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#26292E]">
            <span className="text-2xl">✨</span>
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-white mb-2">
            You've reached the end
          </h3>

          {/* Description */}
          <p className="text-[#8B8F96] text-base mb-8 max-w-md mx-auto">
            Join thousands of developers reading and writing on Flagger. 
            Get access to all posts and join the conversation.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white hover:bg-[#E8E9EA] text-[#0E0F14] font-medium px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group"
              >
                Login to view more
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>

          {/* Sign up link */}
          <p className="text-[#8B8F96] text-sm mt-6">
            New here?{" "}
            <Link to="/register" className="text-white hover:text-[#E8E9EA] transition font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginCTA;