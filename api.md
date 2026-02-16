# API 文档

所有API路径前缀为 `/api`，响应格式统一为JSON：

```json
{
  "code": 200,           // 状态码：200成功，500失败
  "message": "success",  // 消息
  "data": {},            // 返回数据
  "t": 1234567890        // 时间戳
}
```

### 认证说明

API支持多种认证方式：
- **IP白名单**：配置`ipWhitelist`后，白名单内IP可直接访问
- **Header认证**：请求头携带`Authorization: <token>`（直接发送token，无Bearer前缀）
- **表单认证**：URL参数携带`s=<token>`，或登录后获取token
- **API Key认证**：请求头携带`s: <apiKey>` 或 URL参数`s=<apiKey>`

---

### 认证相关

#### POST /api/login
用户登录

**请求体** (Login):
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**响应**: 成功返回认证token

**限制**: 登录失败会触发延迟响应(500-5000ms随机)，连续失败可能被限制

---

#### GET /api/test
检测是否处于IP白名单内

**认证**: 不需要

**响应**:
- 成功(code=200): 在白名单内
- 失败(code=500): 不在白名单内

---

### 配置管理

#### GET /api/config
获取系统配置

**响应** (Config): 返回完整配置对象，密码字段被清空

#### POST /api/config
修改系统配置

**请求体** (Config):
| 参数 | 类型 | 说明 |
|------|------|------|
| downloadToolType | String | 下载工具类型: qBittorrent/Transmission/Aria2/115 |
| downloadToolHost | String | 下载工具地址 |
| downloadToolUsername | String | 下载工具用户名 |
| downloadToolPassword | String | 下载工具密码 |
| downloadPathTemplate | String | 下载路径模板 |
| proxy | Boolean | 是否启用代理 |
| proxyHost | String | 代理地址 |
| proxyPort | Integer | 代理端口 |
| rssSleepMinutes | Integer | RSS刷新间隔(分钟) |
| renameSleepSeconds | Integer | 重命名间隔(秒) |
| login | Login | 登录配置(用户名/密码) |

**注意**: 修改`rssSleepMinutes`或`renameSleepSeconds`会重启任务；修改`downloadToolType`会重新加载下载器

---

### 订阅管理 (Ani)

#### GET /api/ani
获取订阅列表

**响应**: List<Ani>，按配置的排序方式排序(拼音/评分/下载时间)

#### POST /api/ani
添加订阅

**请求体** (Ani):
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | String | 是 | RSS地址 |
| title | String | 是 | 标题 |
| season | Integer | 是 | 季度 |
| subgroup | String | 否 | 字幕组 |
| match | List<String> | 否 | 匹配规则列表 |
| exclude | List<String> | 否 | 排除规则列表 |
| globalExclude | Boolean | 否 | 启用全局排除 |
| offset | Integer | 否 | 剧集偏移 |
| enable | Boolean | 否 | 是否启用 |
| ova | Boolean | 否 | 是否剧场版/OVA |
| customDownloadPath | Boolean | 否 | 自定义下载路径开关 |
| downloadPath | String | 否 | 自定义下载路径 |
| bgmUrl | String | 否 | Bangumi URL |

**注意**: 标题+季度重复时，若`replace=true`则替换，否则报错

#### PUT /api/ani
修改订阅

**请求体** (Ani): 同添加

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| move | Boolean | 是否移动已下载文件 |

#### DELETE /api/ani
删除订阅

**请求体**: JSON数组，包含要删除的订阅ID列表

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| deleteFiles | Boolean | 是否同时删除本地文件 |

#### POST /api/ani?type=download
手动刷新订阅/下载

**请求体** (Ani):
- 有值: 刷新指定订阅
- 无值: 刷新全部订阅

#### POST /api/ani?type=batchEnable&value=true/false
批量启用/禁用订阅

**请求体**: JSON数组，包含订阅ID列表

#### POST /api/ani?type=updateTotalEpisodeNumber
更新总集数

**请求体**: JSON数组，包含订阅ID列表

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| force | Boolean | 是否强制更新 |

---

### RSS解析

#### POST /api/rss
解析RSS地址

