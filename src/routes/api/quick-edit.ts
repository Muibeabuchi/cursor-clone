import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { $getUser } from "~/lib/queries/auth";
import { generateText, Output } from "ai";
import {
  //   deepSeekV3OpenRouterProvider,
  //   gptOss120bOpenRouterProvider,
  //   ponyAlphaOpenRouterProvider,
  qwen3CoderOpenRouterProvider,
  // grokOpenRouterProvider,
  //   mistralSmall3124bOpenRouterProvider,
  //   qwen3CoderOpenRouterProvider,
} from "~/lib/open-router";
import { QUICK_EDIT_PROMPT } from "~/lib/utils";
import { firecrawl } from "~/lib/firecrawl/client";
import { GEMINI_MODEL } from "~/lib/google-gemini";
import { HAIKU_MODEL } from "~/lib/claude-ai";

const quickEditSchema = z.object({
  editedCode: z
    .string()
    .describe(
      "The edited version of the selected code based on the instruction",
    ),
});

const URL_REGEX = /^(https?:\/\/)?([^\s\/$.?#].[^\s]*)$/i;

const scrapeWithFirecrawl = async (url: string) => {
  try {
    const result = await firecrawl.scrape(url, { formats: ["markdown"] });
    if (result.markdown) {
      return `<doc url="${url}">\n${result.markdown}\n</doc>`;
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const Route = createFileRoute("/api/quick-edit")({
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
          const { selectedCode, fullCode, instruction } = body;
          if (!selectedCode) {
            return new Response("No code provided", {
              status: 400,
              statusText: "No code provided",
            });
          }
          if (!instruction) {
            return new Response("No instruction provided", {
              status: 400,
              statusText: "No instruction provided",
            });
          }

          //   check if the user gave us any urls
          const urls: Array<string> = instruction.match(URL_REGEX) || [];
          let documentationContext = "";
          if (urls.length > 0) {
            // scrape the results using firecrawl
            const scrapedResults = await Promise.all(
              urls.map((url) => scrapeWithFirecrawl(url)),
            );
            const filteredResults = scrapedResults.filter(Boolean);
            if (filteredResults.length > 0) {
              documentationContext = `
              <documentation>
              ${filteredResults.join("\n")}
              </documentation>
              `;
            }
          }

          const prompt = QUICK_EDIT_PROMPT.replace(
            "{selectedCode}",
            selectedCode,
          )
            .replace("{fullCode}", fullCode || "")
            .replace("{instruction}", instruction)
            .replace("{documentationContext}", documentationContext);

          const result = await generateText({
            model: qwen3CoderOpenRouterProvider,
            output: Output.object({ schema: quickEditSchema }),
            prompt,
          });
          console.log({ quickedit: result });
          return new Response(JSON.stringify(result.output.editedCode));
        } catch (error) {
          console.error(error);
          return new Response("Error generating suggestion", { status: 500 });
        }
      },
    },
  },
});
