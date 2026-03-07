import { abortStream, listStreams } from "@convex-dev/agent";
import { components, internal } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { workflow } from "../components/workflow";
import { ConvexError } from "convex/values";
import { vWorkflowId } from "@convex-dev/workflow";

// mutation that cancels a workflow

export type StreamInfoType = {
  userId?: string | undefined;
  agentName?: string | undefined;
  model?: string | undefined;
  provider?: string | undefined;
  providerOptions?: Record<string, Record<string, any>> | undefined;
  format?: "UIMessageChunk" | "TextStreamPart" | undefined;
  status: "streaming" | "finished" | "aborted";
  order: number;
  stepOrder: number;
  streamId: string;
}[];

export const abortStreamByStreamId = async ({
  ctx,
  threadId,
}: {
  ctx: GenericMutationCtx<DataModel> | GenericActionCtx<DataModel>;
  threadId: string;
}) => {
  const streams = await listStreams(ctx, components.agent, { threadId });

  for (const stream of streams) {
    console.log("Aborting stream", stream);
    await abortStream(ctx, components.agent, {
      reason: "Aborting via async call",
      streamId: stream.streamId,
    });
  }
  if (!streams.length) {
    console.log("No streams found");
  }
};

// loop through all the streams created by the agent and insert their streamId into the conversationStreamInfoTable
export const getStreamIds = async ({
  ctx,
  threadId,
}: {
  ctx: GenericMutationCtx<DataModel> | GenericActionCtx<DataModel>;
  threadId: string;
}) => {
  const definedstreams = await listStreams(ctx, components.agent, { threadId });
  console.log({ definedstreams });

  const streamIds: string[] = definedstreams.map((stream) => stream.streamId);
  return streamIds;
};
