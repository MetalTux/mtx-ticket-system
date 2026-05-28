// src/components/ui/rich-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Highlight } from '@tiptap/extension-highlight';

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

const MenuButton = ({ onClick, isActive = false, disabled = false, title, children }: MenuButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg transition-all border ${
      disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400" :
      isActive 
        ? "bg-brand-600 text-white border-brand-600 shadow-sm" 
        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
    }`}
  >
    {children}
  </button>
);

export default function RichEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit, 
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: false }),
    ],
    content: content,
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] lg:min-h-[200px] p-3 lg:p-4 text-slate-800 dark:text-slate-200 text-xs lg:text-sm leading-relaxed prose-img:rounded-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-700 prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-th:bg-slate-50 dark:prose-th:bg-slate-800",
      },
      handlePaste: (view, event, slice) => {
        return false; 
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-950 transition-colors">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 p-1.5 lg:p-2 flex flex-wrap gap-1.5 lg:gap-2">
        
        {/* DESHACER / REHACER */}
        <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Deshacer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rehacer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
        </MenuButton>
        <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

        {/* ENCABEZADOS Y FORMATO */}
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Título">
          <span className="font-black text-xs">H1</span>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Negrita">
          <span className="font-black text-[10px] lg:text-xs">B</span>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Cursiva">
          <span className="italic font-serif text-xs lg:text-sm">I</span>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Subrayado">
          <span className="underline text-xs lg:text-sm font-bold">U</span>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Resaltar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l-6 6v3h9l3-3"></path><path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path></svg>
        </MenuButton>
        <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

        {/* LISTAS Y CHECKLISTS */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Viñetas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numerada">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")} title="Lista de tareas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </MenuButton>
        <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

        {/* INSERTOS AVANZADOS */}
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Citar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} isActive={editor.isActive("table")} title="Tabla">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divisor">
          <span className="font-black text-xs">—</span>
        </MenuButton>

      </div>

      <EditorContent editor={editor} className="bg-white dark:bg-slate-900/50 tiptap-wrapper" />
    </div>
  );
}


// // src/components/ui/rich-editor.tsx
// "use client";

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from '@tiptap/extension-underline';
// import { Table } from '@tiptap/extension-table';
// import TableRow from '@tiptap/extension-table-row';
// import TableCell from '@tiptap/extension-table-cell';
// import TableHeader from '@tiptap/extension-table-header';
// import Image from '@tiptap/extension-image';
// import Link from '@tiptap/extension-link';
// import { TextStyle } from '@tiptap/extension-text-style';
// import Color from '@tiptap/extension-color';
// import TextAlign from '@tiptap/extension-text-align';

// interface MenuButtonProps {
//   onClick: () => void;
//   isActive: boolean;
//   title?: string;
//   children: React.ReactNode;
// }

// const MenuButton = ({ onClick, isActive, title, children }: MenuButtonProps) => (
//   <button
//     type="button"
//     title={title}
//     onClick={onClick}
//     className={`w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg transition-all border ${
//       isActive 
//         ? "bg-brand-600 text-white border-brand-600 shadow-sm" 
//         : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
//     }`}
//   >
//     {children}
//   </button>
// );

// export default function RichEditor({ 
//   content, 
//   onChange 
// }: { 
//   content: string; 
//   onChange: (html: string) => void 
// }) {
//   const editor = useEditor({
//     extensions: [
//       StarterKit, 
//       Underline,
//       TextStyle,
//       Color,
//       TextAlign.configure({ types: ['heading', 'paragraph'] }),
//       Link.configure({ openOnClick: false }),
//       Image,
//       Table.configure({ resizable: true }),
//       TableRow,
//       TableHeader,
//       TableCell,
//     ],
//     content: content,
//     immediatelyRender: false, 
//     editorProps: {
//       attributes: {
//         // Añadidas clases prose para dar estilo automático a tablas e imágenes pegadas
//         class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] lg:min-h-[200px] p-3 lg:p-4 text-slate-800 dark:text-slate-200 text-xs lg:text-sm leading-relaxed prose-img:rounded-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-700 prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2 prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-th:bg-slate-50 dark:prose-th:bg-slate-800",
//       },
//       handlePaste: (view, event, slice) => {
//         // RETÉN PARA FASE 2: Aquí atraparemos las imágenes para Uploadthing
//         // Al retornar false, dejamos que TipTap procese el HTML (tablas, colores) de forma nativa.
//         return false; 
//       }
//     },
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//   });

//   if (!editor) return null;

//   return (
//     <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-950 transition-colors">
//       <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 p-1.5 lg:p-2 flex flex-wrap gap-1.5 lg:gap-2">
//         {/* BÁSICOS */}
//         <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Negrita">
//           <span className="font-black text-[10px] lg:text-xs">B</span>
//         </MenuButton>

//         <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Cursiva">
//           <span className="italic font-serif text-xs lg:text-sm">I</span>
//         </MenuButton>

//         <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Subrayado">
//           <span className="underline text-xs lg:text-sm font-bold">U</span>
//         </MenuButton>

//         <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

//         {/* LISTAS (Añadido) */}
//         <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Lista con viñetas">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
//         </MenuButton>

//         <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Lista numerada">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
//         </MenuButton>

//         <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

//         {/* TABLAS E INSERTOS (Añadido) */}
//         <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} isActive={editor.isActive("table")} title="Insertar Tabla">
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
//         </MenuButton>

//         <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Bloque de código">
//           <span className="text-[10px] font-mono">{`</>`}</span>
//         </MenuButton>
//       </div>

//       <EditorContent editor={editor} className="bg-white dark:bg-slate-900/50 tiptap-wrapper" />
//     </div>
//   );
// }


// // src/components/ui/rich-editor.tsx
// "use client";

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from '@tiptap/extension-underline';

// interface MenuButtonProps {
//   onClick: () => void;
//   isActive: boolean;
//   children: React.ReactNode;
// }

// const MenuButton = ({ onClick, isActive, children }: MenuButtonProps) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg transition-all border ${
//       isActive 
//         ? "bg-brand-600 text-white border-brand-600 shadow-sm" 
//         : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
//     }`}
//   >
//     {children}
//   </button>
// );

// export default function RichEditor({ 
//   content, 
//   onChange 
// }: { 
//   content: string; 
//   onChange: (html: string) => void 
// }) {
//   const editor = useEditor({
//     extensions: [StarterKit, Underline],
//     content: content,
//     immediatelyRender: false, 
//     editorProps: {
//       attributes: {
//         class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] lg:min-h-[200px] p-3 lg:p-4 text-slate-800 dark:text-slate-200 text-xs lg:text-sm leading-relaxed",
//       },
//     },
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//   });

//   if (!editor) return null;

//   return (
//     <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-950 transition-colors">
//       <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 p-1.5 lg:p-2 flex flex-wrap gap-1.5 lg:gap-2">
//         <MenuButton 
//           onClick={() => editor.chain().focus().toggleBold().run()} 
//           isActive={editor.isActive("bold")}
//         >
//           <span className="font-black text-[10px] lg:text-xs">B</span>
//         </MenuButton>

//         <MenuButton 
//           onClick={() => editor.chain().focus().toggleItalic().run()} 
//           isActive={editor.isActive("italic")}
//         >
//           <span className="italic font-serif text-xs lg:text-sm">I</span>
//         </MenuButton>

//         <MenuButton 
//           onClick={() => editor.chain().focus().toggleUnderline().run()} 
//           isActive={editor.isActive("underline")}
//         >
//           <span className="underline text-xs lg:text-sm font-bold">U</span>
//         </MenuButton>

//         <div className="w-px h-5 lg:h-6 bg-slate-300 dark:bg-slate-700 mx-1 self-center" />

//         <MenuButton 
//           onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
//           isActive={editor.isActive("codeBlock")}
//         >
//           <span className="text-[10px] font-mono">{`</>`}</span>
//         </MenuButton>
//       </div>

//       <EditorContent editor={editor} className="bg-white dark:bg-slate-900/50" />
//     </div>
//   );
// }