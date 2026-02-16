import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, ImportAniDataDTO } from '../client/types.js';

export const subscriptionTools: Tool[] = [
  {
    name: 'ani-rss_list-subscriptions',
    description: '获取所有订阅列表',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_add-subscription',
    description: '添加新订阅。注意：offset默认为0，enable默认为true',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'RSS地址' },
        title: { type: 'string', description: '标题' },
        season: { type: 'number', description: '季度' },
        subgroup: { type: 'string', description: '字幕组' },
        match: { type: 'array', items: { type: 'string' }, description: '匹配规则列表' },
        exclude: { type: 'array', items: { type: 'string' }, description: '排除规则列表' },
        globalExclude: { type: 'boolean', description: '启用全局排除' },
        offset: { type: 'number', description: '剧集偏移（默认0）' },
        enable: { type: 'boolean', description: '是否启用（默认true）' },
        ova: { type: 'boolean', description: '是否剧场版/OVA' },
        customDownloadPath: { type: 'boolean', description: '自定义下载路径开关' },
        downloadPath: { type: 'string', description: '自定义下载路径' },
        bgmUrl: { type: 'string', description: 'Bangumi URL' },
        replace: { type: 'boolean', description: '标题+季度重复时是否替换' },
      },
      required: ['url', 'title', 'season'],
    },
  },
  {
    name: 'ani-rss_update-subscription',
    description: '更新订阅。注意：offset默认为0，enable默认为true',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '订阅ID' },
        url: { type: 'string', description: 'RSS地址' },
        title: { type: 'string', description: '标题' },
        season: { type: 'number', description: '季度' },
        subgroup: { type: 'string', description: '字幕组' },
        match: { type: 'array', items: { type: 'string' }, description: '匹配规则列表' },
        exclude: { type: 'array', items: { type: 'string' }, description: '排除规则列表' },
        globalExclude: { type: 'boolean', description: '启用全局排除' },
        offset: { type: 'number', description: '剧集偏移（默认0）' },
        enable: { type: 'boolean', description: '是否启用（默认true）' },
        ova: { type: 'boolean', description: '是否剧场版/OVA' },
        customDownloadPath: { type: 'boolean', description: '自定义下载路径开关' },
        downloadPath: { type: 'string', description: '自定义下载路径' },
        bgmUrl: { type: 'string', description: 'Bangumi URL' },
        move: { type: 'boolean', description: '是否移动已下载文件' },
      },
      required: ['id'],
    },
  },
  {
    name: 'ani-rss_delete-subscriptions',
    description: '删除订阅',
    inputSchema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'string' }, description: '要删除的订阅ID列表' },
        deleteFiles: { type: 'boolean', description: '是否同时删除本地文件' },
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

export async function handleListSubscriptions(): Promise<string> {
  const response = await client.get<Ani[]>('/ani');

  if (response.code === 200) {
    return JSON.stringify(response.data, null, 2);
  }

  return JSON.stringify({ error: true, message: response.message });
}

const addSubscriptionSchema = z.object({
  url: z.string(),
  title: z.string(),
  season: z.number(),
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
  replace: z.boolean().optional(),
});

export async function handleAddSubscription(args: unknown): Promise<string> {
  const parsed = addSubscriptionSchema.parse(args);
  const replace = (args as { replace?: boolean }).replace;

  // Set default values to match frontend behavior
  // id should be empty string for new subscriptions
  const ani: Ani = {
    id: '',
    ...parsed,
    offset: parsed.offset ?? 0,
    enable: parsed.enable ?? true,
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
