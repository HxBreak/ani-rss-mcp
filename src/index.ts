#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

import { config, logStartupInfo } from './config/index.js';
import {
  allTools,
  getAvailableTools,
  hasBackendTools,
  handleListSubscriptions,
  handleAddSubscription,
  handleUpdateSubscription,
  handleDeleteSubscriptions,
  handleRefreshSubscription,
  handleBatchEnable,
  handleUpdateEpisodeCount,
  handleImportSubscriptions,
  handleScrapeMediaInfo,
  handleGetPlaylist,
  handleGetSubtitles,
  handleSearchMikanDirect,
  handleBrowseMikanSeason,
  handleGetMikanBangumiDetail,
} from './tools/index.js';

// Backend tool names for protection check
const backendToolNames = new Set([
  'ani-rss_list-subscriptions',
  'ani-rss_add-subscription',
  'ani-rss_update-subscription',
  'ani-rss_delete-subscriptions',
  'ani-rss_refresh-subscription',
  'ani-rss_batch-enable',
  'ani-rss_update-episode-count',
  'ani-rss_import-subscriptions',
  'ani-rss_scrape-media-info',
  'ani-rss_get-playlist',
  'ani-rss_get-subtitles',
]);

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
  return { tools: getAvailableTools() };
});

// Handle call tool request
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  let result: string;

  try {
    // Protect backend tools in Mikan-only mode
    if (backendToolNames.has(name) && !hasBackendTools()) {
      result = JSON.stringify({
        error: true,
        message: `Tool "${name}" requires ANI_RSS_API_KEY to be configured. Current mode: Mikan-only.`,
      });
    } else {
      switch (name) {
      // Subscription tools (/ani - supports API_KEY)
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

      // Playlist tools (/playlist, /playitem - supports API_KEY)
      case 'ani-rss_get-playlist':
        result = await handleGetPlaylist(args);
        break;
      case 'ani-rss_get-subtitles':
        result = await handleGetSubtitles(args);
        break;

      // Mikan tools (direct scraping - no backend needed)
      case 'ani-rss_search-mikan-direct':
        result = await handleSearchMikanDirect(args);
        break;
      case 'ani-rss_browse-mikan-season':
        result = await handleBrowseMikanSeason(args);
        break;
      case 'ani-rss_get-mikan-bangumi-detail':
        result = await handleGetMikanBangumiDetail(args);
        break;

      default:
        result = JSON.stringify({ error: true, message: `Unknown tool: ${name}` });
    }
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
  logStartupInfo();
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
