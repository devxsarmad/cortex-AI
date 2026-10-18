import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteConversation, getConversation, listConversations } from "@/services/conversation.service";

export const conversationKeys = {
  all: ["conversations"] as const,
  detail: (id: string) => ["conversations", id] as const
};

export const useConversations = () => {
  const queryClient = useQueryClient();
  const conversationsQuery = useQuery({ queryKey: conversationKeys.all, queryFn: listConversations });
  const loadMutation = useMutation({
    mutationFn: (id: string) => queryClient.fetchQuery({ queryKey: conversationKeys.detail(id), queryFn: () => getConversation(id) })
  });
  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: conversationKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    }
  });
  return { conversationsQuery, loadMutation, deleteMutation };
};

