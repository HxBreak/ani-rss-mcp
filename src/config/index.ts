/**
 * MCP Configuration Module
 *
 * Determines available tools based on whether ANI_RSS_API_KEY is configured:
 * - Full mode: ANI_RSS_API_KEY configured → 14 tools available
 * - Mikan-only mode: ANI_RSS_API_KEY not configured → 3 Mikan tools available
 */

export interface McpConfig {
  baseUrl: string;
  apiKey?: string;
  hasBackend: boolean;
}

export function loadConfig(): McpConfig {
  const baseUrl = process.env.ANI_RSS_URL || 'http://localhost:7789';
  const apiKey = process.env.ANI_RSS_API_KEY;
  const hasBackend = apiKey !== undefined && apiKey !== '';
  return { baseUrl, apiKey, hasBackend };
}

export const config = loadConfig();

export function logStartupInfo(): void {
  if (config.hasBackend) {
    console.error(`[ani-rss MCP] Full mode - Backend: ${config.baseUrl}`);
    console.error('[ani-rss MCP] Available: All 14 tools');
  } else {
    console.error('[ani-rss MCP] Mikan-only mode');
    console.error('[ani-rss MCP] Available: 3 tools (Mikan search/browse)');
  }
}
