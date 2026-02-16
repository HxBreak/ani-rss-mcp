import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { authTools } from './auth.js';
import { configTools } from './config.js';
import { subscriptionTools } from './subscription.js';
import { rssTools } from './rss.js';
import { downloadTools } from './download.js';
import { bangumiTools } from './bangumi.js';
import { tmdbTools } from './tmdb.js';
import { mikanTools } from './mikan.js';
import { notificationTools } from './notification.js';
import { collectionTools } from './collection.js';
import { playlistTools } from './playlist.js';
import { systemTools } from './system.js';

// Export all tools
export const allTools: Tool[] = [
  ...authTools,
  ...configTools,
  ...subscriptionTools,
  ...rssTools,
  ...downloadTools,
  ...bangumiTools,
  ...tmdbTools,
  ...mikanTools,
  ...notificationTools,
  ...collectionTools,
  ...playlistTools,
  ...systemTools,
];

// Export handlers
export { handleLogin, handleTestWhitelist } from './auth.js';
export { handleGetConfig, handleUpdateConfig } from './config.js';
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
export { handleParseRss, handlePreviewItems } from './rss.js';
export {
  handleGetDownloadPath,
  handleTestDownloadLogin,
  handleListTorrents,
  handleDeleteTorrentCache,
  handleUpdateTrackers,
  handleGetDownloadLogs,
} from './download.js';
export {
  handleSearchBangumi,
  handleGetBangumiInfo,
  handleGetBangumiTitle,
  handleSaveBangumiRating,
  handleGetBgmUserInfo,
} from './bangumi.js';
export { handleGetTmdbName, handleGetTmdbEpisodeGroup } from './tmdb.js';
export { handleSearchMikan, handleGetMikanGroups } from './mikan.js';
export {
  handleTestNotification,
  handleCreateNotificationConfig,
  handleGetTelegramChatId,
} from './notification.js';
export {
  handlePreviewCollection,
  handleExtractCollectionSubgroup,
  handleStartCollectionDownload,
} from './collection.js';
export { handleGetPlaylist, handleGetSubtitles } from './playlist.js';
export {
  handleGetCustomCss,
  handleGetCustomJs,
  handleGetSystemInfo,
  handleUpdateSystem,
  handleRestartSystem,
  handleClearCache,
  handleListLogs,
  handleClearLogs,
  handleTestProxy,
  handleRefreshCover,
} from './system.js';
