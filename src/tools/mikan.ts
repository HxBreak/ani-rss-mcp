/**
 * Mikan tools - Direct scraping only
 *
 * Backend-dependent tools have been removed:
 * - ani-rss_search-mikan: Use ani-rss_search-mikan-direct instead
 * - ani-rss_get-mikan-groups: Use ani-rss_get-mikan-bangumi-detail instead
 */

import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  searchMikan,
  browseMikanSeason,
  getMikanBangumiDetail,
} from '../scrapers/mikan.js';
import type { MikanDetailOptions } from '../scrapers/types.js';

export const mikanTools: Tool[] = [
  {
    name: 'ani-rss_search-mikan-direct',
    description: '从 Mikan 网站在线搜索番剧。这是在线查询，用于发现新番剧，返回的 cover 字段可用 markdown 显示：`![封面](coverURL)`',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词（如：辉夜、葬送的芙莉莲）',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'ani-rss_browse-mikan-season',
    description: '按季度浏览 Mikan 在线新番列表。这是在线查询，用于发现当季新番，返回的 cover 字段可用 markdown 显示：`![封面](coverURL)`',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: '年份（如 2026）',
        },
        season: {
          type: 'string',
          enum: ['冬', '春', '夏', '秋'],
          description: '季度',
        },
      },
      required: ['year', 'season'],
    },
  },
  {
    name: 'ani-rss_get-mikan-bangumi-detail',
    description: '获取 Mikan 番剧在线详情。这是在线查询，用于获取字幕组和种子信息。默认返回精简数据（不含种子详情），可指定 includeTorrents=true 获取完整数据，也可通过 subgroupIds 过滤指定字幕组',
    inputSchema: {
      type: 'object',
      properties: {
        bangumiId: {
          type: 'string',
          description: 'Mikan 番剧 ID（如 3878）',
        },
        includeTorrents: {
          type: 'boolean',
          description: '是否包含种子详情（默认 false，返回精简数据）',
        },
        subgroupIds: {
          type: 'array',
          items: { type: 'string' },
          description: '过滤指定字幕组 ID（如 ["370", "209"]）',
        },
      },
      required: ['bangumiId'],
    },
  },
];

// Direct scraping handlers

const searchMikanDirectSchema = z.object({
  keyword: z.string().min(1),
});

export async function handleSearchMikanDirect(args: unknown): Promise<string> {
  const { keyword } = searchMikanDirectSchema.parse(args);

  try {
    const results = await searchMikan(keyword);
    return JSON.stringify({
      success: true,
      data: results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return JSON.stringify({ success: false, message: errorMessage });
  }
}

const browseMikanSeasonSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  season: z.enum(['冬', '春', '夏', '秋']),
});

export async function handleBrowseMikanSeason(args: unknown): Promise<string> {
  const { year, season } = browseMikanSeasonSchema.parse(args);

  try {
    const results = await browseMikanSeason(year, season);
    return JSON.stringify({
      success: true,
      data: results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return JSON.stringify({ success: false, message: errorMessage });
  }
}

const getMikanBangumiDetailSchema = z.object({
  bangumiId: z.string().min(1),
  includeTorrents: z.boolean().optional(),
  subgroupIds: z.array(z.string()).optional(),
});

export async function handleGetMikanBangumiDetail(args: unknown): Promise<string> {
  const { bangumiId, includeTorrents, subgroupIds } = getMikanBangumiDetailSchema.parse(args);

  const options: MikanDetailOptions = {
    includeTorrents,
    subgroupIds,
  };

  try {
    const detail = await getMikanBangumiDetail(bangumiId, options);
    return JSON.stringify({
      success: true,
      data: detail,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return JSON.stringify({ success: false, message: errorMessage });
  }
}
