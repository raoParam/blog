import { X, Sparkles, BookOpen } from "lucide-react";

const GUIDE_SECTIONS = [
  {
    title: "Headers",
    syntax: "# Heading 1\n## Heading 2\n### Heading 3",
    description: "Use 1 to 6 hash characters at the beginning of a line.",
  },
  {
    title: "Emphasis & Text Styling",
    syntax: "**Bold text**\n*Italic text*\n~~Strikethrough~~",
    description: "Wrap text in double asterisks for bold, single for italic, double tildes for strikethrough.",
  },
  {
    title: "Lists",
    syntax: "- Item 1\n- Item 2\n  - Sub item\n\n1. First step\n2. Second step\n\n- [x] Completed task\n- [ ] Pending task",
    description: "Use `-` or `*` for bullet points, numbers for ordered lists, and `- [ ]` for task checkboxes.",
  },
  {
    title: "Links & Images",
    syntax: "[Flagger Blog](https://flagger.dev)\n![Alt text](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800)",
    description: "Format links with `[label](url)` and images with `![alt](image_url)`.",
  },
  {
    title: "Quotes & Callouts",
    syntax: "> Great ideas come from curious minds.\n> — Steve Jobs",
    description: "Start any line with `>` to create a blockquote.",
  },
  {
    title: "Code & Syntax Highlighting",
    syntax: "`inline code`\n\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```",
    description: "Use single backticks for inline code, triple backticks with an optional language identifier for code blocks.",
  },
  {
    title: "Tables",
    syntax: "| Feature | Supported |\n| :--- | :---: |\n| Markdown | Yes |\n| Live Preview | Yes |",
    description: "Create tables using pipes `|` and hyphens `-`.",
  },
  {
    title: "Horizontal Rule",
    syntax: "---",
    description: "Three or more hyphens create a dividing line separator.",
  },
];

const MarkdownGuideModal = ({ isOpen, onClose, onInsertTemplate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface-elevated)] text-[var(--text-body)] shadow-[var(--shadow-dropdown)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-card)] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-surface-hover)] text-[var(--color-accent)]">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-heading)]">Markdown Reference & Cheatsheet</h2>
              <p className="text-xs text-[var(--text-secondary)]">Quick syntax guide with copy and insert helpers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="rounded-lg border border-[var(--border-input)] p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-heading)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--bg-surface-input)] p-3.5 text-xs text-[var(--text-body)] flex items-start gap-2.5">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
            <span>
              You can write directly in standard GitHub-Flavored Markdown. Use the toolbar or type markdown formatting markers directly.
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {GUIDE_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="flex flex-col justify-between rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 transition hover:border-[var(--border-focus)] shadow-sm"
              >
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{section.description}</p>
                  <pre className="mt-3 rounded-lg border border-[var(--border-input)] bg-[var(--bg-surface-code)] p-2.5 font-mono text-xs text-[var(--text-heading)] overflow-x-auto whitespace-pre">
                    {section.syntax}
                  </pre>
                </div>
                {onInsertTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      onInsertTemplate(section.syntax);
                      onClose();
                    }}
                    className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-heading)] transition hover:border-[var(--border-focus)] hover:bg-[var(--bg-surface-hover)]"
                  >
                    Insert Example
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[var(--border-card)] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-5 py-2 text-xs font-semibold text-[var(--text-heading)] transition hover:bg-[var(--bg-surface-hover)]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownGuideModal;
