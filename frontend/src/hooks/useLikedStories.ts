import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PaginatedResponse, Story } from "../types";

export function useLikedStories(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["liked-stories"],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Story>>("/api/stories/liked/", {
        params: { page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled,
    refetchOnWindowFocus: true,
  });
}
