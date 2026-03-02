import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { createThread, saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { getUserOrThrow } from "../models/authModel";
import { paginationOptsValidator } from "convex/server";
// import { Id } from "../_generated/dataModel";
import { ensureProjectBelongsTouser } from "../models/projectModel";
import { projectConversationAgent } from "../components/agent";
// import { continueThread } from "@convex-dev/agent";

// NB: CONVERSATIONS WILL BE USED INTERCHANGEBLY WITH THREADS

export const getConversationsByProjectId = query({
  args: {
    paginationOpts: paginationOptsValidator,
    projectId: v.id("projects"),
  },
  async handler(ctx, args) {
    const {
      project,
      user: { _id: userId, ...user },
    } = await ensureProjectBelongsTouser({ ctx, projectId: args.projectId });

    // get all the threads owned by a user
    const threads = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      { userId, paginationOpts: args.paginationOpts },
    );

    // get all the projectThreads by projectId
    const projectThreads = await ctx.db
      .query("projectThreads")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    //   filter out only the threads that can be found in the projectThreads
    const filteredThreads = threads.page
      .filter((thread) => {
        return projectThreads.find((item) => item.threadId === thread._id);
      })
      .map((thread) => {
        // get the projectTHread associated with this filterTHread
        const filteredProjecthread = projectThreads.find(
          (projectThread) => projectThread.threadId === thread._id,
        );
        if (!filteredProjecthread) {
          throw new ConvexError("ProjectThread does not exist");
        }
        return {
          ...thread,
          filteredProjecthread,
        };
      });

    return {
      ...threads,
      page: filteredThreads,
    };
  },
});

export const geConversationByProjectThreadId = query({
  args: {
    projectThreadId: v.id("projectThreads"),
  },
  async handler(ctx, { projectThreadId }) {
    const projectThread = await ctx.db.get("projectThreads", projectThreadId);
    if (!projectThread) {
      throw new ConvexError("ProjectThread does not exist");
    }

    // confirm that the project belongs to the user
    const {
      project,
      user: { _id: userId, ...user },
    } = await ensureProjectBelongsTouser({
      ctx,
      projectId: projectThread.projectId,
    });

    if (userId !== projectThread.userId) {
      throw new ConvexError(
        "uNAUTHORIZED: User does not have access to this projectThread",
      );
    }

    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: projectThread.threadId,
    });
    if (!thread) {
      throw new ConvexError("THread does not exist");
    }

    if (userId !== thread.userId) {
      throw new ConvexError(
        "UNAUTHORIZED: user does not have access to this thread",
      );
    }

    return {
      thread,
      projectThread,
    };
  },
});

// ================================MUTATIONS======================================
export const createProjectThread = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUserOrThrow(ctx);
    const threadId = await createThread(ctx, components.agent, {
      userId: user._id,
      title: args.title,
    });

    //TODO: generate a title and summary after the thread is created

    const projectThreadId = await ctx.db.insert("projectThreads", {
      projectId: args.projectId,
      threadId: threadId,
      userId: user._id,
    });

    return {
      projectThreadId,
      threadId,
    };
  },
});
