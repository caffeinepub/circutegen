import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PromptEntry } from "../backend.d.ts";
import { useActor } from "./useActor";

export function useRecentPrompts() {
  const { actor, isFetching } = useActor();
  return useQuery<PromptEntry[]>({
    queryKey: ["recentPrompts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentPrompts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavePrompt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, string>({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.savePrompt(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentPrompts"] });
    },
  });
}
