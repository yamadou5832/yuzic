import { ExternalAlbumBase } from '@/types'
import { createMusicBrainzClient } from '../client'

function artistCreditName(rg: any): string {
  const ac = rg['artist-credit']
  if (!Array.isArray(ac) || ac.length === 0) return ''
  return ac.map((c: any) => c.name ?? c.artist?.name ?? '').filter(Boolean).join(', ') || ''
}

function normalizeReleaseGroup(rg: any): ExternalAlbumBase {
  const artist = artistCreditName(rg)
  return {
    id: rg.id,
    title: rg.title ?? '',
    artist,
    subtext: artist,
    cover: { kind: 'musicbrainz', releaseGroupId: rg.id },
    releaseDate: rg['first-release-date'] ?? undefined,
  }
}

/** Escape tag for Lucene query (tag:"...") */
function escapeTag(t: string): string {
  return t.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export async function getReleaseGroupsByTag(
  tag: string,
  limit = 8
): Promise<ExternalAlbumBase[]> {
  const trimmed = tag.trim()
  if (!trimmed) return []

  try {
    const { request } = createMusicBrainzClient()
    const query = `tag:"${escapeTag(trimmed)}" AND primarytype:album`
    const res = await request<{ 'release-groups'?: any[] }>('release-group', {
      query,
      limit: String(Math.min(limit + 4, 100)),
    })

    const groups = Array.isArray(res['release-groups']) ? res['release-groups'] : []

    return groups
      .filter((rg) => (rg['primary-type'] ?? null) === 'Album')
      .slice(0, limit)
      .map(normalizeReleaseGroup)
  } catch (err) {
    console.warn(`MusicBrainz getReleaseGroupsByTag("${tag}") failed:`, err)
    return []
  }
}
