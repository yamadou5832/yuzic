import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useApi } from '@/api';
import { QueryKeys } from '@/enums/queryKeys';
import { FAVORITES_ID } from '@/constants/favorites';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

export function useUnstarSong() {
  const api = useApi();
  const queryClient = useQueryClient();
  const activeServer = useSelector(selectActiveServer);

  return useMutation({
    mutationFn: (songId: string) => api.starred.remove(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Starred] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Albums] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist, activeServer?.id, FAVORITES_ID],
      });
    },
  });
}