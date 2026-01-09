import { SlskdConfig } from '@/types';
import { createSlskdClient } from '../client';

export async function testConnection(config: SlskdConfig): Promise<boolean> {
  const { request } = createSlskdClient(config);

  console.log("Helo")
  await request('/system/info');
  return true;
}
