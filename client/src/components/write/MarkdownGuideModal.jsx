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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#2A2E3B] bg-[#0C0E14] text-[#EDEDED] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E222D] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F9FAFB]">Markdown Reference & Cheatsheet</h2>
              <p className="text-xs text-[#9CA3AF]">Quick syntax guide with copy and insert helpers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="rounded-lg border border-[#272B38] p-1.5 text-[#9CA3AF] transition hover:bg-[#1C202B] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 text-xs text-indigo-200 flex items-start gap-2.5">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-400" />
            <span>
              You can write directly in standard GitHub-Flavored Markdown. Use the toolbar or type markdown formatting markers directly.
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {GUIDE_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="flex flex-col justify-between rounded-xl border border-[#1F232F] bg-[#11141D] p-4 transition hover:border-[#2E3547]"
              >
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A5B4FC]">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed">{section.description}</p>
                  <pre className="mt-3 rounded-lg border border-[#232734] bg-[#0A0C11] p-2.5 font-mono text-xs text-[#E0E7FF] overflow-x-auto whitespace-pre">
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
                    className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg border border-[#2B3244] bg-[#171B26] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition hover:border-indigo-500 hover:bg-indigo-600/20 hover:text-white"
                  >
                    Insert Example
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[#1E222D] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#2A2E3B] bg-[#181C26] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#202534]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownGuideModal;
