/**
 * MCP Tools - Dynamic tool exposure based on configuration
 *
 * Full mode (ANI_RSS_API_KEY configured):
 * - /ani (subscription) - 9 tools
 * - /playlist - 2 tools
 * - mikan direct - 3 tools
 *
 * Mikan-only mode (ANI_RSS_API_KEY not configured):
 * - mikan direct - 3 tools only
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config/index.js';
import { subscriptionTools } from './subscription.js';
import { playlistTools } from './playlist.js';
import { mikanTools } from './mikan.js';

// All tools for backward compatibility
export const allTools: Tool[] = [
  ...subscriptionTools,
  ...playlistTools,
  ...mikanTools,
];

/**
 * Get available tools based on configuration
 * - Full mode: all 14 tools
 * - Mikan-only mode: 3 mikan tools only
 */
export function getAvailableTools(): Tool[] {
  if (config.hasBackend) {
    return [...subscriptionTools, ...playlistTools, ...mikanTools];
  }
  return [...mikanTools];
}

/**
 * Check if backend tools are available
 */
export function hasBackendTools(): boolean {
  return config.hasBackend;
}

// Export handlers
export {
  handleListSubscriptions,
  handleAddSubscription,
  handleUpdateSubscription,
  handleDeleteSubscriptions,
  handleRefreshSubscription,
  handleBatchEnable,
  handleUpdateEpisodeCount,
  handleImportSubscriptions,
  handleScrapeMediaInfo,
} from './subscription.js';
export { handleGetPlaylist, handleGetSubtitles } from './playlist.js';
// Mikan - direct scraping only
export {
  handleSearchMikanDirect,
  handleBrowseMikanSeason,
  handleGetMikanBangumiDetail,
} from './mikan.js';
