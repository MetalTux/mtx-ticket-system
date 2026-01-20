"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// 1. EL HELPER VA FUERA DEL COMPONENTE PRINCIPAL
interface MenuButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

const MenuButton = ({ onClick, isActive, children }: MenuButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-md transition-colors border ${
      isActive 
        ? "bg-brand-600 text-white border-brand-600" 
        : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);

// 2. COMPONENTE PRINCIPAL
export default function RichEditor({ 
  content, 
  onChange 
}: { 
  content: string; 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: "form-input min-h-[200px] prose dark:prose-invert max-w-none focus:outline-none border-t-0 rounded-t-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 p-2 flex flex-wrap gap-2">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive("bold")}
        >
          <span className="font-bold px-1">B</span>
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive("italic")}
        >
          <span className="italic px-1">I</span>
        </MenuButton>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          isActive={editor.isActive("underline")}
        >
          <span className="underline px-1">U</span>
        </MenuButton>

        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 self-center" />

        <MenuButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          isActive={editor.isActive("codeBlock")}
        >
          {`</>`}
        </MenuButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}