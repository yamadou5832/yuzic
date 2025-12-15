import { useEffect, useState } from 'react';
import { Playlist } from '@/types';
import { useApi } from '@/api';

type UsePlaylistResult = {
  playlist: Playlist | null;
  isLoading: boolean;
  error: Error | null;
};

export function usePlaylist(id: string): UsePlaylistResult {
  const api = useApi();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await api.playlists.get(id);
        if (mounted) setPlaylist(result);
      } catch (err) {
        if (mounted) {
          setPlaylist(null);
          setError(err as Error);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { playlist, isLoading, error };
}