import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Edit3, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { setUser } from "../../store/slices/authSlice";
import FeedPostCard from "../../components/feed/FeedPostCard";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ProfileAbout from "../../components/profile/ProfileAbout";
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

const ProfilePageSkeleton = () => (
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
      <div className="h-4 w-40 rounded bg-surface-2" />
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

      <main className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {pageError && (
          <div role="alert" className="mb-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {pageError}
          </div>
        )}

        {loadingPage ? (
          <ProfilePageSkeleton />
        ) : (
          <>
            <ProfileHeader
              avatar={avatar}
              userName={userName}
              fullName={profileFullName}
              verified={isVerifiedUser}
              bio={profile?.bio}
              joinedText={joinedText}
              stats={stats.map((stat) => ({
                ...stat,
                onClick: stat.key === "posts" ? undefined : () => openConnectionsList(stat.key),
              }))}
              action={
                <button
                  type="button"
                  onClick={() => {
                    initializeEditForm(profile || {});
                    setEditOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-2"
                >
                  <Edit3 size={15} aria-hidden="true" />
                  Edit profile
                </button>
              }
            />

            <section className="mt-10">
              <ProfileTabs tabs={["posts", "saved", "about"]} active={activeTab} onChange={setActiveTab} />

              <div>
                {activeTab === "posts" ? (
                  feedPosts.length ? (
                    <div>
                      {feedPosts.map((post) => (
                        <FeedPostCard key={post._id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">No posts yet</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                        Your published posts will show up here.
                      </p>
                      <Link
                        to="/write"
                        className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover"
                      >
                        Write a post
                      </Link>
                    </div>
                  )
                ) : activeTab === "saved" ? (
                  savedPosts.length ? (
                    <div>
                      {savedPosts.map((post) => (
                        <FeedPostCard key={post._id} post={post} onBookmarkClick={handleUnsavePost} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">Nothing saved</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">No saved posts yet.</p>
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
                        value: formatShortDate(profile?.createdAt || profile?.joinedAt) || "Unknown",
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
          <div role="dialog" aria-modal="true" aria-label="Edit profile" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface-1 p-6 shadow-pop">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-text-primary">Edit profile</h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
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
                  className="absolute bottom-0 right-0 inline-flex cursor-pointer rounded-full bg-accent p-1.5 text-accent-fg transition hover:bg-accent-hover"
                  aria-label="Change photo"
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
                <label htmlFor="profile-first-name" className="mb-1.5 block text-sm font-medium text-text-body">First Name</label>
                <input
                  id="profile-first-name"
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[15px] text-text-primary outline-none transition hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
              </div>
              <div>
                <label htmlFor="profile-last-name" className="mb-1.5 block text-sm font-medium text-text-body">Last Name</label>
                <input
                  id="profile-last-name"
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[15px] text-text-primary outline-none transition hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-medium text-text-body">Bio</label>
              <textarea
                id="profile-bio"
                rows={4}
                maxLength={500}
                value={editForm.bio}
                onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))}
                className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-[15px] text-text-primary outline-none transition hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
              <p className="mt-1 text-xs text-text-secondary">{(editForm.bio || "").length}/500</p>
            </div>

            {editError && <p className="mt-3 text-sm text-danger">{editError}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-border-strong px-5 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-60"
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
