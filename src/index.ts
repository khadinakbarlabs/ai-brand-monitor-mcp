#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

export { createServer };

export function createSandboxServer() {
  return createServer();
}

export default createSandboxServer;

async function main() {
  try {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ai-brand-monitor-mcp running on stdio");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to start ai-brand-monitor-mcp: ${message}`);
    process.exit(1);
  }
}

void main();
