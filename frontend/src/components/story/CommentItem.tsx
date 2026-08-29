import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { Comment } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { mediaUrl } from "../../lib/media";
import { useProfileLink } from "../../lib/profileLink";
import { useClickOutside } from "../../hooks/useClickOutside";
import {
  useReplies,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
} from "../../hooks/useComments";
import { CommentComposer } from "./CommentComposer";
import { GlassModal } from "../ui/GlassModal";

export function CommentItem({
  comment,
  storySlug,
  isReply = false,
  forceOpenReplies = false,
}: {
  comment: Comment;
  storySlug: string;
  isReply?: boolean;
  forceOpenReplies?: boolean;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const isOwner = isAuthenticated && currentUser?.username === comment.username;
  const profileLink = useProfileLink();

  const [repliesOpen, setRepliesOpen] = useState(forceOpenReplies);
  useEffect(() => {
    if (forceOpenReplies) setRepliesOpen(true);
  }, [forceOpenReplies]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const { data: repliesData, fetchNextPage, hasNextPage, isFetchingNextPage } = useReplies(comment.id, repliesOpen);
  const replies = repliesData?.pages.flatMap((p) => p.results) ?? [];

  const createReply = useCreateComment(storySlug);
  const updateComment = useUpdateComment(isReply ? ["replies", comment.parent as string] : ["comments", storySlug]);
  const deleteComment = useDeleteComment(isReply ? ["replies", comment.parent as string] : ["comments", storySlug]);
  const likeComment = useLikeComment(storySlug);

  function handleLike() {
    if (!isAuthenticated) return navigate("/login");
    likeComment.mutate(comment);
  }

  function saveEdit() {
    if (!editValue.trim()) return;
    updateComment.mutate({ id: comment.id, content: editValue.trim() }, { onSuccess: () => setEditing(false) });
  }

  function cancelEdit() {
    setEditValue(comment.content);
    setEditing(false);
  }

  const avatar = mediaUrl(comment.avatar);
  const showConnector = !isReply && repliesOpen && (replies.length > 0 || isAuthenticated);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastReplyRef = useRef<HTMLDivElement>(null);
  const [trunkHeight, setTrunkHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!showConnector || !lastReplyRef.current || !containerRef.current) {
      setTrunkHeight(null);
      return;
    }
    const containerTop = containerRef.current.getBoundingClientRect().top;
    const lastReplyTop = lastReplyRef.current.getBoundingClientRect().top;
    setTrunkHeight(lastReplyTop - containerTop + 16);
  }, [showConnector, replies.length]);

  return (
    <div id={`comment-${comment.id}`} ref={containerRef} className={isReply ? "flex gap-4 ml-14 relative z-10" : "flex flex-col gap-6 mb-8 relative scroll-mt-24"}>
      {showConnector && (
        <div
          className={`absolute left-5 top-12 w-px bg-outline-variant/50 pointer-events-none ${trunkHeight == null ? "bottom-4" : ""}`}
          style={trunkHeight != null ? { height: Math.max(trunkHeight - 64, 8) } : undefined}
          aria-hidden
        />
      )}
      {isReply && (
        <div
          className="absolute -left-9 top-0 w-8 h-4 border-l border-b border-outline-variant/50 rounded-bl-xl pointer-events-none"
          aria-hidden
        />
      )}

      <div className={isReply ? "contents" : "flex gap-4 relative z-10"}>
        <Link
          to={profileLink(comment.username)}
          className={`${isReply ? "w-8 h-8 ring-1" : "w-10 h-10 ring-2 ring-offset-2"} rounded-full overflow-hidden shrink-0 ring-primary/10 bg-surface-variant flex items-center justify-center z-10 bg-surface hover:opacity-80 transition-opacity`}
        >
          {avatar ? <img src={avatar} alt={comment.username} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>}
        </Link>
        <div className="flex-1">
          <div className="comment-bubble bg-surface-container-low rounded-2xl p-4 mb-2">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <Link to={profileLink(comment.username)} className="font-bold text-on-surface font-label-sm hover:text-primary transition-colors w-fit">
                  {comment.full_name}
                </Link>
                <span className="text-xs text-on-surface-variant mt-0.5">{formatRelative(comment.created_at)}</span>
              </div>
              {isOwner && !editing && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/5 text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-32 bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-lg z-50">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setEditing(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          <span className="text-label-sm">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setConfirmDelete(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-error hover:bg-error/5 transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          <span className="text-label-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-3 mt-2">
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-3 text-body-md outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={updateComment.isPending}
                    className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {updateComment.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant mt-2">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center gap-4 ml-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={comment.is_liked ? { fontVariationSettings: '"FILL" 1', color: "var(--color-error)" } : undefined}
              >
                favorite
              </span>
              {comment.likes_count}
            </button>

            {!isReply && comment.replies_count > 0 && (
              <button
                type="button"
                onClick={() => setRepliesOpen((o) => !o)}
                className="relative z-20 flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">reply</span>
                {comment.replies_count} {comment.replies_count === 1 ? "Reply" : "Replies"}
              </button>
            )}
            {!isReply && comment.replies_count === 0 && isAuthenticated && (
              <button
                type="button"
                onClick={() => setRepliesOpen((o) => !o)}
                className="relative z-20 flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">reply</span>
                {repliesOpen ? "Hide reply" : "Reply"}
              </button>
            )}
          </div>
        </div>
      </div>

      {!isReply && repliesOpen && (
        <>
          {isAuthenticated && (
            <CommentComposer
              variant="reply"
              autoFocus
              isPending={createReply.isPending}
              onSubmit={(content) => createReply.mutate({ content, parent: comment.id })}
            />
          )}
          <div className="flex flex-col gap-6">
            {replies.map((reply, i) => (
              <div key={reply.id} ref={i === replies.length - 1 ? lastReplyRef : undefined}>
                <CommentItem comment={reply} storySlug={storySlug} isReply />
              </div>
            ))}
          </div>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="ml-14 text-xs text-primary font-bold hover:underline w-fit relative z-20"
            >
              {isFetchingNextPage ? "Loading..." : "Load more replies"}
            </button>
          )}
        </>
      )}

      <GlassModal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={isReply ? "Delete reply?" : "Delete comment?"}>
        <p className="text-body-md text-on-surface-variant mb-6">
          This action is permanent and cannot be undone. Are you sure you want to delete this {isReply ? "reply" : "comment"}?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteComment.mutate(comment.id, { onSuccess: () => setConfirmDelete(false) })}
            disabled={deleteComment.isPending}
            className="px-4 py-2 rounded-full bg-error text-on-error text-label-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deleteComment.isPending ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </GlassModal>
    </div>
  );
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}