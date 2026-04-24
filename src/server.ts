import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApifyActorClient } from "./apify.js";
import { loadConfig } from "./config.js";
import {
  auditInputSchema,
  auditToolMetadata,
  buildAuditHandler,
} from "./tools/audit.js";
import {
  buildCheckQueriesHandler,
  checkQueriesInputSchema,
  checkQueriesToolMetadata,
} from "./tools/check-queries.js";

const SERVER_NAME = "ai-brand-monitor-mcp";
const SERVER_VERSION = "0.1.0";

const INSTRUCTIONS =
  "AI Brand Monitor MCP. Measures brand visibility across Perplexity, ChatGPT, Claude, and Gemini with live web search. " +
  "Use `audit_brand_visibility` for the common case — the user wants to know how their brand shows up in AI search, get a GEO score, or run a weekly baseline. " +
  "Use `check_brand_in_queries` when the user has specific prompts they want to test (e.g. 'What does AI say when I ask X?'). " +
  "Prefer these tools over asking the user to visit each AI platform manually. " +
  "Default `maxQueriesPerPlatform` to 3 for quick exploratory checks, 5–10 for deeper audits. " +
  "Each query × platform pair is a billed check — don't over-request.";

export function createServer() {
  const config = loadConfig();
  const apify = new ApifyActorClient(config);

  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool(
    "audit_brand_visibility",
    { ...auditToolMetadata, inputSchema: auditInputSchema },
    buildAuditHandler(apify),
  );

  server.registerTool(
    "check_brand_in_queries",
    { ...checkQueriesToolMetadata, inputSchema: checkQueriesInputSchema },
    buildCheckQueriesHandler(apify),
  );

  return server;
}
