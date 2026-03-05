import { ConvexError, v } from "convex/values";
import {
  authorizedProjectMutation,
  authorizedProjectQuery,
} from "../middleware/projectMiddleware";
import { FunctionReturnType } from "convex/server";
import { mutation, query } from "../_generated/server";
import {
  deleteRecursive,
  ensureFileBelongsToProject,
} from "../models/fileModel";
import {
  authorizedFileMutation,
  authorizedFileQuery,
} from "../middleware/fileMiddleware";
import { Doc, Id } from "../_generated/dataModel";
import { api } from "../_generated/api";

export const getFiles = authorizedProjectQuery({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, args) {
    const { project } = ctx;

    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    return files;
  },
});

//* Can be used for Agent "ReadFile" tool
export const getFile = authorizedFileQuery({
  args: { fileId: v.id("files") },
  async handler(ctx) {
    return ctx.file;
  },
});

export const getFolderContents = authorizedProjectQuery({
  args: {
    projectId: v.id("projects"),
    parentFolderId: v.optional(v.id("files")),
  },
  async handler({ project, db }, { projectId, parentFolderId }) {
    const files = await db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", projectId).eq("parentId", parentFolderId),
      )
      .collect();

    // sort: folders first, then files,alphabetically within each group
    const sortedFiles = files.sort((a, b) => {
      if (a.fileType === "folder" && b.fileType === "file") {
        return -1;
      }
      if (a.fileType === "file" && b.fileType === "folder") {
        return 1;
      }
      return a.fileName.localeCompare(b.fileName);
    });

    return sortedFiles;
  },
});

export const getFilePath = authorizedFileQuery({
  args: {
    fileId: v.id("files"),
  },
  async handler({ file, db, project }) {
    // traverse through the parents until we get to the root and return the files

    const path: Doc<"files">[] = [];
    let currentFileId: Id<"files"> | undefined = file._id;
    while (currentFileId) {
      const fileData = (await db.get("files", currentFileId)) as
        | Doc<"files">
        | undefined;
      if (!fileData) break;
      path.unshift(fileData);
      currentFileId = fileData.parentId;
    }
    return path.map((item) => ({
      _id: item._id,
      name: item.fileName,
      type: item.fileType,
    }));
  },
});

export type getFilePathType = FunctionReturnType<
  typeof api.controller.files.getFilePath
>;

//* Used for Agent "ListFiles" tool
export const getProjectFiles = authorizedProjectQuery({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// -----------------------------MUTATIONS---------------------------//

export const createFile = authorizedProjectMutation({
  args: {
    parentFolderId: v.optional(v.id("files")),
    fileName: v.string(),
    content: v.string(),
  },
  async handler({ project, db }, { parentFolderId, fileName, content }) {
    const files = await db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", project._id).eq("parentId", parentFolderId),
      )
      .collect();

    const sortedFiles = files.sort((a, b) => {
      if (a.fileType === "folder" && b.fileType === "file") {
        return -1;
      }
      if (a.fileType === "file" && b.fileType === "folder") {
        return 1;
      }
      return a.fileName.localeCompare(b.fileName);
    });

    const existingFile = sortedFiles.find(
      (file) => file.fileName === fileName && file.fileType === "file",
    );

    if (existingFile) {
      throw new ConvexError("File already exists");
    }

    console.log({ projectId: project._id });

    const file = await db.insert("files", {
      projectId: project._id,
      parentId: parentFolderId,
      fileName,
      fileType: "file",
      content,
      updatedAt: Date.now(),
    });
    return file;
  },
});

// export const createFolder = authorized

//* Will be used by the Agent for "CreateFile" tool
export const createFileToolHandler = authorizedProjectMutation({
  args: {
    content: v.string(),
    name: v.string(),
    parentId: v.optional(v.id("files")),
  },
  async handler(ctx, args) {
    // Ensure the agent doesnt accidemtally create file with the same name as an existing file
    // get all the files in the parentFolder
    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", ctx.project._id).eq("parentId", args.parentId),
      )
      .collect();

    const existingFile = files.find(
      (file) => file.fileName === args.name && file.fileType === "file",
    );

    if (existingFile) {
      throw new ConvexError("File already exists");
    }

    const file = await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      fileName: args.name,
      fileType: "file",
      content: args.content,
      updatedAt: Date.now(),
    });
    return file;
  },
});

//* Will be used by the Agent  for bulk "CreateFiles" tool
export const createFilesToolHandler = authorizedProjectMutation({
  args: {
    parentId: v.optional(v.id("files")),
    files: v.array(
      v.object({
        name: v.string(),
        content: v.string(),
      }),
    ),
  },
  async handler(ctx, args) {
    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", ctx.project._id).eq("parentId", args.parentId),
      )
      .collect();

    const results: { name: string; fileId: Id<"files">; error?: string }[] = [];

    for (const file of args.files) {
      const existingFile = files.find(
        (item) => item.fileName === file.name && item.fileType === "file",
      );
      if (existingFile) {
        results.push({
          name: existingFile.fileName,
          fileId: existingFile._id,
          error: "File already exists",
        });
        continue;
      }

      const newFileId = await ctx.db.insert("files", {
        fileName: file.name,
        content: file.content,
        projectId: args.projectId,
        parentId: args.parentId,
        updatedAt: Date.now(),
        fileType: "file",
      });

      results.push({
        fileId: newFileId,
        name: file.name,
      });
    }

    return results;
  },
});

