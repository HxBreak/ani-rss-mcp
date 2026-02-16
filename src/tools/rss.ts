import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, ItemsPreview } from '../client/types.js';

export const rssTools: Tool[] = [
  {
    name: 'ani-rss_parse-rss',
    description: '解析 RSS 地址获取订阅信息',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'RSS地址' },
        type: { type: 'string', description: '类型' },
        bgmUrl: { type: 'string', description: 'Bangumi URL' },
      },
      required: ['url'],
    },
  },
  {
    name: 'ani-rss_preview-items',
    description: '预览订阅 RSS 条目',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '订阅配置' },
      },
      required: ['ani'],
    },
  },
];

const parseRssSchema = z.object({
  url: z.string(),
  type: z.string().optional(),
  bgmUrl: z.string().optional(),
});

export async function handleParseRss(args: unknown): Promise<string> {
  const { url, type, bgmUrl } = parseRssSchema.parse(args);
  const ani = { url, type, bgmUrl } as unknown as Ani;

  const response = await client.post<Ani>('/rss', ani);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const previewItemsSchema = z.object({
  ani: z.any(),
});

export async function handlePreviewItems(args: unknown): Promise<string> {
  const { ani } = previewItemsSchema.parse(args);

  const response = await client.post<ItemsPreview>('/items', ani as Ani);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
