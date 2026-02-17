import { z } from 'zod';
import { randomUUID } from 'crypto';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, ImportAniDataDTO } from '../client/types.js';

export const subscriptionTools: Tool[] = [
  {
    name: 'ani-rss_list-subscriptions',
    description: '获取用户已订阅的番剧列表。这是本地订阅管理，不是在线搜索。返回的 image 字段可用 markdown 显示：`![封面](图片URL)`',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_add-subscription',
    description: '添加新订阅。必填字段：url、title、season、year、month、date。日期可从Bangumi获取。image字段可用于显示封面：![封面](image)',
    inputSchema: {
      type: 'object',
      properties: {
        // === 必填字段 ===
        url: { type: 'string', description: 'RSS地址（从mikan获取的订阅链接）' },
        title: { type: 'string', description: '番剧标题（中文或日文）' },
        season: { type: 'number', description: '季度（第几季，如1、2、3）' },
        year: { type: 'number', description: '开播年份（从Bangumi获取，如2025）' },
        month: { type: 'number', description: '开播月份（1-12，从Bangumi获取）' },
        date: { type: 'number', description: '开播日期（1-31，从Bangumi获取）' },
        // === 常用可选字段 ===
        subgroup: { type: 'string', description: '字幕组名称（如LoliHouse）' },
        bgmUrl: { type: 'string', description: 'Bangumi条目URL（如https://bgm.tv/subject/12345）' },
        image: { type: 'string', description: '封面图片URL（从Bangumi或Mikan获取）' },
        offset: { type: 'number', description: '剧集偏移（默认0，用于修正集数编号）' },
        enable: { type: 'boolean', description: '是否启用订阅（默认true）' },
        // === 过滤规则 ===
        match: { type: 'array', items: { type: 'string' }, description: '匹配规则（正则，如["1080p","HEVC"]，留空匹配所有）' },
        exclude: { type: 'array', items: { type: 'string' }, description: '排除规则（正则，默认排除720p、合集等）' },
        globalExclude: { type: 'boolean', description: '是否启用全局排除规则（默认false）' },
        // === 类型标识 ===
        ova: { type: 'boolean', description: '是否为剧场版/OVA（默认false）' },
        // === 下载选项 ===
        downloadNew: { type: 'boolean', description: '是否只下载最新一集（默认false）' },
        omit: { type: 'boolean', description: '是否启用遗漏检测（默认true）' },
        // === 自定义路径 ===
        customDownloadPath: { type: 'boolean', description: '是否启用自定义下载路径（默认false）' },
        downloadPath: { type: 'string', description: '自定义下载路径（customDownloadPath=true时有效）' },
        // === 其他 ===
        replace: { type: 'boolean', description: '标题+季度重复时是否替换已有订阅（默认false）' },
      },
      required: ['url', 'title', 'season', 'year', 'month', 'date'],
    },
  },
  {
    name: 'ani-rss_update-subscription',
    description: '更新已有订阅。只需提供要修改的字段，id为必填。',
    inputSchema: {
      type: 'object',
      properties: {
        // === 必填 ===
        id: { type: 'string', description: '订阅ID（从list-subscriptions获取）' },
        // === 基本信息可更新 ===
        url: { type: 'string', description: 'RSS地址' },
        title: { type: 'string', description: '番剧标题' },
        season: { type: 'number', description: '季度' },
        year: { type: 'number', description: '开播年份' },
        month: { type: 'number', description: '开播月份（1-12）' },
        date: { type: 'number', description: '开播日期（1-31）' },
        subgroup: { type: 'string', description: '字幕组名称' },
        bgmUrl: { type: 'string', description: 'Bangumi条目URL' },
        image: { type: 'string', description: '封面图片URL' },
        // === 下载选项 ===
        offset: { type: 'number', description: '剧集偏移' },
        enable: { type: 'boolean', description: '是否启用订阅' },
        ova: { type: 'boolean', description: '是否为剧场版/OVA' },
        downloadNew: { type: 'boolean', description: '是否只下载最新一集' },
        omit: { type: 'boolean', description: '是否启用遗漏检测' },
        // === 过滤规则 ===
        match: { type: 'array', items: { type: 'string' }, description: '匹配规则' },
        exclude: { type: 'array', items: { type: 'string' }, description: '排除规则' },
        globalExclude: { type: 'boolean', description: '是否启用全局排除' },
        // === 路径 ===
        customDownloadPath: { type: 'boolean', description: '是否启用自定义下载路径' },
        downloadPath: { type: 'string', description: '自定义下载路径' },
        // === 其他 ===
        move: { type: 'boolean', description: '修改下载路径时是否移动已下载文件' },
      },
      required: ['id'],
    },
  },
  {
    name: 'ani-rss_delete-subscriptions',
    description: '删除订阅。会自动删除种子文件，deleteFiles=true时可同时删除下载的视频文件。',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: '要删除的订阅ID列表（从list-subscriptions获取）' },
        deleteFiles: { type: 'boolean', description: '是否同时删除本地下载的视频文件（默认false，只删除订阅记录和种子文件）' },
      },
      required: ['ids'],
    },
  },
  {
    name: 'ani-rss_refresh-subscription',
    description: '刷新/下载订阅',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '订阅配置(为空则刷新全部)' },
      },
    },
  },
  {
    name: 'ani-rss_batch-enable',
    description: '批量启用/禁用订阅',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: '订阅ID列表' },
        enable: { type: 'boolean', description: 'true=启用, false=禁用' },
      },
      required: ['ids', 'enable'],
    },
  },
  {
    name: 'ani-rss_update-episode-count',
    description: '更新订阅的总集数',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: '订阅ID列表' },
        force: { type: 'boolean', description: '是否强制更新' },
      },
      required: ['ids'],
    },
  },
  {
    name: 'ani-rss_import-subscriptions',
    description: '导入订阅',
    inputSchema: {
      type: 'object',
      properties: {
        aniList: { type: 'array', description: '订阅列表' },
        conflict: { type: 'string', enum: ['SKIP', 'REPLACE'], description: '冲突处理方式' },
      },
      required: ['aniList'],
    },
  },
  {
    name: 'ani-rss_scrape-media-info',
    description: '刮削媒体信息',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '订阅信息' },
        force: { type: 'boolean', description: '是否强制刮削' },
      },
      required: ['ani'],
    },
  },
];

