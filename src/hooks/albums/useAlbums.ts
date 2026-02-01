import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { QueryKeys } from '@/enums/queryKeys';
import { AlbumBase } from '@/types';
import { useApi } from '@/api';
import { staleTime } from '@/constants/staleTime';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

type UseAlbumsResult = {
  albums: AlbumBase[];
  isLoading: boolean;
  error: Error | null;
};

export function useAlbums(): UseAlbumsResult {
  const api = useApi();
  const activeServer = useSelector(selectActiveServer);

  const query = useQuery<AlbumBase[], Error>({
    queryKey: [QueryKeys.Albums, activeServer?.id],
    queryFn: api.albums.list,
    enabled: !!activeServer?.id,
    staleTime: staleTime.albums,
  });

  return {
    albums: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}