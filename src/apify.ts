import { ApifyClient } from "apify-client";
import { MISSING_TOKEN_MESSAGE, type Config } from "./config.js";
import type { BrandCheckRecord, MonitorResult, RunSummary } from "./types.js";

export interface ActorInput {
  brandName: string;
  brandDomain?: string;
  brandAliases?: string[];
  competitors?: string[];
  industry?: string;
  platforms?: string[];
  queryTemplates?: string[];
  customQueries?: string[];
  maxQueriesPerPlatform?: number;
  /**
   * `concise` ≈ 200-char ai_response_summary + 150-char mention_context.
   * `detailed` (default) ≈ 800-char + 330-char.
   * MCP wrapper defaults to `concise` to keep agent token budgets tight.
   */
  responseFormat?: "concise" | "detailed";
}

// Per-item token budget: keep full-text response trimmed so 20 items stay < 10k tokens
// (well under the 25k Claude Code tool-output cap).
const SUMMARY_MAX_CHARS = 280;
const CONTEXT_MAX_CHARS = 240;
const CITED_URLS_MAX = 8;

const PREVIEW_FIELDS: Array<keyof BrandCheckRecord> = [
  "platform",
  "query",
  "query_category",
  "brand_name",
  "brand_mentioned",
  "brand_mention_count",
  "brand_share_of_voice",
  "mention_position_score",
  "mention_context",
  "sentiment",
  "is_cited_as_source",
  "cited_url",
  "cited_urls",
  "total_sources_cited",
  "competitor_mentions",
  "competitor_mention_count",
  "ai_response_summary",
  "model_used",
  "scraped_at",
];

export class ApifyActorClient {
  private readonly client: ApifyClient;

  constructor(private readonly config: Config) {
    this.client = new ApifyClient({ token: config.apifyToken || "placeholder" });
  }

  async runActor(input: ActorInput): Promise<MonitorResult> {
    if (!this.config.apifyToken) {
      throw new Error(MISSING_TOKEN_MESSAGE);
    }

    const requested = input.maxQueriesPerPlatform ?? this.config.defaultMaxQueries;
    const maxQueriesPerPlatform = Math.min(requested, this.config.maxQueriesCeiling);

    // MCP consumers are token-sensitive — default to `concise` upstream
    // unless the caller explicitly asks for `detailed`.
    const responseFormat: "concise" | "detailed" = input.responseFormat ?? "concise";

    const runInput: ActorInput = {
      ...input,
      maxQueriesPerPlatform,
      responseFormat,
    };

    const run = await this.client
      .actor(this.config.actorId)
      .call(runInput, { waitSecs: this.config.waitSecs });

    if (!run) {
      throw new Error(
        "Apify actor did not return a run. Check your APIFY_TOKEN and network connection.",
      );
    }

    if (run.status !== "SUCCEEDED" && run.status !== "READY") {
      const runUrl = `https://console.apify.com/actors/runs/${run.id}`;
      throw new Error(
        `Apify actor run ended with status ${run.status}. Inspect the run at ${runUrl} for details.`,
      );
    }

    const dataset = this.client.dataset<BrandCheckRecord>(run.defaultDatasetId);
    const { items } = await dataset.listItems({ limit: 500 });
    const trimmedItems = items.map(projectPreview);

    // The actor persists aggregate metrics in its key-value store under LAST_RUN_SUMMARY.
    // Surface it to the agent so it can answer "what's the GEO score?" without
    // re-computing from per-check records.
    let summary: RunSummary | null = null;
    try {
      const kvStore = this.client.keyValueStore(run.defaultKeyValueStoreId);
      const record = await kvStore.getRecord("LAST_RUN_SUMMARY");
      if (record && typeof record.value === "object" && record.value !== null) {
        summary = record.value as RunSummary;
      }
    } catch {
      summary = null;
    }

    return {
      run: {
        runId: run.id,
        datasetId: run.defaultDatasetId,
        status: run.status,
        startedAt: run.startedAt ? new Date(run.startedAt).toISOString() : undefined,
        finishedAt: run.finishedAt ? new Date(run.finishedAt).toISOString() : undefined,
        apifyRunUrl: `https://console.apify.com/actors/runs/${run.id}`,
      },
      count: trimmedItems.length,
      items: trimmedItems,
      summary,
      truncated: items.length >= 500,
    };
  }
}

function projectPreview(item: BrandCheckRecord): BrandCheckRecord {
  const preview: BrandCheckRecord = {};
  for (const key of PREVIEW_FIELDS) {
    const value = item[key];
    if (value === undefined) continue;

    if (key === "ai_response_summary" && typeof value === "string") {
      preview[key] = value.length > SUMMARY_MAX_CHARS
        ? `${value.slice(0, SUMMARY_MAX_CHARS)}…`
        : value;
    } else if (key === "mention_context" && typeof value === "string") {
      preview[key] = value.length > CONTEXT_MAX_CHARS
        ? `${value.slice(0, CONTEXT_MAX_CHARS)}…`
        : value;
    } else if (key === "cited_urls" && Array.isArray(value)) {
      preview[key] = value.slice(0, CITED_URLS_MAX) as string[];
    } else {
      (preview as Record<string, unknown>)[key] = value;
    }
  }
  return preview;
}