**请求体** (Ani):
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | String | 是 | RSS地址(自动补全https://) |
| type | String | 否 | 类型 |
| bgmUrl | String | 否 | Bangumi URL |

**响应** (Ani): 解析后的订阅信息

---

### 预览订阅

#### POST /api/items
预览订阅RSS条目

**请求体** (Ani): 订阅配置

**响应**:
```json
{
  "downloadPath": "下载路径",
  "items": [Item],       // RSS条目列表
  "omitList": [Integer]  // 遗漏集数列表
}
```

---

### 下载管理

#### POST /api/downloadPath
获取下载路径

**请求体** (Ani): 订阅配置

**响应**:
```json
{
  "change": false,       // 路径是否改变
  "downloadPath": "路径"
}
```

#### POST /api/downloadLoginTest
测试下载工具登录

**请求体** (Config): 下载工具配置

**响应**: 登录成功/失败消息

#### GET /api/torrentsInfos
获取下载器任务列表

**响应**: List<TorrentsInfo>

#### DELETE /api/torrent
删除缓存的种子文件

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 订阅ID |
| infoHash | String | 是 | 种子hash，多个用逗号分隔 |

#### POST /api/trackersUpdate
更新Trackers

**请求体** (Config): 配置对象

#### GET /api/downloadLogs
下载日志压缩包

**响应**: logs.zip文件流

---

### Bangumi (BGM)

#### GET /api/bgm?type=search&name=xxx
搜索番剧

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 搜索关键词 |

**响应**: 搜索结果列表

#### GET /api/bgm?type=getAniBySubjectId&id=xxx
通过ID获取订阅信息

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | Bangumi Subject ID |

**响应** (Ani): 订阅信息

#### POST /api/bgm?type=getTitle
获取最终标题

**请求体** (Ani): 包含tmdb信息

**响应**: 最终标题

#### POST /api/bgm?type=rate
保存评分

**请求体** (Ani):
| 参数 | 类型 | 说明 |
|------|------|------|
| score | Double | 评分(null清除评分) |

#### GET /api/bgm?type=me
获取当前用户信息

**响应**: 用户信息+token过期天数

#### GET /api/bgm/oauth/callback
BGM OAuth回调

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| code | String | 授权码 |

---

### TMDB

#### POST /api/tmdb?method=getThemoviedbName
获取TMDB名称

**请求体** (Ani): 订阅信息

**响应** (Ani): 包含themoviedbName

#### POST /api/tmdb?method=getTmdbGroup
获取TMDB剧集组信息

**请求体** (Ani): 包含tmdb信息

**响应**: 剧集组列表

---

### Mikan

#### GET/POST /api/mikan
搜索Mikan番剧

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| text | String | 搜索关键词 |

**请求体** (Mikan.Season): 季度信息(可选)

**响应**: 番剧列表

#### GET /api/mikan/group
获取字幕组信息

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| url | String | 是 | Mikan番剧URL |

**响应**: 字幕组列表(含标签信息)

---

### 通知系统

#### POST /api/notification?type=test
测试通知

**请求体** (NotificationConfig): 通知配置

**响应**: 成功/失败

#### GET /api/notification?type=add
创建默认通知配置

**响应** (NotificationConfig): 默认配置模板

#### GET /api/telegram?method=getUpdates
获取Telegram Chat ID

**请求体** (NotificationConfig): Telegram配置

**响应**: `{chatId: "xxx", title: "xxx"}`

---

### 合集下载

#### POST /api/collection?type=preview
预览合集内容

**请求体** (CollectionInfo):
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| torrent | String | 是 | Base64编码的种子文件 |
| ani | Ani | 是 | 订阅配置 |

**响应**: List<Item> 文件列表

#### POST /api/collection?type=subgroup
从合集提取字幕组

**请求体**: 同preview

**响应**: 字幕组名称

#### POST /api/collection?type=start
开始下载合集

**请求体**: 同preview

**限制**: 仅支持qBittorrent

---

### 文件操作

#### GET /api/file
获取文件/图片

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| img | String | 图片URL(Base64可选) |
| filename | String | 文件名(Base64可选) |

**响应**: 文件流(支持Range请求)

**特性**:
- 图片缓存30天
- 视频支持Range请求
- 小于3M的文件缓存30天

#### POST /api/upload
上传文件

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| type | String | getBase64返回Base64，否则保存文件 |

**请求体**: multipart/form-data，字段名`file`

**限制**: 最大50MB

**响应**: 文件保存路径

---

### 媒体库集成

#### POST /api/emby?type=getViews
获取Emby媒体库列表

**请求体** (NotificationConfig): Emby配置

**响应**: List<EmbyViews>

#### POST /api/emby?type=refresh
刷新Emby媒体库

**请求体** (NotificationConfig): Emby配置

#### POST /api/web_hook
WebHook接收(Emby播放状态同步到BGM)

**认证**: API_KEY

**请求体** (EmbyWebHook): Emby WebHook数据

**功能**:
- 接收Emby播放事件
- 自动标记BGM观看状态

---

### 播放列表

#### POST /api/playlist
获取视频播放列表

**请求体** (Ani): 包含url的订阅信息

**响应**: List<PlayItem>

#### POST /api/playitem
视频操作

**请求体**:
```json
{
  "type": "getSubtitles",
  "file": "文件路径(Base64)"
}
```

**响应**: List<Subtitles> (MKV内封字幕)

---

### 系统操作

#### GET /api/about
获取系统信息

**响应** (About): 版本信息、最新版本等

#### POST /api/update
更新系统

**响应**: 更新成功/失败消息

#### POST /api/stop
关闭/重启系统

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| status | Integer | 0=重启，1=关闭 |

#### POST /api/clearCache
清理缓存

**响应**: 清理完成的MB数

#### GET /api/logs
获取日志列表

**响应**: List<Log>

#### DELETE /api/logs
清空日志

#### POST /api/scrape
刮削媒体信息

**请求体** (Ani): 订阅信息

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| force | Boolean | 强制刮削 |

---

### 代理测试

#### POST /api/proxy
测试代理连接

**Query参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| url | String | 测试URL(Base64编码) |

**请求体** (Config): 代理配置

**响应**:
```json
{
  "status": 200,
  "time": 1234
}
```

---

### 导入导出

#### POST /api/ani/import
导入订阅

**请求体** (ImportAniDataDTO):
| 参数 | 类型 | 说明 |
|------|------|------|
| aniList | List<Ani> | 订阅列表 |
| conflict | Conflict | 冲突处理: SKIP/REPLACE |

---

### 自定义资源

#### GET /api/custom.css
获取自定义CSS

**认证**: 不需要

**响应**: CSS内容

#### GET /api/custom.js
获取自定义JS

**认证**: 不需要

**响应**: JS内容

---

### 封面刷新

#### POST /api/cover
刷新封面

**请求体** (Ani): 包含image的订阅信息

**响应**: 新封面路径

---

### 爱发电/赞助

#### POST /api/afdian?type=verifyNo
验证订单号

**请求体** (Config):
| 参数 | 类型 | 说明 |
|------|------|------|
| outTradeNo | String | 订单号 |

#### POST /api/afdian?type=tryOut
试用申请

**请求体** (Config):
| 参数 | 类型 | 说明 |
|------|------|------|
| githubToken | String | GitHub Token(需已star项目) |

---

# 实体类说明

### Ani (订阅)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 唯一标识 |
| url | String | RSS地址 |
| title | String | 标题 |
| jpTitle | String | 日语标题 |
| season | Integer | 季度 |
| year/month/date | Integer | 上映日期 |
| subgroup | String | 字幕组 |
| match | List<String> | 匹配规则 |
| exclude | List<String> | 排除规则 |
| globalExclude | Boolean | 启用全局排除 |
| offset | Integer | 剧集偏移 |
| enable | Boolean | 是否启用 |
| currentEpisodeNumber | Integer | 当前集数 |
| totalEpisodeNumber | Integer | 总集数 |
| score | Double | 评分 |
| ova | Boolean | 剧场版/OVA |
| downloadPath | String | 自定义下载路径 |
| customDownloadPath | Boolean | 启用自定义路径 |
| bgmUrl | String | Bangumi URL |
| tmdb | Tmdb | TMDB信息 |
| customEpisode/customEpisodeStr/customEpisodeGroupIndex | - | 自定义集数规则 |
| omit | Boolean | 遗漏检测 |
| downloadNew | Boolean | 只下载最新集 |
| notDownload | List<Double> | 不下载的集 |
| upload | Boolean | 自动上传 |
| procrastinating | Boolean | 摸鱼模式 |
| message | Boolean | 消息通知 |
| completed | Boolean | 完结迁移 |
| customTags | List<String> | 自定义标签 |

### Config (配置)
主要字段见上文POST /api/config说明，其他重要字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| mikanHost | String | Mikan地址 |
| tmdbApi/tmdbApiKey | String | TMDB配置 |
| downloadCount | Integer | 同时下载数限制 |
| delete | Boolean | 自动删除已完成任务 |
| autoDisabled | Boolean | 自动禁用已完结 |
| skip5 | Boolean | 跳过x.5集 |
| rename | Boolean | 自动重命名 |
| renameTemplate | String | 重命名模板 |
| notificationConfigList | List | 通知配置列表 |
| exclude | List<String> | 全局排除列表 |

### NotificationConfig (通知配置)
| 字段 | 类型 | 说明 |
|------|------|------|
| notificationType | Enum | 类型: TELEGRAM/EMAIL/WEBHOOK等 |
| enable | Boolean | 启用 |
| retry | Integer | 重试次数 |
| statusList | List<Enum> | 触发状态: DOWNLOAD_START/OMIT/ERROR等 |
| telegramBotToken/telegramChatId | String | Telegram配置 |
| mailSMTPHost/mailFrom/mailPassword | String | 邮箱配置 |
| webHookUrl/webHookBody | String | WebHook配置 |
| embyHost/embyApiKey | String | Emby配置 |
| openListUploadHost/openListUploadApiKey | String | OpenList配置 |

