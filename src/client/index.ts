import type { ApiResponse } from './types.js';

export class AniRssClient {
  private baseUrl: string;
  private authType: 'none' | 'bearer' | 'apiKey';
  private token?: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.ANI_RSS_URL || 'http://localhost:7789';
    this.authType = (process.env.ANI_RSS_AUTH_TYPE as 'none' | 'bearer' | 'apiKey') || 'bearer';
    this.token = process.env.ANI_RSS_TOKEN;
    this.apiKey = process.env.ANI_RSS_API_KEY;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authType === 'bearer' && this.token) {
      headers['Authorization'] = this.token;
    } else if (this.authType === 'apiKey' && this.apiKey) {
      // API Key 使用 header 's' 而不是 Authorization
      headers['s'] = this.apiKey;
    }

    return headers;
  }

  private addApiKeyParam(url: URL): void {
    if (this.authType === 'apiKey' && this.apiKey) {
      url.searchParams.append('s', this.apiKey);
    }
  }

  setToken(token: string): void {
    this.token = token;
    this.authType = 'bearer';
  }

  async get<T>(path: string, query?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/api${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    this.addApiKeyParam(url);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        code: 500,
        message: `连接失败: ${this.baseUrl} - ${errorMessage}`,
        data: null as T,
        t: Date.now(),
      };
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async post<T>(path: string, body?: unknown, query?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/api${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    this.addApiKeyParam(url);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        code: 500,
        message: `连接失败: ${this.baseUrl} - ${errorMessage}`,
        data: null as T,
        t: Date.now(),
      };
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async put<T>(path: string, body?: unknown, query?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/api${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    this.addApiKeyParam(url);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        code: 500,
        message: `连接失败: ${this.baseUrl} - ${errorMessage}`,
        data: null as T,
        t: Date.now(),
      };
    }

    return response.json() as Promise<ApiResponse<T>>;
  }

  async delete<T>(path: string, body?: unknown, query?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/api${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    this.addApiKeyParam(url);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        code: 500,
        message: `连接失败: ${this.baseUrl} - ${errorMessage}`,
        data: null as T,
        t: Date.now(),
      };
    }

    return response.json() as Promise<ApiResponse<T>>;
  }
}

// Singleton instance
export const client = new AniRssClient();
