import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PaginatedResponse, Story } from "../types";

interface Bookmark {
  saved_at: string;
  story: Story;
}

export function useBookmarks() {
  return useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Bookmark>>("/api/bookmarks/", {
        params: { page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    refetchOnWindowFocus: true,
  });
}
