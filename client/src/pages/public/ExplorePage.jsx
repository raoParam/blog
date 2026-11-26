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
          {posts.length > 0 ? (
            <div className="border-t border-border-subtle">
              {posts.slice(0, 10).map((post) => (
                <PublicPostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="border-t border-border-subtle py-14">
              <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
                No stories yet.
              </p>
              <p className="mt-2 max-w-md text-text-secondary">
                Nothing has been published so far. Check back soon, or create an account and write the first one.
              </p>
            </div>
          )}

          {/* Login CTA - always shown */}
          <LoginCTA />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
