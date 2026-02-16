import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Config } from '../client/types.js';

export const configTools: Tool[] = [
  {
    name: 'ani-rss_get-config',
    description: '获取 ani-rss 系统配置',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_update-config',
    description: '更新 ani-rss 系统配置',
    inputSchema: {
      type: 'object',
      properties: {
        downloadToolType: {
          type: 'string',
          enum: ['qBittorrent', 'Transmission', 'Aria2', '115'],
          description: '下载工具类型',
        },
        downloadToolHost: {
          type: 'string',
          description: '下载工具地址',
        },
        downloadToolUsername: {
          type: 'string',
          description: '下载工具用户名',
        },
        downloadToolPassword: {
          type: 'string',
          description: '下载工具密码',
        },
        downloadPathTemplate: {
          type: 'string',
          description: '下载路径模板',
        },
        proxy: {
          type: 'boolean',
          description: '是否启用代理',
        },
        proxyHost: {
          type: 'string',
          description: '代理地址',
        },
        proxyPort: {
          type: 'number',
          description: '代理端口',
        },
        proxyUsername: {
          type: 'string',
          description: '代理用户名',
        },
        proxyPassword: {
          type: 'string',
          description: '代理密码',
        },
        rssSleepMinutes: {
          type: 'number',
          description: 'RSS刷新间隔(分钟)',
        },
        renameSleepSeconds: {
          type: 'number',
          description: '重命名间隔(秒)',
        },
        mikanHost: {
          type: 'string',
          description: 'Mikan地址',
        },
        tmdbApi: {
          type: 'string',
          description: 'TMDB API地址',
        },
        tmdbApiKey: {
          type: 'string',
          description: 'TMDB API Key',
        },
        downloadCount: {
          type: 'number',
          description: '同时下载数限制',
        },
        delete: {
          type: 'boolean',
          description: '自动删除已完成任务',
        },
        autoDisabled: {
          type: 'boolean',
          description: '自动禁用已完结',
        },
        skip5: {
          type: 'boolean',
          description: '跳过x.5集',
        },
        rename: {
          type: 'boolean',
          description: '自动重命名',
        },
        renameTemplate: {
          type: 'string',
          description: '重命名模板',
        },
        exclude: {
          type: 'array',
          items: { type: 'string' },
          description: '全局排除列表',
        },
        ipWhitelist: {
          type: 'array',
          items: { type: 'string' },
          description: 'IP白名单',
        },
        apiKey: {
          type: 'string',
          description: 'API Key',
        },
        login: {
          type: 'object',
          description: '登录配置(用户名/密码)',
          properties: {
            username: { type: 'string', description: '用户名' },
            password: { type: 'string', description: '密码' },
          },
        },
      },
    },
  },
];

export async function handleGetConfig(): Promise<string> {
  const response = await client.get<Config>('/config');

  if (response.code === 200) {
    return JSON.stringify(response.data, null, 2);
  }

  return JSON.stringify({
    error: true,
    message: response.message,
  });
}

const configSchema = z.object({
  downloadToolType: z.enum(['qBittorrent', 'Transmission', 'Aria2', '115']).optional(),
  downloadToolHost: z.string().optional(),
  downloadToolUsername: z.string().optional(),
  downloadToolPassword: z.string().optional(),
  downloadPathTemplate: z.string().optional(),
  proxy: z.boolean().optional(),
  proxyHost: z.string().optional(),
  proxyPort: z.number().optional(),
  proxyUsername: z.string().optional(),
  proxyPassword: z.string().optional(),
  rssSleepMinutes: z.number().optional(),
  renameSleepSeconds: z.number().optional(),
  mikanHost: z.string().optional(),
  tmdbApi: z.string().optional(),
  tmdbApiKey: z.string().optional(),
  downloadCount: z.number().optional(),
  delete: z.boolean().optional(),
  autoDisabled: z.boolean().optional(),
  skip5: z.boolean().optional(),
  rename: z.boolean().optional(),
  renameTemplate: z.string().optional(),
  exclude: z.array(z.string()).optional(),
  ipWhitelist: z.array(z.string()).optional(),
  apiKey: z.string().optional(),
  login: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
});

export async function handleUpdateConfig(args: unknown): Promise<string> {
  const config = configSchema.parse(args) as Config;

  const response = await client.post<Config>('/config', config);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: '配置更新成功',
      data: response.data,
    });
  }

  return JSON.stringify({
    success: false,
    message: response.message,
  });
}
