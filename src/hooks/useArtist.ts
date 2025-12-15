import { useEffect, useState } from 'react';
import { Artist } from '@/types';
import { useApi } from '@/api';

type UseArtistResult = {
  artist: Artist | null;
  isLoading: boolean;
  error: Error | null;
};

export function useArtist(id: string): UseArtistResult {
  const api = useApi();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await api.artists.get(id);
        if (mounted) setArtist(result);
      } catch (err) {
        if (mounted) {
          setArtist(null);
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

  return { artist, isLoading, error };
}