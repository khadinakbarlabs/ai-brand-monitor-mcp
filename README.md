# AI Brand Monitor MCP

> **The AI-Search brand-visibility MCP for AI agents — OAuth in 30 seconds, no API keys.** Track how your brand appears in Perplexity, ChatGPT, Claude and Gemini search results directly inside Claude, Cursor, Codex, Windsurf, ChatGPT and any MCP-compatible AI client.

[![npm version](https://img.shields.io/npm/v/ai-brand-monitor-mcp.svg?style=flat-square)](https://www.npmjs.com/package/ai-brand-monitor-mcp)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-1.x-black?style=flat-square)](https://modelcontextprotocol.io)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-97d700?style=flat-square)](https://apify.com/khadinakbar/ai-search-brand-monitor)
[![OAuth](https://img.shields.io/badge/OAuth-zero--install-7c3aed?style=flat-square)](#option-a--cloud-mcp-oauth-recommended)
[![Works with Claude](https://img.shields.io/badge/Claude-ready-orange?style=flat-square)](#claudeai-web-cowork-mobile-desktop--one-setting-for-all)
[![Works with Cursor](https://img.shields.io/badge/Cursor-ready-black?style=flat-square)](#cursor)
[![Works with Windsurf](https://img.shields.io/badge/Windsurf-ready-00b8a9?style=flat-square)](#windsurf)
[![Works with VS Code](https://img.shields.io/badge/VS%20Code-ready-blue?style=flat-square)](#vs-code)

---

## What this is

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives any MCP-compatible AI agent a single, reliable way to measure brand visibility across the four AI-search platforms:

- 🔍 **Perplexity** — native Sonar search + citations
- 💬 **ChatGPT** — gpt-4o-search-preview with live web search
- 🧠 **Claude** — Claude Sonnet 4.5 with native Anthropic web_search tool
- ✨ **Gemini** — Gemini 2.5 Flash with Google Search grounding

### What each call returns

For every `brand × query × platform` combination:

- 📊 **Mention rate** and **position score** (1 = AI leads with your brand, 10 = not mentioned)
- 📎 **Citation detection** — does the AI link to your domain?
- 😊 **Sentiment** — positive, neutral, or negative framing
- 🥊 **Competitor co-mentions** — which rivals appear in the same response?
- 🎯 **GEO score** (0–100) and plain-English recommendations in the run summary

Backed by a production [Apify actor](https://apify.com/khadinakbar/ai-search-brand-monitor) with OpenRouter-routed APIs, native web search on every platform, and a flat `$0.08` per check.

### Why use it inside an AI agent?

Traditional brand-monitoring tools live in a separate dashboard. This one lives **inside the agent**: Claude, Cursor, Codex or any other MCP client can plan a GEO strategy, audit a brand, diff two brands, or check weekly trends — and actually pull the data in the same turn.

---

## Two ways to install

| | Option A: **Cloud MCP (OAuth)** | Option B: Self-hosted (npm) |
|--|--|--|
| Install time | ~30 seconds | 2–3 minutes |
| What you need | An Apify account (OAuth popup signs you in) | Node 18+ and an Apify API token |
| Runs where | Apify Cloud | Your machine |
| Best for | Most users — Claude, Cursor, Windsurf, VS Code, Codex | Self-hosted infra, air-gapped networks, advanced overrides |
| Config | One URL | Command + token env var |

**Not sure which one?** Pick Option A. That's why it's first.

### Client coverage at a glance (Option A)

| Client | Surface | Install path |
|--------|---------|--------------|
| [Claude.ai](#claudeai-web-cowork-mobile-desktop--one-setting-for-all) | Web · Desktop · Cowork · iOS · Android | Settings → Connectors → Add custom connector |
| [ChatGPT](#chatgpt-web-pro-team-enterprise-edu) | Web · Desktop | Settings → Connectors → Create (Pro/Team/Enterprise/Edu) |
| [Cursor](#cursor) | Desktop | One-click deeplink or `~/.cursor/mcp.json` |
| [Claude Code](#claude-code) | CLI | `claude mcp add --transport http ...` |
| [VS Code](#vs-code) | Desktop | `.vscode/mcp.json` |
| [Windsurf](#windsurf) | Desktop | `~/.codeium/windsurf/mcp_config.json` |
| [OpenAI Codex CLI](#openai-codex-cli) | CLI | `~/.codex/config.toml` |

---

## Option A — Cloud MCP (OAuth, recommended)

### 🔗 The one URL you need

```
https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor
```

Paste this into any MCP-compatible client. On first call, a browser tab opens, you sign into Apify, and the tools are live. No tokens. No npm install. One setting covers Claude web, Claude Desktop, Cowork, mobile apps, ChatGPT web, Cursor, Windsurf, VS Code, Claude Code, Codex CLI and any other Streamable-HTTP MCP client.

> New to Apify? Accounts are free and include **$5 of credits** — enough for ~60 brand-query checks before you pay a cent.

### Claude.ai (web, Cowork, mobile, Desktop — one setting for all)

1. Open **Claude → profile icon → Settings → Connectors**.
2. Scroll to the bottom and click **"Add custom connector"**.
3. Paste:
   ```
   https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor
   ```
4. Click **Connect**. A browser tab opens for Apify OAuth. Approve it.
5. You're done — the connector works across Claude web, Desktop, Cowork and mobile apps with a single setup.

Works on Free, Pro, Max, Team and Enterprise plans (Free is limited to 1 custom connector).

### ChatGPT (web — Pro, Team, Enterprise, Edu)

1. Open **ChatGPT → Settings → Connectors** (toggle **Developer Mode** in Advanced settings first if you don't see it).
2. Click **Create** / **Add custom connector**.
3. Fill in:
   - **Name:** `AI Brand Monitor`
   - **Description:** `Track brand visibility across Perplexity, ChatGPT, Claude & Gemini.`
   - **MCP server URL:** `https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor`
   - **Authentication:** OAuth (recommended) or Bearer with your Apify API token
4. Save. First call opens the Apify OAuth popup.

Not available on the Free plan.

### Claude Desktop

Open `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows). Add:

```json
{
  "mcpServers": {
    "ai-brand-monitor": {
      "url": "https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor"
    }
  }
}
```

Restart Claude Desktop. First call opens the OAuth popup.

### Cursor

Either:

- **One-click:** click the Cursor deeplink in the Apify Store listing, or
- **Manual:** add to `~/.cursor/mcp.json`:

  ```json
  {
    "mcpServers": {
      "ai-brand-monitor": {
        "url": "https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor"
      }
    }
  }
  ```

### Claude Code

```bash
claude mcp add --transport http ai-brand-monitor \
  https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor
```

### VS Code

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "ai-brand-monitor": {
      "type": "http",
      "url": "https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor"
    }
  }
}
```

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "ai-brand-monitor": {
      "serverUrl": "https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor"
    }
  }
}
```

### OpenAI Codex CLI

Edit `~/.codex/config.toml`:

```toml
[mcp_servers.ai-brand-monitor]
url = "https://mcp.apify.com?tools=khadinakbar/ai-search-brand-monitor"
```

---

## Option B — Self-hosted (npm)

### Prerequisites

- Node.js 18+
- An [Apify API token](https://console.apify.com/account/integrations) (free, includes $5 credits)

### Install via npx (no global install)

```jsonc
// Claude Desktop or any JSON config
{
  "mcpServers": {
    "ai-brand-monitor": {
      "command": "npx",
      "args": ["-y", "ai-brand-monitor-mcp"],
      "env": {
        "APIFY_TOKEN": "apify_api_xxx"
      }
    }
  }
}
```

### Optional environment variables

| Variable | Default | Purpose |
|---|---|---|
| `APIFY_TOKEN` | — | **Required.** Your Apify API token. |
| `APIFY_ACTOR_ID` | `khadinakbar/ai-search-brand-monitor` | Override to run against a forked actor. |
| `DEFAULT_MAX_QUERIES` | `3` | Used when the agent doesn't specify `maxQueriesPerPlatform`. |
| `MAX_QUERIES_CEILING` | `10` | Hard cap for `maxQueriesPerPlatform`. Protects credits. |
| `APIFY_WAIT_SECS` | `300` | How long to wait for an actor run before timing out. |

### Manual install (clone + build)

```bash
git clone https://github.com/khadinakbaronline/ai-brand-monitor-mcp.git
cd ai-brand-monitor-mcp
npm install
npm run build
node dist/index.js
```

---

## Tools

### `audit_brand_visibility`

Run a comprehensive GEO audit using standard query templates — best for baselines, weekly monitoring, and before/after content measurements.

| Parameter | Required | Description |
|---|---|---|
| `brandName` | ✅ | Brand to track (e.g. `"Ahrefs"`) |
| `brandDomain` | | For citation detection (e.g. `"ahrefs.com"`) |
| `brandAliases` | | Alternate names / acronyms |
| `industry` | | Makes template queries category-specific |
| `competitors` | | Up to 10 rival brands for co-mention tracking |
| `platforms` | | Subset of `perplexity`, `chatgpt`, `claude`, `gemini` |
| `queryTemplates` | | Subset of `best_tools`, `alternatives`, `recommendations`, `reviews`, `comparisons` |
| `maxQueriesPerPlatform` | | 1–20, default 3 |

Example prompt (inside any MCP-enabled agent):

> "Run a brand visibility audit for Ahrefs against Semrush and Moz in the SEO category. Pull 5 queries per platform."

### `check_brand_in_queries`

Submit 1–10 **custom** questions across all four platforms — best when the user has specific prompts to test.

| Parameter | Required | Description |
|---|---|---|
| `brandName` | ✅ | Brand to track |
| `customQueries` | ✅ | 1–10 questions (strings) |
| `brandDomain` | | For citation detection |
| `brandAliases` | | Alternate names / acronyms |
| `competitors` | | Up to 10 rival brands |
| `platforms` | | Subset of platforms |

Example prompt:

> "Ask Perplexity, ChatGPT and Claude 'What is the best tool for local-business SEO?' and tell me how often Ahrefs gets mentioned."

---

## Output shape

Every tool call returns:

- `run` — Apify run metadata (runId, datasetId, apifyRunUrl) so you can open the full dataset in Apify Console
- `count` — number of per-check records
- `items[]` — one record per `brand × query × platform` with mention context, sentiment, citations, competitor mentions
- `summary` — aggregate `geo_score` (0–100), `overall_mention_rate`, `platform_scores`, and plain-English `recommendations`
- `truncated` — boolean flag if the dataset was capped

Fields are flat and stable so agents can reliably extract values across runs.

---

## Pricing

The Apify actor is pay-per-event:

- `actor-start`: `$0.00005` per run (per GB RAM)
- `brand-query-checked`: **`$0.08`** per `brand × query × platform` event

A typical audit (1 brand, 3 query templates × 2 queries each × 4 platforms = 24 checks) costs **~$1.92**. All four AI platforms are included — no separate OpenAI / Anthropic / Perplexity / Google keys needed.

Your first `$5` of Apify credits covers roughly 60 checks.

---

## Privacy & security

- The MCP server never sees AI platform API keys — all routing happens server-side on Apify.
- Your Apify token stays in the MCP client config or Apify OAuth session; the server process never logs or persists it.
- The per-check records never leave Apify's dataset storage unless the agent explicitly pushes them somewhere.

---

## FAQ

**Q: How is this different from just calling Perplexity / ChatGPT myself?**
A: This runs the same prompt across all four AI platforms with one call, scores brand mentions consistently, detects citations, and produces an aggregate GEO score. Running the same thing manually would mean four separate API signups, four billing setups, four different response parsers, and a score you have to compute yourself.

**Q: Why does Claude have live web search? I thought Claude only used its training data.**
A: The underlying Apify actor enables Claude's native Anthropic `web_search_20250305` server-side tool so Claude returns real 2026 citations, not stale training data. Same for Gemini (native Google Search grounding) and ChatGPT (native gpt-4o-search-preview).

**Q: Can I monitor multiple brands?**
A: One brand per tool call today. Run the tool multiple times for multiple brands, or run it once per week for trend tracking.

**Q: How often should I run this?**
A: Weekly is the sweet spot. Run after every major content push, product launch, or PR event to measure impact on AI search visibility.

**Q: Is my Apify token stored on any server?**
A: Option A (Cloud MCP): your token sits in your own Apify session, managed by Apify's OAuth. Option B (self-hosted): the token is only in your local MCP client config.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome for:

- Additional MCP clients with install snippets
- Output field projections (what to include / exclude in `items[]`)
- New query-template categories for the underlying Apify actor

---

## License

MIT — see [LICENSE](LICENSE).

Built by [Khadin Akbar](https://github.com/khadinakbaronline) on top of the production [ai-search-brand-monitor](https://apify.com/khadinakbar/ai-search-brand-monitor) Apify actor.
