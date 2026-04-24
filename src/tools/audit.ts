import { z } from "zod";
import type { ApifyActorClient } from "../apify.js";

export const PLATFORM_ENUM = ["perplexity", "chatgpt", "claude", "gemini"] as const;

export const TEMPLATE_ENUM = [
  "best_tools",
  "alternatives",
  "recommendations",
  "reviews",
  "comparisons",
] as const;

export const auditInputSchema = {
  brandName: z
    .string()
    .min(1)
    .describe(
      "Brand, company, product, or tool name to audit. Examples: 'Ahrefs', 'HubSpot', 'Notion'. This is the primary entity the tool tracks across AI responses — do NOT pass competitor names here, put those in 'competitors' instead.",
    ),
  brandDomain: z
    .string()
    .optional()
    .describe(
      "Primary website domain of the brand (e.g. 'ahrefs.com', 'hubspot.com'). Used to detect when an AI response cites the brand's own site as a source. Leave empty to track text mentions only.",
    ),
  brandAliases: z
    .array(z.string())
    .optional()
    .describe(
      "Alternate names, acronyms or handles the brand is known by (e.g. ['Ahrefs Inc', 'AH']). The audit searches all aliases in addition to brandName.",
    ),
  industry: z
    .string()
    .optional()
    .describe(
      "Brand's industry or product category (e.g. 'SEO', 'CRM', 'email marketing'). Used to make template queries more specific. If omitted, queries use generic category wording.",
    ),
  competitors: z
    .array(z.string())
    .max(10)
    .optional()
    .describe(
      "Up to 10 competitor brand names to track co-mentions for (e.g. ['Semrush', 'Moz', 'Majestic']). Each AI response will be scanned for these and report which competitors appeared alongside the target brand.",
    ),
  platforms: z
    .array(z.enum(PLATFORM_ENUM))
    .optional()
    .describe(
      "Subset of AI platforms to query. Defaults to all four: perplexity, chatgpt, claude, gemini. Pass a shorter list to save credits (each query × platform pair is billed).",
    ),
  queryTemplates: z
    .array(z.enum(TEMPLATE_ENUM))
    .optional()
    .describe(
      "Which standard GEO query patterns to run. 'best_tools' = category roundup prompts, 'alternatives' = 'what are alternatives to X', 'recommendations' = 'should I use X', 'reviews' = sentiment prompts, 'comparisons' = 'X vs competitors'. Defaults to best_tools + alternatives + recommendations.",
    ),
  maxQueriesPerPlatform: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe(
      "Maximum queries to send per platform. Defaults to 3. Increase to 5–10 for deeper audits; each query × platform = one billed brand-query-checked event on the underlying Apify actor ($0.08 per event).",
    ),
};

export const auditToolMetadata = {
  title: "Audit AI brand visibility",
  description:
    "Run a comprehensive AI-search brand visibility audit across Perplexity, ChatGPT (with live web search), Claude (with native web search) and Gemini (with Google Search grounding) using standard GEO query templates. " +
    "Returns per-check records with mention rate, position score, sentiment, citation detection, and competitor co-mentions, plus a run summary with an overall GEO score (0–100) and actionable recommendations. " +
    "Use for baseline audits, weekly monitoring runs, or before/after content-push measurement. " +
    "Do NOT use when the user already has specific custom questions — use `check_brand_in_queries` for that. " +
    "Backed by a production Apify actor with native web search on all four platforms. " +
    "Pay-per-result: $0.08 per brand × query × platform check.",
  annotations: {
    title: "Audit AI brand visibility",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
};

export function buildAuditHandler(apify: ApifyActorClient) {
  return async (args: {
    brandName: string;
    brandDomain?: string;
    brandAliases?: string[];
    industry?: string;
    competitors?: string[];
    platforms?: string[];
    queryTemplates?: string[];
    maxQueriesPerPlatform?: number;
  }) => {
    try {
      const result = await apify.runActor({
        brandName: args.brandName,
        brandDomain: args.brandDomain,
        brandAliases: args.brandAliases,
        industry: args.industry,
        competitors: args.competitors,
        platforms: args.platforms,
        queryTemplates: args.queryTemplates,
        maxQueriesPerPlatform: args.maxQueriesPerPlatform,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: formatAuditSummary(
              args.brandName,
              result.count,
              result.summary?.geo_score,
              result.summary?.overall_mention_rate,
              result.summary?.overall_sentiment,
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

function formatAuditSummary(
  brandName: string,
  count: number,
  geoScore: number | undefined,
  mentionRate: number | undefined,
  sentiment: string | undefined,
  runUrl: string,
): string {
  const parts: string[] = [`Audited "${brandName}" across ${count} AI-search checks.`];
  if (typeof geoScore === "number") {
    parts.push(`GEO score: ${geoScore}/100.`);
  }
  if (typeof mentionRate === "number") {
    parts.push(`Mention rate: ${Math.round(mentionRate * 100)}%.`);
  }
  if (sentiment) {
    parts.push(`Sentiment: ${sentiment}.`);
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
        text: `Brand visibility audit failed: ${message}`,
      },
    ],
    isError: true,
  };
}
