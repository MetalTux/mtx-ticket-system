// src/components/ui/rich-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from '@tiptap/extension-underline';

interface MenuButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

const MenuButton = ({ onClick, isActive, children }: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg transition-all border ${
      isActive 
        ? "bg-brand-600 text-white border-brand-600 shadow-sm" 
        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
    }`}
  >
    {children}
  </button>
);

export default function RichEditor({ 
  content, 
  onChange 
}: { 
  content: string; 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] lg:min-h-[200px] p-3 lg:p-4 text-slate-800 dark:text-slate-200 text-xs lg:text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-950 transition-colors">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 p-1.5 lg:p-2 flex flex-wrap gap-1.5 lg:gap-2">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")}
        >
          <span className="font-black text-[10px] lg:text-xs">B</span>
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")}
        >
          <span className="italic font-serif text-xs lg:text-sm">I</span>
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive("underline")}
        >
          <span className="underline text-xs lg:text-sm font-bold">U</span>
        </MenuButton>

        <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          isActive={editor.isActive("codeBlock")}
        >
          <span className="text-[10px] font-mono">{`</>`}</span>
        </MenuButton>
      </div>

      <EditorContent editor={editor} className="bg-white dark:bg-slate-900/50" />
    </div>
  );
}