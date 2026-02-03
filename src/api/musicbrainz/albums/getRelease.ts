import { createMusicBrainzClient } from '../client';

export type ReleaseWithGroup = {
  id: string;
  releaseGroupId: string;
};

/** Fetch a release and return its release-group ID. Used when servers provide release IDs. */
export async function getRelease(
  releaseId: string
): Promise<ReleaseWithGroup | null> {
  try {
    const { request } = createMusicBrainzClient();

    const release = await request<any>(
      `release/${releaseId}`,
      { inc: 'release-groups' }
    );

    const rg = release['release-group'];
    if (!rg?.id) return null;

    return {
      id: release.id,
      releaseGroupId: rg.id,
    };
  } catch (err) {
    console.warn(
      `MusicBrainz getRelease failed for ${releaseId}`,
      err
    );
    return null;
  }
}
