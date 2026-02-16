# ani-rss MCP Server

MCP (Model Context Protocol) server for ani-rss API.

## Installation

```bash
cd mcp
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
ANI_RSS_URL=http://localhost:7789          # ani-rss server URL
ANI_RSS_AUTH_TYPE=none|bearer|apiKey       # Authentication type
ANI_RSS_TOKEN=<token>                      # Bearer token (if auth type is bearer)
ANI_RSS_API_KEY=<api-key>                  # API Key (if auth type is apiKey)
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ani-rss": {
      "command": "node",
      "args": ["/path/to/ani-rss/mcp/dist/index.js"],
      "env": {
        "ANI_RSS_URL": "http://localhost:7789",
        "ANI_RSS_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools (48 tools)

### Authentication (2)
- `ani-rss_login` - Login to get token
- `ani-rss_test-whitelist` - Check if IP is whitelisted

### Configuration (2)
- `ani-rss_get-config` - Get system configuration
- `ani-rss_update-config` - Update system configuration

### Subscription Management (9)
- `ani-rss_list-subscriptions` - Get subscription list
- `ani-rss_add-subscription` - Add subscription
- `ani-rss_update-subscription` - Update subscription
- `ani-rss_delete-subscriptions` - Delete subscriptions
- `ani-rss_refresh-subscription` - Refresh/download subscription
- `ani-rss_batch-enable` - Batch enable/disable
- `ani-rss_update-episode-count` - Update total episode count
- `ani-rss_import-subscriptions` - Import subscriptions
- `ani-rss_scrape-media-info` - Scrape media info

### RSS Parsing (2)
- `ani-rss_parse-rss` - Parse RSS URL
- `ani-rss_preview-items` - Preview subscription items

### Download Management (6)
- `ani-rss_get-download-path` - Get download path
- `ani-rss_test-download-login` - Test download tool connection
- `ani-rss_list-torrents` - Get downloader task list
- `ani-rss_delete-torrent-cache` - Delete cached torrents
- `ani-rss_update-trackers` - Update Trackers
- `ani-rss_get-download-logs` - Get download logs

### Bangumi (5)
- `ani-rss_search-bangumi` - Search bangumi
- `ani-rss_get-bangumi-info` - Get bangumi info by ID
- `ani-rss_get-bangumi-title` - Get final title
- `ani-rss_save-bangumi-rating` - Save rating
- `ani-rss_get-bgm-user-info` - Get user info

### TMDB (2)
- `ani-rss_get-tmdb-name` - Get TMDB name
- `ani-rss_get-tmdb-episode-group` - Get episode group info

### Mikan (2)
- `ani-rss_search-mikan` - Search Mikan bangumi
- `ani-rss_get-mikan-groups` - Get subtitle groups

### Notification (3)
- `ani-rss_test-notification` - Test notification
- `ani-rss_create-notification-config` - Create notification config
- `ani-rss_get-telegram-chat-id` - Get Telegram Chat ID

### Collection Download (3)
- `ani-rss_preview-collection` - Preview collection
- `ani-rss_extract-collection-subgroup` - Extract subgroup
- `ani-rss_start-collection-download` - Start collection download

### Playlist (2)
- `ani-rss_get-playlist` - Get playlist
- `ani-rss_get-subtitles` - Get subtitles

### System (10)
- `ani-rss_get-custom-css` - Get custom CSS
- `ani-rss_get-custom-js` - Get custom JavaScript
- `ani-rss_get-system-info` - Get system info
- `ani-rss_update-system` - Update system
- `ani-rss_restart-system` - Restart/shutdown system
- `ani-rss_clear-cache` - Clear cache
- `ani-rss_list-logs` - Get log list
- `ani-rss_clear-logs` - Clear logs
- `ani-rss_test-proxy` - Test proxy connection
- `ani-rss_refresh-cover` - Refresh cover

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT
