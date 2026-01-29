import { createMusicBrainzClient } from '../client'

const TAG_LIMIT = 80

function isReasonableTag(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  const t = name.trim()
  if (t.length < 2 || t.length > 40) return false
  if (/^\d+$/.test(t)) return false
  return true
}

/** Uses /genre/all (paginated list). Genres work as tags for release-group filtering. */
export async function getTags(): Promise<string[]> {
  try {
    const { request } = createMusicBrainzClient()
    const res = await request<{ genres?: { name?: string }[] }>('genre/all', {
      limit: String(TAG_LIMIT),
      offset: '0',
    })
    const raw = Array.isArray(res?.genres) ? res.genres : []
    return raw
      .map((g) => (typeof g === 'string' ? g : g?.name))
      .filter((n): n is string => isReasonableTag(n ?? ''))
  } catch (err) {
    console.warn('MusicBrainz getTags failed:', err)
    return []
  }
}
