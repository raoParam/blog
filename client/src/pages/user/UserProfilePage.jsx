import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import FeedPostCard from "../../components/feed/FeedPostCard";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";
import LoaderRing from "../../components/common/LoaderRing";
import { profileService } from "../../services/profile.service";

const formatJoinedDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const formatShortDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const normalizePost = (post, currentUserId) => {
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const commentsCount = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);
  return {
    ...post,
    likesCount: likesArray.length,
    commentsCount,
    isLikedByCurrentUser: likesArray.some((id) => String(id) === String(currentUserId)),
    isSaved: false,
  };
};

const UserRow = ({ person, currentUserId, onToggleFollow, loading }) => {
  const avatar = person?.avatar?.trim();
  const fullName = `${person?.firstName || ""} ${person?.lastName || ""}`.trim() || person?.userName || "User";
  const isSelf = String(person?._id) === String(currentUserId);
  const isVerified = Boolean(person?.isVerified || person?.isVerifiedBadge);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#1F2634] bg-[#07080D] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {avatar ? (
          <img src={avatar} alt={fullName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#131B2A] text-sm font-semibold text-[#E7EDF6]">
            {(person?.userName?.charAt(0) || "U").toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-[#EDF3FF]">{fullName}</p>
            {isVerified && <ShieldCheck size={13} className="text-[#5CA6FF]" />}
          </div>
          <p className="truncate text-xs text-[#97A2B7]">@{person?.userName || "user"}</p>
        </div>
      </div>

      {!isSelf && (
        <button
          type="button"
          onClick={() => onToggleFollow(person)}
          disabled={loading}
          className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition ${
            person?.isFollowing
              ? "border-[#5CA6FF] bg-[#111A2B] text-[#DDE8FF]"
              : "border-[#4B5568] bg-[#0B0E13] text-[#E7EDF6] hover:border-[#5CA6FF]"
          } ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {person?.isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
};

const UserProfileSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="rounded-3xl border border-[#10131B] bg-[#020307] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-[#111827]" />
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="h-14 w-24 rounded-2xl bg-[#111827]" />
          <div className="h-14 w-24 rounded-2xl bg-[#111827]" />
          <div className="h-14 w-24 rounded-2xl bg-[#111827]" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 w-32 rounded bg-[#111827]" />
        <div className="h-5 w-48 rounded bg-[#111827]" />
        <div className="h-3 w-28 rounded bg-[#111827]" />
      </div>
    </div>
    {[1, 2].map((item) => (
      <div key={item} className="rounded-2xl border border-[#1F2737] bg-[#05070B] p-5">
        <div className="h-4 w-1/3 rounded bg-[#111827]" />
        <div className="mt-3 h-3 w-full rounded bg-[#111827]" />
        <div className="mt-2 h-3 w-5/6 rounded bg-[#111827]" />
      </div>
    ))}
  </div>
);

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [showNotFoundPopup, setShowNotFoundPopup] = useState(false);
  const [listModal, setListModal] = useState({
    open: false,
    type: "followers",
    loading: false,
    users: [],
    error: "",
    actionUserId: "",
  });

  const profileFullName = useMemo(() => {
    if (!profile) return "";
    return `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  }, [profile]);

  useEffect(() => {
    if (!username) return;
    if (user?.userName && user.userName.toLowerCase() === username.toLowerCase()) {
      navigate("/profile", { replace: true });
      return;
    }

    let mounted = true;
    const loadData = async () => {
      setLoadingPage(true);
      setPageError("");
      setShowNotFoundPopup(false);
      try {
        const [profileRes, postsRes] = await Promise.all([
          profileService.getUserProfile(username),
          profileService.getUserPosts(username, { page: 1, limit: 20 }),
        ]);

        if (!mounted) return;
        const nextProfile = profileRes?.user || null;
        const nextPosts = (postsRes?.posts || []).map((post) => normalizePost(post, user?._id));

        setProfile(nextProfile);
        setPosts(nextPosts);
      } catch (error) {
        if (!mounted) return;
        if (error?.response?.status === 404) {
          setShowNotFoundPopup(true);
          setPageError("");
        } else {
          setPageError(error?.response?.data?.message || "Unable to load user profile.");
        }
      } finally {
        if (mounted) setLoadingPage(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [username, user?.userName, user?._id, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleToggleFollow = async () => {
    if (!profile?._id || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await profileService.unfollowUser(profile._id);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: false,
                followersCount: Math.max(0, (prev.followersCount || 0) - 1),
              }
            : prev
        );
      } else {
        await profileService.followUser(profile._id);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: true,
                followersCount: (prev.followersCount || 0) + 1,
              }
            : prev
        );
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const openConnectionsList = async (type) => {
    if (!profile?._id) return;
    setListModal((prev) => ({ ...prev, open: true, type, loading: true, error: "", users: [] }));
    try {
      const response =
        type === "followers"
          ? await profileService.getFollowers({ page: 1, limit: 100, userId: profile._id })
          : await profileService.getFollowing({ page: 1, limit: 100, userId: profile._id });

      setListModal((prev) => ({
        ...prev,
        loading: false,
        users: type === "followers" ? response?.followers || [] : response?.following || [],
      }));
    } catch (error) {
      setListModal((prev) => ({
        ...prev,
        loading: false,
        error: error?.response?.data?.message || "Unable to load list.",
      }));
    }
  };

  const handleToggleFollowFromList = async (person) => {
    const targetId = person?._id;
    if (!targetId) return;

    setListModal((prev) => ({ ...prev, actionUserId: String(targetId) }));
    try {
      if (person.isFollowing) {
        await profileService.unfollowUser(targetId);
      } else {
        await profileService.followUser(targetId);
      }

      setListModal((prev) => ({
        ...prev,
        users: prev.users.map((entry) =>
          String(entry._id) === String(targetId) ? { ...entry, isFollowing: !entry.isFollowing } : entry
        ),
      }));

      if (String(targetId) === String(profile?._id)) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !person.isFollowing,
                followersCount: person.isFollowing
                  ? Math.max(0, (prev.followersCount || 0) - 1)
                  : (prev.followersCount || 0) + 1,
              }
            : prev
        );
      }
    } finally {
      setListModal((prev) => ({ ...prev, actionUserId: "" }));
    }
  };

  const avatar = profile?.avatar?.trim();
  const userName = profile?.userName || username || "user";
  const joinedText = formatJoinedDate(profile?.joinedAt || profile?.createdAt);
  const isVerifiedUser = Boolean(profile?.isVerified || profile?.isVerifiedBadge);

  return (
    <div className="min-h-screen bg-[#020307] text-[#E9EDF3]">
      <HomeNavbar
        user={user}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMenuOpen((prev) => !prev)}
        onWrite={() => navigate("/write")}
      />

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <HomeSidebar
          categories={[]}
          selectedCategory=""
          onSelectCategory={() => {}}
          onClearCategory={() => {}}
          onCloseMenu={() => setMenuOpen(false)}
          onHomeClick={() => navigate("/home")}
          onWriteClick={() => navigate("/write")}
          selectedMenuItem="profile"
          hideCategories
        />
      </aside>

      <main className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-6">
        {pageError && (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {pageError}
          </div>
        )}

        <section className="relative rounded-3xl border border-[#10131B] bg-[#020307] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.6)] sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={userName}
                    className="h-24 w-24 rounded-full border-2 border-[#1F2130] object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#1F2130] bg-[#0B0E17] text-2xl font-semibold text-[#F8FBFF]">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-wrap gap-4">
                <div className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left">
                  <span className="text-xs text-[#6E7489]">Posts</span>
                  <span className="text-lg font-semibold text-[#F8FBFF]">{posts.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openConnectionsList("followers")}
                  className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left transition hover:border hover:border-[#7FA8CA]"
                >
                  <span className="text-xs text-[#6E7489]">Followers</span>
                  <span className="text-lg font-semibold text-[#F8FBFF]">{profile?.followersCount || 0}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openConnectionsList("following")}
                  className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left transition hover:border hover:border-[#7FA8CA]"
                >
                  <span className="text-xs text-[#6E7489]">Following</span>
                  <span className="text-lg font-semibold text-[#F8FBFF]">{profile?.followingCount || 0}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-[#8C95A7]">@{userName}</p>
                  {isVerifiedUser && <ShieldCheck size={14} className="text-[#5CA6FF]" />}
                </div>
                <p className="text-base font-semibold text-[#F3F7FF]">{profileFullName}</p>
              </div>

              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={followLoading || !profile}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  profile?.isFollowing
                    ? "border border-[#4B5568] bg-[#0B0E13] text-[#E7EDF6] hover:border-[#5CA6FF]"
                    : "bg-[#5CA6FF] text-white hover:bg-[#6CB0FF]"
                } ${followLoading ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {followLoading ? "Please wait..." : profile?.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs font-semibold text-[#8C95A7]">Joined {joinedText || "Unknown"}</p>
          </div>
        </section>

        <section className="mt-6">
          <div className="border-b border-[#1F293B]">
            <div className="flex flex-wrap gap-6 text-sm font-semibold">
              {["posts", "about"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 pb-2 text-sm transition ${
                    activeTab === tab
                      ? "border-[#5CA6FF] text-[#5CA6FF]"
                      : "border-transparent text-[#90A1C2] hover:text-[#D2DCFF]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {loadingPage ? (
              <UserProfileSkeleton />
            ) : activeTab === "posts" ? (
              posts.length ? (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <FeedPostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#1F2737] bg-[#05070B] p-8 text-center text-sm text-[#9EA9C1]">
                  No public posts yet.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-[#1F2737] bg-[#05070B] p-6 text-sm text-[#A9B5CE]">
                <p>
                  <span className="text-[#7D8BA0]">Name:</span> {profileFullName || "Anonymous"}
                </p>
                <p>
                  <span className="text-[#7D8BA0]">Username:</span> @{userName}
                </p>
                <p>
                  <span className="text-[#7D8BA0]">Bio:</span> {profile?.bio || "No bio yet."}
                </p>
                <p>
                  <span className="text-[#7D8BA0]">Account Created:</span>{" "}
                  {formatShortDate(profile?.joinedAt || profile?.createdAt) || "Unknown"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {listModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#1F2635] bg-[#05070B] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F3F7FF] capitalize">{listModal.type}</h2>
              <button
                type="button"
                onClick={() => setListModal((prev) => ({ ...prev, open: false }))}
                className="rounded-full border border-[#1F2635] p-1 text-[#8F9CB4] transition hover:border-[#5CA6FF] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {listModal.loading ? (
              <div className="flex items-center justify-center py-4">
                <LoaderRing />
              </div>
            ) : listModal.error ? (
              <p className="text-sm text-red-300">{listModal.error}</p>
            ) : listModal.users.length === 0 ? (
              <p className="text-sm text-[#9EA9C1]">No users found.</p>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {listModal.users.map((person) => (
                  <UserRow
                    key={person._id}
                    person={person}
                    currentUserId={user?._id}
                    loading={listModal.actionUserId === String(person._id)}
                    onToggleFollow={handleToggleFollowFromList}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showNotFoundPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#140C11] p-6 text-center">
            <h2 className="text-xl font-semibold text-[#FFDCE2]">User not found</h2>
            <p className="mt-2 text-sm text-[#FFC6CF]">
              The profile you are trying to view does not exist or is unavailable.
            </p>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-5 rounded-xl bg-[#2A4E88] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3663AA]"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
