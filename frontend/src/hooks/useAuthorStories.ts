import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PaginatedResponse, Story } from "../types";

export function useAuthorStories(username: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["author-stories", username],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Story>>(`/api/stories/author/${username}/`, {
        params: { page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled,
  });
}
