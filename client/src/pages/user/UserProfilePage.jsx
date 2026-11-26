import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import FeedPostCard from "../../components/feed/FeedPostCard";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ProfileAbout from "../../components/profile/ProfileAbout";
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
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {avatar ? (
          <img src={avatar} alt={fullName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-text-primary">
            {(person?.userName?.charAt(0) || "U").toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-text-primary">{fullName}</p>
            {isVerified && <ShieldCheck size={13} className="text-accent" aria-label="Verified writer" />}
          </div>
          <p className="truncate text-xs text-text-secondary">@{person?.userName || "user"}</p>
        </div>
      </div>

      {!isSelf && (
        <button
          type="button"
          onClick={() => onToggleFollow(person)}
          disabled={loading}
          className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
            person?.isFollowing
              ? "border-border bg-surface-2 text-text-secondary hover:text-text-primary"
              : "border-border-strong text-text-primary hover:bg-surface-2"
          } ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {person?.isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
};

const UserProfileSkeleton = () => (
  <div className="animate-pulse" aria-busy="true" aria-label="Loading profile">
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
      <div className="h-24 w-24 shrink-0 rounded-full bg-surface-2 sm:h-28 sm:w-28" />
      <div className="flex-1 space-y-3">
        <div className="h-9 w-2/3 rounded bg-surface-2" />
        <div className="h-4 w-32 rounded bg-surface-2" />
        <div className="h-4 w-full max-w-xl rounded bg-surface-2" />
        <div className="h-4 w-56 rounded bg-surface-2" />
      </div>
    </div>
    <div className="mt-10 border-b border-border-subtle pb-3.5">
      <div className="h-4 w-28 rounded bg-surface-2" />
    </div>
    {[1, 2].map((item) => (
      <div key={item} className="border-b border-border-subtle py-7">
        <div className="h-6 w-3/4 rounded bg-surface-2" />
        <div className="mt-3 h-4 w-full rounded bg-surface-2" />
        <div className="mt-2 h-4 w-5/6 rounded bg-surface-2" />
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
    <div className="min-h-screen bg-background text-text-primary">
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

      <main className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {pageError && (
          <div role="alert" className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {pageError}
          </div>
        )}

        {loadingPage ? (
          <UserProfileSkeleton />
        ) : (
          <>
            <ProfileHeader
              avatar={avatar}
              userName={userName}
              fullName={profileFullName}
              verified={isVerifiedUser}
              bio={profile?.bio}
              joinedText={joinedText}
              stats={[
                { key: "posts", label: "Posts", count: posts.length },
                {
                  key: "followers",
                  label: "Followers",
                  count: profile?.followersCount || 0,
                  onClick: () => openConnectionsList("followers"),
                },
                {
                  key: "following",
                  label: "Following",
                  count: profile?.followingCount || 0,
                  onClick: () => openConnectionsList("following"),
                },
              ]}
              action={
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={followLoading || !profile}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                    profile?.isFollowing
                      ? "border border-border-strong text-text-primary hover:bg-surface-2"
                      : "bg-accent text-accent-fg hover:bg-accent-hover"
                  } ${followLoading ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  {followLoading ? "Please wait..." : profile?.isFollowing ? "Following" : "Follow"}
                </button>
              }
            />

            <section className="mt-10">
              <ProfileTabs tabs={["posts", "about"]} active={activeTab} onChange={setActiveTab} />

              <div>
                {activeTab === "posts" ? (
                  posts.length ? (
                    <div>
                      {posts.map((post) => (
                        <FeedPostCard key={post._id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">No posts yet</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">No public posts yet.</p>
                    </div>
                  )
                ) : (
                  <ProfileAbout
                    rows={[
                      { label: "Name", value: profileFullName || "Anonymous" },
                      { label: "Username", value: `@${userName}` },
                      { label: "Bio", value: profile?.bio || "No bio yet." },
                      {
                        label: "Account created",
                        value: formatShortDate(profile?.joinedAt || profile?.createdAt) || "Unknown",
                      },
                    ]}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {listModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div role="dialog" aria-modal="true" aria-label={listModal.type} className="w-full max-w-xl rounded-xl border border-border bg-surface-1 p-5 shadow-pop">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold capitalize tracking-tight text-text-primary">{listModal.type}</h2>
              <button
                type="button"
                onClick={() => setListModal((prev) => ({ ...prev, open: false }))}
                aria-label="Close"
                className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            {listModal.loading ? (
              <div className="flex items-center justify-center py-4">
                <LoaderRing />
              </div>
            ) : listModal.error ? (
              <p className="text-sm text-danger">{listModal.error}</p>
            ) : listModal.users.length === 0 ? (
              <p className="text-sm text-text-secondary">No users found.</p>
            ) : (
              <div className="max-h-[420px] divide-y divide-border-subtle overflow-y-auto pr-1">
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
          <div role="alertdialog" aria-modal="true" aria-labelledby="user-not-found-title" className="w-full max-w-md rounded-xl border border-danger/40 bg-surface-1 p-6 text-center shadow-pop">
            <h2 id="user-not-found-title" className="font-serif text-2xl font-semibold tracking-tight text-text-primary">User not found</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              The profile you are trying to view does not exist or is unavailable.
            </p>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="mt-5 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
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
