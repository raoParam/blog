import { useState, useEffect } from "react";
import { publicService } from "../../services/public.service";

const TopicsShell = ({ children }) => (
  <section className="border-t border-border-subtle">
    <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-baseline md:gap-10">
        <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
          Popular topics
        </h2>
        {children}
      </div>
    </div>
  </section>
);

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

  if (loading) {
    return (
      <TopicsShell>
        <div className="flex flex-wrap gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-surface-2" />
          ))}
        </div>
      </TopicsShell>
    );
  }

  // No real topics (empty or failed): hide the section instead of showing made-up ones
  if (error || categories.length === 0) return null;

  return (
    <TopicsShell>
      <ul className="flex flex-wrap gap-2.5">
        {categories.map((topic, index) => (
          <li
            key={topic.name || index}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-2 text-sm"
          >
            <span className="font-medium text-text-primary">
              <span className="text-text-muted">#</span>
              {topic.name}
            </span>
            {topic.count && <span className="text-xs text-text-muted">{topic.count}</span>}
          </li>
        ))}
      </ul>
    </TopicsShell>
  );
};

export default TrendingTopics;
