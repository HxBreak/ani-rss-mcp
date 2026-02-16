#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import {
  allTools,
  handleLogin,
  handleTestWhitelist,
  handleGetConfig,
  handleUpdateConfig,
  handleListSubscriptions,
  handleAddSubscription,
  handleUpdateSubscription,
  handleDeleteSubscriptions,
  handleRefreshSubscription,
  handleBatchEnable,
  handleUpdateEpisodeCount,
  handleImportSubscriptions,
  handleScrapeMediaInfo,
  handleParseRss,
  handlePreviewItems,
  handleGetDownloadPath,
  handleTestDownloadLogin,
  handleListTorrents,
  handleDeleteTorrentCache,
  handleUpdateTrackers,
  handleGetDownloadLogs,
  handleSearchBangumi,
  handleGetBangumiInfo,
  handleGetBangumiTitle,
  handleSaveBangumiRating,
  handleGetBgmUserInfo,
  handleGetTmdbName,
  handleGetTmdbEpisodeGroup,
  handleSearchMikan,
  handleGetMikanGroups,
  handleTestNotification,
  handleCreateNotificationConfig,
  handleGetTelegramChatId,
  handlePreviewCollection,
  handleExtractCollectionSubgroup,
  handleStartCollectionDownload,
  handleGetPlaylist,
  handleGetSubtitles,
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
} from './tools/index.js';

// Create server instance
const server = new Server(
  {
    name: 'ani-rss-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: allTools };
});

// Handle call tool request
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  let result: string;

  try {
    switch (name) {
      // Auth tools
      case 'ani-rss_login':
        result = await handleLogin(args);
        break;
      case 'ani-rss_test-whitelist':
        result = await handleTestWhitelist();
        break;

      // Config tools
      case 'ani-rss_get-config':
        result = await handleGetConfig();
        break;
      case 'ani-rss_update-config':
        result = await handleUpdateConfig(args);
        break;

      // Subscription tools
      case 'ani-rss_list-subscriptions':
        result = await handleListSubscriptions();
        break;
      case 'ani-rss_add-subscription':
        result = await handleAddSubscription(args);
        break;
      case 'ani-rss_update-subscription':
        result = await handleUpdateSubscription(args);
        break;
      case 'ani-rss_delete-subscriptions':
        result = await handleDeleteSubscriptions(args);
        break;
      case 'ani-rss_refresh-subscription':
        result = await handleRefreshSubscription(args);
        break;
      case 'ani-rss_batch-enable':
        result = await handleBatchEnable(args);
        break;
      case 'ani-rss_update-episode-count':
        result = await handleUpdateEpisodeCount(args);
        break;
      case 'ani-rss_import-subscriptions':
        result = await handleImportSubscriptions(args);
        break;
      case 'ani-rss_scrape-media-info':
        result = await handleScrapeMediaInfo(args);
        break;

      // RSS tools
      case 'ani-rss_parse-rss':
        result = await handleParseRss(args);
        break;
      case 'ani-rss_preview-items':
        result = await handlePreviewItems(args);
        break;

      // Download tools
      case 'ani-rss_get-download-path':
        result = await handleGetDownloadPath(args);
        break;
      case 'ani-rss_test-download-login':
        result = await handleTestDownloadLogin(args);
        break;
      case 'ani-rss_list-torrents':
        result = await handleListTorrents();
        break;
      case 'ani-rss_delete-torrent-cache':
        result = await handleDeleteTorrentCache(args);
        break;
      case 'ani-rss_update-trackers':
        result = await handleUpdateTrackers(args);
        break;
      case 'ani-rss_get-download-logs':
        result = await handleGetDownloadLogs();
        break;

      // Bangumi tools
      case 'ani-rss_search-bangumi':
        result = await handleSearchBangumi(args);
        break;
      case 'ani-rss_get-bangumi-info':
        result = await handleGetBangumiInfo(args);
        break;
      case 'ani-rss_get-bangumi-title':
        result = await handleGetBangumiTitle(args);
        break;
      case 'ani-rss_save-bangumi-rating':
        result = await handleSaveBangumiRating(args);
        break;
      case 'ani-rss_get-bgm-user-info':
        result = await handleGetBgmUserInfo();
        break;

      // TMDB tools
      case 'ani-rss_get-tmdb-name':
        result = await handleGetTmdbName(args);
        break;
      case 'ani-rss_get-tmdb-episode-group':
        result = await handleGetTmdbEpisodeGroup(args);
        break;

      // Mikan tools
      case 'ani-rss_search-mikan':
        result = await handleSearchMikan(args);
        break;
      case 'ani-rss_get-mikan-groups':
        result = await handleGetMikanGroups(args);
        break;

      // Notification tools
      case 'ani-rss_test-notification':
        result = await handleTestNotification(args);
        break;
      case 'ani-rss_create-notification-config':
        result = await handleCreateNotificationConfig();
        break;
      case 'ani-rss_get-telegram-chat-id':
        result = await handleGetTelegramChatId(args);
        break;

      // Collection tools
      case 'ani-rss_preview-collection':
        result = await handlePreviewCollection(args);
        break;
      case 'ani-rss_extract-collection-subgroup':
        result = await handleExtractCollectionSubgroup(args);
        break;
      case 'ani-rss_start-collection-download':
        result = await handleStartCollectionDownload(args);
        break;

      // Playlist tools
      case 'ani-rss_get-playlist':
        result = await handleGetPlaylist(args);
        break;
      case 'ani-rss_get-subtitles':
        result = await handleGetSubtitles(args);
        break;

      // System tools
      case 'ani-rss_get-custom-css':
        result = await handleGetCustomCss();
        break;
      case 'ani-rss_get-custom-js':
        result = await handleGetCustomJs();
        break;
      case 'ani-rss_get-system-info':
        result = await handleGetSystemInfo();
        break;
      case 'ani-rss_update-system':
        result = await handleUpdateSystem();
        break;
      case 'ani-rss_restart-system':
        result = await handleRestartSystem(args);
        break;
      case 'ani-rss_clear-cache':
        result = await handleClearCache();
        break;
      case 'ani-rss_list-logs':
        result = await handleListLogs();
        break;
      case 'ani-rss_clear-logs':
        result = await handleClearLogs();
        break;
      case 'ani-rss_test-proxy':
        result = await handleTestProxy(args);
        break;
      case 'ani-rss_refresh-cover':
        result = await handleRefreshCover(args);
        break;

      default:
        result = JSON.stringify({ error: true, message: `Unknown tool: ${name}` });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result = JSON.stringify({ error: true, message: errorMessage });
  }

  return {
    content: [
      {
        type: 'text',
        text: result,
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ani-rss MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
