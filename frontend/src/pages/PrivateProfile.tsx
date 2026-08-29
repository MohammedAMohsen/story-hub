import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivateProfile } from "../hooks/useProfile";
import { useMyStories } from "../hooks/useMyStories";
import { useLikedStories } from "../hooks/useLikedStories";
import { useBookmarks } from "../hooks/useBookmarks";
import { StoryCard } from "../components/story/StoryCard";
import { FollowersModal } from "../components/profile/FollowersModal";
import { useAuthStore } from "../store/authStore";
import { mediaUrl } from "../lib/media";
import { formatBirthDate } from "../lib/profileLink";
import { GitHubIcon, LinkedInIcon } from "../components/profile/BrandIcons";

type Tab = "stories" | "about" | "likes" | "saved";
const TABS: { key: Tab; label: string }[] = [
  { key: "stories", label: "Stories" },
  { key: "about", label: "About" },
  { key: "likes", label: "Likes" },
  { key: "saved", label: "Saved" },
];

export function PrivateProfile() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = usePrivateProfile();
  const [activeTab, setActiveTab] = useState<Tab>("stories");
  const [followersOpen, setFollowersOpen] = useState<"followers" | "following" | null>(null);

  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ stories: null, about: null, likes: null, saved: null });
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  const measure = useCallback((tab: Tab) => {
    const container = tabsContainerRef.current;
    const btn = tabRefs.current[tab];
    if (!container || !btn) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({ width: btnRect.width, left: btnRect.left - containerRect.left });
  }, []);

  useLayoutEffect(() => {
    measure(activeTab);
  }, [activeTab, measure]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => measure(activeTab));
    return () => cancelAnimationFrame(raf);
  }, [profile, activeTab, measure]);

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

  const storiesQuery = useMyStories("Published");
  const likesQuery = useLikedStories(activeTab === "likes");
  const savedQuery = useBookmarks();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const activeQuery =
    activeTab === "stories" ? storiesQuery : activeTab === "likes" ? likesQuery : activeTab === "saved" ? savedQuery : null;

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !activeQuery) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
          activeQuery.fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeQuery]);

  if (isLoading || !profile) {
    return <p className="text-center text-on-surface-variant py-20 w-full">Loading...</p>;
  }

  const stories = storiesQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const likedStories = likesQuery.data?.pages.flatMap((p) => p.results) ?? [];
  const savedBookmarks = savedQuery.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="w-full flex flex-col gap-8 max-w-[900px] mx-auto items-center relative pb-12">
      <div className="w-full bg-surface-container-lowest shadow-sm border-x border-b border-outline-variant/10 overflow-hidden relative rounded-2xl">
        <div className="h-40 md:h-52 w-full relative">
          {mediaUrl(profile.cover) && (
            <img src={mediaUrl(profile.cover)} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="px-6 md:px-10 pb-6 relative">
          <div className="absolute -top-14 left-6 md:left-10 flex items-end">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-surface-container-lowest bg-surface-variant shadow-md overflow-hidden flex items-center justify-center">
                {mediaUrl(profile.avatar) ? (
                  <img src={mediaUrl(profile.avatar)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[42px]">person</span>
                )}
              </div>
              {profile.is_identity_verified && (
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-[#1DA1F2]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    verified
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-3 mb-2 gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="rounded-full bg-primary text-on-primary font-label-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-2 px-4 py-1.5 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit Profile
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <div>
              <h1 className="font-headline-md text-on-surface mb-1 text-[18px] font-bold">
                {currentUser?.full_name ?? ""}
              </h1>
              {currentUser?.username && <span className="text-body-md text-on-surface-variant">@{currentUser.username}</span>}
            </div>

            {profile.bio && <p className="text-body-md text-on-surface max-w-2xl leading-relaxed line-clamp-2">{profile.bio}</p>}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-on-surface-variant text-label-sm">
              {profile.location && (
                <div className="flex items-center gap-1.5 group cursor-help relative">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span>{profile.location}</span>
                  <span className="material-symbols-outlined text-[14px] text-outline ml-1">lock</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-inverse-surface text-inverse-on-surface text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center shadow-md">
                    Private information, not visible to others
                  </div>
                </div>
              )}
              {profile.birth_date && (
                <div className="flex items-center gap-1.5 group cursor-help relative">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>{formatBirthDate(profile.birth_date)}</span>
                  <span className="material-symbols-outlined text-[14px] text-outline ml-1">lock</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-inverse-surface text-inverse-on-surface text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 text-center shadow-md">
                    Private information, not visible to others
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto md:ml-0">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined text-[24px]">language</span>
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all text-on-surface-variant hover:text-primary">
                    <GitHubIcon />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all text-on-surface-variant hover:text-primary">
                    <LinkedInIcon />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5 pt-3 border-t border-outline-variant/10">
              <div className="flex gap-1.5">
                <span className="font-bold text-on-surface">{profile.story_count}</span>
                <span className="text-on-surface-variant">Stories</span>
              </div>
              <button onClick={() => setFollowersOpen("following")} className="flex gap-1.5 hover:underline decoration-primary">
                <span className="font-bold text-on-surface">{profile.following_count}</span>
                <span className="text-on-surface-variant hover:text-primary transition-colors">Following</span>
              </button>
              <button onClick={() => setFollowersOpen("followers")} className="flex gap-1.5 hover:underline decoration-primary">
                <span className="font-bold text-on-surface">{profile.followers_count}</span>
                <span className="text-on-surface-variant hover:text-primary transition-colors">Followers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={tabsContainerRef}
        className="sticky top-16 z-40 flex items-center justify-center mb-2 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-sm p-1 border border-outline-variant/10 w-full max-w-2xl mx-auto"
      >
        <span
          className="absolute top-1 bottom-1 left-0 rounded-full bg-primary transition-all duration-300 ease-in-out z-0"
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[tab.key] = el;
            }}
            onClick={() => setActiveTab(tab.key)}
            className={`relative z-10 px-6 py-2.5 rounded-full text-center font-label-sm text-label-sm flex-1 min-w-[80px] transition-colors ${
              activeTab === tab.key ? "text-on-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={activeTab} className="w-full flex flex-col gap-8 md:gap-12 animate-in fade-in duration-300">
        {activeTab === "stories" &&
          (stories.length ? (
            stories.map((s) => <StoryCard key={s.slug} story={s} />)
          ) : (
            <EmptyState icon="auto_stories" title="No published stories" text="Stories you publish will appear here." />
          ))}

        {activeTab === "about" && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm">
            {profile.bio ? (
              <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line text-left w-full">{profile.bio}</p>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[40px] text-primary/40">subject</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">No extended bio yet</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
                  You haven't written a bio to tell readers more about your background, interests, and the kinds of
                  stories you like to tell.
                </p>
                <button
                  onClick={() => navigate("/settings")}
                  className="px-6 py-2.5 rounded-full bg-primary/10 text-primary font-label-sm hover:bg-primary/20 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Write Bio
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === "likes" &&
          (likedStories.length ? (
            likedStories.map((s) => <StoryCard key={s.slug} story={s} />)
          ) : (
            <EmptyState icon="favorite" title="No liked stories" text="Stories you like will appear here." />
          ))}

        {activeTab === "saved" &&
          (savedBookmarks.length ? (
            savedBookmarks.map((b) => <StoryCard key={b.story.slug} story={b.story} />)
          ) : (
            <EmptyState icon="bookmark" title="No saved stories" text="Stories you save for later will appear here." />
          ))}

        <div ref={loadMoreRef} className="h-4" />
        {activeQuery?.isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-4">Loading more...</p>}
      </div>

      <FollowersModal open={followersOpen !== null} onClose={() => setFollowersOpen(null)} show={followersOpen ?? "followers"} />
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[40px] text-primary/40">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}