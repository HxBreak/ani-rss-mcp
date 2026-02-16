import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { MikanSeason, MikanResult, MikanGroupInfo } from '../client/types.js';

export const mikanTools: Tool[] = [
  {
    name: 'ani-rss_search-mikan',
    description: '搜索 Mikan 番剧，支持关键词搜索或按季度查询新番列表',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '搜索关键词（可选，为空时按季度查询）',
        },
        year: {
          type: 'number',
          description: '年份（季度查询时使用，如 2026）',
        },
        season: {
          type: 'string',
          enum: ['冬', '春', '夏', '秋'],
          description: '季度（季度查询时使用）',
        },
      },
    },
  },
  {
    name: 'ani-rss_get-mikan-groups',
    description: '获取 Mikan 字幕组信息',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Mikan 番剧 URL' },
      },
      required: ['url'],
    },
  },
];

const searchMikanSchema = z.object({
  text: z.string().optional(),
  year: z.number().optional(),
  season: z.enum(['冬', '春', '夏', '秋']).optional(),
});

export async function handleSearchMikan(args: unknown): Promise<string> {
  const { text, year, season } = searchMikanSchema.parse(args);

  // Build query params
  const queryParams: Record<string, string> = {};
  if (text !== undefined && text !== '') {
    queryParams.text = text;
  }

  // Build body for season query
  let body: MikanSeason | undefined;
  if (year !== undefined && season !== undefined) {
    body = { year, season };
  }

  // Use POST method to support both search and season query
  const response = await client.post<MikanResult>('/mikan', body, queryParams);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const getMikanGroupsSchema = z.object({
  url: z.string(),
});

export async function handleGetMikanGroups(args: unknown): Promise<string> {
  const { url } = getMikanGroupsSchema.parse(args);

  const response = await client.get<MikanGroupInfo[]>('/mikan/group', { url });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
