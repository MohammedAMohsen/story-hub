import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowList } from "../hooks/useProfile";
import { useFollowUser } from "../hooks/useStoryActions";
import { useProfileLink } from "../lib/profileLink";
import { mediaUrl } from "../lib/media";

export function Following() {
  const navigate = useNavigate();
  const profileLink = useProfileLink();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFollowList("following", undefined, true);
  const users = data?.pages.flatMap((p) => p.results ?? []) ?? [];
  const followMutation = useFollowUser();

  const loadMoreRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="w-full max-w-[800px] mx-auto flex flex-col gap-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[28px]">group</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface">Following</h1>
      </div>
      <div className="h-px w-full bg-outline-variant/20" />

      {isLoading && <p className="text-center text-on-surface-variant py-10">Loading...</p>}

      {!isLoading && !users.length && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-[48px] text-primary/40">person_add</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Your circle is quiet.</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-10 leading-relaxed">
            It looks like you haven't followed any storytellers yet. Follow your favorite authors to see their
            latest stories here, or explore the latest trends to find your next inspiration.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-full bg-primary text-on-primary font-label-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Explore Latest Stories
          </button>
        </div>
      )}

      {!!users.length && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((u) => (
              <div
                key={u.username}
                className="flex flex-col p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group gap-4 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <button onClick={() => navigate(profileLink(u.username))} className="flex items-center gap-4 hover:opacity-80 transition-opacity text-left">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/5 bg-surface-variant flex items-center justify-center shrink-0">
                      {mediaUrl(u.avatar) ? (
                        <img alt={u.username} className="w-full h-full object-cover" src={mediaUrl(u.avatar)} />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant text-[24px]">person</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">{u.full_name}</span>
                      {(u.story_count !== undefined || u.followers_count !== undefined) && (
                        <span className="text-on-surface-variant text-label-sm">
                          {u.story_count ?? 0} Stories • {formatCount(u.followers_count ?? 0)} Followers
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => followMutation.mutate(u.username)}
                    className={
                      u.is_following
                        ? "px-4 py-1.5 rounded-full bg-primary/5 text-primary font-label-sm text-label-sm border border-primary/10 backdrop-blur-sm hover:bg-primary/10 transition-all shrink-0"
                        : "px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant font-label-sm text-label-sm hover:border-primary hover:text-primary transition-colors shrink-0"
                    }
                  >
                    {u.is_following ? "Following" : "Follow"}
                  </button>
                </div>
                {u.bio && (
                  <button
                    onClick={() => navigate(profileLink(u.username))}
                    className="text-body-md text-on-surface-variant line-clamp-1 mt-2 text-left hover:text-primary transition-colors"
                  >
                    {u.bio}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div ref={loadMoreRef} className="h-2" />
          {isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-4">Loading more...</p>}

          <div className="mt-4 p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center gap-4">
            <span className="material-symbols-outlined text-primary/40 text-[40px]">explore</span>
            <h2 className="font-headline-md text-[20px] text-on-surface">Discover New Voices</h2>
            <p className="text-on-surface-variant max-w-md">
              Explore trending stories and find more writers who share your passion for the quiet weight of words.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-8 py-2.5 rounded-full bg-primary text-on-primary font-label-sm hover:shadow-md transition-all"
            >
              Explore Stories
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
