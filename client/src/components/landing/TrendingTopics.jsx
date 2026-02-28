import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hash, TrendingUp } from "lucide-react";
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
        // Assuming API returns { categories: [...] }
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

  // Fallback data if API fails or is empty
  const fallbackTopics = [
    { name: "react", count: "2.3k" },
    { name: "nextjs", count: "1.8k" },
    { name: "typescript", count: "1.5k" },
    { name: "tailwind", count: "1.2k" },
    { name: "nodejs", count: "1.1k" },
    { name: "python", count: "980" },
  ];

  const displayTopics = categories.length > 0 ? categories : fallbackTopics;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-text-primary">Trending Topics</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="w-24 h-10 bg-surface-2 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-bold text-text-primary">Trending Topics</h2>
          </div>
          <div className="text-text-secondary text-sm">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-1/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-8"
        >
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-bold text-text-primary">Trending Topics</h2>
        </motion.div>

        {/* Topics Cloud */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3"
        >
          {displayTopics.map((topic, index) => (
            <motion.div
              key={topic.name || index}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={`/topic/${topic.name}`}
                className="group inline-flex items-center gap-2 bg-surface-1 hover:bg-surface-2 border border-border-subtle hover:border-accent/40 rounded-full px-5 py-2.5 transition-all duration-300"
              >
                <Hash className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
                <span className="text-text-primary text-sm font-medium">{topic.name}</span>
                {topic.count && (
                  <span className="text-text-secondary text-xs bg-surface-2 group-hover:bg-surface-1 px-2 py-0.5 rounded-full transition-colors">
                    {topic.count}
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Link
            to="/topics"
            className="text-sm text-text-secondary hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            Browse all topics
            <span className="text-lg">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingTopics;