export type Sentiment = "positive" | "neutral" | "negative";

export interface BrandCheckRecord {
  run_id?: string;
  platform?: string;
  query?: string;
  query_category?: string;
  brand_name?: string;
  brand_mentioned?: boolean;
  brand_mention_count?: number;
  mention_position_score?: number;
  mention_context?: string | null;
  sentiment?: Sentiment;
  is_cited_as_source?: boolean;
  cited_url?: string | null;
  cited_urls?: string[];
  total_sources_cited?: number;
  competitor_mentions?: string[];
  ai_response_summary?: string;
  model_used?: string;
  scraped_at?: string;
  [key: string]: unknown;
}

export interface PlatformScore {
  mention_rate: number;
  avg_position: number;
  citation_rate: number;
  sentiment: Sentiment;
}

export interface RunSummary {
  brand_name?: string;
  industry?: string;
  run_at?: string;
  total_checks?: number;
  overall_mention_rate?: number;
  geo_score?: number;
  overall_sentiment?: Sentiment;
  platform_scores?: Record<string, PlatformScore>;
  recommendations?: string[];
  [key: string]: unknown;
}

export interface ApifyRunSummary {
  runId: string;
  datasetId: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  apifyRunUrl: string;
  [key: string]: unknown;
}

export interface MonitorResult {
  run: ApifyRunSummary;
  count: number;
  items: BrandCheckRecord[];
  summary?: RunSummary | null;
  truncated: boolean;
  [key: string]: unknown;
}
