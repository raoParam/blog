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
      <div className="min-h-screen bg-[#080B10] font-['Arial'] text-[#EEF3FA]">
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
          className={`fixed left-0 top-16 z-40 transition-transform duration-200 ${
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

        <main className="mx-auto w-full max-w-[1366px] px-4 py-6 sm:px-6">
          <section className="mx-auto max-w-[760px]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {selectedCategory && (
              <div className="mb-4 rounded-xl border border-[#D0D9E5]/25 bg-[#111823] px-3 py-2 text-sm text-[#DDE5F0]">
                Showing category: <span className="font-semibold text-[#7DA6FF]">{selectedCategory}</span>
              </div>
            )}

            {pageError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {pageError}
              </div>
            )}

            {initialLoading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-[#D0D9E5]/20 bg-[#0E1219] p-8 text-center">
                <p className="text-sm text-[#B9C4D3]">
                  {activeTab === "following"
                    ? "No posts from people you follow yet."
                    : "No posts available right now."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <FeedPostCard key={post._id} post={post} />
                ))}

                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                  <div className="rounded-xl border border-[#CDD6E4]/20 bg-[#0E1219] p-3 text-center text-sm text-[#B5C0CF]">
                    <LoaderRing className="mx-auto" />
                  </div>
                )}

                {!hasNext && posts.length > 0 && (
                  <div className="rounded-xl border border-[#CDD6E4]/20 bg-[#0E1219] p-3 text-center text-sm text-[#B5C0CF]">
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
