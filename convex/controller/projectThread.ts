import { ConvexError, v } from "convex/values";
import { action, internalAction, mutation, query } from "../_generated/server";
import {
  createThread,
  getThreadMetadata,
  saveMessage,
} from "@convex-dev/agent";
import { components } from "../_generated/api";
import { getUserOrThrow } from "../models/authModel";
import { paginationOptsValidator } from "convex/server";
// import { Id } from "../_generated/dataModel";
import { ensureProjectBelongsTouser } from "../models/projectModel";
import { projectConversationAgent, titleAgent } from "../components/agent";
import { authorizeThreadAccess } from "../models/conversationModel";
import { generateText } from "ai";
import { gemini2_5FlashLite } from "../lib/geminiModel";
import z from "zod";
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

//!: THis action should only be called by authenticated mutations
export const updateConversationTitle = internalAction({
  args: {
    threadId: v.string(),
    content: v.string(),
    newThreadTitle: v.optional(v.boolean()),
  },
  handler: async (ctx, { threadId, content, newThreadTitle }) => {
    // await getUserOrThrow(ctx);

    const { summary: initialSummary, title: initialTitle } =
      await getThreadMetadata(ctx, components.agent, { threadId });

    let title: string | undefined = content || initialSummary;
    let summary: string | undefined;
    if (!newThreadTitle) {
      const {
        object: { summary: summaryString, title: titleString },
      } = await titleAgent.generateObject(
        ctx,
        { threadId },
        {
          schema: z.object({
            title: z.string().describe("The new title for the thread"),
            summary: z.string().describe("The new summary for the thread"),
          }),
          // prompt: "Generate a title and summary for this thread.",
          prompt:
            "Generate a title and summary for the thread. The title should be a single sentence that captures the main topic of the thread. The summary should be a short description of the thread that could be used to describe it to someone who hasn't read it.",
        },
        {
          storageOptions: {
            saveMessages: "none",
          },
        },
      );
      // join the array into a string

      title = titleString;
      summary = summaryString;
    }

    await projectConversationAgent.updateThreadMetadata(ctx, {
      threadId,
      patch: {
        title,
        summary: summary ? summary : initialSummary,
      },
    });
  },
});
