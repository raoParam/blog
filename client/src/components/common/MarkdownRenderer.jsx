import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

/**
 * Typography for headings, paragraphs, lists, quotes, links, inline code and
 * images lives in the `.prose-flagger` styles in index.css. This file only
 * handles the pieces that need behaviour or extra markup.
 */

const CodeBlock = ({ node: _node, children, className, ...props }) => {
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
      // fallback if clipboard API fails
    }
  };

  // Inline code (no language and a single line) is styled by .prose-flagger
  if (!match && !codeString.includes("\n")) {
    return (
      <code {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-8 overflow-hidden rounded-xl border border-border bg-surface-1 font-mono text-[13.5px]">
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2 text-xs text-text-secondary">
        <span className="font-semibold uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-1 px-2.5 py-1 text-[11px] font-medium text-text-body transition hover:bg-surface-3 hover:text-text-primary"
        >
          {copied ? (
            <>
              <Check size={12} className="text-success" />
              <span className="text-success">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 leading-6 text-text-primary">
        <pre className="!m-0 !bg-transparent !p-0 font-mono">
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
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center text-sm text-text-muted">
        Nothing to preview yet. Start typing to see your formatted markdown live!
      </div>
    );
  }

  return (
    <div className={`markdown-content prose-flagger ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // CodeBlock renders its own <pre>, so skip the default wrapper
          pre: ({ children }) => <>{children}</>,
          a: ({ node: _node, href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          table: ({ node: _node, ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node: _node, ...props }) => (
            <thead
              className="border-b border-border bg-surface-2 text-xs uppercase tracking-wider text-text-secondary"
              {...props}
            />
          ),
          tbody: ({ node: _node, ...props }) => (
            <tbody className="divide-y divide-border bg-surface-1" {...props} />
          ),
          tr: ({ node: _node, ...props }) => (
            <tr className="transition hover:bg-surface-2/60" {...props} />
          ),
          th: ({ node: _node, ...props }) => (
            <th className="px-4 py-3 font-semibold text-text-primary" {...props} />
          ),
          td: ({ node: _node, ...props }) => (
            <td className="px-4 py-2.5 text-text-body" {...props} />
          ),
          img: ({ node: _node, src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || "Blog image"}
              className="max-h-[560px] w-auto object-cover"
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
