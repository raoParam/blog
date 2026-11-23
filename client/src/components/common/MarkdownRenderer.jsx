import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

const CodeBlock = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!match && !codeString.includes("\n")) {
    return (
      <code
        className="rounded bg-[var(--bg-surface-input)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--color-accent)] border border-[var(--border-input)] font-medium"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface-code)] font-mono text-[13.5px]">
      <div className="flex items-center justify-between border-b border-[var(--border-card)] bg-[var(--bg-surface-code-header)] px-4 py-2 text-xs text-[var(--text-secondary)]">
        <span className="font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-heading)] transition hover:bg-[var(--bg-surface-hover)]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-[var(--text-heading)] leading-6">
        <pre className="!bg-transparent !p-0 !m-0 font-mono">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content, className = "" }) => {
  if (!content || !content.trim()) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-surface-input)] p-8 text-center text-sm text-[var(--text-muted)]">
        Nothing to preview yet. Start typing to see your formatted markdown live!
      </div>
    );
  }

  return (
    <div className={`markdown-content space-y-4 text-[15px] leading-7 text-[var(--text-body)] ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mt-7 mb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)] border-b border-[var(--divider)] pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-6 mb-2.5 text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-heading)] border-b border-[var(--divider)] pb-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-5 mb-2 text-lg sm:text-xl font-semibold text-[var(--text-heading)]" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="mt-4 mb-1.5 text-base sm:text-lg font-semibold text-[var(--text-heading)]" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-3 leading-7 text-[var(--text-body)]" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-[var(--text-heading)]" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-[var(--text-body)]" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-[var(--text-muted)]" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-[var(--color-accent)]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:text-[var(--color-accent)]" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed text-[var(--text-body)]" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-4 border-l-4 border-[var(--color-accent)] bg-[var(--bg-surface-input)] py-2.5 px-4 rounded-r-xl italic text-[var(--text-heading)]"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-[var(--divider)]" {...props} />
          ),
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-accent)] underline underline-offset-4 transition hover:text-[var(--color-accent-hover)]"
              {...props}
            >
              {children}
            </a>
          ),
          table: ({ node, ...props }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)]">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="border-b border-[var(--border-card)] bg-[var(--bg-surface-code-header)] text-xs uppercase tracking-wider text-[var(--text-heading)] font-semibold" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[var(--border-card)] bg-[var(--bg-surface)]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="transition hover:bg-[var(--bg-surface-hover)]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-semibold text-[var(--text-heading)]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2.5 text-[var(--text-body)]" {...props} />
          ),
          img: ({ node, src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || "Blog image"}
              className="my-4 max-h-[500px] w-auto max-w-full rounded-xl border border-[var(--border-card)] object-cover shadow-sm"
              loading="lazy"
              {...props}
            />
          ),
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
