import {
  authorizedProjectMutation,
  authorizedProjectQuery,
} from "../middleware/projectMiddleware";
import {
  authenticatedMutation,
  authenticatedQuery,
} from "../middleware/authMiddleware";
import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { createThread } from "@convex-dev/agent";
import { api, components, internal } from "../_generated/api";
import { projectSettings } from "../schema";

import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { projectConversationAgent } from "../components/agent";
import { workflow } from "../components/workflow";

export const getPartial = authenticatedQuery({
  args: {
    limit: v.number(),
  },
  async handler(ctx, args) {
    const { _id: userId } = ctx.user;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(args.limit);

    return projects;
  },
});

export const get = authenticatedQuery({
  args: {},
  async handler(ctx) {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ctx.user._id))
      .order("desc")
      .collect();
    return projects;
  },
});

export const getById = authorizedProjectQuery({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx) {
    return ctx.project;
  },
});

// ==========================AGENT TOOLS======================================//

// ---------------------------------MUTATIONS---------------------------------//

export const renameProjectName = authorizedProjectMutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    const { project } = ctx;
    await ctx.db.patch("projects", project._id, {
      name: args.name,
      updatedAt: Date.now(),
    });
  },
});

export const create = authenticatedMutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    const { _id: userId } = ctx.user;

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: userId,
      updatedAt: Date.now(),
    });

    // const threadId = await createThread(ctx, components.agent, {
    //   userId,
    // });

    // // create a conversation for this project
    // await ctx.db.insert("projectThreads", {
    //   projectId,
    //   threadId,
    //   userId,
    // });

    return projectId;
  },
});

export const createProjectWithMessage = authenticatedMutation({
  args: {
    prompt: v.string(),
  },
  async handler(ctx, args) {
    const { _id: userId } = ctx.user;

    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "-",
    });
    // NOTE:: THere will be no need to authorize thread access seeing we are creating the project/thread for the first time
    const projectId = await ctx.db.insert("projects", {
      name: randomName,
      ownerId: userId,
      updatedAt: Date.now(),
    });

    // ? Create the thread with initial title
    const threadId = await createThread(ctx, components.agent, {
      userId,
      title: "New Conversation",
    });
    await ctx.scheduler.runAfter(
      0,
      internal.controller.projectThread.updateConversationTitle,
      {
        threadId: threadId,
        content: args.prompt,
      },
    );

    const projectThreadId = await ctx.db.insert("projectThreads", {
      projectId,
      threadId: threadId,
      userId,
    });

    const { messageId } = await projectConversationAgent.saveMessage(ctx, {
      threadId: threadId,
      message: { role: "user", content: args.prompt },
      skipEmbeddings: true,
      userId,
    });

    const workflowId = await workflow.start(
      ctx,
      internal.aiAgents.conversationWorkflow.processMessageWorkflow,
      {
        threadId: threadId,
        promptMessageId: messageId,
        projectId: projectId,
        projectThreadId,
        userId,
      },
      {
        onComplete: api.controller.workflowThread.updateWorkflowStatus,
        context: "",
      },
    );

    return {
      projectThreadId,
      messageId,
      threadId,
      projectId,
    };
  },
});

export const updateSettings = authorizedProjectMutation({
  args: {
    settings: projectSettings,
  },
  async handler(ctx, args) {
    const { project } = ctx;
    await ctx.db.patch("projects", project._id, {
      settings: args.settings,
      updatedAt: Date.now(),
    });
  },
});
