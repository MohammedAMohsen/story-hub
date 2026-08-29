import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Story } from "../types";
import { patchStoryEverywhere, patchAuthorStoriesEverywhere } from "../lib/storyCache";

export function useStory(slug: string) {
  return useQuery({
    queryKey: ["story", slug],
    queryFn: async () => {
      const { data } = await api.get<Story>(`/api/stories/${slug}/`);
      return data;
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useLikeStoryDetail(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ liked: boolean; likes_count: number }>("/api/like/", {
        type: "story",
        object_id: slug,
      });
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
      const prev = queryClient.getQueryData<Story>(["story", slug]);
      if (prev) {
        patchStoryEverywhere(queryClient, slug, {
          is_liked: !prev.is_liked,
          likes_count: prev.likes_count + (prev.is_liked ? -1 : 1),
        });
      }
    },
    onSuccess: (data) => {
      patchStoryEverywhere(queryClient, slug, { is_liked: data.liked, likes_count: data.likes_count });
    },
  });
}

export function useBookmarkStoryDetail(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ saved: boolean }>("/api/bookmarks/", { story_slug: slug });
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
      const prev = queryClient.getQueryData<Story>(["story", slug]);
      if (prev) patchStoryEverywhere(queryClient, slug, { is_saved: !prev.is_saved });
    },
    onSuccess: (data) => {
      patchStoryEverywhere(queryClient, slug, { is_saved: data.saved });
    },
  });
}

export function useFollowUserDetail(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.post<{ username: string; follow: boolean }>("/api/follows/", { username });
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
      const prev = queryClient.getQueryData<Story>(["story", slug]);
      if (prev) patchStoryEverywhere(queryClient, slug, { is_following: !prev.is_following });
    },
    onSuccess: (data) => {
      patchAuthorStoriesEverywhere(queryClient, data.username, { is_following: data.follow });
    },
  });
}
