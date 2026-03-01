// src/components/tickets/ticket-attachments.tsx
"use client";

import { useState } from "react";
import { Paperclip, Download, FileText, X } from "lucide-react";

interface Attachment {
  url: string;
  name: string;
}

export default function TicketAttachments({ attachments }: { attachments: Attachment[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Paperclip className="w-3 h-3" />
        <h3 className="text-[9px] font-black uppercase tracking-widest">Adjuntos ({attachments.length})</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4">
        {attachments.map((file, index) => {
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

          return (
            <div key={index} className="group relative border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all">
              {isImage ? (
                <div 
                  className="aspect-square lg:aspect-video w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden cursor-zoom-in"
                  onClick={() => setSelectedImage(file.url)}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-square lg:aspect-video w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
              )}

              <div className="p-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[9px] lg:text-[10px] font-bold truncate text-slate-500 flex-1">
                  {file.name}
                </span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-brand-600 transition-all"
                >
                  <Download className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-2 lg:p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full"><X/></button>
          <img 
            src={selectedImage} 
            className="max-w-full max-h-[90vh] rounded shadow-2xl object-contain animate-in zoom-in-95" 
            alt="Vista previa" 
          />
        </div>
      )}
    </div>
  );
}