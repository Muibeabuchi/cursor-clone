import { createTool } from "@convex-dev/agent";
import { z } from "zod";

// export const conversationTools = createTool({
//   description: "Tools for conversation",
//   args: z.object({ query: z.string().describe("The query to search for") }),
//   handler: async (ctx, args, options): Promise<Array<{ name: string }>> => {
//     // ctx has agent, userId, threadId, messageId
//     // as well as ActionCtx properties like auth, storage, runMutation, and runAction
//     // const ideas = await ctx.runQuery(api.ideas.searchIdeas, {
//     //   query: args.query,
//     // });
//     // console.log("found ideas", ideas);
//     return [
//       {
//         name: "test",
//       },
//     ];
//   },
// });

// export const ideaSearch = createTool({
//   description: "Search for ideas in the database",
//   args: z.object({ query: z.string().describe("The query to search for") }),
//   handler: async (ctx, args, options): Promise<Array<Idea>> => {
//     // ctx has agent, userId, threadId, messageId
//     // as well as ActionCtx properties like auth, storage, runMutation, and runAction
//     const ideas = await ctx.runQuery(api.ideas.searchIdeas, {
//       query: args.query,
//     });
//     console.log("found ideas", ideas);
//     return ideas;
//   },
// });
