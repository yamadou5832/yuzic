import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { QueryKeys } from '@/enums/queryKeys';
import { Playlist } from '@/types';
import { useApi } from '@/api';
import { staleTime } from '@/constants/staleTime';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

type UsePlaylistResult = {
  playlist: Playlist | null;
  isLoading: boolean;
  error: Error | null;
};

export function usePlaylist(id: string): UsePlaylistResult {
  const api = useApi();
  const activeServer = useSelector(selectActiveServer);

  const query = useQuery<Playlist, Error>({
    queryKey: [QueryKeys.Playlist, activeServer?.id, id],
    queryFn: () => api.playlists.get(id),
    enabled: !!activeServer?.id && !!id,
    staleTime: staleTime.playlists,
  });

  return {
    playlist: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}