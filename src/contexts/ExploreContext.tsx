import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { InteractionManager } from 'react-native';

import {
  ExternalArtistBase,
  ExternalAlbumBase,
} from '@/types';

import * as listenbrainz from '@/api/listenbrainz';
import * as musicbrainz from '@/api/musicbrainz';
import { resolveArtistMbid } from '@/utils/musicbrainz/resolveArtistMbid';

const MIN_ARTISTS = 12;
const MIN_ALBUMS = 12;

const MAX_ARTISTS = 24;
const MAX_ALBUM_ARTISTS = 8;

export type ExploreSeedArtist = {
  id?: string;
  name: string;
};

export type ExploreContextType = {
  artistPool: ExternalArtistBase[];
  albumPool: ExternalAlbumBase[];
  isLoading: boolean;
  refresh: (seedArtists: ExploreSeedArtist[]) => Promise<void>;
  clear: () => void;
};

const ExploreContext = createContext<ExploreContextType | undefined>(
  undefined
);

export const useExplore = (): ExploreContextType => {
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
  const [artistPool, setArtistPool] = useState<ExternalArtistBase[]>([]);
  const [albumPool, setAlbumPool] = useState<ExternalAlbumBase[]>([]);

  const clear = useCallback(() => {
    setArtistPool([]);
    setAlbumPool([]);
  }, []);

  const refresh = useCallback(
    async (seedArtists: ExploreSeedArtist[]) => {
      clear();

      const seedMbids = (
        await Promise.all(
          seedArtists.map(a =>
            resolveArtistMbid(a.id, a.name)
          )
        )
      )
        .filter((m): m is string => !!m)
        .slice(0, 2);

      if (!seedMbids.length) return;

      const similar = (
        await Promise.all(
          seedMbids.map(mbid =>
            listenbrainz.getSimilarArtists(mbid, {
              limit: MAX_ARTISTS,
            })
          )
        )
      ).flat();

      const artistMbids = Array.from(
        new Set(similar.map(a => a.artist_mbid))
      );

      InteractionManager.runAfterInteractions(async () => {
        const artists: ExternalArtistBase[] = [];

        await runSerial(
          artistMbids.slice(0, MAX_ARTISTS),
          async mbid => {
            const artist = await musicbrainz.getArtist(mbid);
            if (!artist) return;

            artists.push(artist);
            setArtistPool(prev => mergeArtists(prev, [artist]));
          }
        );

        await runSerial(
          artists.slice(0, MAX_ALBUM_ARTISTS),
          async artist => {
            const albums =
              await musicbrainz.getArtistAlbums(
                artist.id,
                artist.name
              );

            setAlbumPool(prev =>
              mergeAlbums(prev, albums)
            );
          }
        );
      });
    },
    [clear]
  );

  const isLoading =
    artistPool.length < MIN_ARTISTS ||
    albumPool.length < MIN_ALBUMS;

  const value = useMemo(
    () => ({
      artistPool,
      albumPool,
      isLoading,
      refresh,
      clear,
    }),
    [artistPool, albumPool, isLoading, refresh, clear]
  );

  return (
    <ExploreContext.Provider value={value}>
      {children}
    </ExploreContext.Provider>
  );
};

async function runSerial<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  delayMs = 1100
) {
  for (const item of items) {
    await fn(item);
    await new Promise(r => setTimeout(r, delayMs));
  }
}

function mergeArtists(
  prev: ExternalArtistBase[],
  next: ExternalArtistBase[]
) {
  const map = new Map<string, ExternalArtistBase>();
  prev.forEach(a => map.set(a.id, a));
  next.forEach(a => map.set(a.id, a));
  return Array.from(map.values());
}

function mergeAlbums(
  prev: ExternalAlbumBase[],
  next: ExternalAlbumBase[]
) {
  const map = new Map<string, ExternalAlbumBase>();
  prev.forEach(a =>
    map.set(`${a.artist}-${a.title}`, a)
  );
  next.forEach(a =>
    map.set(`${a.artist}-${a.title}`, a)
  );
  return Array.from(map.values());
}