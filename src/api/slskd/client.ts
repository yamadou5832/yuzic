import { SlskdConfig } from '@/types';

export function createSlskdClient(config: SlskdConfig) {
  const { serverUrl, apiKey } = config;

  if (!serverUrl || !apiKey) {
    throw new Error('slskd not configured');
  }

  async function request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${serverUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`slskd API error (${res.status})`);
    }

    return res.json();
  }

  return { request };
}