/**
 * Simplified subscription item for display
 */
interface SimplifiedAni {
  id: string;
  title: string;
  url: string;
  season: number;
  subgroup?: string;
  enable: boolean;
  completed: boolean;
  currentEpisodeNumber: number;
  totalEpisodeNumber: number;
  date?: string;           // Combined from year/month/date
  score?: number;
  image?: string;
  bgmUrl?: string;
  downloadPath?: string;
  lastDownloadTime?: number;
}

/**
 * Simplify subscription data for display
 */
function simplifyAni(item: Record<string, any>): SimplifiedAni {
  // Combine year/month/date into single date string
  // Only show date if year is valid (>= 2020)
  let date: string | undefined;
  if (item.year && item.year >= 2020 && item.month && item.date) {
    date = `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.date).padStart(2, '0')}`;
  }

  return {
    id: item.id || '',
    title: item.title || '',
    url: item.url || '',
    season: item.season || 1,
    subgroup: item.subgroup,
    enable: item.enable ?? true,
    completed: item.completed ?? false,
    currentEpisodeNumber: item.currentEpisodeNumber || 0,
    totalEpisodeNumber: item.totalEpisodeNumber || 0,
    date,
    score: item.score,
    image: item.image,
    bgmUrl: item.bgmUrl,
    downloadPath: item.downloadPath,
    lastDownloadTime: item.lastDownloadTime,
  };
}

export async function handleListSubscriptions(): Promise<string> {
  const response = await client.get<Ani[]>('/ani');

  if (response.code === 200) {
    const simplified = response.data.map(item => simplifyAni(item as unknown as Record<string, any>));
    return JSON.stringify(simplified, null, 2);
  }

  return JSON.stringify({ error: true, message: response.message });
}

const addSubscriptionSchema = z.object({
  // Required fields
  url: z.string().min(1, 'RSS地址不能为空'),
  title: z.string().min(1, '标题不能为空'),
  season: z.number().int().min(1, '季度必须大于0'),
  year: z.number().int().min(1970, '年份必须大于1970'),
  month: z.number().int().min(1).max(12, '月份必须在1-12之间'),
  date: z.number().int().min(1).max(31, '日期必须在1-31之间'),
  // Optional fields - Basic info
  subgroup: z.string().optional(),
  bgmUrl: z.string().optional(),
  image: z.string().optional(),
  // Optional fields - Filtering
  match: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  globalExclude: z.boolean().optional(),
  // Optional fields - Download options
  offset: z.number().int().optional(),
  enable: z.boolean().optional(),
  ova: z.boolean().optional(),
  downloadNew: z.boolean().optional(),
  omit: z.boolean().optional(),
  // Optional fields - Custom path
  customDownloadPath: z.boolean().optional(),
  downloadPath: z.string().optional(),
  // Other
  replace: z.boolean().optional(),
});