//* Can be used by the Agent for "CreateFolder" toool
export const createFolder = authorizedProjectMutation({
  args: {
    parentFolderId: v.optional(v.id("files")),
    folderName: v.string(),
    isToolCall: v.optional(v.boolean()),
  },
  async handler({ project, db }, { parentFolderId, folderName, isToolCall }) {
    const files = await db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", project._id).eq("parentId", parentFolderId),
      )
      .collect();

    let dynamicFiles = files;
    if (!isToolCall) {
      const sortedFiles = files.sort((a, b) => {
        if (a.fileType === "folder" && b.fileType === "file") {
          return -1;
        }
        if (a.fileType === "file" && b.fileType === "folder") {
          return 1;
        }
        return a.fileName.localeCompare(b.fileName);
      });

      dynamicFiles = sortedFiles;
    }

    const existingFolder = dynamicFiles.find(
      (file) => file.fileName === folderName && file.fileType === "folder",
    );

    if (existingFolder) {
      throw new ConvexError("Folder already exists");
    }

    const folder = await db.insert("files", {
      projectId: project._id,
      parentId: parentFolderId,
      fileName: folderName,
      fileType: "folder",
      updatedAt: Date.now(),
    });

    await db.patch("projects", project._id, {
      updatedAt: Date.now(),
    });

    return folder;
  },
});

// *Will be used by Agent for "RenameFile" tool
export const renameFileToolHandler = authorizedFileMutation({
  args: {
    newName: v.string(),
    fileId: v.id("files"),
  },
  async handler({ db, file }, { fileId, newName: newFileName }) {
    // check if a file with the new already exists in the parent folder

    const siblings = await db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId),
      )
      .collect();

    const existingSibling = siblings.find(
      (sibling) =>
        sibling.fileName === newFileName &&
        sibling.fileType === file.fileType &&
        sibling._id !== fileId,
    );

    if (existingSibling) {
      throw new ConvexError(
        `A ${file.fileType} named ${newFileName} already exists`,
      );
    }

    const existingFile = siblings.find(
      (sibling) =>
        sibling.fileName === newFileName && sibling.fileType === "file",
    );

    if (existingFile) {
      throw new ConvexError(`A ${file.fileType} with this name already exists`);
    }

    await db.patch("files", fileId, {
      fileName: newFileName,
      updatedAt: Date.now(),
    });

    await db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const renameFile = authorizedFileMutation({
  args: {
    fileId: v.id("files"),
    newFileName: v.string(),
    //  neccessary for optimistic updates
    projectId: v.id("projects"),
    parentFolderId: v.optional(v.id("files")),
  },
  async handler({ file, db }, { fileId, newFileName }) {
    // check if a file with the new already exists in the parent folder

    const siblings = await db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId),
      )
      .collect();

    const existingSibling = siblings.find(
      (sibling) =>
        sibling.fileName === newFileName &&
        sibling.fileType === file.fileType &&
        sibling._id !== fileId,
    );

    if (existingSibling) {
      throw new ConvexError("File already exists");
    }

    const sortedSiblings = siblings.sort((a, b) => {
      if (a.fileType === "folder" && b.fileType === "file") {
        return -1;
      }
      if (a.fileType === "file" && b.fileType === "folder") {
        return 1;
      }
      return a.fileName.localeCompare(b.fileName);
    });

    const existingFile = sortedSiblings.find(
      (sibling) =>
        sibling.fileName === newFileName && sibling.fileType === "file",
    );

    if (existingFile) {
      throw new ConvexError(`A ${file.fileType} with this name already exists`);
    }

    await db.patch("files", fileId, {
      fileName: newFileName,
      updatedAt: Date.now(),
    });

    await db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

// * Can be used by Agent for "DeleteFile" tool
export const deleteFile = authorizedFileMutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, { fileId }) {
    // recursively delete file/folder and all of its descendants
    await deleteRecursive({ ctx, fileId });

    await ctx.db.patch("projects", ctx.file.projectId, {
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

// * Can be used by the Agent for "UpdateFile" tool
export const updateFile = authorizedFileMutation({
  args: {
    fileId: v.id("files"),
    content: v.string(),
  },

  async handler(ctx, { fileId, content }) {
    const now = Date.now();
    await ctx.db.patch("files", fileId, {
      content,
      updatedAt: now,
    });

    await ctx.db.patch("projects", ctx.file.projectId, {
      updatedAt: now,
    });
  },
});
