import * as musicbrainz from '@/api/musicbrainz';
import { sharedMusicBrainzQueue } from '@/features/explore/utils/requestQueue';

/**
 * Returns the correct MusicBrainz URL for an album mbid.
 * Servers may provide either release or release-group IDs.
 */
export async function getAlbumMbidUrl(mbid: string): Promise<string> {
  const release = await sharedMusicBrainzQueue.run(() =>
    musicbrainz.getRelease(mbid)
  );
  if (release) {
    return `https://musicbrainz.org/release/${mbid}`;
  }

  const group = await sharedMusicBrainzQueue.run(() =>
    musicbrainz.getReleaseGroup(mbid)
  );
  if (group) {
    return `https://musicbrainz.org/release-group/${mbid}`;
  }

  return `https://musicbrainz.org/release-group/${mbid}`;
}
