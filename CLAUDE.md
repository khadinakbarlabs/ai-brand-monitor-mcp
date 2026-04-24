# ai-brand-monitor-mcp

## What this is
Standalone Node.js MCP server that wraps the `khadinakbar/ai-search-brand-monitor` Apify actor. Exposes two tools (`audit_brand_visibility`, `check_brand_in_queries`) so any MCP-compatible AI agent can measure brand visibility across Perplexity, ChatGPT, Claude and Gemini.

## Relationship to the Apify actor
- **Upstream source of truth:** the Apify actor at [apify.com/khadinakbar/ai-search-brand-monitor](https://apify.com/khadinakbar/ai-search-brand-monitor). This MCP package only calls it via `apify-client`.
- **MCP also available without this package** — users can hit `https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor` directly. This repo adds npm-distributable / Smithery-distributable alternatives + branded tool names (`audit_brand_visibility` vs Apify's default `ai-search-brand-monitor`) for better agent ergonomics.

## Template pattern
This project is a direct copy of the [google-maps-scraper-mcp](https://github.com/khadinakbaronline/google-maps-scraper-mcp) structure — same folder layout, same smithery.yaml shape, same server.json schema, same `src/{index,server,config,apify,types}.ts` + `src/tools/*.ts` pattern. When updating one, consider updating the other for consistency.

## Architecture
- Transport: stdio (`@modelcontextprotocol/sdk/server/stdio.js`)
- Actor invocation: `apify-client` (`client.actor(id).call(input, { waitSecs })`)
- Dataset projection: trims heavy fields (`ai_response_summary` → 280 chars, `mention_context` → 240 chars, `cited_urls` → max 8) so 20 items stay well under the 25k token output cap.
- `LAST_RUN_SUMMARY` from the actor's key-value store is surfaced as `result.summary` for agent-level GEO score / recommendations.

## Tools

### `audit_brand_visibility`
Template-driven GEO audit. Required: `brandName`. Optional: `brandDomain`, `brandAliases`, `industry`, `competitors`, `platforms`, `queryTemplates`, `maxQueriesPerPlatform`.

### `check_brand_in_queries`
Custom-question mode. Required: `brandName`, `customQueries` (1–10). Optional: `brandDomain`, `brandAliases`, `competitors`, `platforms`.

## Env vars

| Name | Default | Purpose |
|---|---|---|
| `APIFY_TOKEN` | — | Required. Apify API token. |
| `APIFY_ACTOR_ID` | `khadinakbar/ai-search-brand-monitor` | Override to call a forked actor. |
| `DEFAULT_MAX_QUERIES` | `3` | Default per-platform query count when agent omits it. |
| `MAX_QUERIES_CEILING` | `10` | Hard cap on `maxQueriesPerPlatform`. |
| `APIFY_WAIT_SECS` | `300` | Actor run wait timeout (seconds). AI brand monitor runs longer than most actors because it calls 4 LLMs per query. |

## Build & test

```bash
cd ~/apify-actors/ai-brand-monitor-mcp
npm install
npm run build
# stdio smoke test (no APIFY_TOKEN required for tools/list):
(printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'; sleep 1) \
  | APIFY_TOKEN=fake node dist/index.js
# real tool call: use MCP Inspector
npm run inspect
```

## Publish

1. Bump `package.json` version + `server.json` version.
2. `npm run build && npm publish --access public` (requires npm login as the package owner).
3. `git tag v0.x.y && git push origin v0.x.y`.
4. Update the [MCP Registry](https://registry.modelcontextprotocol.io) entry if the tool surface changed.
5. Optionally submit to Smithery via their GitHub-connected flow.

## Known gaps (v0.1.0)
- No GitHub Action for auto-publish on tag push yet (gmaps has one — port it over).
- No `examples/` folder yet.
- No `.env.example` template.
- `scripts/submit-to-directories.mjs` referenced in CONTRIBUTING but not implemented.

## Parent project
~/apify-actors/ — see master CLAUDE.md. Upstream Apify actor logbook lives at `~/apify-actors/ai-search-brand-monitor/CLAUDE.md`.

## Changelog
- 2026-04-24 (v0.1.0): Scaffolded from google-maps-scraper-mcp template. Two tools live, stdio transport verified, README/LICENSE/CONTRIBUTING in place. Not yet published to npm or GitHub.

## Last worked
2026-04-24
