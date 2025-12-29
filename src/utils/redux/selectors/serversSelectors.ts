import { Server } from '@/types';
import { RootState } from '@/utils/redux/store';

export const selectActiveServer = (state: RootState) => {
  const { servers, activeServerId } = state.servers;

  if (!servers || !activeServerId) return null;

  return servers.find(s => s.id === activeServerId) ?? null;
};

export const selectServerById =
  (id: string) =>
  (state: RootState): Server | null =>
    state.servers.servers.find(s => s.id === id) ?? null;