import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { usePublicProfile, useFollowFromProfile } from "../hooks/useProfile";
import { useAuthorStories } from "../hooks/useAuthorStories";
import { useAuthStore } from "../store/authStore";
import { StoryCard } from "../components/story/StoryCard";
import { FollowersModal } from "../components/profile/FollowersModal";
import { MessageComingSoon } from "../components/profile/MessageComingSoon";
import { mediaUrl } from "../lib/media";
import { GitHubIcon, LinkedInIcon } from "../components/profile/BrandIcons";

export function PublicProfile() {
  const { username = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuthStore();

  const { data: profile, isLoading } = usePublicProfile(username);
  const followMutation = useFollowFromProfile(username);
  const storiesQuery = useAuthorStories(username, !!profile);
  const stories = storiesQuery.data?.pages.flatMap((p) => p.results ?? []).filter(Boolean) ?? [];

  const [followersOpen, setFollowersOpen] = useState<"followers" | "following" | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const [showMessageNotice, setShowMessageNotice] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = bioRef.current;
    if (!el || bioExpanded) return;
    setBioOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [profile?.bio, bioExpanded]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && storiesQuery.hasNextPage && !storiesQuery.isFetchingNextPage) {
          storiesQuery.fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [storiesQuery]);

  useEffect(() => {
    if (!showMessageNotice) return;
    const t = setTimeout(() => setShowMessageNotice(false), 3000);
    return () => clearTimeout(t);
  }, [showMessageNotice]);

  function handleFollow() {
    if (!isAuthenticated) return navigate("/follow-required");
    followMutation.mutate();
  }

  if (isAuthenticated && currentUser?.username === username) {
    return <Navigate to="/profile" replace />;
  }

  if (isLoading || !profile) {
    return <p className="text-center text-on-surface-variant py-20 w-full">Loading...</p>;
  }

  return (
    <div className="w-full flex flex-col gap-8 max-w-[900px] mx-auto items-center relative pb-12">
      <div className="w-full bg-surface-container-lowest shadow-sm border-x border-b border-outline-variant/10 overflow-hidden relative rounded-2xl">
        <div className="h-40 md:h-52 w-full relative">
          {mediaUrl(profile.cover) && <img src={mediaUrl(profile.cover)} alt="Cover" className="w-full h-full object-cover" />}
        </div>
        <div className="px-6 md:px-10 pb-6 relative">
          <div className="absolute -top-14 left-6 md:left-10 flex items-end">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-surface-container-lowest bg-surface-variant shadow-md overflow-hidden flex items-center justify-center">
                {mediaUrl(profile.avatar) ? (
                  <img src={mediaUrl(profile.avatar)} alt={profile.username} className="w-full h-full object-cover" />
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

          <div className="flex justify-end pt-20 md:pt-5 mb-2 gap-3">
            <button
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className={
                profile.is_following
                  ? "rounded-full font-label-sm transition-all flex items-center gap-1 px-4 py-1 text-sm border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                  : "rounded-full font-label-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center gap-1 px-4 py-1 text-sm border border-transparent bg-primary text-on-primary"
              }
            >
              <span className="material-symbols-outlined text-[16px]">{profile.is_following ? "person_check" : "person_add"}</span>
              {profile.is_following ? "Following" : "Follow"}
            </button>
            <button
              onClick={() => setShowMessageNotice(true)}
              className="rounded-full bg-surface-container border border-outline-variant/20 text-on-surface font-label-sm hover:bg-surface-container-high transition-all flex items-center gap-1 px-4 py-1 text-sm shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Message
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <div>
              <h1 className="font-headline-md text-on-surface mb-1 text-[18px] font-bold">
                {profile.full_name}
              </h1>
              <span className="text-body-md text-on-surface-variant">@{profile.username}</span>
            </div>

            {profile.bio && (
              <div className="flex flex-col gap-1">
                <p ref={bioRef} className={`text-body-md text-on-surface max-w-2xl leading-relaxed ${bioExpanded ? "" : "line-clamp-2"}`}>
                  {profile.bio}
                </p>
                {(bioOverflows || bioExpanded) && (
                  <button
                    onClick={() => setBioExpanded((v) => !v)}
                    className="text-primary font-label-sm text-sm hover:underline w-fit"
                  >
                    {bioExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-on-surface-variant text-label-sm">
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

      <div className="w-full flex flex-col gap-8 md:gap-12">
        {stories.length ? (
          stories.map((s) => <StoryCard key={s.slug} story={s} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[40px] text-primary/40">auto_stories</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-3">No stories yet</h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {profile.full_name} hasn't published any stories yet.
            </p>
          </div>
        )}
        <div ref={loadMoreRef} className="h-4" />
        {storiesQuery.isFetchingNextPage && <p className="text-center text-xs text-on-surface-variant py-4">Loading more...</p>}
      </div>

      <FollowersModal open={followersOpen !== null} onClose={() => setFollowersOpen(null)} show={followersOpen ?? "followers"} author={username} />
      <MessageComingSoon show={showMessageNotice} />
    </div>
  );
}
