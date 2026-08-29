import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMyStories, type StoryStatus } from "../hooks/useMyStories";
import { StoryCard } from "../components/story/StoryCard";

const TABS: { key: StoryStatus; label: string; icon: string }[] = [
  { key: "Draft", label: "Draft", icon: "edit_document" },
  { key: "Published", label: "Published", icon: "task_alt" },
  { key: "Archived", label: "Archived", icon: "inventory_2" },
];

export function MyStories() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StoryStatus>("Published");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyStories(activeTab);
  const stories = data?.pages.flatMap((p) => p.results) ?? [];

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

  const tabRefs = useRef<Record<StoryStatus, HTMLButtonElement | null>>({
    Draft: null,
    Published: null,
    Archived: null,
  });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  const measure = useCallback((tab: StoryStatus) => {
    const container = tabsContainerRef.current;
    const btn = tabRefs.current[tab];
    if (!container || !btn) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setIndicator({
      width: btnRect.width,
      left: btnRect.left - containerRect.left,
    });
  }, []);

  useLayoutEffect(() => {
    measure(activeTab);
  }, [activeTab, measure]);

  useEffect(() => {
    const container = tabsContainerRef.current;
    const btn = tabRefs.current[activeTab];
    if (!container || !btn || typeof ResizeObserver === "undefined") return;

    const onChange = () => measure(activeTab);
    const observer = new ResizeObserver(onChange);
    observer.observe(container);
    observer.observe(btn);
    window.addEventListener("resize", onChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onChange);
    };
  }, [activeTab, measure]);

  return (
    <div className="w-full flex flex-col gap-8 max-w-[800px] mx-auto items-center relative">
      <div className="w-full flex flex-col items-start">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 backdrop-blur-md border border-primary/10">
            <span className="material-symbols-outlined text-primary text-[32px] font-light">auto_stories</span>
          </div>
          <h1 className="font-headline-md text-on-surface font-semibold" style={{ fontSize: "35px" }}>
            My Stories
          </h1>
        </div>
        <div className="w-full h-px bg-primary/20 mb-8 rounded-full" />
      </div>

      <div
        ref={tabsContainerRef}
        className="sticky top-[76px] z-40 flex items-center justify-center mb-8 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-sm p-1 border border-outline-variant/10 mx-auto transition-shadow duration-150"
      >
        <span
          className="absolute top-1 bottom-1 left-0 rounded-full bg-primary/10 transition-all duration-150 ease-out z-0"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
        {TABS.map((tab, i) => (
          <div key={tab.key} className="contents">
            <button
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
              onClick={() => setActiveTab(tab.key)}
              className={`relative z-10 flex items-center gap-2 px-6 py-2 rounded-full transition-colors duration-150 text-label-sm font-label-sm ${
                activeTab === tab.key ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
            {i < TABS.length - 1 && <span className="text-outline-variant/30 self-center relative z-10">|</span>}
          </div>
        ))}
      </div>

      <div key={activeTab} className="flex flex-col gap-8 md:gap-12 w-full max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-1 duration-300">
        {isLoading && <p className="text-center text-on-surface-variant py-10">Loading...</p>}

        {!isLoading && !stories.length && activeTab === "Draft" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary/40 text-[50px]" style={{ fontSize: 40}}>edit_document</span>
            </div>
            <h3 className="text-headline-md text-on-surface mb-2">No drafts yet</h3>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              Your unfinished thoughts will live here until they are ready for the world.
            </p>
          </div>
        )}

        {!isLoading && !stories.length && activeTab === "Archived" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary/40 text-[50px]" style={{ fontSize: 40}}>inventory_2</span>
            </div>
            <h3 className="text-headline-md text-on-surface mb-2">Your archive is a quiet room.</h3>
            <p className="text-body-md text-on-surface-variant max-w-xs mb-8">
              You haven't archived any stories yet. Keeping your space tidy helps the mind focus on new narratives.
            </p>
            <button
              onClick={() => setActiveTab("Published")}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary hover:opacity-90 transition-all shadow-lg font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span>Return to Published</span>
            </button>
          </div>
        )}

        {!isLoading && !stories.length && activeTab === "Published" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary/40 text-[50px]" style={{ fontSize: 40}}>auto_stories</span>
            </div>
            <h3 className="text-headline-md text-on-surface mb-2">Your stories are empty</h3>
            <p className="text-body-md text-on-surface-variant max-w-xs mb-8">
              You haven't published any stories yet. Your journey as a storyteller begins with a single word.
            </p>
            <button
              onClick={() => navigate("/write")}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary font-label-sm text-label-sm hover:shadow-lg hover:bg-primary/90 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              <span>Create Story</span>
            </button>
          </div>
        )}

        {stories.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}

        <div ref={loadMoreRef} className="h-4" />
        {isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-4">Loading more...</p>}
      </div>
    </div>
  );
}
