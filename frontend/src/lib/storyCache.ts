import type { QueryClient } from "@tanstack/react-query";
import type { Story } from "../types";

//
//

function patchItemBySlug(item: unknown, slug: string, patch: Partial<Story>): unknown {
  if (!item || typeof item !== "object") return item;
  const obj = item as Record<string, unknown>;
  if (obj.slug === slug) return { ...obj, ...patch };
  if (obj.story && typeof obj.story === "object" && (obj.story as Story).slug === slug) {
    return { ...obj, story: { ...(obj.story as Story), ...patch } };
  }
  return item;
}

function patchItemByUsername(item: unknown, username: string, patch: Partial<Story>): unknown {
  if (!item || typeof item !== "object") return item;
  const obj = item as Record<string, unknown>;
  if (obj.username === username) return { ...obj, ...patch };
  if (obj.story && typeof obj.story === "object" && (obj.story as Story).username === username) {
    return { ...obj, story: { ...(obj.story as Story), ...patch } };
  }
  return item;
}

function forEachStoryCache(queryClient: QueryClient, mutate: (item: unknown) => unknown) {
  queryClient.getQueryCache().getAll().forEach((query) => {
    const data = query.state.data as any;
    if (!data || typeof data !== "object") return;

    if (Array.isArray(data.pages)) {
      let changed = false;
      const newPages = data.pages.map((page: any) => {
        if (!page || !Array.isArray(page.results)) return page;
        const newResults = page.results.map((item: unknown) => {
          const updated = mutate(item);
          if (updated !== item) changed = true;
          return updated;
        });
        return newResults === page.results ? page : { ...page, results: newResults };
      });
      if (changed) queryClient.setQueryData(query.queryKey, { ...data, pages: newPages });
      return;
    }

    const updated = mutate(data);
    if (updated !== data) queryClient.setQueryData(query.queryKey, updated);
  });
}

export function patchStoryEverywhere(queryClient: QueryClient, slug: string, patch: Partial<Story>) {
  forEachStoryCache(queryClient, (item) => patchItemBySlug(item, slug, patch));
}

export function patchAuthorStoriesEverywhere(queryClient: QueryClient, username: string, patch: Partial<Story>) {
  forEachStoryCache(queryClient, (item) => patchItemByUsername(item, username, patch));
}
