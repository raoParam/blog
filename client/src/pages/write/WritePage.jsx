import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ImagePlus,
  Trash2,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  FileText,
  Clock,
  Type,
  Layers,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { feedService } from "../../services/feed.service";
import HomeNavbar from "../../components/feed/HomeNavbar";
import HomeSidebar from "../../components/feed/HomeSidebar";
import MarkdownRenderer from "../../components/common/MarkdownRenderer";
import MarkdownToolbar from "../../components/write/MarkdownToolbar";
import MarkdownGuideModal from "../../components/write/MarkdownGuideModal";

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
  const textareaRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Markdown Options State
  const [editorMode, setEditorMode] = useState("write"); // "write" | "preview" | "split"
  const [markdownEnabled, setMarkdownEnabled] = useState(true);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

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

  const handleInsertMarkdown = (prefix, suffix = "", defaultText = "", isBlock = false) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = content;
    const selectedText = previousText.substring(start, end);
    const replacementText = selectedText || defaultText;

    let before = previousText.substring(0, start);
    const after = previousText.substring(end);

    if (isBlock && before.length > 0 && !before.endsWith("\n")) {
      before = before + "\n";
    }

    const insertion = `${prefix}${replacementText}${suffix}`;
    const newContent = `${before}${insertion}${after}`;

    setContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = before.length + prefix.length;
      const cursorEnd = cursorStart + replacementText.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        handleInsertMarkdown("**", "**", "bold text");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        handleInsertMarkdown("*", "*", "italic text");
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        handleInsertMarkdown("[", "](https://example.com)", "link text");
      }
    }
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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-body)] transition-colors duration-200">
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
          {/* Main Editing Area */}
          <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] transition-colors">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--divider)] pb-4">
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-heading)]">Write New Story</h1>
                <p className="text-sm text-[var(--text-secondary)]">Draft your post with Markdown support and publish when ready.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={submitting}
                  className="rounded-xl bg-[var(--btn-primary-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-primary-text)] shadow-sm transition hover:bg-[var(--btn-primary-hover)] disabled:opacity-60"
                >
                  {submitting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={TITLE_MAX}
                  placeholder="Write your headline..."
                  className="w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] px-4 py-3 text-[15px] text-[var(--text-heading)] outline-none transition focus:border-[var(--border-focus)] placeholder:text-[var(--text-muted)]"
                />
                <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                  {titleLength}/{TITLE_MAX} (min {TITLE_MIN})
                </p>
              </div>

              {/* Content Editor with Markdown Mode */}
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">
                      Content
                    </label>
                    {markdownEnabled && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)]/40 bg-[var(--bg-surface-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                        <Sparkles size={10} />
                        Markdown
                      </span>
                    )}
                  </div>

                  {/* Mode Selector & Markdown Option Toggle */}
                  <div className="flex items-center gap-2">
                    {/* Markdown Enable/Disable Switch */}
                    <button
                      type="button"
                      onClick={() => setMarkdownEnabled((prev) => !prev)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                        markdownEnabled
                          ? "border-[var(--border-focus)] bg-[var(--bg-surface-hover)] text-[var(--text-heading)]"
                          : "border-[var(--border-input)] bg-[var(--bg-surface-input)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                      }`}
                      title={markdownEnabled ? "Markdown enabled" : "Plain text mode"}
                    >
                      <Sparkles size={12} />
                      <span>{markdownEnabled ? "Markdown On" : "Markdown Off"}</span>
                    </button>

                    {/* View Modes (Write / Preview / Split) */}
                    <div className="flex items-center rounded-lg border border-[var(--border-input)] bg-[var(--bg-surface-input)] p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditorMode("write")}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                          editorMode === "write"
                            ? "bg-[var(--bg-surface)] text-[var(--text-heading)] font-semibold shadow-xs"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
                        }`}
                        title="Write mode"
                      >
                        <Edit3 size={13} />
                        <span>Write</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditorMode("preview")}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                          editorMode === "preview"
                            ? "bg-[var(--bg-surface)] text-[var(--text-heading)] font-semibold shadow-xs"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
                        }`}
                        title="Preview mode"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditorMode("split")}
                        className={`hidden sm:flex items-center gap-1 rounded-md px-2.5 py-1 transition ${
                          editorMode === "split"
                            ? "bg-[var(--bg-surface)] text-[var(--text-heading)] font-semibold shadow-xs"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
                        }`}
                        title="Split view"
                      >
                        <Columns size={13} />
                        <span>Split</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Markdown Toolbar */}
                {markdownEnabled && (editorMode === "write" || editorMode === "split") && (
                  <div className="mb-2">
                    <MarkdownToolbar
                      onInsert={handleInsertMarkdown}
                      onOpenGuide={() => setGuideModalOpen(true)}
                    />
                  </div>
                )}

                {/* Editor Body */}
                {editorMode === "write" && (
                  <textarea
                    ref={textareaRef}
                    rows={16}
                    maxLength={CONTENT_MAX}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      markdownEnabled
                        ? "Start writing your story in Markdown (e.g. # Heading, **bold**, `code`, etc.)..."
                        : "Start writing your story..."
                    }
                    className="w-full resize-y rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] px-4 py-3 font-mono text-[14.5px] leading-7 text-[var(--text-heading)] outline-none transition focus:border-[var(--border-focus)] placeholder:text-[var(--text-muted)]"
                  />
                )}

                {editorMode === "preview" && (
                  <div className="min-h-[420px] rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-5">
                    <MarkdownRenderer content={content} />
                  </div>
                )}

                {editorMode === "split" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col">
                      <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        <span>Markdown Editor</span>
                        <span>Ctrl+B, Ctrl+I, Ctrl+K</span>
                      </div>
                      <textarea
                        ref={textareaRef}
                        rows={16}
                        maxLength={CONTENT_MAX}
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write markdown here..."
                        className="h-[420px] w-full resize-y rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] px-4 py-3 font-mono text-[14px] leading-7 text-[var(--text-heading)] outline-none transition focus:border-[var(--border-focus)] placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                        <span>Live Preview</span>
                        <span className="text-[var(--color-accent)] font-semibold">Real-time</span>
                      </div>
                      <div className="h-[420px] overflow-y-auto rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-4">
                        <MarkdownRenderer content={content} />
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                  {contentLength}/{CONTENT_MAX} (min {CONTENT_MIN})
                </p>
              </div>

              {/* Summary / Excerpt Input */}
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  maxLength={EXCERPT_MAX}
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  placeholder="Short summary for cards and previews..."
                  className="w-full resize-none rounded-xl border border-[var(--border-input)] bg-[var(--bg-surface-input)] px-4 py-3 text-[14px] text-[var(--text-heading)] outline-none transition focus:border-[var(--border-focus)] placeholder:text-[var(--text-muted)]"
                />
                <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                  {excerptLength}/{EXCERPT_MAX} (min {EXCERPT_MIN} if provided)
                </p>
              </div>

              {/* Images */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Images (max {MAX_IMAGES}, 10MB each)</label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-3 py-1.5 text-xs text-[var(--text-heading)] transition hover:border-[var(--border-focus)]">
                    <ImagePlus size={14} />
                    Add Images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages} />
                  </label>
                </div>

                {images.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border-input)] bg-[var(--bg-surface-input)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                    No cover or gallery images attached. You can also insert image URLs inside markdown!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-lg border border-[var(--border-card)]">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute right-1.5 top-1.5 rounded-md bg-black/70 p-1 text-white hover:bg-black/90"
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

          {/* Sidebar Area */}
          <aside className="space-y-4">
            {/* Post Settings */}
            <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-heading)]">Post Settings</h2>

              <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">Visibility</label>
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="mb-3 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-surface-input)] px-3 py-2 text-sm text-[var(--text-heading)] outline-none focus:border-[var(--border-focus)] transition"
              >
                <option value="public">Public</option>
                <option value="anonymous">Anonymous</option>
              </select>
            </section>

            {/* Markdown Quick Card */}
            <section className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]">
                  <Sparkles size={15} />
                  <span>Markdown Support</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(true)}
                  className="text-xs text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80 font-medium"
                >
                  Guide
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Use headings, code blocks, checklists, tables, links, quotes, and more to enrich your blog post.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-[var(--text-heading)]">
                <span className="rounded bg-[var(--bg-surface-input)] px-2 py-0.5 border border-[var(--border-input)]"># Heading</span>
                <span className="rounded bg-[var(--bg-surface-input)] px-2 py-0.5 border border-[var(--border-input)]">**bold**</span>
                <span className="rounded bg-[var(--bg-surface-input)] px-2 py-0.5 border border-[var(--border-input)]">`code`</span>
                <span className="rounded bg-[var(--bg-surface-input)] px-2 py-0.5 border border-[var(--border-input)]">&gt; quote</span>
                <span className="rounded bg-[var(--bg-surface-input)] px-2 py-0.5 border border-[var(--border-input)]">- list</span>
              </div>
            </section>

            {/* Live Stats */}
            <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-heading)]">Live Stats</h2>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                    <FileText size={14} /> Words
                  </span>
                  <span className="font-semibold text-[var(--text-heading)]">{wordCount}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Type size={14} /> Characters
                  </span>
                  <span className="font-semibold text-[var(--text-heading)]">{contentLength}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Clock size={14} /> Read Time
                  </span>
                  <span className="font-semibold text-[var(--text-heading)]">{readMinutes} min</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Layers size={14} /> Images
                  </span>
                  <span className="font-semibold text-[var(--text-heading)]">{images.length}/{MAX_IMAGES}</span>
                </p>
              </div>
            </section>

            {/* Constraints */}
            <section className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-heading)]">Publishing Constraints</h2>
              <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                <p>Title: {TITLE_MIN}-{TITLE_MAX} characters</p>
                <p>Content: {CONTENT_MIN}-{CONTENT_MAX} characters</p>
                <p>Summary: {EXCERPT_MIN}-{EXCERPT_MAX} characters (optional)</p>
                <p>Images: up to {MAX_IMAGES}, image files only, max 10MB each</p>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Markdown Guide Cheatsheet Modal */}
      <MarkdownGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onInsertTemplate={(syntax) => handleInsertMarkdown(syntax, "", "", true)}
      />

      {/* Error Popup */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] p-6 text-center shadow-[var(--shadow-dropdown)]">
            <h2 className="mb-3 text-2xl font-semibold text-[var(--danger-text)]">Publishing Error</h2>
            <p className="mx-auto max-w-xl text-[15px] leading-7 text-[var(--danger-text)] opacity-90">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="mt-5 rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 py-2 text-sm font-semibold text-[var(--text-heading)] hover:border-[var(--border-focus)] transition"
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
