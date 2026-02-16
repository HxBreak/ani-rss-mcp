import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, EpisodeGroup } from '../client/types.js';

export const tmdbTools: Tool[] = [
  {
    name: 'ani-rss_get-tmdb-name',
    description: '获取 TMDB 名称',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '订阅信息' },
      },
      required: ['ani'],
    },
  },
  {
    name: 'ani-rss_get-tmdb-episode-group',
    description: '获取 TMDB 剧集组信息',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '包含 tmdb 信息的订阅对象' },
      },
      required: ['ani'],
    },
  },
];

const getTmdbNameSchema = z.object({
  ani: z.any(),
});

export async function handleGetTmdbName(args: unknown): Promise<string> {
  const { ani } = getTmdbNameSchema.parse(args);

  const response = await client.post<Ani>('/tmdb', ani as Ani, {
    method: 'getThemoviedbName',
  });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const getTmdbEpisodeGroupSchema = z.object({
  ani: z.any(),
});

export async function handleGetTmdbEpisodeGroup(args: unknown): Promise<string> {
  const { ani } = getTmdbEpisodeGroupSchema.parse(args);

  const response = await client.post<EpisodeGroup[]>('/tmdb', ani as Ani, {
    method: 'getTmdbGroup',
  });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
