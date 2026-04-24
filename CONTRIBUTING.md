# Contributing

Thanks for thinking about contributing! This project has a deliberately small surface area — two tools over one Apify actor — which makes it easy to keep healthy.

## Ways to help

1. **Bug reports.** Open an issue with a minimal repro (agent, prompt, server logs from stderr, and the `run.apifyRunUrl` so we can inspect the actor run).
2. **Tool improvements.** Edits to the Zod schemas, tool descriptions, or error messages that make agents more reliable are always welcome.
3. **Integration recipes.** Drop new example flows into `examples/` — LangGraph, CrewAI, n8n, autogen, Zapier, etc.
4. **Client coverage.** Spot a new MCP-aware client (Zed, Goose, Continue, Cline, Roo Code…)? Add an install snippet to `README.md`.

## Development setup

```bash
git clone https://github.com/khadinakbaronline/ai-brand-monitor-mcp.git
cd ai-brand-monitor-mcp
npm install
cp .env.example .env  # set APIFY_TOKEN
npm run build
npm run inspect       # official MCP Inspector UI
```

## Code guidelines

- TypeScript, strict mode. Keep tool files under 400 lines.
- One tool per file in `src/tools/`.
- Tool descriptions are product copy for LLMs — be concrete and action-oriented.
- Input schemas must include constraints and examples in `.describe()`.
- No runtime dependencies beyond `@modelcontextprotocol/sdk`, `apify-client` and `zod` unless there is a very good reason.

## Commit style

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

## Releasing

1. Bump `package.json` version.
2. `npm run build`.
3. `npm publish`.
4. Tag and push: `git tag v0.x.y && git push --tags`.
