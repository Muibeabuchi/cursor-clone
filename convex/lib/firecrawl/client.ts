"use node";
import { Firecrawl } from "@mendable/firecrawl-js";
import { action } from "../../_generated/server";
import { v } from "convex/values";

export const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export const scrapeUrlAction = action({
  args: v.object({
    urls: v.array(v.string()),
  }),
  async handler(ctx, args): Promise<string> {
    const results: { url: string; content: string }[] = [];
    for (const url of args.urls) {
      try {
        const result = await firecrawl.scrape(url, {
          formats: ["markdown"],
        });
        if (result.markdown) {
          results.push({
            url,
            content: result.markdown,
          });
        }
      } catch (error) {
        results.push({
          url,
          content: `Failed to scrape URL:${url}`,
        });
      }
    }
    if (results.length === 0)
      return `No content could be scraped from the URLs`;

    return JSON.stringify(results);
  },
});
