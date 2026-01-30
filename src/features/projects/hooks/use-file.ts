import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export const fileQueryOptions = {
  getFolderContents: ({
    projectId,
    parentFolderId,
    enabled,
  }: {
    projectId: Id<"projects">;
    parentFolderId?: Id<"files">;
    enabled?: boolean;
  }) =>
    convexQuery(
      api.controller.files.getFolderContents,
      enabled
        ? {
            projectId,
            parentFolderId,
          }
        : "skip",
    ),
};

export const useFolderContents = ({
  projectId,
  parentFolderId,
  enabled,
}: {
  projectId: Id<"projects">;
  parentFolderId?: Id<"files">;
  enabled?: boolean;
}) => {
  return useQuery(
    fileQueryOptions.getFolderContents({
      parentFolderId,
      projectId,
      enabled,
    }),
  );
};

// ----------------------MUTATIONS---------------------------//
export const useCreateFile = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.controller.files.createFile),
  });
};

export const useCreateFolder = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.controller.files.createFolder),
  });
};
