"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import * as commands from "@uiw/react-md-editor/commands";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div
      data-color-mode="dark"
      className="rounded-lg overflow-hidden border border-white/10"
    >
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={450}
        preview="edit"
        textareaProps={{ placeholder: placeholder }}
        commands={[
          commands.group(
            [commands.title1, commands.title2, commands.title3, commands.title4, commands.title5, commands.title6],
            {
              name: "title",
              groupName: "title",
              buttonProps: { "aria-label": "Insert title" },
            }
          ),
          commands.divider,
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
          commands.divider,
          commands.link,
          commands.quote,
          commands.code,
          commands.image,
          commands.divider,
          commands.table,
          commands.divider,
          commands.help,
        ]}
        extraCommands={[
          commands.codeEdit,
          commands.codePreview,
          commands.codeLive,
          commands.fullscreen,
        ]}
      />
    </div>
  );
}
