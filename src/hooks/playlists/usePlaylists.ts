import { QueryClient, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { QueryKeys } from '@/enums/queryKeys';
import { Playlist, PlaylistBase } from '@/types';
import { useApi } from '@/api';
import { staleTime } from '@/constants/staleTime';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

type UsePlaylistsResult = {
    playlists: PlaylistBase[];
    isLoading: boolean;
    error: Error | null;
};

export function usePlaylists(): UsePlaylistsResult {
    const api = useApi();
    const activeServer = useSelector(selectActiveServer);

    const query = useQuery<PlaylistBase[], Error>({
        queryKey: [QueryKeys.Playlists, activeServer?.id],
        queryFn: api.playlists.list,
        enabled: !!activeServer?.id,
        staleTime: staleTime.playlists,
    });

    return {
        playlists: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error ?? null,
    };
}


export function useFullPlaylists(playlists: PlaylistBase[]) {
  const api = useApi();
  const activeServer = useSelector(selectActiveServer);

  const queries = useQueries({
    queries: playlists.map(p => ({
      queryKey: [QueryKeys.Playlist, activeServer?.id, p.id],
      queryFn: () => api.playlists.get(p.id),
      enabled: !!activeServer?.id && !!p.id,
      staleTime: staleTime.playlists,
    })),
  });

  const fullPlaylists = queries
    .map(q => q.data)
    .filter(Boolean) as Playlist[];

  const isLoading = queries.some(q => q.isLoading);

  return {
    playlists: fullPlaylists,
    isLoading,
  };
}