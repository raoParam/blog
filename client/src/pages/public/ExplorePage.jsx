import React, { useState, useEffect } from "react";
import NavbarLoggedOut from "../../components/layout/NavbarLoggedOut";
import Footer from "../../components/layout/Footer";
import ExploreHero from "../../components/explore/ExploreHero";
import PublicPostCard from "../../components/explore/PublicPostCard";
import LoginCTA from "../../components/explore/LoginCTA";
import { publicService } from "../../services/public.service";

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await publicService.getPosts();
        setPosts(response.blogs || []);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError("Could not load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fallback data if API fails
  const fallbackPosts = [
    {
      _id: "1",
      title: "Understanding React Server Components",
      excerpt: "A deep dive into how RSC work and when to use them in production...",
      author: { userName: "rahul_kumar", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 42,
      commentsCount: 8,
    },
    {
      _id: "2",
      title: "Getting Started with Next.js 14",
      excerpt: "Learn about App Router, Server Components, and the new features...",
      author: { userName: "priya_sharma", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 89,
      commentsCount: 12,
    },
    {
      _id: "3",
      title: "Why I Left Big Tech",
      excerpt: "A personal story about work-life balance and mental health...",
      author: null,
      createdAt: new Date().toISOString(),
      likes: 156,
      commentsCount: 34,
    },
    {
      _id: "4",
      title: "Mastering TypeScript in 2024",
      excerpt: "Tips and tricks to level up your TypeScript game...",
      author: { userName: "typescript_guru", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 67,
      commentsCount: 15,
    },
    {
      _id: "5",
      title: "The Future of Web Development",
      excerpt: "Where are we heading? Predictions for the next 5 years...",
      author: { userName: "web_dev", isVerifiedBadge: false },
      createdAt: new Date().toISOString(),
      likes: 103,
      commentsCount: 27,
    },
    {
      _id: "6",
      title: "Building Scalable APIs with Node.js",
      excerpt: "Best practices for designing and implementing robust APIs...",
      author: { userName: "api_master", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 78,
      commentsCount: 19,
    },
    {
      _id: "7",
      title: "CSS Grid vs Flexbox",
      excerpt: "When to use which layout system...",
      author: { userName: "css_wizard", isVerifiedBadge: false },
      createdAt: new Date().toISOString(),
      likes: 34,
      commentsCount: 7,
    },
    {
      _id: "8",
      title: "Introduction to GraphQL",
      excerpt: "Why GraphQL is changing how we build APIs...",
      author: { userName: "graphql_fan", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 92,
      commentsCount: 23,
    },
    {
      _id: "9",
      title: "Debugging Like a Pro",
      excerpt: "Tools and techniques to debug faster...",
      author: { userName: "debugger", isVerifiedBadge: false },
      createdAt: new Date().toISOString(),
      likes: 45,
      commentsCount: 11,
    },
    {
      _id: "10",
      title: "Open Source Contribution Guide",
      excerpt: "How to make your first open source contribution...",
      author: { userName: "oss_contributor", isVerifiedBadge: true },
      createdAt: new Date().toISOString(),
      likes: 128,
      commentsCount: 42,
    },
  ];

  const displayPosts = posts.length > 0 ? posts : fallbackPosts;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavbarLoggedOut />
        <main className="mx-auto max-w-3xl px-6 py-16 sm:px-8" aria-busy="true" aria-label="Loading posts">
          <div className="animate-pulse">
            <div className="h-10 w-3/4 rounded bg-surface-2" />
            <div className="mt-4 h-5 w-1/2 rounded bg-surface-2" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-border-subtle py-7">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-surface-2" />
                  <div className="h-3 w-24 rounded bg-surface-2" />
                </div>
                <div className="mt-4 h-6 w-3/4 rounded bg-surface-2" />
                <div className="mt-3 h-4 w-full rounded bg-surface-2" />
                <div className="mt-2 h-4 w-5/6 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <NavbarLoggedOut />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8">
          <p role="alert" className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
            {error}
          </p>
          <p className="mt-2 text-sm text-text-secondary">Please try again in a moment.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavbarLoggedOut />
      <main>
        <ExploreHero />

        <div className="mx-auto max-w-3xl px-6 pb-20 sm:px-8">
          <h2 className="sr-only">Recent posts</h2>
          <div className="border-t border-border-subtle">
            {displayPosts.slice(0, 10).map((post) => (
              <PublicPostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Login CTA - always shown */}
          <LoginCTA />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
