import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useFollowList } from "../../hooks/useProfile";
import { useFollowUser } from "../../hooks/useStoryActions";
import { useAuthStore } from "../../store/authStore";
import { useProfileLink } from "../../lib/profileLink";
import { mediaUrl } from "../../lib/media";
import { GlassModal } from "../ui/GlassModal";

interface Props {
  open: boolean;
  onClose: () => void;
  show: "followers" | "following";
  author?: string;
}

export function FollowersModal({ open, onClose, show, author }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUsername = useAuthStore((s) => s.user?.username);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFollowList(
    show,
    author,
    open && isAuthenticated
  );
  const users = data?.pages.flatMap((p) => p.results ?? []) ?? [];
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const profileLink = useProfileLink();
  const followMutation = useFollowUser();

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !open) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, open]);

  return (
    <GlassModal open={open} onClose={onClose} title={show === "followers" ? "Followers" : "Following"}>
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px] text-primary/40">lock</span>
          </div>
          <h4 className="font-headline-md text-on-surface text-base font-semibold mb-1">Log in to see this list</h4>
          <p className="text-sm text-on-surface-variant">You need an account to view followers and following.</p>
        </div>
      ) : (
        <>
          {isLoading && <p className="text-body-md text-on-surface-variant py-4 text-center">Loading...</p>}
          <div className="flex flex-col gap-1 max-h-[60vh]">
        {users.map((u) => (
          <div key={u.username} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-primary/5 transition-colors">
            <Link to={profileLink(u.username)} onClick={onClose} className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center shrink-0">
                {mediaUrl(u.avatar) ? (
                  <img src={mediaUrl(u.avatar)} alt={u.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-on-surface text-body-md truncate">{u.full_name}</span>
                <span className="text-xs text-on-surface-variant truncate">@{u.username}</span>
              </div>
            </Link>
            {u.username !== currentUsername && (
              <button
                onClick={() => followMutation.mutate(u.username)}
                className={
                  u.is_following
                    ? "shrink-0 px-4 py-1.5 rounded-full bg-surface-container-high text-primary text-xs font-semibold border border-primary/20 hover:bg-primary/10 transition-colors"
                    : "shrink-0 px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant text-xs font-semibold hover:border-primary hover:text-primary transition-colors"
                }
              >
                {u.is_following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        ))}
        {!isLoading && !users.length && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-primary/40">
                {show === "followers" ? "group" : "person_search"}
              </span>
            </div>
            <h4 className="font-headline-md text-on-surface text-base font-semibold mb-1">
              {show === "followers" ? "No followers yet" : "Not following anyone yet"}
            </h4>
            <p className="text-sm text-on-surface-variant max-w-xs">
              {show === "followers"
                ? "When people follow this account, they'll show up here."
                : "Storytellers this account follows will show up here."}
            </p>
          </div>
        )}
        <div ref={loadMoreRef} className="h-2" />
        {isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-3">Loading more...</p>}
          </div>
        </>
      )}
    </GlassModal>
  );
}
