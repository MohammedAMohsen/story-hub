import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { useStory, useLikeStoryDetail, useBookmarkStoryDetail, useFollowUserDetail } from "../hooks/useStory";
import { useArchiveStory, useDeleteStory } from "../hooks/useStoryActions";
import { useClickOutside } from "../hooks/useClickOutside";
import { GlassModal } from "../components/ui/GlassModal";
import { useComments, useCreateComment } from "../hooks/useComments";
import { useAuthStore } from "../store/authStore";
import { mediaUrl } from "../lib/media";
import { useProfileLink } from "../lib/profileLink";
import { CommentComposer, type CommentComposerHandle } from "../components/story/CommentComposer";
import { CommentItem } from "../components/story/CommentItem";
import { ImageLightbox } from "../components/ui/ImageLightbox";

export function StoryDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const { data: story, isLoading } = useStory(slug);
  const likeMutation = useLikeStoryDetail(slug);
  const bookmarkMutation = useBookmarkStoryDetail(slug);
  const followMutation = useFollowUserDetail(slug);
  const archiveMutation = useArchiveStory();
  const deleteMutation = useDeleteStory();
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ownerMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(ownerMenuRef, () => setOwnerMenuOpen(false));

  const { data: commentsData, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(slug);
  const createComment = useCreateComment(slug);
  const comments = commentsData?.pages.flatMap((p) => p.results) ?? [];
  const totalComments = commentsData?.pages[0]?.count ?? 0;

  const composerRef = useRef<CommentComposerHandle>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const profileLink = useProfileLink();

  const openCommentId = searchParams.get("openComment");
  const openParentId = searchParams.get("openParent");

  useEffect(() => {
    if (openCommentId && !comments.length) return;

    if (openCommentId) {
      const el = document.getElementById(`comment-${openCommentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const bubble = el.querySelector<HTMLElement>(".comment-bubble") ?? el;
        bubble.classList.add("comment-flash");
        setTimeout(() => bubble.classList.remove("comment-flash"), 1800);
        return;
      }
    }

    if (location.hash === "#comments") {
      commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (isAuthenticated) {
        setTimeout(() => composerRef.current?.focus(), 400);
      }
    }
  }, [comments.length, openCommentId, location.hash, isAuthenticated, isLoading]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <p className="text-center text-on-surface-variant py-20 w-full">Loading...</p>;
  }
  if (!story) {
    return <p className="text-center text-on-surface-variant py-20 w-full">Story not found</p>;
  }

  const isOwnStory = isAuthenticated && currentUser?.username === story.username;
  const readTime = Math.max(1, Math.round(story.content.trim().split(/\s+/).length / 200));

  function handleLike() {
    if (!isAuthenticated) return navigate("/login");
    likeMutation.mutate();
  }
  function handleBookmark() {
    if (!isAuthenticated) return navigate("/login");
    bookmarkMutation.mutate();
  }
  function handleFollow() {
    if (!isAuthenticated) return navigate("/follow-required");
    followMutation.mutate(story.username);
  }
  function handleCommentClick() {
    commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (isAuthenticated) setTimeout(() => composerRef.current?.focus(), 400);
  }

  return (
    <div className="flex flex-col w-full max-w-[800px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-label-sm">Back to feed</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <Link to={profileLink(story.username)} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/10 ring-offset-2 bg-surface-variant flex items-center justify-center">
            {mediaUrl(story.avatar) ? (
              <img src={mediaUrl(story.avatar)} alt={story.username} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-on-surface text-body-lg">{story.full_name}</span>
            <span className="text-xs text-on-surface-variant">{formatDate(story.created_at)} • {readTime} min read</span>
          </div>
        </Link>

        {isOwnStory ? (
          <div className="relative" ref={ownerMenuRef}>
            <button
              onClick={() => setOwnerMenuOpen((o) => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">more_vert</span>
            </button>
            {ownerMenuOpen && (
              <div className="absolute right-0 top-11 w-44 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setOwnerMenuOpen(false);
                    navigate(`/write/${slug}`);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-body-md text-on-surface hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <button
                  onClick={() => {
                    setOwnerMenuOpen(false);
                    archiveMutation.mutate(slug, { onSuccess: () => navigate("/") });
                  }}
                  disabled={archiveMutation.isPending || story.status === "Archived"}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-body-md text-on-surface hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">archive</span>
                  {archiveMutation.isPending ? "Archiving..." : story.status === "Archived" ? "Archived" : "Archive"}
                </button>
                <button
                  onClick={() => {
                    setOwnerMenuOpen(false);
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
            onClick={handleFollow}
            className={
              story.is_following
                ? "rounded-full text-primary text-xs border border-primary/20 bg-primary/10 hover:bg-primary/20 hover:scale-105 transition-all py-2 px-8 font-bold"
                : "rounded-full text-primary text-xs border border-primary/20 backdrop-blur-sm hover:bg-primary/20 hover:scale-105 transition-all bg-primary/5 py-2 px-8"
            }
          >
            {story.is_following ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <article className="mb-12">
        <h1 className="font-display-lg text-on-surface mb-8 leading-tight text-[36px] font-semibold">{story.title}</h1>
        {story.cover && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="w-full aspect-video rounded-3xl overflow-hidden mb-10 shadow-xl bg-surface-variant block cursor-zoom-in group relative"
          >
            <img src={mediaUrl(story.cover)} alt={story.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
            <span className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </span>
          </button>
        )}
        <div className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed space-y-6">
          {story.content.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>

      <div className="flex items-center justify-between py-6 border-y border-outline-variant/20 mb-12">
        <div className="flex items-center gap-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group`}
          >
            <span
              className="material-symbols-outlined group-hover:scale-110 transition-transform"
              style={story.is_liked ? { fontVariationSettings: '"FILL" 1', color: "var(--color-error)" } : undefined}
            >
              favorite
            </span>
            <span className="font-label-sm">{story.likes_count}</span>
          </button>
          <button onClick={handleCommentClick} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
            <span className="font-label-sm">{story.comments_count}</span>
          </button>
        </div>
        <button
          onClick={handleBookmark}
          className={isAuthenticated ? "text-on-surface-variant hover:text-primary transition-colors" : "text-on-surface-variant/50 cursor-not-allowed"}
        >
          <span
            className="material-symbols-outlined"
            style={story.is_saved ? { fontVariationSettings: '"FILL" 1', color: "var(--color-primary)" } : undefined}
          >
            bookmark
          </span>
        </button>
      </div>

      <section id="comments" ref={commentsSectionRef} className="pb-20 scroll-mt-24">
        {isAuthenticated && (
          <CommentComposer
            ref={composerRef}
            variant="comment"
            isPending={createComment.isPending}
            onSubmit={(content) => createComment.mutate({ content })}
          />
        )}

        <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-8">Responses ({totalComments})</h3>

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            storySlug={slug}
            forceOpenReplies={openParentId === comment.id || openCommentId === comment.id}
          />
        ))}

        {!comments.length && (
          <p className="text-on-surface-variant text-body-md">No comments yet. Be the first to comment.</p>
        )}

        <div ref={loadMoreRef} className="h-4" />
        {isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-4">Loading more...</p>}
      </section>

      {lightboxOpen && story.cover && (
        <ImageLightbox src={mediaUrl(story.cover)!} alt={story.title} onClose={() => setLightboxOpen(false)} />
      )}

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
            onClick={() => deleteMutation.mutate(slug, { onSuccess: () => navigate("/") })}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 rounded-full bg-error text-on-error text-label-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </GlassModal>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
