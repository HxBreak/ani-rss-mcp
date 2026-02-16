import { z } from 'zod';
import crypto from 'crypto';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { client } from '../client/index.js';
import type { Login } from '../client/types.js';

export const authTools: Tool[] = [
  {
    name: 'ani-rss_login',
    description: '登录 ani-rss 系统获取认证 token',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: '用户名',
        },
        password: {
          type: 'string',
          description: '密码',
        },
      },
      required: ['username', 'password'],
    },
  },
  {
    name: 'ani-rss_test-whitelist',
    description: '检测当前 IP 是否在白名单内',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function handleLogin(args: unknown): Promise<string> {
  const { username, password } = loginSchema.parse(args);
  // 密码需要进行 MD5 哈希
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
  const loginData: Login = { username, password: hashedPassword };

  const response = await client.post<string>('/login', loginData);

  if (response.code === 200 && response.data) {
    client.setToken(response.data);
    return JSON.stringify({
      success: true,
      message: '登录成功',
      token: response.data,
    });
  }

  return JSON.stringify({
    success: false,
    message: response.message || '登录失败',
  });
}

export async function handleTestWhitelist(): Promise<string> {
  const response = await client.get<void>('/test');

  return JSON.stringify({
    inWhitelist: response.code === 200,
    message: response.message,
  });
}
