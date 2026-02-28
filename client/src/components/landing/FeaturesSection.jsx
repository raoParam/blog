import React from "react";
import { motion } from "framer-motion";
import {
  PenSquare,
  Lock,
  Award,
  Users,
  BookOpen,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: PenSquare,
    title: "Rich Markdown Editor",
    description:
      "Write with full formatting support — code blocks, headings, lists, and beautiful syntax highlighting.",
  },
  {
    icon: Lock,
    title: "Anonymous Posting",
    description:
      "Share freely in groups without revealing your identity. Speak honestly, think openly.",
  },
  {
    icon: Award,
    title: "Verified Writer Badge",
    description:
      "Earn recognition for quality contributions and build credibility in the community.",
  },
  {
    icon: Users,
    title: "Developer Communities",
    description:
      "Join public and private groups built around real developer interests.",
  },
  {
    icon: BookOpen,
    title: "Learning in Public",
    description:
      "Document your journey, showcase your skills, and build your personal brand.",
  },
  {
    icon: Sparkles,
    title: "Smart Discovery",
    description:
      "Explore trending ideas, follow writers, and personalize your feed.",
  },
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative py-28 overflow-hidden">

      {/* Soft Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6 tracking-tight leading-tight">
            Built for Developers Who
            <br />
            <span className="text-accent">Think in Public</span>
          </h2>

          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            A modern platform designed for blogging, anonymous discussions,
            and meaningful developer communities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative"
              >
                {/* Glow Layer */}
                <div className="absolute inset-0 rounded-3xl bg-accent/5 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl" />

                {/* Card */}
                <div className="relative bg-surface-1/80 backdrop-blur-sm border border-border-subtle rounded-3xl p-8 h-full transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-xl">

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default FeaturesSection;