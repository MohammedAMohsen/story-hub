import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PrivateProfile, PublicProfile, FollowUser, PaginatedResponse } from "../types";
import { patchAuthorStoriesEverywhere } from "../lib/storyCache";

export function usePrivateProfile() {
  return useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const { data } = await api.get<PrivateProfile>("/api/profile/me/");
      return data;
    },
  });
}

export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await api.get<PublicProfile>(`/api/profile/${username}/`);
      return data;
    },
    enabled: !!username,
  });
}

export function useFollowList(show: "followers" | "following", author: string | undefined, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["follow-list", show, author ?? "me"],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<FollowUser>>("/api/follows/", {
        params: { show, author, page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled,
  });
}

export function useFollowFromProfile(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ username: string; follow: boolean }>("/api/follows/", { username });
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
      const prev = queryClient.getQueryData<PublicProfile>(["profile", username]);
      if (prev) {
        queryClient.setQueryData<PublicProfile>(["profile", username], {
          ...prev,
          is_following: !prev.is_following,
          followers_count: prev.followers_count + (prev.is_following ? -1 : 1),
        });
      }
      patchAuthorStoriesEverywhere(queryClient, username, { is_following: !(prev?.is_following ?? false) });
    },
    onSuccess: (data) => {
      const prev = queryClient.getQueryData<PublicProfile>(["profile", username]);
      if (prev) queryClient.setQueryData<PublicProfile>(["profile", username], { ...prev, is_following: data.follow });
      patchAuthorStoriesEverywhere(queryClient, username, { is_following: data.follow });
    },
  });
}
