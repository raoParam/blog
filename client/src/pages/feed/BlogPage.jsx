import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Bookmark, ShieldCheck, CircleUserRound, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { feedService } from "../../services/feed.service";
import { profileService } from "../../services/profile.service";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";
import MarkdownRenderer from "../../components/common/MarkdownRenderer";

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const getReadingTime = (content) => {
  if (typeof content !== "string" || !content.trim()) return 0;
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 220));
};

const BlogPageSkeleton = () => (
  <div className="animate-pulse" aria-busy="true" aria-label="Loading post">
    <div className="h-10 w-5/6 rounded bg-surface-2 sm:h-12" />
    <div className="mt-3 h-10 w-2/3 rounded bg-surface-2 sm:h-12" />
    <div className="mt-8 flex items-center gap-3 border-y border-border-subtle py-4">
      <div className="h-10 w-10 rounded-full bg-surface-2" />
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-surface-2" />
        <div className="h-3 w-40 rounded bg-surface-2" />
      </div>
    </div>
    <div className="mt-10 space-y-3">
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-4 w-5/6 rounded bg-surface-2" />
      <div className="h-4 w-full rounded bg-surface-2" />
      <div className="h-4 w-4/6 rounded bg-surface-2" />
    </div>
  </div>
);

const BlogPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [likingLoading, setLikingLoading] = useState(false);
  const [authorFollowed, setAuthorFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [savedPostIds, setSavedPostIds] = useState(new Set());
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState(1);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const images = useMemo(() => (Array.isArray(post?.images) ? post.images : []), [post?.images]);
  const isAnonymous = !post?.author;
  const authorName = !isAnonymous ? post.author.userName : "Anonymous";
  const authorAvatar = !isAnonymous ? post.author?.avatar?.trim() : "";
  const isAuthorVerified = Boolean(post?.author?.isVerified || post?.author?.isVerifiedBadge);
  const isSaved = post?._id ? savedPostIds.has(String(post._id)) : false;
  const isOwner = Boolean(!isAnonymous && post?.author?._id && String(post.author._id) === String(user?._id));

  useEffect(() => {
    if (!postId) return;
    let mounted = true;

    const loadPage = async () => {
      setLoading(true);
      setError("");
      try {
        const [postRes, commentsRes, meRes] = await Promise.all([
          feedService.getPostById(postId),
          feedService.getComments(postId, { page: 1, limit: 100 }),
          feedService.getCurrentUser(),
        ]);

        if (!mounted) return;
        const nextPost = postRes?.blog || null;
        const me = meRes?.user || null;
        const savedIds = new Set((me?.savedPosts || []).map((id) => String(id)));
        const followingSet = new Set((me?.following || []).map((id) => String(id)));
        const likesArray = Array.isArray(nextPost?.likes) ? nextPost.likes : [];
        const normalizedPost = nextPost
          ? {
              ...nextPost,
              likesCount: likesArray.length,
              isLikedByCurrentUser: likesArray.some((id) => String(id) === String(me?._id)),
            }
          : null;

        setPost(normalizedPost);
        setAuthorFollowed(Boolean(normalizedPost?.author?._id && followingSet.has(String(normalizedPost.author._id))));
        setComments(commentsRes?.comments || []);
        setSavedPostIds(savedIds);
        setCarouselIndex(0);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Unable to load blog.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPage();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setCarouselDirection(1);
    setCarouselIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    if (!images.length) return;
    setCarouselDirection(-1);
    setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleOpenImageViewer = async () => {
    if (!images.length) return;
    setImageViewerOpen(true);

    // Fullscreen must be requested directly from the user click to work on mobile browsers.
    const target = document.documentElement;
    const requestFs =
      target.requestFullscreen ||
      target.webkitRequestFullscreen ||
      target.msRequestFullscreen;

    if (typeof requestFs === "function" && !document.fullscreenElement) {
      try {
        await requestFs.call(target);
      } catch {
        // Keep modal overlay open as fallback when fullscreen is blocked.
      }
    }
  };

  const handleCloseImageViewer = async () => {
    const exitFs = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if ((document.fullscreenElement || document.webkitFullscreenElement) && typeof exitFs === "function") {
      try {
        await exitFs.call(document);
      } catch {
        // Ignore fullscreen exit failures and still close the overlay.
      }
    }
    setImageViewerOpen(false);
  };

  useEffect(() => {
    if (!imageViewerOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseImageViewer();
      } else if (event.key === "ArrowRight" && images.length > 1) {
        handleNextImage();
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        handlePrevImage();
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setImageViewerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-runs only when the viewer opens or the image count changes
  }, [imageViewerOpen, images.length]);

  const handleToggleLike = async () => {
    if (!post?._id || likingLoading) return;
    setLikingLoading(true);
    try {
      const response = await feedService.toggleLike(post._id);
      const payload = response?.likes || {};
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: payload.totalLikes ?? prev.likesCount,
              isLikedByCurrentUser:
                payload.isLikedByUser !== undefined ? payload.isLikedByUser : prev.isLikedByCurrentUser,
            }
          : prev
      );
    } finally {
      setLikingLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!post?._id || savingLoading) return;
    setSavingLoading(true);
    try {
      if (savedPostIds.has(String(post._id))) {
        await feedService.unsavePost(post._id);
        setSavedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(String(post._id));
          return next;
        });
      } else {
        await feedService.savePost(post._id);
        setSavedPostIds((prev) => new Set(prev).add(String(post._id)));
      }
    } finally {
      setSavingLoading(false);
    }
  };

  const handleAddComment = async () => {
    const nextContent = commentText.trim();
    if (!post?._id || !nextContent || commentLoading) return;
    setCommentLoading(true);
    try {
      const response = await feedService.addComment(post._id, nextContent);
      const nextComment = response?.comment;
      if (nextComment) {
        setComments((prev) => [nextComment, ...prev]);
      }
      setCommentText("");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleFollowAuthor = async () => {
    if (!post?.author?._id || followLoading || String(post.author._id) === String(user?._id)) return;
    setFollowLoading(true);
    try {
      if (authorFollowed) {
        await profileService.unfollowUser(post.author._id);
        setAuthorFollowed(false);
      } else {
        await profileService.followUser(post.author._id);
        setAuthorFollowed(true);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAuthorNavigate = () => {
    if (isAnonymous || !post?.author?.userName) return;
    navigate(`/profile/${post.author.userName}`);
  };

  const openEditModal = () => {
    if (!post) return;
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setEditExcerpt(post.excerpt || "");
    setEditOpen(true);
  };

  const handleUpdatePost = async () => {
    if (!post?._id || editSaving) return;
    if (editTitle.trim().length < 5 || editTitle.trim().length > 100) {
      setError("Title must be 5-100 characters long.");
      return;
    }
    if (editContent.trim().length < 10 || editContent.trim().length > 7000) {
      setError("Content must be 10-7000 characters long.");
      return;
    }
    if (editExcerpt.trim().length > 0 && (editExcerpt.trim().length < 10 || editExcerpt.trim().length > 200)) {
      setError("Summary must be 10-200 characters if provided.");
      return;
    }

    setEditSaving(true);
    try {
      const response = await feedService.updatePost(post._id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        excerpt: editExcerpt.trim(),
      });
      const updated = response?.updatedBlog;
      if (updated) {
        setPost((prev) => ({ ...prev, ...updated }));
      }
      setEditOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update post.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post?._id || deleteLoading) return;
    const ok = window.confirm("Delete this blog permanently?");
    if (!ok) return;

    setDeleteLoading(true);
    try {
      await feedService.deletePost(post._id);
      sessionStorage.setItem(
        "success_popup",
        JSON.stringify({
          title: "Blog Deleted",
          message: "Your post has been removed successfully.",
        })
      );
      navigate("/home");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete post.");
    } finally {
      setDeleteLoading(false);
    }
  };

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
          className="fixed inset-0 z-30 bg-black/60"
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-40 transition-transform duration-200 ${
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
          selectedMenuItem=""
          hideCategories
        />
      </aside>

      <main className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {loading ? (
          <BlogPageSkeleton />
        ) : error ? (
          <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-5 py-4 text-sm text-danger">{error}</div>
        ) : !post ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl font-semibold tracking-tight text-text-primary">Post not found</p>
            <p className="mt-2 text-sm text-text-secondary">It may have been removed or the link is wrong.</p>
          </div>
        ) : (
          <article>
            <header>
              <h1 className="font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-5xl">
                {post.title}
              </h1>

              <div className="mt-8 flex flex-col gap-4 border-y border-border-subtle py-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleAuthorNavigate}
                  disabled={isAnonymous}
                  className={`flex items-center gap-3 text-left ${isAnonymous ? "" : "hover:opacity-85"} w-full sm:w-auto`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-text-secondary">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <CircleUserRound size={20} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-text-primary">@{authorName}</p>
                      {isAuthorVerified && <ShieldCheck size={14} className="text-accent" aria-label="Verified writer" />}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {formatDate(post.createdAt)}
                      {getReadingTime(post.content) ? <> · {getReadingTime(post.content)} min read</> : null}
                    </p>
                  </div>
                </button>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
                  {!isAnonymous && !isOwner && (
                    <button
                      type="button"
                      onClick={handleToggleFollowAuthor}
                      disabled={followLoading}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        authorFollowed
                          ? "border border-border-strong text-text-primary hover:bg-surface-2"
                          : "bg-accent text-accent-fg hover:bg-accent-hover"
                      } ${followLoading ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      {followLoading ? "Please wait..." : authorFollowed ? "Following" : "Follow"}
                    </button>
                  )}

                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={openEditModal}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-2"
                      >
                        <Pencil size={14} aria-hidden="true" />
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={handleDeletePost}
                        disabled={deleteLoading}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-danger/40 px-3.5 py-2 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-60"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        {deleteLoading ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </header>

            {images.length > 0 && (
              <section className="mt-8" aria-label="Post images">
                <div className="relative h-[220px] overflow-hidden rounded-lg border border-border-subtle bg-surface-1 sm:h-[320px]">
                  <AnimatePresence mode="wait" custom={carouselDirection}>
                    <Motion.button
                      key={carouselIndex}
                      type="button"
                      onClick={handleOpenImageViewer}
                      className="absolute inset-0 h-full w-full cursor-zoom-in"
                      aria-label="Open image in full screen"
                      custom={carouselDirection}
                      initial={{ opacity: 0, x: carouselDirection > 0 ? 40 : -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: carouselDirection > 0 ? -40 : 40 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                    >
                      <img
                        src={images[carouselIndex]}
                        alt={`${post.title} (image ${carouselIndex + 1} of ${images.length})`}
                        className="h-full w-full object-cover"
                      />
                    </Motion.button>
                  </AnimatePresence>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface-1/90 p-2 text-text-primary transition hover:bg-surface-2"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-surface-1/90 p-2 text-text-primary transition hover:bg-surface-2"
                        aria-label="Next image"
                      >
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2 py-1">
                        {images.map((_, idx) => (
                          <button
                            key={`dot-${idx}`}
                            type="button"
                            onClick={() => {
                              setCarouselDirection(idx > carouselIndex ? 1 : -1);
                              setCarouselIndex(idx);
                            }}
                            className={`h-1.5 w-1.5 rounded-full ${idx === carouselIndex ? "bg-white" : "bg-white/40"}`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <section className="mt-10">
              <MarkdownRenderer content={post.content} />
              {post.excerpt && (
                <aside className="mt-10 border-l-2 border-accent pl-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">Summary</h2>
                  <p className="mt-2 font-serif text-lg leading-relaxed text-text-body">{post.excerpt}</p>
                </aside>
              )}
            </section>

            <div className="mt-12 flex items-center gap-2 border-y border-border-subtle py-3">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={likingLoading}
                aria-pressed={Boolean(post.isLikedByCurrentUser)}
                aria-label={post.isLikedByCurrentUser ? "Unlike post" : "Like post"}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-surface-2 ${
                  post.isLikedByCurrentUser ? "text-danger" : "text-text-secondary hover:text-text-primary"
                } ${likingLoading ? "opacity-60" : ""}`}
              >
                <Heart size={18} aria-hidden="true" className={post.isLikedByCurrentUser ? "fill-current" : ""} />
                <span>{post.likesCount || 0}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingLoading}
                aria-pressed={isSaved}
                aria-label={isSaved ? "Remove from saved" : "Save post"}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-surface-2 ${
                  isSaved ? "text-accent" : "text-text-secondary hover:text-text-primary"
                } ${savingLoading ? "opacity-60" : ""}`}
              >
                <Bookmark size={18} aria-hidden="true" className={isSaved ? "fill-current" : ""} />
              </button>
            </div>

            <section className="mt-12" aria-labelledby="comments-heading">
              <h2 id="comments-heading" className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
                Comments{comments.length > 0 ? ` (${comments.length})` : ""}
              </h2>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                  className="w-full flex-1 resize-none rounded-lg border border-border bg-surface-1 px-3.5 py-2.5 text-[15px] text-text-primary outline-none transition placeholder:text-text-muted focus:border-border-strong"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {commentLoading ? "Posting..." : "Post"}
                </button>
              </div>

              <div className="mt-6">
                {comments.length === 0 ? (
                  <p className="border-t border-border-subtle py-8 text-center text-sm text-text-secondary">
                    No comments yet. Be the first to respond.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-subtle border-y border-border-subtle">
                    {comments.map((comment) => {
                      const commentAuthor = comment.author || null;
                      const isCommentVerified = Boolean(commentAuthor?.isVerified || commentAuthor?.isVerifiedBadge);
                      const commentAvatar = commentAuthor?.avatar?.trim?.() || "";
                      return (
                        <li key={comment._id} className="py-5">
                          <div className="mb-2 flex items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-text-secondary">
                              {commentAvatar ? (
                                <img src={commentAvatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <CircleUserRound size={15} aria-hidden="true" />
                              )}
                            </span>
                            <span className="text-sm font-semibold text-text-primary">@{commentAuthor?.userName || "user"}</span>
                            {isCommentVerified && <ShieldCheck size={13} className="text-accent" aria-label="Verified writer" />}
                            <span className="text-text-muted" aria-hidden="true">·</span>
                            <span className="text-sm text-text-secondary">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="whitespace-pre-wrap break-words pl-[2.375rem] text-[15px] leading-relaxed text-text-body">{comment.content}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </article>
        )}
      </main>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-post-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface-1 p-5 shadow-pop sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="edit-post-title" className="font-serif text-2xl font-semibold tracking-tight text-text-primary">Update post</h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
                aria-label="Close"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-border-strong"
              />
              <textarea
                rows={8}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Content"
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-border-strong"
              />
              <textarea
                rows={2}
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                placeholder="Summary / Excerpt"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-border-strong"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePost}
                disabled={editSaving}
                className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg transition hover:bg-accent-hover disabled:opacity-60"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageViewerOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/95"
          onClick={() => {
            handleCloseImageViewer();
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCloseImageViewer();
            }}
            className="absolute right-4 top-4 z-10 rounded-full border border-border-strong bg-black/50 p-2 text-white"
            aria-label="Close image viewer"
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-strong bg-black/50 p-2 text-white"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-strong bg-black/50 p-2 text-white"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div
            className="flex h-full w-full items-center justify-center px-3 py-12 sm:px-10"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={images[carouselIndex]}
              alt={`Full-screen blog image ${carouselIndex + 1}`}
              className="max-h-[88vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {carouselIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
