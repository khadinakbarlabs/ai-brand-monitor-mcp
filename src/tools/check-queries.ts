import { z } from "zod";
import type { ApifyActorClient } from "../apify.js";
import { PLATFORM_ENUM } from "./audit.js";

export const checkQueriesInputSchema = {
  brandName: z
    .string()
    .min(1)
    .describe(
      "Brand, company, product or tool name to track in the custom questions. Examples: 'Ahrefs', 'Stripe', 'Notion'. Do NOT pass competitor names here.",
    ),
  customQueries: z
    .array(z.string().min(3))
    .min(1)
    .max(10)
    .describe(
      "1–10 custom questions or prompts to submit to the AI platforms. Examples: ['What is the best SEO tool for local businesses?', 'Who builds the most accurate backlink index?']. Each question is billed per platform on the underlying Apify actor.",
    ),
  brandDomain: z
    .string()
    .optional()
    .describe(
      "Primary website domain of the brand (e.g. 'ahrefs.com'). Used to detect when an AI response cites the brand's own site as a source.",
    ),
  brandAliases: z
    .array(z.string())
    .optional()
    .describe(
      "Alternate names or acronyms the brand is known by. The check scans all aliases in addition to brandName.",
    ),
  competitors: z
    .array(z.string())
    .max(10)
    .optional()
    .describe(
      "Up to 10 competitor brand names to detect co-mentions for. Each AI response is scanned for these names alongside the target brand.",
    ),
  platforms: z
    .array(z.enum(PLATFORM_ENUM))
    .optional()
    .describe(
      "Subset of AI platforms to query. Defaults to all four: perplexity, chatgpt, claude, gemini. Pass a shorter list to focus on specific platforms or save credits.",
    ),
};

export const checkQueriesToolMetadata = {
  title: "Check brand across custom AI queries",
  description:
    "Submit 1–10 custom questions to Perplexity, ChatGPT, Claude, and Gemini (all with live web search) and analyze each response for brand mentions, competitor co-mentions, citation detection, sentiment, and mention position. " +
    "Use when the user has specific prompts they want to test — e.g. 'What tool does ChatGPT recommend for backlink research?' or 'Which CRM does Perplexity cite for small business?'. " +
    "Do NOT use for comprehensive template-driven audits — use `audit_brand_visibility` for that. " +
    "Returns one record per query × platform with full mention analysis. " +
    "Pay-per-result: $0.08 per brand × query × platform check.",
  annotations: {
    title: "Check brand across custom AI queries",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export function buildCheckQueriesHandler(apify: ApifyActorClient) {
  return async (args: {
    brandName: string;
    customQueries: string[];
    brandDomain?: string;
    brandAliases?: string[];
    competitors?: string[];
    platforms?: string[];
  }) => {
    try {
      const result = await apify.runActor({
        brandName: args.brandName,
        brandDomain: args.brandDomain,
        brandAliases: args.brandAliases,
        competitors: args.competitors,
        platforms: args.platforms,
        customQueries: args.customQueries,
        // Disable templates — this tool is strictly custom-query driven.
        queryTemplates: [],
        // maxQueriesPerPlatform is derived from the length of customQueries
        // on the actor side; we still cap it here for safety.
        maxQueriesPerPlatform: args.customQueries.length,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: formatSummary(
              args.brandName,
              args.customQueries.length,
              result.count,
              result.summary?.overall_mention_rate,
              result.run.apifyRunUrl,
            ),
          },
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    } catch (err) {
      return errorResult(err);
    }
  };
}

function formatSummary(
  brandName: string,
  queryCount: number,
  checkCount: number,
  mentionRate: number | undefined,
  runUrl: string,
): string {
  const parts: string[] = [
    `Checked "${brandName}" across ${queryCount} custom questions (${checkCount} total checks).`,
  ];
  if (typeof mentionRate === "number") {
    parts.push(`Mention rate: ${Math.round(mentionRate * 100)}%.`);
  }
  parts.push(`Full run: ${runUrl}`);
  return parts.join(" ");
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [
      {
        type: "text" as const,
        text: `Brand-in-queries check failed: ${message}`,
      },
    ],
    isError: true,
  };
}
