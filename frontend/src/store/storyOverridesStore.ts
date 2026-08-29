import { create } from "zustand";
import type { Story } from "../types";

//

type StoryOverride = Partial<Pick<Story, "is_liked" | "likes_count" | "is_saved">>;

interface StoryOverridesState {
  storyOverrides: Record<string, StoryOverride>;
  followOverrides: Record<string, boolean>;
  setStoryOverride: (slug: string, patch: StoryOverride) => void;
  setFollowOverride: (username: string, isFollowing: boolean) => void;
}

export const useStoryOverridesStore = create<StoryOverridesState>((set) => ({
  storyOverrides: {},
  followOverrides: {},
  setStoryOverride: (slug, patch) =>
    set((state) => ({
      storyOverrides: { ...state.storyOverrides, [slug]: { ...state.storyOverrides[slug], ...patch } },
    })),
  setFollowOverride: (username, isFollowing) =>
    set((state) => ({ followOverrides: { ...state.followOverrides, [username]: isFollowing } })),
}));

export function useDisplayStory(story: Story): Story {
  const storyOverride = useStoryOverridesStore((s) => s.storyOverrides[story.slug]);
  const followOverride = useStoryOverridesStore((s) => s.followOverrides[story.username]);
  return {
    ...story,
    ...storyOverride,
    is_following: followOverride ?? story.is_following,
  };
}
