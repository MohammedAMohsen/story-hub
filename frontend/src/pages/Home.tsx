import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStories } from "../hooks/useStories";
import { StoryCard } from "../components/story/StoryCard";
import { FeedTabs } from "../components/layout/FeedTabs";
import { useAuthStore } from "../store/authStore";

export function Home() {
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const tab = searchParams.get("feed") === "following" ? "following" : "for-you";
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;

  const showFollowGate = tab === "following" && !isAuthenticated;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useStories(
    showFollowGate ? "for-you" : tab,
    { category, tag, search }
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || showFollowGate) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, showFollowGate]);

  const stories = data?.pages.flatMap((p) => p.results) ?? [];
  const activeFilter = category || tag || search;

  return (
    <div className="w-full flex flex-col gap-8 max-w-[800px] mx-auto items-center relative">
      <FeedTabs />

      {showFollowGate ? (
        <div className="w-full flex flex-col items-center text-center py-16 px-6 max-w-lg mx-auto">
          <div className="relative w-24 h-24 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/8 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-primary/10" />
            <div className="relative w-14 h-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] text-primary">lock</span>
            </div>
          </div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface mb-4">
            This corner is for members only.
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-10 max-w-sm">
            Following your favorite storytellers, and keeping their new stories close, is something we save for
            readers who've made a home here. It only takes a moment to join.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-3 rounded-full bg-primary text-on-primary text-label-sm font-bold hover:shadow-lg hover:scale-[1.03] transition-all duration-300"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-7 py-3 rounded-full border border-outline-variant text-on-surface text-label-sm font-bold hover:border-primary hover:text-primary transition-colors duration-300"
            >
              Create an account
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeFilter && (
            <div className="flex items-center gap-2 -mb-4 mt-2">
              <span className="text-xs text-on-surface-variant">
                {category && <>Category: <b className="text-primary">{category}</b></>}
                {tag && <>Tag: <b className="text-primary">{tag}</b></>}
                {search && <>Search: <b className="text-primary">"{search}"</b></>}
              </span>
              <button
                onClick={() => navigate("/")}
                className="text-xs text-on-surface-variant hover:text-error transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-8 md:gap-12 mt-4 w-full max-w-[800px] mx-auto">
            {isLoading && <p className="text-center text-on-surface-variant py-10">Loading...</p>}

            {!isLoading && tab === "following" && stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-[48px] text-primary/40">person_add</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-4">Your circle is quiet.</h3>
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
            ) : !isLoading && stories.length === 0 ? (
              <p className="text-center text-on-surface-variant py-10">No matching stories</p>
            ) : (
              stories.map((story) => <StoryCard key={story.slug} story={story} />)
            )}

            <div ref={loadMoreRef} className="h-4" />
            {isFetchingNextPage && <p className="text-center text-on-surface-variant py-4">Loading more...</p>}
          </div>
        </>
      )}
    </div>
  );
}
