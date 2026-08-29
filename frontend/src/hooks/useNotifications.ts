import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import type { Notification, PaginatedResponse } from "../types";

export function useNotificationsCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>("/api/notifications-count/");
      return data.count;
    },
    enabled: isAuthenticated,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationsPreview(enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["notifications-preview"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Notification>>("/api/notifications/");
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      return data.results;
    },
    enabled,
  });
}

export function useNotificationsInfinite(enabled: boolean) {
  const queryClient = useQueryClient();
  return useInfiniteQuery({
    queryKey: ["notifications-infinite"],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<PaginatedResponse<Notification>>("/api/notifications/", {
        params: { page: pageParam },
      });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled,
  });
}
