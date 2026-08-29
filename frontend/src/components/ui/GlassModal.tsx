import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function GlassModal({ open, onClose, title, children }: GlassModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[80vh] bg-surface-container-lowest/90 backdrop-blur-xl border border-outline-variant/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
