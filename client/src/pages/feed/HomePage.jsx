import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { feedService } from "../../services/feed.service";
import SuccessPopup from "../../components/common/SuccessPopup";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";
import FeedTabs from "../../components/feed/FeedTabs";
import FeedPostCard from "../../components/feed/FeedPostCard";
import FeedSkeleton from "../../components/feed/FeedSkeleton";
import Footer from "../../components/layout/Footer";
import LoaderRing from "../../components/common/LoaderRing";

const FEED_LIMIT = 10;

const normalizePost = (post, currentUserId, savedPostIds) => {
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const likesCount = likesArray.length;
  const isLikedByCurrentUser = likesArray.some((id) => String(id) === String(currentUserId));

  return {
    ...post,
    likesCount,
    isLikedByCurrentUser,
    isSaved: savedPostIds.has(String(post._id)),
    commentsCount: post.commentsCount || 0,
  };
};

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [popup, setPopup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("for-you");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageError, setPageError] = useState("");
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(user || null);

  const sentinelRef = useRef(null);
  const requestInFlight = useRef(false);
  const hasNextRef = useRef(true);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const lastLoadAtRef = useRef(0);

  useEffect(() => {
    const rawPopup = sessionStorage.getItem("success_popup");
    if (!rawPopup) return;
    try {
      setPopup(JSON.parse(rawPopup));
    } catch {
      setPopup(null);
    }
  }, []);

  const handleClosePopup = () => {
    setPopup(null);
    sessionStorage.removeItem("success_popup");
  };

  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);

  useEffect(() => {
    loadingRef.current = initialLoading || loadingMore;
  }, [initialLoading, loadingMore]);

  useEffect(() => {
    pageRef.current = currentPage;
  }, [currentPage]);

  const fetchFeedByMode = useCallback(
    async (page) => {
      if (selectedCategory) {
        return feedService.getCategoryFeed({ category: selectedCategory, page, limit: FEED_LIMIT });
      }
      if (activeTab === "trending") {
        return feedService.getTrendingFeed({ page, limit: FEED_LIMIT });
      }
      if (activeTab === "following") {
        return feedService.getFollowingFeed({ page, limit: FEED_LIMIT });
      }
      return feedService.getForYouFeed({ page, limit: FEED_LIMIT });
    },
    [activeTab, selectedCategory]
  );

  const loadFeed = useCallback(
    async ({ page, reset = false, externalSavedIds = null, externalUserId = null }) => {
      if (requestInFlight.current) return;
      requestInFlight.current = true;

      if (reset) {
        setInitialLoading(true);
        setPageError("");
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetchFeedByMode(page);
        const blogs = response?.blogs || [];
        const savedIds = externalSavedIds || savedPostIds;
        const userId = externalUserId || currentUser?._id || user?._id;

        const mapped = blogs.map((post) => normalizePost(post, userId, savedIds));

        setPosts((prev) => {
          if (reset) return mapped;
          const existing = new Set(prev.map((post) => String(post._id)));
          const next = mapped.filter((post) => !existing.has(String(post._id)));
          return [...prev, ...next];
        });

        setCurrentPage(response?.pagination?.currentPage || page);
        setHasNext(Boolean(response?.pagination?.hasNext));
      } catch (error) {
        const message = error.response?.data?.message || "Unable to load feed right now.";
        setPageError(message);
      } finally {
        requestInFlight.current = false;
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [currentUser?._id, fetchFeedByMode, savedPostIds, user?._id]
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const [categoriesResponse, meResponse] = await Promise.all([
          feedService.getCategories(),
          feedService.getCurrentUser(),
        ]);

        if (!mounted) return;

        const me = meResponse?.user || null;
        const nextSavedIds = new Set((me?.savedPosts || []).map((id) => String(id)));

        setCategories(categoriesResponse?.categories || []);
        setCurrentUser(me);
        setSavedPostIds(nextSavedIds);

        await loadFeed({
          page: 1,
          reset: true,
          externalSavedIds: nextSavedIds,
          externalUserId: me?._id,
        });
        setBootstrapped(true);
      } catch (error) {
        if (!mounted) return;
        const message = error.response?.data?.message || "Unable to load homepage data.";
        setPageError(message);
        setInitialLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    loadFeed({ page: 1, reset: true });
  }, [activeTab, selectedCategory, loadFeed, bootstrapped]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const now = Date.now();
        if (
          entry.isIntersecting &&
          bootstrapped &&
          hasNextRef.current &&
          !requestInFlight.current &&
          !loadingRef.current &&
          now - lastLoadAtRef.current > 600
        ) {
          lastLoadAtRef.current = now;
          loadFeed({ page: pageRef.current + 1 });
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadFeed, bootstrapped]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <div className="min-h-screen bg-background text-text-primary">
        <HomeNavbar
          user={currentUser || user}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setMenuOpen((prev) => !prev)}
          onWrite={() => navigate("/write")}
        />

        {menuOpen && (
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/55"
          />
        )}

        <aside
          className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] overflow-hidden transition-transform duration-200 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <HomeSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(name) => {
              setSelectedCategory(name);
            }}
            onClearCategory={() => setSelectedCategory("")}
            onCloseMenu={() => setMenuOpen(false)}
            onHomeClick={() => {
              setMenuOpen(false);
              navigate("/home");
            }}
            onWriteClick={() => {
              setMenuOpen(false);
              navigate("/write");
            }}
            selectedMenuItem="home"
          />
        </aside>

        <main className="mx-auto w-full max-w-[1366px] px-4 pb-16 pt-6 sm:px-6">
          <section className="mx-auto max-w-[720px]">
            <h1 className="sr-only">Your feed</h1>
            <div className="flex items-center justify-between gap-3">
              <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {selectedCategory && (
              <div className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
                <span className="h-px w-6 bg-accent" aria-hidden="true" />
                Showing category: <span className="font-semibold text-text-primary">{selectedCategory}</span>
              </div>
            )}

            {pageError && (
              <div role="alert" className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {pageError}
              </div>
            )}

            {initialLoading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
                  {activeTab === "following" ? "Nothing here yet" : "Nothing to read yet"}
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                  {activeTab === "following"
                    ? "No posts from people you follow yet."
                    : "No posts available right now."}
                </p>
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <FeedPostCard key={post._id} post={post} />
                ))}

                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                  <div className="py-8 text-center text-sm text-text-body">
                    <LoaderRing className="mx-auto" />
                  </div>
                )}

                {!hasNext && posts.length > 0 && (
                  <div className="py-10 text-center text-sm text-text-muted">
                    You&apos;ve reached the end.
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>

      <SuccessPopup
        isOpen={Boolean(popup)}
        title={popup?.title || ""}
        message={popup?.message || ""}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default HomePage;
