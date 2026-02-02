import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '@/enums/queryKeys';
import { ExternalAlbum } from '@/types';
import { staleTime } from '@/constants/staleTime';
import { sharedMusicBrainzQueue } from '@/features/explore/utils/requestQueue';

import * as musicbrainz from '@/api/musicbrainz';

type UseExternalAlbumResult = {
  album: ExternalAlbum | null;
  isLoading: boolean;
  error: Error | null;
};

type ResolveResult = {
  releaseGroupId: string;
  releaseId?: string;
};

/** Resolve albumId to release group ID (and release ID when available). Servers typically provide release IDs. */
async function resolveAlbumId(albumId: string): Promise<ResolveResult | null> {
  // Try release first - Navidrome/Jellyfin usually provide release IDs
  const release = await sharedMusicBrainzQueue.run(() =>
    musicbrainz.getRelease(albumId)
  );
  if (release) {
    return { releaseGroupId: release.releaseGroupId, releaseId: release.id };
  }

  // Fall back to release-group (e.g. from MusicBrainz search)
  const group = await sharedMusicBrainzQueue.run(() =>
    musicbrainz.getReleaseGroup(albumId)
  );
  if (group) return { releaseGroupId: albumId };

  return null;
}

export function useExternalAlbum(
  albumId: string
): UseExternalAlbumResult {
  const query = useQuery<ExternalAlbum | null, Error>({
    queryKey: [QueryKeys.ExternalAlbum, albumId],
    enabled: !!albumId,
    staleTime: staleTime.musicbrainz,

    queryFn: async () => {
      // Try single-request path first (release ID from Navidrome/Jellyfin)
      const fromRelease = await sharedMusicBrainzQueue.run(() =>
        musicbrainz.getReleaseWithDetails(albumId)
      );
      if (fromRelease) return fromRelease;

      // Fall back to release-group path (e.g. from MusicBrainz search)
      const resolved = await resolveAlbumId(albumId);
      if (!resolved) return null;

      const { releaseGroupId, releaseId } = resolved;

      const group = await sharedMusicBrainzQueue.run(() =>
        musicbrainz.getReleaseGroup(releaseGroupId)
      );
      if (!group) return null;

      let trackReleaseId = releaseId;
      if (!trackReleaseId) {
        const canonical = await sharedMusicBrainzQueue.run(() =>
          musicbrainz.getCanonicalRelease(releaseGroupId)
        );
        if (!canonical) return null;
        trackReleaseId = canonical.id;
      }

      const tracks = await sharedMusicBrainzQueue.run(() =>
        musicbrainz.getReleaseTracks(
          trackReleaseId!,
          group.id,
          group.artist
        )
      );

      return {
        id: group.id,
        title: group.title,
        artist: group.artist,
        subtext: group.artist,
        cover: { kind: 'musicbrainz', releaseGroupId: group.id },
        songs: tracks,
      };
    },
  });

  return {
    album: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}