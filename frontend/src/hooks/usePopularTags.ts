import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Tag {
  id: number;
  name: string;
}

export function usePopularTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get<Tag[]>("/api/tag/");
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}