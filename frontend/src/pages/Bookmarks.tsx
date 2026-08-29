import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBookmarks } from "../hooks/useBookmarks";
import { StoryCard } from "../components/story/StoryCard";

export function Bookmarks() {
  const navigate = useNavigate();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useBookmarks();
  const stories = data?.pages.flatMap((p) => p.results.map((b) => b.story)) ?? [];

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
    <div className="w-full flex flex-col gap-8 max-w-[800px] mx-auto items-center relative">
      <div className="w-full flex justify-between mb-2 border-b border-outline-variant/30 pb-4 items-center">
        <div className="flex items-center gap-4 group">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary shadow-sm transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[28px]">bookmarks</span>
          </div>
          <div className="relative">
            <h1 className="font-headline-md text-headline-md md:text-[32px] font-bold text-on-surface tracking-tight">
              Bookmarks
            </h1>
            <div className="absolute -bottom-1.5 left-0 w-1/3 h-1.5 bg-primary/30 rounded-full" />
          </div>
        </div>
      </div>

      {isLoading && <p className="text-center text-on-surface-variant py-10">Loading...</p>}

      {!isLoading && !stories.length && (
        <div className="flex flex-col items-center text-center max-w-md mx-auto py-16">
          <div className="relative w-24 h-24 flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-primary/15 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[40px]">bookmark</span>
            </div>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-4">Your sanctuary is empty.</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
            You haven't saved any stories yet. Follow the storytellers and preserve the tales that move you.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-full bg-primary text-on-primary font-label-sm text-label-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Explore Stories
          </button>
        </div>
      )}

      <div className="flex flex-col gap-8 md:gap-12 mt-4 w-full max-w-[800px] mx-auto">
        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
        <div ref={loadMoreRef} className="h-4" />
        {isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-4">Loading more...</p>}
      </div>
    </div>
  );
}
