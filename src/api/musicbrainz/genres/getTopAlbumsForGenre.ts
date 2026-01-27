import { ExternalAlbumBase } from '@/types'
import { createMusicBrainzClient } from '../client'

const normalizeReleaseGroup = (
  rg: any
): ExternalAlbumBase => ({
  id: rg.id,
  title: rg.title,
  artist:
    rg['artist-credit']?.[0]?.name ?? '',
  subtext:
    rg['artist-credit']?.[0]?.name ?? '',
  cover: {
    kind: 'musicbrainz',
    releaseGroupId: rg.id,
  },
  releaseDate: rg['first-release-date'],
})

export const getTopAlbumsForGenre = async (
  genre: string,
  limit = 12
): Promise<ExternalAlbumBase[]> => {
  if (!genre.trim()) return []

  try {
    const { request } = createMusicBrainzClient()

    const normalizedGenre = genre
      .toLowerCase()
      .replace(/\s+/g, ' ')

    const res = await request<{
      'release-groups'?: any[]
    }>('release-group', {
      query: `tag:${normalizedGenre} AND primarytype:album`,
      limit: String(limit),
    })

    return Array.isArray(res['release-groups'])
      ? res['release-groups'].map(
          normalizeReleaseGroup
        )
      : []
  } catch (error) {
    console.warn(
      `MusicBrainz genre album fetch failed for "${genre}":`,
      error
    )
    return []
  }
}