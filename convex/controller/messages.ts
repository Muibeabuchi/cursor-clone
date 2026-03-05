import { ConvexError, v } from "convex/values";
import { query, mutation, internalAction, action } from "../_generated/server";
import { authorizeThreadAccess } from "../models/conversationModel";
import {
  syncStreams,
  listUIMessages,
  vStreamArgs,
  saveMessage,
  listMessages,
} from "@convex-dev/agent";
import { components, internal } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";
import { getUserOrThrow } from "../models/authModel";
import { processMessageWorkflow } from "../agents/conversationWorkflow";
import { workflow } from "../components/workflow";
import { WorkflowId } from "@convex-dev/workflow";
import { ensureProjectBelongsTouser } from "../models/projectModel";
import { projectConversationAgent } from "../components/agent";

export const getMessagesByProjectThreadId = query({
  args: {
    streamArgs: vStreamArgs, // Used to stream messages.
    paginationOpts: paginationOptsValidator,
    threadId: v.string(),
    projectThreadId: v.id("projectThreads"),
  },
  handler: async (
    ctx,
    { threadId, projectThreadId, paginationOpts, streamArgs },
  ) => {
    const { thread } = await authorizeThreadAccess({
      ctx,
      projectThreadId,
    });

    if (threadId !== thread._id) {
      throw new ConvexError("Thread does not exist");
    }

    const streams = await syncStreams(ctx, components.agent, {
      threadId,
      streamArgs,
    });

    const messages = await listUIMessages(ctx, components.agent, {
      threadId: thread._id,
      paginationOpts,
    });

    return {
      ...messages,
      streams,
    };
  },
});

// ============================MUTATIONS================================//

export const createMessage = mutation({
  args: {
    projectThreadId: v.id("projectThreads"),
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (
    ctx,
    { projectThreadId, prompt, threadId },
  ): Promise<{ messageId: string; workflowId: WorkflowId }> => {
    const { thread, userId } = await authorizeThreadAccess({
      ctx,
      projectThreadId,
    });

    console.log({ threadId, thread });

    if (threadId !== thread._id) {
      throw new ConvexError("Thread does not exist");
    }

    // Generate a converstion(thread) title using the titleGenerator agent if the thread has no messages
    const messages = await listMessages(ctx, components.agent, {
      threadId: thread._id,
      paginationOpts: {
        cursor: null,
        numItems: 1,
      },
    });
    const threadIsEmpty = messages.page.length <= 0;

    const { messageId } = await projectConversationAgent.saveMessage(ctx, {
      threadId: thread._id,
      message: { role: "user", content: prompt },
      skipEmbeddings: true,
      userId,
    });
    // !Check this for consistency during testing phase
    console.log({ threadIsEmpty });
    if (threadIsEmpty) {
      await ctx.scheduler.runAfter(
        0,
        internal.controller.projectThread.updateConversationTitle,
        {
          threadId: thread._id,
          content: prompt,
        },
      );
    }

    //Todo: GENERATE AGENT RESPONSE BY CALLING WORKFLOW
    const workflowId = await workflow.start(
      ctx,
      internal.agents.conversationWorkflow.processMessageWorkflow,
      {
        threadId: thread._id,
        promptMessageId: messageId,
      },
    );

    return {
      messageId,
      workflowId,
    };
  },
});

// ============================ACTIONS================================//

export const processMessage = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await projectConversationAgent.streamText(
      ctx,
      {
        threadId: args.threadId,
      },
      {
        promptMessageId: args.promptMessageId,
      },
      {
        saveStreamDeltas: { chunking: "line", throttleMs: 1000 },
      },
    );

    await result.consumeStream();
  },
});
