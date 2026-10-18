import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDocument, listDocuments, retryDocument, uploadDocument } from "@/services/document.service";

export const documentKeys = { all: ["documents"] as const };

export const useDocuments = () => {
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({ queryKey: documentKeys.all, queryFn: listDocuments });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: documentKeys.all });
  return {
    documentsQuery,
    uploadMutation: useMutation({ mutationFn: uploadDocument, onSuccess: invalidate }),
    retryMutation: useMutation({ mutationFn: retryDocument, onSuccess: invalidate }),
    deleteMutation: useMutation({ mutationFn: deleteDocument, onSuccess: invalidate })
  };
};
