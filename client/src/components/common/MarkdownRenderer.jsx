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
      // fallback if clipboard API fails
    }
  };

  // If inline code without language or multiline block
  if (!match && !codeString.includes("\n")) {
    return (
      <code
        className="rounded bg-[#171A21] px-1.5 py-0.5 font-mono text-[13px] text-[#7DD3FC] border border-[#262B36]"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-[#232732] bg-[#0E1117] font-mono text-[13.5px]">
      <div className="flex items-center justify-between border-b border-[#232732] bg-[#141822] px-4 py-2 text-xs text-[#8E93A3]">
        <span className="font-semibold uppercase tracking-wider text-[#A5B4FC]">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#2B3140] bg-[#1A1F2C] px-2.5 py-1 text-[11px] font-medium text-[#D1D5DB] transition hover:bg-[#252B3C] hover:text-white"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-[#E2E8F0] leading-6">
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
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-[#252830] bg-[#0A0B0F] p-8 text-center text-sm text-[#7D818C]">
        Nothing to preview yet. Start typing to see your formatted markdown live!
      </div>
    );
  }

  return (
    <div className={`markdown-content space-y-4 text-[15px] leading-7 text-[#DDE1E8] ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="mt-7 mb-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF] border-b border-[#242732] pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="mt-6 mb-2.5 text-xl sm:text-2xl font-semibold tracking-tight text-[#F3F4F6] border-b border-[#1E222D] pb-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="mt-5 mb-2 text-lg sm:text-xl font-semibold text-[#E5E7EB]" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="mt-4 mb-1.5 text-base sm:text-lg font-semibold text-[#D1D5DB]" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-3 leading-7 text-[#D6D9E0]" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-[#E0E7FF]" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-[#848B9B]" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-6 marker:text-[#6366F1]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-6 marker:text-[#6366F1]" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed text-[#D6D9E0]" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-4 border-l-4 border-[#4F46E5] bg-[#111420]/70 py-2.5 px-4 rounded-r-xl italic text-[#C7D2FE]"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-[#242835]" {...props} />
          ),
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#60A5FA] underline underline-offset-4 transition hover:text-[#93C5FD]"
              {...props}
            >
              {children}
            </a>
          ),
          table: ({ node, ...props }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-[#232734]">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="border-b border-[#232734] bg-[#131620] text-xs uppercase tracking-wider text-[#A5B4FC]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-[#1D212D] bg-[#0B0D13]" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="transition hover:bg-[#151926]/50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-semibold text-[#E2E8F0]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2.5 text-[#CBD5E1]" {...props} />
          ),
          img: ({ node, src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || "Blog image"}
              className="my-4 max-h-[500px] w-auto max-w-full rounded-xl border border-[#282D3D] object-cover"
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
