import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { QueryKeys } from '@/enums/queryKeys';
import { ArtistBase } from '@/types';
import { useApi } from '@/api';
import { staleTime } from '@/constants/staleTime';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

type UseArtistsResult = {
  artists: ArtistBase[];
  isLoading: boolean;
  error: Error | null;
};

export function useArtists(): UseArtistsResult {
  const api = useApi();
  const activeServer = useSelector(selectActiveServer);

  const query = useQuery<ArtistBase[], Error>({
    queryKey: [QueryKeys.Artists, activeServer?.id],
    queryFn: api.artists.list,
    enabled: !!activeServer?.id,
    staleTime: staleTime.artists,
  });

  return {
    artists: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}