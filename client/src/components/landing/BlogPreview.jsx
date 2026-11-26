import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, ArrowRight, ShieldCheck, EyeOff } from "lucide-react";
import { publicService } from "../../services/public.service";

const SectionHeader = ({ showLink = true }) => (
  <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        From the community
      </p>
      <h2 className="font-serif text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
        Latest posts
      </h2>
    </div>
    {showLink && (
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary underline decoration-accent/60 decoration-[1.5px] underline-offset-4 transition hover:text-accent hover:decoration-accent"
      >
        View all <ArrowRight size={15} aria-hidden="true" />
      </Link>
    )}
  </div>
);

const Avatar = ({ author }) => {
  if (author?.avatar) {
    return (
      <img
        src={author.avatar}
        alt=""
        className="h-7 w-7 rounded-full border border-border object-cover"
      />
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-text-primary">
      {(author?.userName || "?").charAt(0).toUpperCase()}
    </span>
  );
};

const BlogPreview = () => {
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
        setError("Could not load recent posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <SectionHeader showLink={false} />
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border-t border-border pt-6">
                <div className="mb-5 h-4 w-32 rounded bg-surface-2" />
                <div className="mb-3 h-6 w-full rounded bg-surface-2" />
                <div className="mb-5 h-6 w-2/3 rounded bg-surface-2" />
                <div className="mb-2 h-4 w-full rounded bg-surface-2" />
                <div className="h-4 w-3/4 rounded bg-surface-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!error && posts.length === 0) {
    return (
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <SectionHeader showLink={false} />
          <div className="border-t border-border pt-8">
            <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
              No stories yet.
            </p>
            <p className="mt-2 max-w-md text-text-secondary">
              Flagger is just getting started. Create an account and publish the first one.
            </p>
            <Link
              to="/register"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-text-primary underline decoration-accent/60 decoration-[1.5px] underline-offset-4 transition hover:text-accent hover:decoration-accent"
            >
              Start writing <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (error && posts.length === 0) {
    return (
      <section className="border-t border-border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
          <SectionHeader showLink={false} />
          <p className="rounded-xl border border-border bg-surface-1 p-8 text-center text-text-secondary">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-border-subtle">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-24">
        <SectionHeader />

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <article key={post._id} className="border-t border-border pt-6">
              <Link to={`/blog/${post._id}`} className="group block h-full">
                <div className="mb-5 flex items-center gap-2.5 text-sm">
                  {post.author ? (
                    <>
                      <Avatar author={post.author} />
                      <span className="font-medium text-text-primary">
                        @{post.author.userName}
                      </span>
                      {(post.author?.isVerified || post.author?.isVerifiedBadge) && (
                        <ShieldCheck
                          size={14}
                          className="text-accent"
                          aria-label="Verified writer"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-text-secondary">
                        <EyeOff size={14} aria-hidden="true" />
                      </span>
                      <span className="font-medium text-text-secondary">Anonymous</span>
                    </>
                  )}
                  <span className="text-text-muted" aria-hidden="true">·</span>
                  <span className="text-text-secondary">{formatDate(post.createdAt)}</span>
                </div>

                <h3 className="line-clamp-3 font-serif text-2xl font-semibold leading-snug tracking-tight text-text-primary decoration-accent decoration-[1.5px] underline-offset-4 group-hover:underline">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-3 line-clamp-3 leading-relaxed text-text-secondary">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-5 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Heart size={15} aria-hidden="true" />
                    {Array.isArray(post.likes) ? post.likes.length : post.likes || 0}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle size={15} aria-hidden="true" />
                    {post.commentsCount || 0}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
