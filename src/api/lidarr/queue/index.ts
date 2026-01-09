import { createLidarrClient } from '../client';
import { LidarrConfig } from '@/types';

export type LidarrQueueRecord = {
  id: number;
  artistId?: number;
  albumId?: number;
  title?: string;
  status?: string;
  trackedDownloadState?: string;
  size?: number;
  sizeleft?: number;
  timeleft?: string;
};

export type LidarrQueueResponse = {
  page: number;
  pageSize: number;
  totalRecords: number;
  records: LidarrQueueRecord[];
};

export type FinishedQueueItem = LidarrQueueRecord;

export async function fetchQueue(
  config: LidarrConfig
): Promise<LidarrQueueRecord[]> {
  const { request } = createLidarrClient(config);

  const data = await request<LidarrQueueResponse>('/queue');
  return data?.records ?? [];
}

export function detectFinishedQueueItems(
  previous: LidarrQueueRecord[],
  current: LidarrQueueRecord[]
): FinishedQueueItem[] {
  if (!previous.length) return [];

  const currentIds = new Set(current.map(item => item.id));
  return previous.filter(item => !currentIds.has(item.id));
}

export async function fetchQueueWithDiff(
  config: LidarrConfig,
  previousQueue: LidarrQueueRecord[]
): Promise<{
  currentQueue: LidarrQueueRecord[];
  finishedItems: FinishedQueueItem[];
}> {
  const currentQueue = await fetchQueue(config);
  const finishedItems = detectFinishedQueueItems(
    previousQueue,
    currentQueue
  );

  return { currentQueue, finishedItems };
}