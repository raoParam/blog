import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Edit3, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { setUser } from "../../store/slices/authSlice";
import FeedPostCard from "../../components/feed/FeedPostCard";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";
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

    try {
      const response = await profileService.updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
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
    <div className="min-h-screen bg-[#020307] text-[#E9EDF3]">
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
                {stats.map((stat) =>
                  stat.key == "posts" ? (
                    <div
                      key={stat.key}
                      className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left"
                    >
                      <span className="text-xs text-[#6E7489]">{stat.label}</span>
                      <span className="text-lg font-semibold text-[#F8FBFF]">{stat.count}</span>
                    </div>
                  ) : (
                    <button
                      key={stat.key}
                      type="button"
                      onClick={() => openConnectionsList(stat.key)}
                      className="flex flex-col gap-1 rounded-2xl bg-[#04060C] px-3 py-2 text-left transition hover:border hover:border-[#7FA8CA]"
                    >
                      <span className="text-xs text-[#6E7489]">{stat.label}</span>
                      <span className="text-lg font-semibold text-[#F8FBFF]">{stat.count}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <p className="text-sm text-[#8C95A7]">@{userName}</p>
                {isVerifiedUser && <ShieldCheck size={14} className="text-[#5CA6FF]" />}
              </div>
              <p className="text-base font-semibold text-[#F3F7FF]">
                {profile?.firstName || profile?.lastName ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() : ""}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs font-semibold text-[#8C95A7]">
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
            className="absolute right-4 bottom-4 rounded-full border border-[#1F2130] bg-[#0B0E17] p-3 text-[#EAF1FF] transition hover:border-[#7FA8CA]"
          >
            <Edit3 size={18} />
          </button>
        </section>

        <section className="mt-6">
          <div className="border-b border-[#1F293B]">
            <div className="flex flex-wrap gap-6 text-sm font-semibold">
              {["posts", "saved", "about"].map((tab) => (
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
              <div className="rounded-2xl border border-[#1F2737] bg-[#05070B] p-8 text-center text-sm text-[#8C99B3]">
                Loading profile...
              </div>
            ) : activeTab === "posts" ? (
              feedPosts.length ? (
                <div className="space-y-3">
                  {feedPosts.map((post) => (
                    <FeedPostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#1F2737] bg-[#05070B] p-8 text-center">
                  <Link
                    to="/write"
                    className="inline-flex rounded-full bg-[#5CA6FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6CB0FF]"
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
                <div className="rounded-2xl border border-[#1F2737] bg-[#05070B] p-8 text-center text-sm text-[#9EA9C1]">
                  No saved posts yet.
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
                  <span className="text-[#7D8BA0]">Account Created:</span> {formatShortDate(profile?.createdAt || profile?.joinedAt) || "Unknown"}
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
              <p className="text-sm text-[#9EA9C1]">Loading...</p>
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
          <div className="w-full max-w-2xl rounded-2xl border border-[#1F2635] bg-[#05070B] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#F3F7FD]">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full border border-[#1F2635] p-1 text-[#8F9CB4] transition hover:border-[#5CA6FF] hover:text-white"
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
                    className="h-20 w-20 rounded-full border border-[#2A3546] object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#131B2A] text-2xl font-bold text-[#EEF3FA]">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="profile-avatar-input"
                  className="absolute bottom-0 right-0 inline-flex cursor-pointer rounded-full bg-[#5CA6FF] p-1.5 text-white"
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
                <p className="text-sm text-[#9EB0CC]">@{userName}</p>
                <p className="text-base text-[#F3F7FF]">Click to change photo</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[#6D7C99]">First Name</label>
                <input
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="w-full rounded-2xl border border-[#1F2635] bg-[#07090E] px-3 py-2 text-sm text-[#ECF1FF] outline-none focus:border-[#5CA6FF]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[#6D7C99]">Last Name</label>
                <input
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="w-full rounded-2xl border border-[#1F2635] bg-[#07090E] px-3 py-2 text-sm text-[#ECF1FF] outline-none focus:border-[#5CA6FF]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-[0.3em] text-[#6D7C99]">Bio</label>
              <textarea
                rows={4}
                maxLength={500}
                value={editForm.bio}
                onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))}
                className="w-full resize-none rounded-2xl border border-[#1F2635] bg-[#07090E] px-3 py-2 text-sm text-[#ECF1FF] outline-none focus:border-[#5CA6FF]"
              />
              <p className="mt-1 text-xs text-[#7C8AA5]">{(editForm.bio || "").length}/500</p>
            </div>

            {editError && <p className="mt-3 text-sm text-red-300">{editError}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-full border border-[#1F2635] px-5 py-2 text-sm font-semibold text-[#EDF1FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="rounded-full bg-[#5CA6FF] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6DB5FF] disabled:opacity-60"
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
