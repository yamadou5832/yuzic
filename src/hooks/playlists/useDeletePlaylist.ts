import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useApi } from '@/api';
import { QueryKeys } from '@/enums/queryKeys';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

export function useDeletePlaylist() {
  const api = useApi();
  const queryClient = useQueryClient();
  const activeServer = useSelector(selectActiveServer);

  return useMutation({
    mutationFn: async (playlistId: string) => {
      await api.playlists.delete(playlistId);
    },
    onSuccess: (_, playlistId) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Playlists] });
      queryClient.removeQueries({
        queryKey: [QueryKeys.Playlist, activeServer?.id, playlistId],
      });
    },
  });
}
