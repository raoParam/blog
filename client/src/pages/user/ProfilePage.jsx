import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Edit3, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { setUser } from "../../store/slices/authSlice";
import FeedPostCard from "../../components/feed/FeedPostCard";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";
import LoaderRing from "../../components/common/LoaderRing";
import { profileService } from "../../services/profile.service";

const NAME_REGEX = /^[A-Za-z_]+$/;

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

const normalizeProfilePost = (post, currentUserId, overrides = {}) => {
  const likesArray = Array.isArray(post.likes) ? post.likes : [];
  const commentsCount = post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0);

  return {
    ...post,
    likesCount: likesArray.length,
    commentsCount,
    isLikedByCurrentUser: likesArray.some((id) => String(id) === String(currentUserId)),
    author: overrides.author || post.author || null,
    isSaved: overrides.isSaved || false,
  };
};

const UserRow = ({ person, currentUserId, onToggleFollow, loading }) => {
  const avatar = person?.avatar?.trim();
  const fullName = `${person?.firstName || ""} ${person?.lastName || ""}`.trim() || person?.userName || "User";
  const isSelf = String(person?._id) === String(currentUserId);
  const isVerified = Boolean(person?.isVerified || person?.isVerifiedBadge);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-background px-3 py-2.5">
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
            {isVerified && <ShieldCheck size={13} className="text-accent" />}
          </div>
          <p className="truncate text-xs text-text-secondary">@{person?.userName || "user"}</p>
        </div>
      </div>

      {!isSelf && (
        <button
          type="button"
          onClick={() => onToggleFollow(person)}
          disabled={loading}
          className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition ${
            person?.isFollowing
              ? "border-accent bg-surface-2 text-text-primary"
              : "border-border-strong bg-background text-text-primary hover:border-accent"
          } ${loading ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {person?.isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
};

const ProfilePageSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="rounded-3xl border border-border-subtle bg-background p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-surface" />
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="h-14 w-24 rounded-2xl bg-surface" />
          <div className="h-14 w-24 rounded-2xl bg-surface" />
          <div className="h-14 w-24 rounded-2xl bg-surface" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 w-32 rounded bg-surface" />
        <div className="h-5 w-48 rounded bg-surface" />
        <div className="h-3 w-28 rounded bg-surface" />
      </div>
    </div>
    {[1, 2].map((item) => (
      <div key={item} className="rounded-2xl border border-border-subtle bg-background p-5">
        <div className="h-4 w-1/3 rounded bg-surface" />
        <div className="mt-3 h-3 w-full rounded bg-surface" />
        <div className="mt-2 h-3 w-5/6 rounded bg-surface" />
      </div>
    ))}
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [profile, setProfile] = useState(user || null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  const [listModal, setListModal] = useState({
    open: false,
    type: "followers",
    loading: false,
    users: [],
    error: "",
    actionUserId: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    avatarFile: null,
    avatarPreview: "",
  });

  const profileFullName = useMemo(() => {
    if (!profile) return "";
    return `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  }, [profile]);

  const stats = [
    { label: "Posts", key: "posts", count: feedPosts.length },
    { label: "Followers", key: "followers", count: followersCount },
    { label: "Following", key: "following", count: followingCount },
  ];

  const initializeEditForm = (userData) => {
    setEditForm({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      bio: userData?.bio || "",
      avatarFile: null,
      avatarPreview: userData?.avatar || "",
    });
  };

  const buildAuthorOverride = (me) => {
    if (!me) return null;
    return {
      userName: me.userName,
      avatar: me.avatar,
      firstName: me.firstName,
      lastName: me.lastName,
      isVerified: me.isVerified || me.isVerifiedBadge,
      isVerifiedBadge: me.isVerifiedBadge || me.isVerified,
    };
  };

  const loadProfileData = async () => {
    setLoadingPage(true);
    setPageError("");

    try {
      const [profileRes, postsRes, savedRes] = await Promise.all([
        profileService.getMyProfile(),
        profileService.getMyPosts(),
        profileService.getSavedPosts(),
      ]);

      const me = profileRes?.user || null;
      const rawPosts = postsRes?.blogs || [];
      const rawSaved = savedRes?.savedPosts || [];

      const authorOverride = buildAuthorOverride(me);
      const normalizedOwnPosts = rawPosts.map((post) =>
        normalizeProfilePost(post, me?._id, { author: authorOverride })
      );
      const normalizedSaved = rawSaved.map((post) =>
        normalizeProfilePost(post, me?._id, { isSaved: true })
      );

      setProfile(me);
      setFeedPosts(normalizedOwnPosts);
      setSavedPosts(normalizedSaved);
      setFollowersCount((me?.followers || []).filter(Boolean).length);
      setFollowingCount((me?.following || []).filter(Boolean).length);
      initializeEditForm(me || {});

      if (me) {
        dispatch(setUser(me));
      }
    } catch (error) {
      setPageError(error?.response?.data?.message || "Unable to load profile data.");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openConnectionsList = async (type) => {
    setListModal((prev) => ({ ...prev, open: true, type, loading: true, error: "", users: [] }));
    try {
      const response =
        type === "followers"
          ? await profileService.getFollowers({ page: 1, limit: 100 })
          : await profileService.getFollowing({ page: 1, limit: 100 });

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

  const handleToggleFollow = async (person) => {
    const targetId = person?._id;
    if (!targetId) return;

    setListModal((prev) => ({ ...prev, actionUserId: String(targetId) }));
    try {
      if (person.isFollowing) {
        await profileService.unfollowUser(targetId);
        setFollowingCount((count) => Math.max(0, count - 1));
      } else {
        await profileService.followUser(targetId);
        setFollowingCount((count) => count + 1);
      }

      setListModal((prev) => ({
        ...prev,
        users: prev.users.map((entry) =>
          String(entry._id) === String(targetId) ? { ...entry, isFollowing: !entry.isFollowing } : entry
        ),
      }));
    } catch {
      // ignore
    } finally {
      setListModal((prev) => ({ ...prev, actionUserId: "" }));
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEditForm((prev) => ({ ...prev, avatarFile: file, avatarPreview: previewUrl }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setEditError("");

    const normalizedFirstName = (editForm.firstName || "").trim();
    const normalizedLastName = (editForm.lastName || "").trim();

    if (normalizedFirstName && !NAME_REGEX.test(normalizedFirstName)) {
      setSavingProfile(false);
      setEditError("First name can only contain letters (a-z, A-Z) and underscore (_).");
      return;
    }

    if (normalizedLastName && !NAME_REGEX.test(normalizedLastName)) {
      setSavingProfile(false);
      setEditError("Last name can only contain letters (a-z, A-Z) and underscore (_).");
      return;
    }

    try {
      const response = await profileService.updateProfile({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        bio: editForm.bio,
        avatarFile: editForm.avatarFile,
      });

      const updated = response?.user || {};
      const merged = { ...(profile || {}), ...updated };

      setProfile(merged);
      dispatch(setUser(merged));
      initializeEditForm(merged);
      setEditOpen(false);
    } catch (error) {
      setEditError(error?.response?.data?.message || "Unable to update profile right now.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUnsavePost = async (post) => {
    if (!post?._id) return;
    try {
      await profileService.unsavePost(post._id);
      setSavedPosts((prev) => prev.filter((entry) => String(entry._id) !== String(post._id)));
    } catch {
      // ignore
    }
  };

  const avatar = profile?.avatar?.trim();
  const joinedText = formatJoinedDate(profile?.createdAt || profile?.joinedAt);
  const userName = profile?.userName || user?.userName || "user";
  const isVerifiedUser = Boolean(profile?.isVerified || profile?.isVerifiedBadge);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <HomeNavbar
        user={profile || user}
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
          <div className="mb-4 rounded-2xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {pageError}
          </div>
        )}

        {loadingPage ? (
          <ProfilePageSkeleton />
        ) : (
          <>
            <section className="relative rounded-3xl border border-border-subtle bg-background p-5 shadow-pop sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={userName}
                        className="h-24 w-24 rounded-full border-2 border-border-subtle object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border-subtle bg-background text-2xl font-semibold text-text-primary">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-wrap gap-4">
                    {stats.map((stat) =>
                      stat.key == "posts" ? (
                        <div
                          key={stat.key}
                          className="flex flex-col gap-1 rounded-2xl bg-background px-3 py-2 text-left"
                        >
                          <span className="text-xs text-text-muted">{stat.label}</span>
                          <span className="text-lg font-semibold text-text-primary">{stat.count}</span>
                        </div>
                      ) : (
                        <button
                          key={stat.key}
                          type="button"
                          onClick={() => openConnectionsList(stat.key)}
                          className="flex flex-col gap-1 rounded-2xl bg-background px-3 py-2 text-left transition hover:border hover:border-accent"
                        >
                          <span className="text-xs text-text-muted">{stat.label}</span>
                          <span className="text-lg font-semibold text-text-primary">{stat.count}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-text-secondary">@{userName}</p>
                    {isVerifiedUser && <ShieldCheck size={14} className="text-accent" />}
                  </div>
                  <p className="text-base font-semibold text-text-primary">
                    {profile?.firstName || profile?.lastName ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() : ""}
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-xs font-semibold text-text-secondary">
                  Joined {joinedText || "Unknown"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  initializeEditForm(profile || {});
                  setEditOpen(true);
                }}
                aria-label="Edit profile"
                className="absolute right-4 bottom-4 rounded-full border border-border-subtle bg-background p-3 text-text-primary transition hover:border-accent"
              >
                <Edit3 size={18} />
              </button>
            </section>

            <section className="mt-6">
              <div className="border-b border-border-subtle">
                <div className="flex flex-wrap gap-6 text-sm font-semibold">
                  {["posts", "saved", "about"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`border-b-2 pb-2 text-sm transition ${
                        activeTab === tab
                          ? "border-accent text-accent"
                          : "border-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                {activeTab === "posts" ? (
              feedPosts.length ? (
                <div className="space-y-3">
                  {feedPosts.map((post) => (
                    <FeedPostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border-subtle bg-background p-8 text-center">
                  <Link
                    to="/write"
                    className="inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
                  >
                    Write a Post
                  </Link>
                </div>
              )
            ) : activeTab === "saved" ? (
              savedPosts.length ? (
                <div className="space-y-3">
                  {savedPosts.map((post) => (
                    <FeedPostCard key={post._id} post={post} onBookmarkClick={handleUnsavePost} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border-subtle bg-background p-8 text-center text-sm text-text-secondary">
                  No saved posts yet.
                </div>
              )
                ) : (
                  <div className="rounded-2xl border border-border-subtle bg-background p-6 text-sm text-text-body">
                    <p>
                      <span className="text-text-secondary">Name:</span> {profileFullName || "Anonymous"}
                    </p>
                    <p>
                      <span className="text-text-secondary">Username:</span> @{userName}
                    </p>
                    <p>
                      <span className="text-text-secondary">Bio:</span> {profile?.bio || "No bio yet."}
                    </p>
                    <p>
                      <span className="text-text-secondary">Account Created:</span> {formatShortDate(profile?.createdAt || profile?.joinedAt) || "Unknown"}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {listModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-border-subtle bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary capitalize">{listModal.type}</h2>
              <button
                type="button"
                onClick={() => setListModal((prev) => ({ ...prev, open: false }))}
                className="rounded-full border border-border-subtle p-1 text-text-secondary transition hover:border-accent hover:text-text-primary"
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
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {listModal.users.map((person) => (
                  <UserRow
                    key={person._id}
                    person={person}
                    currentUserId={profile?._id}
                    loading={listModal.actionUserId === String(person._id)}
                    onToggleFollow={handleToggleFollow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-subtle bg-background p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-text-primary">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full border border-border-subtle p-1 text-text-secondary transition hover:border-accent hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 flex flex-col items-center gap-3 sm:flex-row">
              <div className="relative">
                {editForm.avatarPreview ? (
                  <img
                    src={editForm.avatarPreview}
                    alt={userName}
                    className="h-20 w-20 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 text-2xl font-bold text-text-primary">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="profile-avatar-input"
                  className="absolute bottom-0 right-0 inline-flex cursor-pointer rounded-full bg-accent p-1.5 text-accent-fg"
                >
                  <Camera size={14} />
                </label>
                <input
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm text-text-secondary">@{userName}</p>
                <p className="text-base text-text-primary">Click to change photo</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-text-muted">First Name</label>
                <input
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="w-full rounded-2xl border border-border-subtle bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-text-muted">Last Name</label>
                <input
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="w-full rounded-2xl border border-border-subtle bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-text-muted">Bio</label>
              <textarea
                rows={4}
                maxLength={500}
                value={editForm.bio}
                onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))}
                className="w-full resize-none rounded-2xl border border-border-subtle bg-background px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-text-secondary">{(editForm.bio || "").length}/500</p>
            </div>

            {editError && <p className="mt-3 text-sm text-danger">{editError}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full border border-border-subtle px-5 py-2 text-sm font-semibold text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
