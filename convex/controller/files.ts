import { ConvexError, v } from "convex/values";
import {
  authorizedProjectMutation,
  authorizedProjectQuery,
} from "../middleware/projectMiddleware";
import { FunctionReturnType } from "convex/server";
import { query } from "../_generated/server";
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

// -----------------------------MUTATIONS---------------------------//

export const createFile = authorizedProjectMutation({
  args: {
    // projectId: v.id("projects"),
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

export const createFolder = authorizedProjectMutation({
  args: {
    parentFolderId: v.optional(v.id("files")),
    folderName: v.string(),
  },
  async handler({ project, db }, { parentFolderId, folderName }) {
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

    const existingFolder = sortedFiles.find(
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
  },
});

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