export async function handleAddSubscription(args: unknown): Promise<string> {
  const parsed = addSubscriptionSchema.parse(args);
  const replace = (args as { replace?: boolean }).replace;

  // Generate UUID for new subscription to avoid ID collision
  // Backend uses this ID directly for duplicate checking
  // Set default values to match backend's createAni() behavior
  const ani: Ani = {
    id: randomUUID(),
    // User provided values
    ...parsed,
    // === Numeric defaults ===
    offset: parsed.offset ?? 0,
    currentEpisodeNumber: 0,
    totalEpisodeNumber: 0,
    score: 0,
    customEpisodeGroupIndex: 2,
    // === Boolean defaults (user can override) ===
    enable: parsed.enable ?? true,
    ova: parsed.ova ?? false,
    globalExclude: parsed.globalExclude ?? false,
    customDownloadPath: parsed.customDownloadPath ?? false,
    omit: parsed.omit ?? true,
    downloadNew: parsed.downloadNew ?? false,
    // === Boolean defaults (internal, always use default) ===
    procrastinating: true,
    message: true,
    completed: true,
    customRenameTemplateEnable: false,
    customPriorityKeywordsEnable: false,
    customUploadEnable: false,
    customCompleted: false,
    customTagsEnable: false,
    customEpisode: false,
    upload: true,
    // === List defaults (avoid NPE) ===
    match: parsed.match ?? [],
    exclude: parsed.exclude ?? ['720[Pp]', '\\d-\\d', '合集'],
    customPriorityKeywords: [],
    customTags: [],
    notDownload: [],
    standbyRssList: [],
    // === String defaults ===
    subgroup: parsed.subgroup ?? '',
    bgmUrl: parsed.bgmUrl ?? '',
    downloadPath: parsed.downloadPath ?? '',
    image: parsed.image ?? '',
    customRenameTemplate: '',
    customUploadPathTarget: '',
    customCompletedPathTemplate: '',
    customEpisodeStr: '(\\d+)',
    themoviedbName: '',
    type: 'mikan',
    // === Object defaults ===
    tmdb: { id: '', name: '' } as any,
  };

  const response = await client.post<Ani>('/ani', ani, replace ? { replace: 'true' } : undefined);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: '订阅添加成功',
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const updateSubscriptionSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  title: z.string().optional(),
  season: z.number().optional(),
  subgroup: z.string().optional(),
  match: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  globalExclude: z.boolean().optional(),
  offset: z.number().optional(),
  enable: z.boolean().optional(),
  ova: z.boolean().optional(),
  customDownloadPath: z.boolean().optional(),
  downloadPath: z.string().optional(),
  bgmUrl: z.string().optional(),
  move: z.boolean().optional(),
});

export async function handleUpdateSubscription(args: unknown): Promise<string> {
  const { move, ...parsed } = updateSubscriptionSchema.parse(args);
  const query = move !== undefined ? { move: String(move) } : undefined;

  // Set default values for required backend fields if not provided
  const ani = {
    ...parsed,
    offset: parsed.offset ?? 0,
    enable: parsed.enable ?? true,
  };

  const response = await client.put<Ani>('/ani', ani as Ani, query);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: '订阅更新成功',
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const deleteSubscriptionsSchema = z.object({
  ids: z.array(z.string()),
  deleteFiles: z.boolean().optional(),
});

export async function handleDeleteSubscriptions(args: unknown): Promise<string> {
  const { ids, deleteFiles } = deleteSubscriptionsSchema.parse(args);
  const query = deleteFiles ? { deleteFiles: 'true' } : undefined;

  const response = await client.delete<void>('/ani', ids, query);

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '订阅删除成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const refreshSubscriptionSchema = z.object({
  ani: z.any().optional(),
});

export async function handleRefreshSubscription(args: unknown): Promise<string> {
  const { ani } = refreshSubscriptionSchema.parse(args);

  // If ani is provided, ensure required fields have defaults
  const body = ani ? {
    offset: ani.offset ?? 0,
    enable: ani.enable ?? true,
    ...ani,
  } : undefined;

  const response = await client.post<void>('/ani', body, { type: 'download' });

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '订阅刷新成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const batchEnableSchema = z.object({
  ids: z.array(z.string()),
  enable: z.boolean(),
});

export async function handleBatchEnable(args: unknown): Promise<string> {
  const { ids, enable } = batchEnableSchema.parse(args);

  const response = await client.post<void>('/ani', ids, {
    type: 'batchEnable',
    value: String(enable),
  });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: enable ? '订阅已启用' : '订阅已禁用',
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const updateEpisodeCountSchema = z.object({
  ids: z.array(z.string()),
  force: z.boolean().optional(),
});

export async function handleUpdateEpisodeCount(args: unknown): Promise<string> {
  const { ids, force } = updateEpisodeCountSchema.parse(args);

  const response = await client.post<void>('/ani', ids, {
    type: 'updateTotalEpisodeNumber',
    ...(force !== undefined ? { force: String(force) } : {}),
  });

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '总集数更新成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const importSubscriptionsSchema = z.object({
  aniList: z.array(z.any()),
  conflict: z.enum(['SKIP', 'REPLACE']).optional(),
});

export async function handleImportSubscriptions(args: unknown): Promise<string> {
  const { aniList, conflict } = importSubscriptionsSchema.parse(args);
  const data: ImportAniDataDTO = {
    aniList: aniList as Ani[],
    conflict: conflict || 'SKIP',
  };

  const response = await client.post<void>('/ani/import', data);

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '订阅导入成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const scrapeMediaInfoSchema = z.object({
  ani: z.any(),
  force: z.boolean().optional(),
});

export async function handleScrapeMediaInfo(args: unknown): Promise<string> {
  const { ani, force } = scrapeMediaInfoSchema.parse(args);
  const query = force ? { force: 'true' } : undefined;

  const response = await client.post<Ani>('/scrape', ani as Ani, query);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: '刮削成功',
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
