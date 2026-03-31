import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { feedService } from "../../services/feed.service";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";

const TITLE_MIN = 5;
const TITLE_MAX = 100;
const CONTENT_MIN = 10;
const CONTENT_MAX = 7000;
const EXCERPT_MIN = 10;
const EXCERPT_MAX = 200;
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const getWordCount = (text) => {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
};

const WritePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const readMinutes = useMemo(() => Math.max(1, Math.ceil(wordCount / 200)), [wordCount]);
  const titleLength = title.trim().length;
  const contentLength = content.trim().length;
  const excerptLength = excerpt.trim().length;

  const getValidationErrors = () => {
    const errors = [];

    if (titleLength < TITLE_MIN || titleLength > TITLE_MAX) {
      errors.push(`Title must be ${TITLE_MIN}-${TITLE_MAX} characters long.`);
    }

    if (contentLength < CONTENT_MIN || contentLength > CONTENT_MAX) {
      errors.push(`Content must be ${CONTENT_MIN}-${CONTENT_MAX} characters long.`);
    }

    if (excerptLength > 0 && (excerptLength < EXCERPT_MIN || excerptLength > EXCERPT_MAX)) {
      errors.push(`Summary/Excerpt must be ${EXCERPT_MIN}-${EXCERPT_MAX} characters or left blank.`);
    }

    if (images.length > MAX_IMAGES) {
      errors.push(`You can upload maximum ${MAX_IMAGES} images.`);
    }

    return errors;
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handlePickImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const invalidType = files.find((file) => !file.type?.startsWith("image/"));
    if (invalidType) {
      setError("Only image files are allowed.");
      return;
    }

    const oversized = files.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) {
      setError("Each image must be 10MB or smaller.");
      return;
    }

    const limited = [...images, ...files].slice(0, MAX_IMAGES);
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Only ${MAX_IMAGES} images are allowed. Extra images were ignored.`);
    } else {
      setError("");
    }
    setImages(limited);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePublish = async () => {
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      return;
    }
    setError("");

    try {
      setSubmitting(true);
      await feedService.createPost({
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        visibility,
        images,
      });

      sessionStorage.setItem(
        "success_popup",
        JSON.stringify({
          title: "Post Published",
          message: "Your story is live on Flagger.",
        })
      );
      navigate("/home");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to publish post right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F2F2F2]">
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
          selectedMenuItem="write"
          hideCategories
        />
      </aside>

      <main className="mx-auto w-full max-w-[1366px] px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-[#1E1F23] bg-[#090A0D] p-5">
            <div className="mb-4 flex items-center justify-between border-b border-[#1C1D22] pb-4">
              <div>
                <h1 className="text-xl font-semibold text-[#F9F9F9]">Write New Story</h1>
                <p className="text-sm text-[#C7C7C9]">Draft your post and publish when ready.</p>
              </div>
              <button
                type="button"
                onClick={handlePublish}
                disabled={submitting}
                className="rounded-xl bg-[#1E3E73] px-4 py-2 text-sm font-semibold text-[#F8FBFF] transition hover:bg-[#2A4E88] disabled:opacity-60"
              >
                {submitting ? "Publishing..." : "Publish"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#B9BABE]">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={TITLE_MAX}
                  placeholder="Write your headline..."
                  className="w-full rounded-xl border border-[#2A2C31] bg-[#0C0D11] px-4 py-3 text-[15px] text-[#F1F1F2] outline-none transition focus:border-[#355D9A]"
                />
                <p className="mt-1 text-right text-xs text-[#9A9BA1]">
                  {titleLength}/{TITLE_MAX} (min {TITLE_MIN})
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#B9BABE]">Content</label>
                <textarea
                  rows={16}
                  maxLength={CONTENT_MAX}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Start writing your story..."
                  className="w-full resize-y rounded-xl border border-[#2A2C31] bg-[#0C0D11] px-4 py-3 text-[15px] leading-7 text-[#ECECEE] outline-none transition focus:border-[#355D9A]"
                />
                <p className="mt-1 text-right text-xs text-[#9A9BA1]">
                  {contentLength}/{CONTENT_MAX} (min {CONTENT_MIN})
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#B9BABE]">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  maxLength={EXCERPT_MAX}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Short summary for cards and previews..."
                  className="w-full resize-none rounded-xl border border-[#2A2C31] bg-[#0C0D11] px-4 py-3 text-[14px] text-[#ECECEE] outline-none transition focus:border-[#355D9A]"
                />
                <p className="mt-1 text-right text-xs text-[#9A9BA1]">
                  {excerptLength}/{EXCERPT_MAX} (min {EXCERPT_MIN} if provided)
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#B9BABE]">Images (max {MAX_IMAGES}, 10MB each)</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#2E3036] bg-[#101114] px-3 py-1.5 text-xs text-[#E7E7E8] hover:border-[#355D9A]">
                    <ImagePlus size={14} />
                    Add Images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages} />
                  </label>
                </div>

                {images.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#30333A] bg-[#0A0B0F] px-4 py-6 text-center text-sm text-[#A9AAB0]">
                    No images selected.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-lg border border-[#2A2D33]">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute right-1.5 top-1.5 rounded-md bg-black/70 p-1 text-white"
                          aria-label="Remove image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#22242A] bg-[#0A0B0F] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[#F0F0F1]">Post Settings</h2>

              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[#B8B9BD]">Visibility</label>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="mb-3 w-full rounded-lg border border-[#2A2D33] bg-[#0C0D11] px-3 py-2 text-sm text-[#ECECEE] outline-none focus:border-[#355D9A]"
              >
                <option value="public">Public</option>
                <option value="anonymous">Anonymous</option>
              </select>
            </section>

            <section className="rounded-2xl border border-[#22242A] bg-[#0A0B0F] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[#F0F0F1]">Live Stats</h2>
              <div className="space-y-2 text-sm text-[#C2C3C8]">
                <p className="flex items-center justify-between">
                  <span>Words</span>
                  <span className="font-semibold text-[#F1F1F2]">{wordCount}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Read Time</span>
                  <span className="font-semibold text-[#F1F1F2]">{readMinutes} min</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Images</span>
                  <span className="font-semibold text-[#F1F1F2]">{images.length}/{MAX_IMAGES}</span>
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#22242A] bg-[#0A0B0F] p-4">
              <h2 className="mb-3 text-sm font-semibold text-[#F0F0F1]">Publishing Constraints</h2>
              <div className="space-y-1.5 text-xs text-[#BFC0C5]">
                <p>Title: {TITLE_MIN}-{TITLE_MAX} characters</p>
                <p>Content: {CONTENT_MIN}-{CONTENT_MAX} characters</p>
                <p>Summary: {EXCERPT_MIN}-{EXCERPT_MAX} characters (optional)</p>
                <p>Images: up to {MAX_IMAGES}, image files only, max 10MB each</p>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#5E2A35] bg-[#120A0D] p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
            <h2 className="mb-3 text-2xl font-semibold text-[#FFE3E8]">Publishing Error</h2>
            <p className="mx-auto max-w-xl text-[15px] leading-7 text-[#FFC8D1]">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-5 rounded-xl border border-[#4A4D54] bg-[#1A1B20] px-5 py-2 text-sm font-semibold text-[#F0F0F2] hover:border-[#355D9A] hover:bg-[#20222A]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritePage;
