import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Comment, PaginatedResponse } from "../types";

type InfiniteCommentsData = { pages: PaginatedResponse<Comment>[]; pageParams: unknown[] };

function patchCommentInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  key: unknown[],
  id: string,
  patch: Partial<Comment>
) {
  queryClient.setQueryData<InfiniteCommentsData | undefined>(key, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        results: page.results.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
    };
  });
}

export function useComments(storySlug: string) {
  return useInfiniteQuery({
    queryKey: ["comments", storySlug],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Comment>>("/api/comments/", {
        params: { story: storySlug, page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useReplies(commentId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["replies", commentId],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Comment>>(`/api/comments/${commentId}/replies/`, {
        params: { page: pageParam },
      });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled,
    refetchInterval: enabled ? 15_000 : false,
    refetchOnWindowFocus: enabled,
  });
}

export function useCreateComment(storySlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, parent }: { content: string; parent?: string }) => {
      const { data } = await api.post<Comment>("/api/comments/", { content, parent }, { params: { story: storySlug } });
      return data;
    },
    onSuccess: (_data, variables) => {
      if (variables.parent) {
        queryClient.invalidateQueries({ queryKey: ["replies", variables.parent] });
      }
      queryClient.invalidateQueries({ queryKey: ["comments", storySlug] });
      const story = queryClient.getQueryData<any>(["story", storySlug]);
      if (story) queryClient.setQueryData(["story", storySlug], { ...story, comments_count: story.comments_count + 1 });
    },
  });
}

export function useUpdateComment(invalidateKey: unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data } = await api.patch<Comment>(`/api/comments/${id}/`, { content });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidateKey }),
  });
}

export function useDeleteComment(invalidateKey: unknown[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/comments/${id}/`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidateKey }),
  });
}

export function useLikeComment(storySlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: Comment) => {
      const { data } = await api.post<{ liked: boolean; likes_count: number }>("/api/like/", {
        type: "comment",
        object_id: comment.id,
      });
      return data;
    },
    onMutate: async (comment) => {
      const key = comment.parent ? ["replies", comment.parent] : ["comments", storySlug];
      patchCommentInCache(queryClient, key, comment.id, {
        is_liked: !comment.is_liked,
        likes_count: comment.likes_count + (comment.is_liked ? -1 : 1),
      });
    },
    onSuccess: (data, comment) => {
      const key = comment.parent ? ["replies", comment.parent] : ["comments", storySlug];
      patchCommentInCache(queryClient, key, comment.id, { is_liked: data.liked, likes_count: data.likes_count });
    },
  });
}
