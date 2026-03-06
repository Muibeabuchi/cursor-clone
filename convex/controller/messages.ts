import { ConvexError, v } from "convex/values";
import { query, mutation, internalAction, action } from "../_generated/server";
import { authorizeThreadAccess } from "../models/conversationModel";
import {
  syncStreams,
  listUIMessages,
  vStreamArgs,
  saveMessage,
  listMessages,
  listStreams,
} from "@convex-dev/agent";
import { components, internal } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";
import { getUserOrThrow } from "../models/authModel";
import { processMessageWorkflow } from "../aiAgents/conversationWorkflow";
import { workflow } from "../components/workflow";
import { vWorkflowId, WorkflowId } from "@convex-dev/workflow";
import { ensureProjectBelongsTouser } from "../models/projectModel";
import { projectConversationAgent } from "../components/agent";
import {
  abortStreamByStreamId,
  getStreamIds,
  getStreams,
} from "../aiAgents/helpers";
import {
  createFilesTool,
  createFolderTool,
  listFilesTool,
  readFilesTool,
} from "../aiAgents/tools";

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
    const { thread, userId, project } = await authorizeThreadAccess({
      ctx,
      projectThreadId,
    });

    // console.log({ threadId, thread });

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
    // console.log({ threadIsEmpty });
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
      internal.aiAgents.conversationWorkflow.processMessageWorkflow,
      {
        threadId: thread._id,
        promptMessageId: messageId,
        projectId: project._id,
        projectThreadId,
      },
    );

    return {
      messageId,
      workflowId,
    };
  },
});

export const cancelProcessMessageAgentWorkflow = mutation({
  args: {
    threadId: v.string(),
    projectThreadId: v.id("projectThreads"),
  },
  handler: async (ctx, { threadId, projectThreadId }) => {
    // protect this mutation
    const { thread } = await authorizeThreadAccess({
      ctx,
      projectThreadId,
    });
    if (threadId !== thread._id) {
      throw new ConvexError("Thread does not exist");
    }

    const { workflowId } = await getStreams({
      ctx,
      threadId,
    });

    // cancel the workflow
    await workflow.cancel(ctx, workflowId);

    // cancel the stream
    await abortStreamByStreamId({ ctx, threadId });
  },
});

export const getStreamByTHreadId = query({
  args: {
    threadId: v.string(),
    // projectThreadId: v.id("projectThreads"),
  },
  handler: async (ctx, { threadId }) => {
    const streams = await listStreams(ctx, components.agent, { threadId });
    const streams2 = await ctx.runQuery(
      projectConversationAgent.component.streams.list,
      {
        threadId,
      },
    );
    console.log({ streams });
    console.log({ streams2 });
    return streams2;
  },
});

// ============================ACTIONS================================//

export const processMessage = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    workflowId: vWorkflowId,
    projectId: v.id("projects"),
    projectThreadId: v.id("projectThreads"),
  },
  handler: async (ctx, args) => {
    // insert info into the conversationStreamInfoTable

    const result = await projectConversationAgent.streamText(
      ctx,
      {
        threadId: args.threadId,
      },
      {
        tools: {
          readFilesTool,
          listFilesTool: listFilesTool({ projectId: args.projectId }),
          createFilesTool: createFilesTool({ projectId: args.projectId }),
          createFolderTool: createFolderTool({ projectId: args.projectId }),
        },
        promptMessageId: args.promptMessageId,
        // onFinish: ({}) => {},
      },
      {
        saveStreamDeltas: { chunking: "line", throttleMs: 1000 },
      },
    );

    console.log("about to consume the stream");

    await result.consumeStream();

    console.log("stream consumed");
    // asynchronoulsy call a mutation that loops through all the streams created and extract their stream Id and insert into the conversationStreamInfoTable
    const streamIds = await getStreamIds({ ctx, threadId: args.threadId });
    console.log({ streamIds });
    await ctx.scheduler.runAfter(
      0,
      internal.controller.conversationStreamInfo.insertConversationStreamInfo,
      {
        threadId: args.threadId,
        workflowId: args.workflowId,
        projectId: args.projectId,
        projectThreadId: args.projectThreadId,
        streamIds,
      },
    );
  },
});
