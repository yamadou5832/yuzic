import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { QueryKeys } from '@/enums/queryKeys';
import { Album } from '@/types';
import { useApi } from '@/api';
import { staleTime } from '@/constants/staleTime';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

type UseAlbumResult = {
  album: Album | null;
  isLoading: boolean;
  error: Error | null;
};

export function useAlbum(id: string): UseAlbumResult {
  const api = useApi();
  const activeServer = useSelector(selectActiveServer);

  const query = useQuery<Album, Error>({
    queryKey: [QueryKeys.Album, activeServer?.id, id],
    queryFn: () => api.albums.get(id),
    enabled: !!activeServer?.id && !!id,
    staleTime: staleTime.albums,
  });

  return {
    album: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}