import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../_generated/api";
import { DataModel, Id } from "../_generated/dataModel";
import { GenericQueryCtx } from "convex/server";
import { ensureFileExists } from "../models/fileModel";

const readFilesToolSchema = z.object({
  fileIds: z
    .array(
      z
        .string()
        .min(1, "fileId cannot be empty")
        .describe("The ID of the file to read"),
    )
    .min(1, "Provide at least 1 fileId")
    .describe("The IDs of the files to read"),
});

export const readFilesTool = createTool({
  description:
    "Read the content of files from the project.returns the file contents",
  inputSchema: readFilesToolSchema,
  execute: async (ctx, args, options): Promise<string> => {
    // ctx has agent, userId, threadId, messageId
    // as well as ActionCtx properties like auth, storage, runMutation, and runAction
    try {
      const results: { id: string; name: string; content: string }[] = [];
      for (const fileId of args.fileIds) {
        const file = await ctx.runQuery(api.controller.files.getFile, {
          fileId: fileId as Id<"files">,
        });
        if (file && file.content) {
          results.push({
            id: fileId,
            name: file.fileName,
            content: file.content,
          });
        }
      }

      if (results.length === 0) {
        return `No files found with the given IDs. Use ListFiles to get Valid FileIds`;
      }

      return JSON.stringify(results);
    } catch (error) {
      console.error("Error reading files:", error);
      return `Error reading files: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
});

// const listFilesToolSchema = z.object({
//   projectId: z
//     .string()
//     .min(1, "projectId cannot be empty")
//     .describe("The ID of the project"),
// });

export const listFilesTool = ({ projectId }: { projectId: string }) => {
  return createTool({
    description:
      "List all files and folders in the project. Returns names, ID'S, fileType and parentId for each Item.Items with parentID:null are at root level. use the parentId to undertand the folder structure,items with the same parentId are in the same folder, if parentId is undefined, it means the file is at the root level",
    inputSchema: z.object({}),
    execute: async (ctx): Promise<string> => {
      // ctx has agent, userId, threadId, messageId
      // as well as ActionCtx properties like auth, storage, runMutation, and runAction
      try {
        const files = await ctx.runQuery(
          api.controller.files.getProjectFilesTool,
          {
            projectId: projectId as Id<"projects">,
          },
        );

        //   sort folders first , then files and in alphabetical order
        const sortedFiles = files.sort((a, b) => {
          if (a.fileType === "folder" && b.fileType === "file") {
            return -1;
          }
          if (a.fileType === "file" && b.fileType === "folder") {
            return 1;
          }
          return a.fileName.localeCompare(b.fileName);
        });

        const fileList = sortedFiles.map((file) => ({
          id: file._id,
          name: file.fileName,
          type: file.fileType,
          parentId: file.parentId ?? null,
        }));

        return JSON.stringify(fileList);
      } catch (error) {
        console.error("Error listing files:", error);
        return `Error listing files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};

export const updateFileTool = createTool({
  description:
    "Update the content of a specific file in the project. Returns the file contents",
  inputSchema: z.object({
    fileId: z
      .string()
      .min(1, "fileId cannot be empty")
      .describe("The ID of the file to update"),
    content: z
      .string()
      .min(1, "content cannot be empty")
      .describe("The new content of the file "),
  }),
  execute: async (ctx, args): Promise<string> => {
    // validate that the file exists
    const fileInfo = await ctx.runQuery(api.controller.files.getFileById, {
      fileId: args.fileId as Id<"files">,
    });
    if (!fileInfo) {
      return `ERROR: File with ID ${args.fileId} not found. Use ListFiles TOOL to get  Valid File Id's`;
    }
    if (fileInfo.fileType === "folder") {
      return `ERROR: File with ID ${args.fileId} is a folder. Use ListFiles TOOL to get  Valid File Id's`;
    }

    try {
      await ctx.runMutation(api.controller.files.updateFileToolHandler, {
        fileId: args.fileId as Id<"files">,
        content: args.content,
      });

      return JSON.stringify({
        id: args.fileId,
        name: fileInfo.fileName,
        type: fileInfo.fileType,
        parentId: fileInfo.parentId ?? null,
      });
    } catch (error) {
      console.error("Error reading files:", error);
      return `ERROR: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
});

export const createFilesTool = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  return createTool({
    description:
      "Create multiple files at once in the sme folder. use this to batch create files that share the same parent folder. more efficient than creating files one by one.",
    inputSchema: z.object({
      parentId: z
        .string()
        .describe(
          "The ID of the parent folder. use empty strings for root level. Must be a valid folder Id from listFiles.",
        )
        .min(1, "parentId cannot be empty"),
      files: z.array(
        z
          .object({
            name: z
              .string()
              .min(1, "name cannot be empty")
              .describe("The name of the file to create"),
            content: z.string().describe("The content of the file to create"),
            // fileType: z.enum(["file", "folder"]),
          })
          .describe("an array of files to create"),
      ),
    }),
    execute: async (ctx, { files, parentId }): Promise<string> => {
      // validate that the file exists

      let resolvedParentId: Id<"files"> | undefined;
      if (parentId && parentId !== "") {
        try {
          resolvedParentId = parentId as Id<"files">;
          const parentFolder = await ctx.runQuery(
            api.controller.files.getFileById,
            {
              fileId: resolvedParentId,
            },
          );
          if (!parentFolder) {
            return `ERROR: Folder with ID ${parentId} not found. Use ListFiles TOOL to get  Valid File Id's`;
          }
          if (parentFolder.fileType !== "folder") {
            return `ERROR: Folder with ID ${parentId} is not a folder. Use ListFiles TOOL to get  Valid File Id's`;
          }
        } catch (error) {
          return `ERROR: Invalid ParentId ${parentId}. Use ListFiles TOOL to get  Valid File Id's`;
        }
      }

      try {
        const results = await ctx.runMutation(
          api.controller.files.createFilesToolHandler,
          {
            projectId,
            parentId: resolvedParentId,
            files,
          },
        );

        const created = results.filter((file) => !file.error);
        const failed = results.filter((file) => file.error);

        let response = `Created ${created.length} file(s)`;
        if (created.length > 0) {
          response += `: ${created.map((file) => file.name).join(", ")}`;
        }
        if (failed.length > 0) {
          response += ` and failed to create ${failed.length} file(s) ${failed.map((file) => file.error).join(", ")}`;
        }

        return response;
      } catch (error) {
        console.error("Error creating files:", error);
        return `ERROR  creating files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};

export const createFolderTool = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  return createTool({
    description: "Create a new folder in the project. Returns the folder ID",
    inputSchema: z.object({
      parentFolderId: z
        .string()
        .describe(
          "The ID(not the name!) of the parent folder from listFiles. use empty strings for root level.",
        ),
      folderName: z
        .string()
        .min(1, "folderName cannot be empty")
        .describe("The name of the folder to create"),
    }),
    execute: async (ctx, { parentFolderId, folderName }): Promise<string> => {
      // validate that the file exists

      let resolvedParentId: Id<"files"> | undefined;
      if (parentFolderId) {
        try {
          resolvedParentId = parentFolderId as Id<"files">;
          const parentFolder = await ctx.runQuery(
            api.controller.files.getFileById,
            {
              fileId: resolvedParentId,
            },
          );
          if (!parentFolder) {
            return `ERROR: Folder with ID ${parentFolderId} not found. Use ListFiles TOOL to get  Valid File Id's`;
          }
          if (parentFolder.fileType !== "folder") {
            return `ERROR: Folder with ID ${parentFolderId} is not a folder. Use ListFiles TOOL to get  Valid File Id's`;
          }
        } catch (error) {
          return `ERROR: Invalid ParentFolderId ${parentFolderId}. Use ListFiles TOOL to get  Valid File Id's`;
        }

        // await ctx.runMutation(api.controller.files.createFolderToolHandler, {
        //   projectId,
        //   parentFolderId: resolvedParentId,
        //   folderName,
        // });
      }

      try {
        const createdFolderId = await ctx.runMutation(
          api.controller.files.createFolderToolHandler,
          {
            projectId,
            parentFolderId: resolvedParentId,
            folderName,
          },
        );

        return ` Folder created with ID ${createdFolderId} and name ${folderName}`;
      } catch (error) {
        console.error("Error creating folder:", error);
        return `ERROR  creating folder: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
