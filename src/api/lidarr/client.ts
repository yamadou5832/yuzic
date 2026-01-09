import { LidarrConfig } from '@/types';

export function createLidarrClient(config: LidarrConfig) {
  const { serverUrl, apiKey } = config;

  if (!serverUrl || !apiKey) {
    throw new Error('Lidarr not configured');
  }

  const baseUrl = `${serverUrl}/api/v1`;

  async function request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${baseUrl}${path}?apikey=${apiKey}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`Lidarr API error (${res.status})`);
    }

    return res.json();
  }

  return { request };
}