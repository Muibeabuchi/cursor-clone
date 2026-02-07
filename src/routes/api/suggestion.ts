import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import z from "zod";
import { grokOpenRouterProvider } from "~/lib/open-router";
import { $getUser } from "~/lib/queries/auth";
import { SUGGESTION_PROMPT } from "~/lib/utils";
import { getAuth } from "~/utils/auth-ssr";

const suggestionSchema = z.object({
  sugestion: z
    .string()
    .describe(
      "The code to insert at the end of the cursor or empty string if no completion needed",
    ),
});

export const Route = createFileRoute("/api/suggestion")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await $getUser();
        if (!user) {
          return new Response("Unauthorized", {
            status: 401,
            statusText: "Unauthorized",
          });
        }

        try {
          const body = await request.json();
          const {
            fileName,
            previousLines,
            currentLine,
            textBeforeCursor,
            textAfterCursor,
            nextLines,
            code,
            lineNumber,
          } = body;
          if (!code) {
            return new Response("No code provided", {
              status: 400,
              statusText: "No code provided",
            });
          }
          const prompt = SUGGESTION_PROMPT.replace("{fileName}", fileName)
            .replace("{previousLines}", previousLines || "")
            .replace("{currentLine}", currentLine)
            .replace("{textBeforeCursor}", textBeforeCursor)
            .replace("{textAfterCursor}", textAfterCursor)
            .replace("{nextLines}", nextLines || "")
            .replace("{code}", code)
            .replace("{lineNumber}", lineNumber.toString());
          const result = await generateText({
            model: grokOpenRouterProvider,
            system: "You are a code suggestion assistant.",
            output: Output.object({ schema: suggestionSchema }),
            prompt,
          });
          console.log({ result });
          return new Response(JSON.stringify(result.output.sugestion));
        } catch (error) {
          console.error(error);
          return new Response("Error generating suggestion", { status: 500 });
        }
      },
    },
  },
});
