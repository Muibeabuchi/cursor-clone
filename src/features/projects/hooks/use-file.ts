import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";

export const fileQueryOptions = {
  getInitialProjectFolderContents: ({
    projectId,
  }: {
    projectId: Id<"projects">;
  }) =>
    convexQuery(api.controller.files.getFolderContents, {
      projectId,
    }),
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
  getFile: ({
    fileId,
    // enabled,
  }: {
    fileId: Id<"files"> | null;
    // enabled: boolean;
  }) => {
    // if(!enabled) return;
    const enabled = !!fileId;
    return convexQuery(
      api.controller.files.getFile,
      enabled
        ? {
            fileId,
          }
        : "skip",
    );
  },
  getFilePath: ({
    fileId,
    // enabled,
  }: {
    fileId: Id<"files"> | null;
    // enabled: boolean;
  }) => {
    // if(!enabled) return;
    const enabled = !!fileId;
    return convexQuery(
      api.controller.files.getFilePath,
      enabled
        ? {
            fileId,
          }
        : "skip",
    );
  },
};

export const useFile = ({ fileId }: { fileId: Id<"files"> | null }) => {
  return useQuery(fileQueryOptions.getFile({ fileId }));
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

export const useInitialProjectFolderContents = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  return useSuspenseQuery(
    fileQueryOptions.getInitialProjectFolderContents({ projectId }),
  );
};

export const useFilePath = ({ fileId }: { fileId: Id<"files"> | null }) => {
  return useQuery(
    fileQueryOptions.getFilePath({
      fileId,
    }),
  );
};

// ----------------------MUTATIONS---------------------------//
export const useCreateFile = () => {
  return useMutation({
    mutationFn: useConvexMutation(
      api.controller.files.createFile,
    ).withOptimisticUpdate((localStorage, variables) => {
      const { projectId, parentFolderId, fileName, content } = variables;
      const data = localStorage.getQuery(
        api.controller.files.getFolderContents,
        {
          projectId,
          parentFolderId,
        },
      );
      if (!data) return;

      const now = Date.now();
      const newData: Doc<"files"> = {
        _id: crypto.randomUUID() as Id<"files">,
        _creationTime: now,
        fileName,
        fileType: "file",
        content,
        projectId,
        parentId: parentFolderId,
        updatedAt: now,
        // storageId: crypto.randomUUID() as Id<"_storage">,
      };

      const sortedFiles = [...data, newData].sort((a, b) => {
        if (a.fileType === "folder" && b.fileType === "file") {
          return -1;
        }
        if (a.fileType === "file" && b.fileType === "folder") {
          return 1;
        }
        return a.fileName.localeCompare(b.fileName);
      });
      localStorage.setQuery(
        api.controller.files.getFolderContents,
        {
          projectId,
          parentFolderId,
        },
        sortedFiles,
      );
    }),
  });
};

export const useCreateFolder = () => {
  return useMutation({
    mutationFn: useConvexMutation(
      api.controller.files.createFolder,
    ).withOptimisticUpdate((localStorage, variables) => {
      const { projectId, parentFolderId, folderName } = variables;
      const data = localStorage.getQuery(
        api.controller.files.getFolderContents,
        {
          projectId,
          parentFolderId,
        },
      );
      if (!data) return;

      const now = Date.now();
      const newData: Doc<"files"> = {
        _id: crypto.randomUUID() as Id<"files">,
        _creationTime: now,
        fileName: folderName,
        fileType: "folder",
        projectId,
        parentId: parentFolderId,
        updatedAt: now,
        // content:"",
        // storageId: crypto.randomUUID() as Id<"_storage">,
      };

      const sortedFiles = [...data, newData].sort((a, b) => {
        if (a.fileType === "folder" && b.fileType === "file") {
          return -1;
        }
        if (a.fileType === "file" && b.fileType === "folder") {
          return 1;
        }
        return a.fileName.localeCompare(b.fileName);
      });
      localStorage.setQuery(
        api.controller.files.getFolderContents,
        {
          projectId,
          parentFolderId,
        },
        sortedFiles,
      );
    }),
  });
};

export const useUpdateFile = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.controller.files.updateFile),
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationFn: useConvexMutation(api.controller.files.deleteFile),
  });
};

export const useRenameFile = () => {
  return useMutation({
    mutationFn: useConvexMutation(
      api.controller.files.renameFile,
    ).withOptimisticUpdate((localStorage, variables) => {
      const { fileId, newFileName, projectId, parentFolderId } = variables;
      const data = localStorage.getQuery(
        api.controller.files.getFolderContents,
        {
          projectId,
          parentFolderId,
        },
      );
      if (!data) return;

      // find the file and update its content

      const filteredData = data.map((file) => {
        if (file._id === fileId) {
          return { ...file, fileName: newFileName };
        }
        return file;
      });

      const sortedData = filteredData.sort((a, b) => {
        if (a.fileType === "folder" && b.fileType === "file") {
          return -1;
        }
        if (a.fileType === "file" && b.fileType === "folder") {
          return 1;
        }
        return a.fileName.localeCompare(b.fileName);
      });

      localStorage.setQuery(
        api.controller.files.getFolderContents,
        {
          projectId,
          parentFolderId,
        },
        sortedData,
      );
    }),
  });
};
