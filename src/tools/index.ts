/**
 * MCP Tools - API_KEY mode only
 *
 * Only includes tools that support API_KEY authentication:
 * - /ani (subscription) - API_KEY supported
 * - /playlist - API_KEY supported
 * - /playitem - API_KEY supported
 * - mikan direct - independent, no backend needed
 *
 * Removed tools (no API_KEY support):
 * - auth, config, download, bangumi, tmdb, notification, collection, rss, system
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { subscriptionTools } from './subscription.js';
import { playlistTools } from './playlist.js';
import { mikanTools } from './mikan.js';

// Export all tools
export const allTools: Tool[] = [
  ...subscriptionTools,
  ...playlistTools,
  ...mikanTools,
];

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
