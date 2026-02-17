import type { ApiResponse } from './types.js';

/**
 * Ani-Rss API Client - API_KEY mode only
 *
 * Configuration via environment variables:
 * - ANI_RSS_URL: Backend URL (default: http://localhost:7789)
 * - ANI_RSS_API_KEY: API key for authentication
 */
export class AniRssClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.ANI_RSS_URL || 'http://localhost:7789';
    this.apiKey = process.env.ANI_RSS_API_KEY;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['s'] = this.apiKey;
    }

    return headers;
  }

  private addApiKeyParam(url: URL): void {
    if (this.apiKey) {
      url.searchParams.append('s', this.apiKey);
    }
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
