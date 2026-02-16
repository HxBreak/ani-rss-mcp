import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, PlayItem, Subtitles } from '../client/types.js';

export const playlistTools: Tool[] = [
  {
    name: 'ani-rss_get-playlist',
    description: '获取视频播放列表',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '包含 url 的订阅信息' },
      },
      required: ['ani'],
    },
  },
  {
    name: 'ani-rss_get-subtitles',
    description: '获取视频内封字幕',
    inputSchema: {
      type: 'object',
      properties: {
        file: { type: 'string', description: '文件路径 (Base64)' },
      },
      required: ['file'],
    },
  },
];

const getPlaylistSchema = z.object({
  ani: z.any(),
});

export async function handleGetPlaylist(args: unknown): Promise<string> {
  const { ani } = getPlaylistSchema.parse(args);

  const response = await client.post<PlayItem[]>('/playlist', ani as Ani);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const getSubtitlesSchema = z.object({
  file: z.string(),
});

export async function handleGetSubtitles(args: unknown): Promise<string> {
  const { file } = getSubtitlesSchema.parse(args);

  const response = await client.post<Subtitles[]>('/playitem', {
    type: 'getSubtitles',
    file,
  });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
