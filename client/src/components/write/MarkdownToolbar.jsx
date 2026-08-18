import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  FileCode,
  List,
  ListOrdered,
  ListChecks,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  HelpCircle,
} from "lucide-react";

const MarkdownToolbar = ({ onInsert, onOpenGuide, disabled = false }) => {
  const tools = [
    {
      group: "headers",
      items: [
        {
          label: "H1",
          icon: <Heading1 size={15} />,
          title: "Heading 1",
          prefix: "# ",
          suffix: "",
          defaultText: "Heading",
          block: true,
        },
        {
          label: "H2",
          icon: <Heading2 size={15} />,
          title: "Heading 2",
          prefix: "## ",
          suffix: "",
          defaultText: "Subheading",
          block: true,
        },
        {
          label: "H3",
          icon: <Heading3 size={15} />,
          title: "Heading 3",
          prefix: "### ",
          suffix: "",
          defaultText: "Section",
          block: true,
        },
      ],
    },
    {
      group: "formatting",
      items: [
        {
          label: "Bold",
          icon: <Bold size={15} />,
          title: "Bold (Ctrl+B)",
          prefix: "**",
          suffix: "**",
          defaultText: "bold text",
        },
        {
          label: "Italic",
          icon: <Italic size={15} />,
          title: "Italic (Ctrl+I)",
          prefix: "*",
          suffix: "*",
          defaultText: "italic text",
        },
        {
          label: "Strike",
          icon: <Strikethrough size={15} />,
          title: "Strikethrough",
          prefix: "~~",
          suffix: "~~",
          defaultText: "strikethrough text",
        },
      ],
    },
    {
      group: "code",
      items: [
        {
          label: "Code",
          icon: <Code size={15} />,
          title: "Inline Code",
          prefix: "`",
          suffix: "`",
          defaultText: "code",
        },
        {
          label: "Block",
          icon: <FileCode size={15} />,
          title: "Code Block",
          prefix: "```javascript\n",
          suffix: "\n```",
          defaultText: "// write code here",
          block: true,
        },
        {
          label: "Quote",
          icon: <Quote size={15} />,
          title: "Quote",
          prefix: "> ",
          suffix: "",
          defaultText: "Quote text",
          block: true,
        },
      ],
    },
    {
      group: "lists",
      items: [
        {
          label: "Bullet",
          icon: <List size={15} />,
          title: "Bullet List",
          prefix: "- ",
          suffix: "",
          defaultText: "List item",
          block: true,
        },
        {
          label: "Numbered",
          icon: <ListOrdered size={15} />,
          title: "Numbered List",
          prefix: "1. ",
          suffix: "",
          defaultText: "First item",
          block: true,
        },
        {
          label: "Checklist",
          icon: <ListChecks size={15} />,
          title: "Task Checklist",
          prefix: "- [ ] ",
          suffix: "",
          defaultText: "Task item",
          block: true,
        },
      ],
    },
    {
      group: "insert",
      items: [
        {
          label: "Link",
          icon: <LinkIcon size={15} />,
          title: "Insert Link",
          prefix: "[",
          suffix: "](https://example.com)",
          defaultText: "link text",
        },
        {
          label: "Image",
          icon: <ImageIcon size={15} />,
          title: "Insert Image Link",
          prefix: "![",
          suffix: "](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800)",
          defaultText: "Image description",
        },
        {
          label: "Table",
          icon: <TableIcon size={15} />,
          title: "Insert Table",
          prefix: "\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item 1 | Details | $100 |\n| Item 2 | Details | $200 |\n",
          suffix: "",
          defaultText: "",
          block: true,
        },
        {
          label: "Divider",
          icon: <Minus size={15} />,
          title: "Horizontal Divider",
          prefix: "\n---\n",
          suffix: "",
          defaultText: "",
          block: true,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-[#232732] bg-[#0E1117] p-2 text-[#9CA3AF]">
      <div className="flex flex-wrap items-center gap-1">
        {tools.map((group, groupIdx) => (
          <div key={group.group} className="flex items-center gap-0.5">
            {group.items.map((item) => (
              <button
                key={item.title}
                type="button"
                disabled={disabled}
                title={item.title}
                aria-label={item.title}
                onClick={() => onInsert(item.prefix, item.suffix, item.defaultText, item.block)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B0B4C0] transition hover:bg-[#1A1F2C] hover:text-white disabled:opacity-40"
              >
                {item.icon}
              </button>
            ))}
            {groupIdx < tools.length - 1 && (
              <div className="mx-1 h-4 w-px bg-[#232732]" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenGuide}
          title="Markdown Cheatsheet & Guide"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2B3140] bg-[#141822] px-2.5 py-1 text-xs font-medium text-[#A5B4FC] transition hover:border-indigo-500/50 hover:bg-[#1C2232] hover:text-white"
        >
          <HelpCircle size={13} />
          <span>Markdown Guide</span>
        </button>
      </div>
    </div>
  );
};

export default MarkdownToolbar;
