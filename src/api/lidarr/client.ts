import { LidarrConfig } from '@/types';

export function createLidarrClient(config: LidarrConfig) {
  const { serverUrl, apiKey } = config;

  if (!serverUrl || !apiKey) {
    throw new Error('Lidarr not configured');
  }

  const baseUrl = `${serverUrl.replace(/\/$/, '')}/api/v1`;

  async function request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey, // ✅ THIS FIXES IT
        ...(options.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Lidarr API error (${res.status}): ${text}`
      );
    }

    return res.json();
  }

  return { request };
}