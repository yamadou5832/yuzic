import { createLidarrClient } from '../client';
import { LidarrConfig } from '@/types';

export type LidarrArtistLookupResult = {
  artistName: string;
  foreignArtistId: string; // MusicBrainz artist id typically
  artistType?: string;
  disambiguation?: string;
  overview?: string;
  images?: any[];
  genres?: string[];
  ratings?: any;
  status?: string;
};

export type LidarrArtist = {
  id: number;
  artistName: string;
  foreignArtistId: string;
  monitored?: boolean;
};

export type EnsureArtistOptions = {
  qualityProfileId?: number;
  metadataProfileId?: number;
  monitored?: boolean;
  searchForMissingAlbums?: boolean;
  rootFolderIndex?: number;
};

/**
 * Lidarr expects “term” like:
 * - "Artist Name"
 * - "mbid:<musicbrainz-id>"
 */
export async function lookupArtist(
  config: LidarrConfig,
  term: string
): Promise<LidarrArtistLookupResult[]> {
  const { request } = createLidarrClient(config);

  if (!term?.trim()) return [];

  // Lidarr uses query param "term"
  // Since our client already appends ?apikey=..., we add &term=
  return request<LidarrArtistLookupResult[]>(
    `/artist/lookup&term=${encodeURIComponent(term)}`
  );
}

export async function getArtists(config: LidarrConfig): Promise<LidarrArtist[]> {
  const { request } = createLidarrClient(config);
  return request<LidarrArtist[]>('/artist');
}

export async function getRootFolders(config: LidarrConfig): Promise<{ path: string }[]> {
  const { request } = createLidarrClient(config);
  return request<{ path: string }[]>('/rootfolder');
}

export async function ensureArtist(
  config: LidarrConfig,
  artist: LidarrArtistLookupResult,
  opts: EnsureArtistOptions = {}
): Promise<{ success: true; artistId: number; created: boolean } | { success: false; message: string }> {
  try {
    if (!artist?.foreignArtistId) {
      return { success: false, message: 'Invalid artist: missing foreignArtistId' };
    }

    const existing = await getArtists(config);
    const found = existing.find(a => a.foreignArtistId === artist.foreignArtistId);

    if (found?.id) {
      return { success: true, artistId: found.id, created: false };
    }

    const rootFolders = await getRootFolders(config);
    if (!rootFolders || rootFolders.length === 0) {
      return { success: false, message: 'No Lidarr root folders configured' };
    }

    const rootFolderIndex = opts.rootFolderIndex ?? 0;
    const rootFolderPath = rootFolders[Math.min(rootFolderIndex, rootFolders.length - 1)].path;

    // NOTE:
    // qualityProfileId / metadataProfileId are installation-specific.
    // We'll default to 1 like your original code, but you may later fetch profiles.
    const qualityProfileId = opts.qualityProfileId ?? 1;
    const metadataProfileId = opts.metadataProfileId ?? 1;

    const payload = {
      artistName: artist.artistName,
      foreignArtistId: artist.foreignArtistId,
      artistType: artist.artistType || 'Person',
      disambiguation: artist.disambiguation || '',
      overview: artist.overview || '',
      images: artist.images || [],
      genres: artist.genres || [],
      ratings: artist.ratings || {},
      status: artist.status || 'active',
      qualityProfileId,
      rootFolderPath,
      monitored: opts.monitored ?? false,
      metadataProfileId,
      addOptions: {
        searchForMissingAlbums: opts.searchForMissingAlbums ?? true,
      },
    };

    const { request } = createLidarrClient(config);
    const created = await request<any>('/artist', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!created?.id) {
      return { success: false, message: 'Artist added but no id returned' };
    }

    return { success: true, artistId: created.id, created: true };
  } catch (e: any) {
    return { success: false, message: e?.message ?? 'Failed to ensure artist' };
  }
}

export async function deleteArtist(
  config: LidarrConfig,
  artistId: number
): Promise<{ success: true } | { success: false; message: string }> {
  try {
    const { request } = createLidarrClient(config);
    // Lidarr delete endpoint: /artist/{id}
    await request(`/artist/${artistId}`, { method: 'DELETE' });
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e?.message ?? 'Failed to delete artist' };
  }
}