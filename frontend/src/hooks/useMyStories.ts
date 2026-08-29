import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PaginatedResponse, Story } from "../types";

export type StoryStatus = "Draft" | "Published" | "Archived";

// GET /api/stories/me/?status=<Draft|Published|Archived>&page=
export function useMyStories(status: StoryStatus) {
  return useInfiniteQuery({
    queryKey: ["my-stories", status],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Story>>("/api/stories/me/", {
        params: { status, page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    refetchOnWindowFocus: true,
  });
}
