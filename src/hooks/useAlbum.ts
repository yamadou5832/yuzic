import { useEffect, useState } from 'react';
import { Album } from '@/types';
import { useApi } from '@/api';

type UseAlbumResult = {
  album: Album | null;
  isLoading: boolean;
  error: Error | null;
};

export function useAlbum(id: string): UseAlbumResult {
  const api = useApi();

  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await api.albums.get(id);
        if (mounted) setAlbum(result);
      } catch (err) {
        if (mounted) {
          setAlbum(null);
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

  return { album, isLoading, error };
}