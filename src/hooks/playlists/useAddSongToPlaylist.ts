import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useApi } from '@/api';
import { QueryKeys } from '@/enums/queryKeys';
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors';

type AddSongArgs = {
  playlistId: string;
  songId: string;
};

export function useAddSongToPlaylist() {
  const api = useApi();
  const queryClient = useQueryClient();
  const activeServer = useSelector(selectActiveServer);

  return useMutation({
    mutationFn: async ({ playlistId, songId }: AddSongArgs) => {
      await api.playlists.addSong(playlistId, songId);
    },
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Playlist, activeServer?.id, playlistId],
      });
    },
  });
}