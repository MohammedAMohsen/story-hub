import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Category } from "../types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/api/category/");
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
}
