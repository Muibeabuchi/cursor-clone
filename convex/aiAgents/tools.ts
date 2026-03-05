import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

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
