import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useSelector } from 'react-redux';

import {
  ExternalArtistBase,
  ExternalAlbumBase,
} from '@/types';
import { selectLastfmConfig } from '@/utils/redux/selectors/lastfmSelectors';
import * as lastfm from '@/api/lastfm';

type ExploreContextType = {
  artists: ExternalArtistBase[];
  albums: ExternalAlbumBase[];
  isLoading: boolean;
  refresh: (seedArtists: string[]) => Promise<void>;
  clear: () => void;
};

const ExploreContext = createContext<ExploreContextType | undefined>(
  undefined
);

export const useExplore = () => {
  const ctx = useContext(ExploreContext);
  if (!ctx) {
    throw new Error('useExplore must be used within ExploreProvider');
  }
  return ctx;
};

type Props = {
  children: ReactNode;
};

export const ExploreProvider: React.FC<Props> = ({ children }) => {
  const lastfmConfig = useSelector(selectLastfmConfig);

  const [artists, setArtists] = useState<ExternalArtistBase[]>([]);
  const [albums, setAlbums] = useState<ExternalAlbumBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clear = useCallback(() => {
    setArtists([]);
    setAlbums([]);
  }, []);

  const refresh = useCallback(
    async (seedArtists: string[]) => {
      if (!lastfmConfig || seedArtists.length === 0) {
        clear();
        return;
      }

      setIsLoading(true);

      try {

        const similarArtistsResults = await Promise.all(
          seedArtists.map(name =>
            lastfm.getSimilarArtists(lastfmConfig, name, 6)
          )
        );

        const flattenedArtists = similarArtistsResults.flat();

        const uniqueArtistsMap = new Map<string, ExternalArtistBase>();

        for (const artist of flattenedArtists) {
          const key = artist.name.toLowerCase();

          if (!uniqueArtistsMap.has(key)) {
            uniqueArtistsMap.set(key, {
              id: artist.id,
              name: artist.name,
              cover: artist.cover,
              subtext: 'Artist',
            });
          }
        }

        const curatedArtists = Array.from(
          uniqueArtistsMap.values()
        ).slice(0, 24);

        setArtists(curatedArtists);

        const albumsResults = await Promise.all(
          curatedArtists.slice(0, 6).map(a =>
            lastfm.getArtistInfo(lastfmConfig, a.name)
          )
        );

        const flattenedAlbums = albumsResults.flatMap(
          r => r.albums
        );

        const uniqueAlbumsMap = new Map<string, ExternalAlbumBase>();

        for (const album of flattenedAlbums) {
          const key = `${album.artist}-${album.title}`.toLowerCase();
          if (!uniqueAlbumsMap.has(key)) {
            uniqueAlbumsMap.set(key, album);
          }
        }

        const curatedAlbums = Array.from(
          uniqueAlbumsMap.values()
        ).slice(0, 24);

        setAlbums(curatedAlbums);
      } catch {
        clear();
      } finally {
        setIsLoading(false);
      }
    },
    [lastfmConfig, clear]
  );

  const value = useMemo(
    () => ({
      artists,
      albums,
      isLoading,
      refresh,
      clear,
    }),
    [artists, albums, isLoading, refresh, clear]
  );

  return (
    <ExploreContext.Provider value={value}>
      {children}
    </ExploreContext.Provider>
  );
};