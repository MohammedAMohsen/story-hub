import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Story } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { useProfileLink } from "../../lib/profileLink";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useLikeStory, useBookmarkStory, useFollowUser, useArchiveStory, useDeleteStory } from "../../hooks/useStoryActions";
import { mediaUrl } from "../../lib/media";
import { GlassModal } from "../ui/GlassModal";

export function StoryCard({ story }: { story: Story }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const readTime = estimateReadTime(story.content);
  const isOwnStory = isAuthenticated && currentUser?.username === story.username;
  const profileLink = useProfileLink();

  const likeMutation = useLikeStory();
  const bookmarkMutation = useBookmarkStory();
  const followMutation = useFollowUser();
  const archiveMutation = useArchiveStory();
  const deleteMutation = useDeleteStory();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  function handleFollowClick() {
    if (!isAuthenticated) return navigate("/follow-required");
    followMutation.mutate(story.username);
  }
  function handleLikeClick() {
    if (!isAuthenticated) return navigate("/login");
    likeMutation.mutate(story);
  }
  function handleBookmarkClick() {
    if (!isAuthenticated) return navigate("/login");
    bookmarkMutation.mutate(story);
  }
  function handleArchive() {
    setMenuOpen(false);
    archiveMutation.mutate(story.slug);
  }
  function handleDelete() {
    deleteMutation.mutate(story.slug, { onSuccess: () => setConfirmDelete(false) });
  }

  return (
    <article className="bg-surface-container-lowest border border-outline-variant/20 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col gap-6 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      <header className="flex items-start justify-between">
        <Link to={profileLink(story.username)} className="flex items-center gap-3 group/author hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant">
            <img src={mediaUrl(story.avatar) ?? "/default-avatar.png"} alt={story.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface group-hover/author:text-primary-container transition-colors">
              {story.full_name}
            </span>
            <span className="text-xs text-on-surface-variant">
              {formatDate(story.created_at)} • {readTime} min read
            </span>
          </div>
        </Link>

        {isOwnStory ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 w-44 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/write/${story.slug}`);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-body-md text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <button
                  onClick={handleArchive}
                  disabled={archiveMutation.isPending || story.status === "Archived"}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-body-md text-on-surface hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">archive</span>
                  {archiveMutation.isPending ? "Archiving..." : story.status === "Archived" ? "Archived" : "Archive"}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-body-md text-error hover:bg-error/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleFollowClick}
            disabled={followMutation.isPending}
            className={
              story.is_following
                ? "flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold border border-primary/20 hover:bg-primary/10 transition-all duration-200"
                : "px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant font-label-sm text-label-sm font-semibold hover:border-primary hover:text-primary transition-colors duration-200 bg-transparent"
            }
          >
            {story.is_following ? "Following" : "Follow"}
          </button>
        )}
      </header>

      <div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {story.cover && (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-[11px] text-primary" style={{ fontSize: 20}} >image</span>
            </div>
          )}
          {story.category && (
            <Link
              to={`/?category=${encodeURIComponent(story.category)}`}
              className="px-3 py-1 bg-primary/10 text-primary font-label-sm text-[11px] font-semibold uppercase tracking-wider rounded-full hover:bg-primary-container hover:text-on-primary transition-all duration-200"
            >
              {story.category}
            </Link>
          )}
          {story.tags.slice(0, 2).map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-primary/10 text-primary font-label-sm text-[11px] font-semibold uppercase tracking-wider rounded-full hover:bg-primary-container hover:text-on-primary transition-all duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>

        <Link to={`/story/${story.slug}`}>
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3 group-hover:text-primary transition-colors">
            {story.title}
          </h2>
        </Link>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 leading-relaxed">
          {story.content}
          <Link to={`/story/${story.slug}`} className="text-primary font-medium hover:underline inline-flex items-center gap-1 ml-1">
            Read more <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
          </Link>
        </p>
      </div>

      <footer className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-2 transition-colors group/btn`}
          >
            <span
              className={`material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform ${story.is_liked ? "text-error" : ""}`}
              style={story.is_liked ? { fontVariationSettings: '"FILL" 1' } : undefined}
            >
              favorite
            </span>
            <span className={`font-label-sm text-xs ${story.is_liked ? "text-error" : ""}`}>{story.likes_count}</span>
          </button>

          <Link
            to={`/story/${story.slug}#comments`}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group/btn"
          >
            <span className="material-symbols-outlined text-[20px] group-hover/btn:scale-110 transition-transform">chat_bubble</span>
            <span className="font-label-sm text-xs">{story.comments_count}</span>
          </Link>
        </div>
        <button
          onClick={handleBookmarkClick}
          className={isAuthenticated ? "text-on-surface-variant hover:text-primary transition-colors" : "text-on-surface-variant/50 cursor-not-allowed"}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${story.is_saved ? "text-primary" : ""}`}
            style={story.is_saved ? { fontVariationSettings: '"FILL" 1' } : undefined}
          >
            bookmark
          </span>
        </button>
      </footer>

      <GlassModal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete story?">
        <p className="text-body-md text-on-surface-variant mb-6">
          This action is permanent and cannot be undone. Are you sure you want to delete "{story.title}"?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 rounded-full bg-error text-on-error text-label-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </GlassModal>
    </article>
  );
}

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
