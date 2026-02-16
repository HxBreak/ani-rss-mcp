import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Ani, Config, About, Log, ProxyTestResponse } from '../client/types.js';

export const systemTools: Tool[] = [
  {
    name: 'ani-rss_get-custom-css',
    description: '获取自定义 CSS 样式',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_get-custom-js',
    description: '获取自定义 JavaScript 脚本',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_get-system-info',
    description: '获取系统信息',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_update-system',
    description: '更新系统',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_restart-system',
    description: '重启或关闭系统',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          description: '0=重启，1=关闭',
        },
      },
      required: ['status'],
    },
  },
  {
    name: 'ani-rss_clear-cache',
    description: '清理缓存',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_list-logs',
    description: '获取日志列表',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_clear-logs',
    description: '清空日志',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_test-proxy',
    description: '测试代理连接',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: '测试 URL (Base64 编码)' },
        config: { type: 'object', description: '代理配置' },
      },
      required: ['url', 'config'],
    },
  },
  {
    name: 'ani-rss_refresh-cover',
    description: '刷新封面',
    inputSchema: {
      type: 'object',
      properties: {
        ani: { type: 'object', description: '包含 image 的订阅信息' },
      },
      required: ['ani'],
    },
  },
];

export async function handleGetCustomCss(): Promise<string> {
  const response = await client.get<string>('/custom.css');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      content: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleGetCustomJs(): Promise<string> {
  const response = await client.get<string>('/custom.js');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      content: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleGetSystemInfo(): Promise<string> {
  const response = await client.get<About>('/about');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleUpdateSystem(): Promise<string> {
  const response = await client.post<string>('/update');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: response.data || '系统更新成功',
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const restartSystemSchema = z.object({
  status: z.number(),
});

export async function handleRestartSystem(args: unknown): Promise<string> {
  const { status } = restartSystemSchema.parse(args);

  const response = await client.post<void>('/stop', undefined, { status: String(status) });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: status === 0 ? '系统正在重启' : '系统正在关闭',
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleClearCache(): Promise<string> {
  const response = await client.post<number>('/clearCache');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: `清理完成，释放 ${response.data} MB`,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleListLogs(): Promise<string> {
  const response = await client.get<Log[]>('/logs');

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleClearLogs(): Promise<string> {
  const response = await client.delete<void>('/logs');

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '日志已清空' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const testProxySchema = z.object({
  url: z.string(),
  config: z.any(),
});

export async function handleTestProxy(args: unknown): Promise<string> {
  const { url, config } = testProxySchema.parse(args);

  const response = await client.post<ProxyTestResponse>(
    '/proxy',
    config as Config,
    { url }
  );

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const refreshCoverSchema = z.object({
  ani: z.any(),
});

export async function handleRefreshCover(args: unknown): Promise<string> {
  const { ani } = refreshCoverSchema.parse(args);

  const response = await client.post<string>('/cover', ani as Ani);

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      message: '封面刷新成功',
      path: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
