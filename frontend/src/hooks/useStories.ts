import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PaginatedResponse, Story } from "../types";

type Feed = "for-you" | "following";

export interface StoryFilters {
  category?: string;
  tag?: string;
  search?: string;
}

// "for-you" -> GET /api/stories/   |   "following" -> GET /api/stories/following/
export function useStories(feed: Feed, filters: StoryFilters = {}) {
  const endpoint = feed === "following" ? "/api/stories/following/" : "/api/stories/";

  return useInfiniteQuery({
    queryKey: ["stories", feed, filters],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Story>>(endpoint, {
        params: {
          page: pageParam,
          category__name: filters.category || undefined,
          tags__name: filters.tag || undefined,
          search: filters.search || undefined,
        },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    refetchInterval: 45_000,
    refetchOnWindowFocus: true,
  });
}
