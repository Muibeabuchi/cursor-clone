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
import { createThread, listMessages, listUIMessages } from "@convex-dev/agent";
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

export const deleteProject = authorizedProjectMutation({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, { projectId }) {
    const { _id: userId } = ctx.user;
    // cancel any workflow / agent if running
    // const runningWorkflows = await ctx.db
    //   .query("workflowThreads")
    //   .withIndex("by_project_id", (q) => q.eq("projectId", projectId))
    //   .collect();
    // for (const runningWorkflow of runningWorkflows) {
    //   await ctx.db.delete(runningWorkflow._id);
    // }

    // delete the messages from the convex agent component if they exist

    // get all the converation THreads in the project
    const projectThreads = await ctx.db
      .query("projectThreads")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    // get the thread ids
    const threadIds = projectThreads.map(
      (projectThread) => projectThread.threadId,
    );
    // get all thread for the user and filter by the project
    const threads = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      { userId, paginationOpts: { numItems: 100, cursor: null } },
    );

    // filter the threads that belong to the project
    const projectThreadsToDelete = threads.page.filter((thread) =>
      threadIds.includes(thread._id),
    );

    // delete all the threads from the convex agent component
    for (const projectThread of projectThreadsToDelete) {
      // list the messages from the thread
      const paginated = await listMessages(ctx, components.agent, {
        threadId: projectThread._id,
        paginationOpts: { numItems: 100, cursor: null },
      });
      // delete the messages from the thread
      for (const message of paginated.page) {
        if (message.id) {
          await projectConversationAgent.deleteMessage(ctx, {
            messageId: message.id,
          });
        }
      }
      await projectConversationAgent.deleteThreadAsync(ctx, {
        threadId: projectThread._id,
      });
    }

    // delete the projectTHreads from the db
    for (const projectThread of projectThreads) {
      await ctx.db.delete("projectThreads", projectThread._id);
    }

    // delete the workflowThreads from the db
    const workflowThreads = await ctx.db
      .query("workflowThread")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    for (const workflowThread of workflowThreads) {
      await ctx.db.delete("workflowThread", workflowThread._id);
    }

    // get all the file associated with a project and delete them all
    const files = await ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    for (const file of files) {
      if (file.storageId) {
        await ctx.storage.delete(file.storageId);
      }
      await ctx.db.delete("files", file._id);
    }

    await ctx.db.delete("projects", projectId);
  },
});
