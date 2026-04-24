export interface Config {
  apifyToken: string;
  actorId: string;
  defaultMaxQueries: number;
  maxQueriesCeiling: number;
  waitSecs: number;
}

export const MISSING_TOKEN_MESSAGE =
  "Missing APIFY_TOKEN. Get a free token at https://console.apify.com/account/integrations and set APIFY_TOKEN in your MCP client configuration.";

export function loadConfig(): Config {
  return {
    apifyToken: process.env.APIFY_TOKEN ?? process.env.APIFY_API_TOKEN ?? "",
    actorId: process.env.APIFY_ACTOR_ID ?? "khadinakbar/ai-search-brand-monitor",
    defaultMaxQueries: Number(process.env.DEFAULT_MAX_QUERIES ?? 3),
    maxQueriesCeiling: Number(process.env.MAX_QUERIES_CEILING ?? 10),
    waitSecs: Number(process.env.APIFY_WAIT_SECS ?? 300),
  };
}
