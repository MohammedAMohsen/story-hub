import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Story } from "../types";
import { patchStoryEverywhere, patchAuthorStoriesEverywhere } from "../lib/storyCache";

export function useLikeStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (story: Story) => {
      const { data } = await api.post<{ liked: boolean; likes_count: number }>("/api/like/", {
        type: "story",
        object_id: story.slug,
      });
      return data;
    },
    onMutate: async (story) => {
      await queryClient.cancelQueries();
      patchStoryEverywhere(queryClient, story.slug, {
        is_liked: !story.is_liked,
        likes_count: story.likes_count + (story.is_liked ? -1 : 1),
      });
    },
    onSuccess: (data, story) => {
      patchStoryEverywhere(queryClient, story.slug, { is_liked: data.liked, likes_count: data.likes_count });
    },
  });
}

export function useBookmarkStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (story: Story) => {
      const { data } = await api.post<{ saved: boolean }>("/api/bookmarks/", { story_slug: story.slug });
      return data;
    },
    onMutate: async (story) => {
      await queryClient.cancelQueries();
      patchStoryEverywhere(queryClient, story.slug, { is_saved: !story.is_saved });
    },
    onSuccess: (data, story) => {
      patchStoryEverywhere(queryClient, story.slug, { is_saved: data.saved });
      if (!data.saved) {
        queryClient.setQueriesData<any>({ queryKey: ["bookmarks"] }, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              results: page.results.filter((b: any) => b.story.slug !== story.slug),
            })),
          };
        });
      }
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.post<{ username: string; follow: boolean }>("/api/follows/", { username });
      return data;
    },
    onMutate: async (username) => {
      await queryClient.cancelQueries();
      let current: boolean | undefined;
      queryClient.getQueryCache().getAll().forEach((query) => {
        const data = query.state.data as any;
        const pages = data?.pages;
        if (!Array.isArray(pages)) return;
        for (const page of pages) {
          for (const item of page.results ?? []) {
            const story = item?.story ?? item;
            if (story?.username === username && typeof story?.is_following === "boolean") {
              current = story.is_following;
            }
          }
        }
      });
      if (current !== undefined) {
        patchAuthorStoriesEverywhere(queryClient, username, { is_following: !current });
      }
    },
    onSuccess: (data) => {
      patchAuthorStoriesEverywhere(queryClient, data.username, { is_following: data.follow });
    },
  });
}

export function useArchiveStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.patch(`/api/stories/${slug}/`, { status: "Archived" });
      return data;
    },
    onSuccess: (_data, slug) => {
      patchStoryEverywhere(queryClient, slug, { status: "Archived" });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["my-stories"] });
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await api.delete(`/api/stories/${slug}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["my-stories"] });
    },
  });
}
