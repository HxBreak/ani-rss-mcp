import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { NotificationConfig, TelegramChatInfo } from '../client/types.js';

export const notificationTools: Tool[] = [
  {
    name: 'ani-rss_test-notification',
    description: '测试通知',
    inputSchema: {
      type: 'object',
      properties: {
        notificationConfig: { type: 'object', description: '通知配置' },
      },
      required: ['notificationConfig'],
    },
  },
  {
    name: 'ani-rss_create-notification-config',
    description: '创建默认通知配置',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'ani-rss_get-telegram-chat-id',
    description: '获取 Telegram Chat ID',
    inputSchema: {
      type: 'object',
      properties: {
        notificationConfig: { type: 'object', description: 'Telegram 配置' },
      },
      required: ['notificationConfig'],
    },
  },
];

const testNotificationSchema = z.object({
  notificationConfig: z.any(),
});

export async function handleTestNotification(args: unknown): Promise<string> {
  const { notificationConfig } = testNotificationSchema.parse(args);

  const response = await client.post<void>(
    '/notification',
    notificationConfig as NotificationConfig,
    { type: 'test' }
  );

  if (response.code === 200) {
    return JSON.stringify({ success: true, message: '通知发送成功' });
  }

  return JSON.stringify({ success: false, message: response.message });
}

export async function handleCreateNotificationConfig(): Promise<string> {
  const response = await client.get<NotificationConfig>('/notification', { type: 'add' });

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}

const getTelegramChatIdSchema = z.object({
  notificationConfig: z.any(),
});

export async function handleGetTelegramChatId(args: unknown): Promise<string> {
  const { notificationConfig } = getTelegramChatIdSchema.parse(args);

  const response = await client.post<TelegramChatInfo>(
    '/telegram',
    notificationConfig as NotificationConfig,
    { method: 'getUpdates' }
  );

  if (response.code === 200) {
    return JSON.stringify({
      success: true,
      data: response.data,
    });
  }

  return JSON.stringify({ success: false, message: response.message });
}
