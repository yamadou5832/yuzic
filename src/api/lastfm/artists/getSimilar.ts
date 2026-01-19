import { ExternalArtistBase, CoverSource, LastfmConfig } from '@/types';
import { createLastfmClient } from '../client';
import { nanoid } from 'nanoid/non-secure';

export type GetSimilarArtistsResult = ExternalArtistBase[];

const normalizeSimilarArtist = (artist: any): ExternalArtistBase => {
  const cover: CoverSource =
    artist.image?.find((i: any) => i.size === 'extralarge')?.['#text']
      ? {
          kind: 'lastfm',
          url: artist.image.find((i: any) => i.size === 'extralarge')['#text'],
        }
      : artist.image?.find((i: any) => i.size === 'large')?.['#text']
      ? {
          kind: 'lastfm',
          url: artist.image.find((i: any) => i.size === 'large')['#text'],
        }
      : artist.image?.[0]?.['#text']
      ? {
          kind: 'lastfm',
          url: artist.image[0]['#text'],
        }
      : { kind: 'none' };

  return {
    id: artist.mbid || `lastfm:artist:${nanoid()}`,
    name: artist.name,
    cover,
    subtext: 'Artist',
  };
};

export const getSimilarArtists = async (
  config: LastfmConfig,
  artistName: string,
  limit = 12
): Promise<GetSimilarArtistsResult> => {
  try {
    const { request } = createLastfmClient(config);

    const res = await request<{
      similarartists?: { artist?: any[] };
    }>({
      method: 'artist.getsimilar',
      artist: artistName,
      limit: String(limit),
    });

    return Array.isArray(res.similarartists?.artist)
      ? res.similarartists.artist.map(normalizeSimilarArtist)
      : [];
  } catch (error) {
    console.warn(
      `❌ Failed to fetch similar artists for "${artistName}":`,
      error
    );
    return [];
  }
};