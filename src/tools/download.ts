import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, Config, DownloadPathResponse, TorrentsInfo } from '../client/types.js';

export const downloadTools: Tool[] = [
  {
    name: 'ani-rss_get-download-path',
    description: '获取下载路径',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '订阅配置' },
      },
      required: ['ani'],
    },
  },
  {
    name: 'ani-rss_test-download-login',
    description: '测试下载工具连接',
    inputSchema: {
      type: 'object',
      properties: {
        downloadToolType: {
          type: 'string',
          enum: ['qBittorrent', 'Transmission', 'Aria2', '115'],
          description: '下载工具类型',
        },
        downloadToolHost: { type: 'string', description: '下载工具地址' },
        downloadToolUsername: { type: 'string', description: '用户名' },
        downloadToolPassword: { type: 'string', description: '密码' },
      },
      required: ['downloadToolType', 'downloadToolHost'],
    },
  },
  {
    name: 'ani-rss_list-torrents',
    description: '获取下载器任务列表',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_delete-torrent-cache',
    description: '删除缓存的种子文件',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '订阅ID' },
        infoHash: { type: 'string', description: '种子hash，多个用逗号分隔' },
      },
      required: ['id', 'infoHash'],
    },
  },
  {
    name: 'ani-rss_update-trackers',
    description: '更新 Trackers',
    inputSchema: {
      type: 'object',
      properties: {
        config: { type: 'object', description: '配置对象' },
      },
      required: ['config'],
    },
  },
  {
    name: 'ani-rss_get-download-logs',
    description: '获取下载日志压缩包',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const getDownloadPathSchema = z.object({
  ani: z.any(),
});

export async function handleGetDownloadPath(args: unknown): Promise<string> {
  const { ani } = getDownloadPathSchema.parse(args);

  const response = await client.post<DownloadPathResponse>('/downloadPath', ani as Ani);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const testDownloadLoginSchema = z.object({
  downloadToolType: z.enum(['qBittorrent', 'Transmission', 'Aria2', '115']),
  downloadToolHost: z.string(),
  downloadToolUsername: z.string().optional(),
  downloadToolPassword: z.string().optional(),
});

export async function handleTestDownloadLogin(args: unknown): Promise<string> {
  const config = testDownloadLoginSchema.parse(args) as Config;

  const response = await client.post<string>('/downloadLoginTest', config);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: response.data || '连接成功',
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleListTorrents(): Promise<string> {
  const response = await client.get<TorrentsInfo[]>('/torrentsInfos');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const deleteTorrentCacheSchema = z.object({
  id: z.string(),
  infoHash: z.string(),
});

export async function handleDeleteTorrentCache(args: unknown): Promise<string> {
  const { id, infoHash } = deleteTorrentCacheSchema.parse(args);

  const response = await client.delete<void>('/torrent', undefined, { id, infoHash });

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '缓存种子删除成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const updateTrackersSchema = z.object({
  config: z.any(),
});

export async function handleUpdateTrackers(args: unknown): Promise<string> {
  const { config } = updateTrackersSchema.parse(args);

  const response = await client.post<void>('/trackersUpdate', config as Config);

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: 'Trackers 更新成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleGetDownloadLogs(): Promise<string> {
  // This endpoint returns a zip file, so we return the URL
  const baseUrl = process.env.ANI_RSS_URL || 'http://localhost:7789';
  return JSON.stringify({
    success: true,
    message: '请直接访问以下URL下载日志',
    url: `${baseUrl}/api/downloadLogs`,
  });
}
