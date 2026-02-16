import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, BgmSearchResult, BgmUserInfo } from '../client/types.js';

export const bangumiTools: Tool[] = [
  {
    name: 'ani-rss_search-bangumi',
    description: '搜索番剧',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '搜索关键词' },
      },
      required: ['name'],
    },
  },
  {
    name: 'ani-rss_get-bangumi-info',
    description: '通过 Bangumi Subject ID 获取订阅信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Bangumi Subject ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'ani-rss_get-bangumi-title',
    description: '获取最终标题',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '包含 tmdb 信息的订阅对象' },
      },
      required: ['ani'],
    },
  },
  {
    name: 'ani-rss_save-bangumi-rating',
    description: '保存评分',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '订阅对象' },
        score: { type: 'number', description: '评分 (null 清除评分)' },
      },
      required: ['ani', 'score'],
    },
  },
  {
    name: 'ani-rss_get-bgm-user-info',
    description: '获取当前 Bangumi 用户信息',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const searchBangumiSchema = z.object({
  name: z.string(),
});

export async function handleSearchBangumi(args: unknown): Promise<string> {
  const { name } = searchBangumiSchema.parse(args);

  const response = await client.get<BgmSearchResult[]>('/bgm', {
    type: 'search',
    name,
  });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const getBangumiInfoSchema = z.object({
  id: z.string(),
});

export async function handleGetBangumiInfo(args: unknown): Promise<string> {
  const { id } = getBangumiInfoSchema.parse(args);

  const response = await client.get<Ani>('/bgm', {
    type: 'getAniBySubjectId',
    id,
  });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const getBangumiTitleSchema = z.object({
  ani: z.any(),
});

export async function handleGetBangumiTitle(args: unknown): Promise<string> {
  const { ani } = getBangumiTitleSchema.parse(args);

  const response = await client.post<string>('/bgm', ani as Ani, { type: 'getTitle' });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      title: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const saveBangumiRatingSchema = z.object({
  ani: z.any(),
  score: z.number().nullable(),
});

export async function handleSaveBangumiRating(args: unknown): Promise<string> {
  const { ani, score } = saveBangumiRatingSchema.parse(args);
  const aniWithScore = { ...(ani as Ani), score };

  const response = await client.post<void>('/bgm', aniWithScore, { type: 'rate' });

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '评分保存成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleGetBgmUserInfo(): Promise<string> {
  const response = await client.get<BgmUserInfo>('/bgm', { type: 'me' });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
