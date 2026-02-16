import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { CollectionInfo, Ani, Item } from '../client/types.js';

export const collectionTools: Tool[] = [
  {
    name: 'ani-rss_preview-collection',
    description: '预览合集内容',
    inputSchema: {
      type: 'object',
      properties: {
        torrent: { type: 'string', description: 'Base64 编码的种子文件' },
        ani: { type: 'object', description: '订阅配置' },
      },
      required: ['torrent', 'ani'],
    },
  },
  {
    name: 'ani-rss_extract-collection-subgroup',
    description: '从合集提取字幕组',
    inputSchema: {
      type: 'object',
      properties: {
        torrent: { type: 'string', description: 'Base64 编码的种子文件' },
        ani: { type: 'object', description: '订阅配置' },
      },
      required: ['torrent', 'ani'],
    },
  },
  {
    name: 'ani-rss_start-collection-download',
    description: '开始下载合集 (仅支持 qBittorrent)',
    inputSchema: {
      type: 'object',
      properties: {
        torrent: { type: 'string', description: 'Base64 编码的种子文件' },
        ani: { type: 'object', description: '订阅配置' },
      },
      required: ['torrent', 'ani'],
    },
  },
];

const collectionSchema = z.object({
  torrent: z.string(),
  ani: z.any(),
});

export async function handlePreviewCollection(args: unknown): Promise<string> {
  const { torrent, ani } = collectionSchema.parse(args);
  const data: CollectionInfo = { torrent, ani: ani as Ani };

  const response = await client.post<Item[]>('/collection', data, { type: 'preview' });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleExtractCollectionSubgroup(args: unknown): Promise<string> {
  const { torrent, ani } = collectionSchema.parse(args);
  const data: CollectionInfo = { torrent, ani: ani as Ani };

  const response = await client.post<string>('/collection', data, { type: 'subgroup' });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      subgroup: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleStartCollectionDownload(args: unknown): Promise<string> {
  const { torrent, ani } = collectionSchema.parse(args);
  const data: CollectionInfo = { torrent, ani: ani as Ani };

  const response = await client.post<void>('/collection', data, { type: 'start' });

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '合集下载已开始' });
  }

  return JSON.stringify({ success: false, message: response.message });
}
