import { ExternalAlbumBase, LastfmConfig } from '@/types';
import { createLastfmClient } from '../client';
import { nanoid } from 'nanoid/non-secure';

export type GetArtistInfoResult = {
  albums: ExternalAlbumBase[];
  bio: string;
  artistUrl: string;
  globalPlayCount: number;
};

const normalizeLastFmAlbum = (album: any): ExternalAlbumBase => ({
  id: album.mbid || `lastfm:${nanoid()}`,
  title: album.name,
  artist: album.artist?.name ?? album.artist ?? '',
  subtext: album.artist?.name ?? album.artist ?? '',
  cover:
    album.image?.find((i: any) => i.size === 'extralarge')?.['#text']
      ? {
          kind: 'lastfm',
          url: album.image.find((i: any) => i.size === 'extralarge')['#text'],
        }
      : album.image?.find((i: any) => i.size === 'large')?.['#text']
      ? {
          kind: 'lastfm',
          url: album.image.find((i: any) => i.size === 'large')['#text'],
        }
      : { kind: 'none' },
});

export const getArtistInfo = async (
  config: LastfmConfig,
  artistName: string
): Promise<GetArtistInfoResult> => {
  try {
    const { request } = createLastfmClient(config);

    const [albumsRes, infoRes] = await Promise.all([
      request<{ topalbums?: { album?: any[] } }>({
        method: 'artist.gettopalbums',
        artist: artistName,
      }),
      request<{
        artist?: {
          bio?: { summary?: string };
          url?: string;
          stats?: { playcount?: string };
        };
      }>({
        method: 'artist.getinfo',
        artist: artistName,
      }),
    ]);

    return {
      albums: Array.isArray(albumsRes.topalbums?.album)
        ? albumsRes.topalbums.album.map(normalizeLastFmAlbum)
        : [],
      bio: infoRes.artist?.bio?.summary ?? '',
      artistUrl: infoRes.artist?.url ?? '',
      globalPlayCount: Number(infoRes.artist?.stats?.playcount ?? 0),
    };
  } catch (error) {
    console.warn(
      `❌ Failed to fetch Last.fm data for "${artistName}":`,
      error
    );
    return {
      albums: [],
      bio: '',
      artistUrl: '',
      globalPlayCount: 0,
    };
  }
};