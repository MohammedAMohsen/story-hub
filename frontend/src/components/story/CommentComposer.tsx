import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { mediaUrl } from "../../lib/media";
import { useAuthStore } from "../../store/authStore";

interface Props {
  variant: "comment" | "reply";
  onSubmit: (content: string) => void;
  isPending?: boolean;
  autoFocus?: boolean;
}

export interface CommentComposerHandle {
  focus: () => void;
}

export const CommentComposer = forwardRef<CommentComposerHandle, Props>(function CommentComposer(
  { variant, onSubmit, isPending, autoFocus },
  ref
) {
  const user = useAuthStore((s) => s.user);
  const [value, setValue] = useState("");
  const avatar = mediaUrl(user?.avatar);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || isPending) return;
    onSubmit(trimmed);
    setValue("");
  }

  if (variant === "reply") {
    return (
      <div className="flex gap-3 ml-14 mb-4 items-center animate-in fade-in duration-300">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-primary/10 bg-surface-variant flex items-center justify-center">
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>}
        </div>
        <div className="flex-1 flex items-center gap-2 bg-surface-container-low border border-outline-variant/20 rounded-full px-4 py-1.5 focus-within:border-primary/30 transition-all">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 bg-transparent border-none p-0 text-body-md focus:ring-0 placeholder:text-on-surface-variant/40 outline-none"
            placeholder="Write a reply..."
            type="text"
          />
          <button onClick={submit} disabled={isPending} className="text-primary hover:scale-110 transition-transform flex items-center justify-center disabled:opacity-40">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="comment-composer" className="flex flex-col gap-4 mb-12 animate-in fade-in duration-500 scroll-mt-24">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/10 ring-offset-2 bg-surface-variant flex items-center justify-center">
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>}
        </div>
        <span className="font-bold text-on-surface text-body-md">{user?.full_name}</span>
      </div>
      <div className="flex-1 relative">
        <div className="relative group">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 pr-14 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-on-surface-variant/50 min-h-[120px] resize-none outline-none"
            placeholder="What are your thoughts?"
          />
          <button
            onClick={submit}
            disabled={isPending}
            className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
        <div className="mt-2 flex justify-end">
          <span className="text-[11px] text-on-surface-variant/60">Press Cmd + Enter to publish</span>
        </div>
      </div>
    </div>
  );
});
