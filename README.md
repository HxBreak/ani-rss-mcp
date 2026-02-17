# ani-rss MCP Server

[MCP](https://modelcontextprotocol.io/) server for [ani-rss](https://github.com/HxBreak/ani-rss) - 番剧自动订阅下载工具。

## 安装

### npm 全局安装

```bash
npm install -g ani-rss-mcp
```

### npx 使用（无需安装）

```bash
npx ani-rss-mcp
```

## 配置

### 环境变量

```bash
ANI_RSS_URL=http://localhost:7789          # ani-rss 服务地址
ANI_RSS_AUTH_TYPE=none|bearer|apiKey       # 认证方式
ANI_RSS_TOKEN=<token>                      # Bearer token (bearer 认证时)
ANI_RSS_API_KEY=<api-key>                  # API Key (apiKey 认证时)
```

### Claude Desktop 配置

添加到 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ani-rss": {
      "command": "ani-rss-mcp",
      "env": {
        "ANI_RSS_URL": "http://localhost:7789",
        "ANI_RSS_API_KEY": "your-api-key"
      }
    }
  }
}
```

或使用 npx：

```json
{
  "mcpServers": {
    "ani-rss": {
      "command": "npx",
      "args": ["ani-rss-mcp"],
      "env": {
        "ANI_RSS_URL": "http://localhost:7789",
        "ANI_RSS_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 可用工具

### 订阅管理

| 工具 | 说明 |
|------|------|
| `ani-rss_list-subscriptions` | 获取订阅列表 |
| `ani-rss_add-subscription` | 添加订阅（支持匹配/排除规则、自定义路径等） |
| `ani-rss_update-subscription` | 更新订阅 |
| `ani-rss_delete-subscriptions` | 删除订阅（可选删除本地文件） |
| `ani-rss_refresh-subscription` | 刷新订阅（检查新资源） |
| `ani-rss_batch-enable` | 批量启用/禁用订阅 |
| `ani-rss_update-episode-count` | 更新总集数 |
| `ani-rss_import-subscriptions` | 导入订阅 |
| `ani-rss_scrape-media-info` | 刮削媒体信息 |

### Mikan 搜索

| 工具 | 说明 |
|------|------|
| `ani-rss_search-mikan` | 搜索 Mikan 番剧 |
| `ani-rss_get-mikan-groups` | 获取字幕组列表 |
| `ani-rss_get-mikan-bangumi` | 获取番剧详情（含 RSS 地址） |

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 监听模式
npm run dev
```

## 发布

```bash
# 登录 npm
npm login

# 发布
npm publish
```

## License

MIT
