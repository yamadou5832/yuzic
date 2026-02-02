import { useQuery } from '@tanstack/react-query'
import { useArtists } from '@/hooks/artists'
import * as listenbrainz from '@/api/listenbrainz'
import * as musicbrainz from '@/api/musicbrainz'
import { resolveArtistMbid } from '@/utils/musicbrainz/resolveArtistMbid'
import { sharedMusicBrainzQueue } from '../utils/requestQueue'
import { QueryKeys } from '@/enums/queryKeys'
import type { ExternalArtistBase } from '@/types'

const LB_DELAY_MS = 500
const TARGET = 8

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export async function fetchSimilarArtists(
  seeds: { id?: string; name: string; mbid?: string | null }[],
  target: number
): Promise<ExternalArtistBase[]> {
  const seen = new Set<string>()
  const result: ExternalArtistBase[] = []
  const shuffledSeeds = shuffle(seeds)

  for (const seed of shuffledSeeds) {
    if (result.length >= target) break
    if (seed.name.toLowerCase() === 'various artists') continue

    const mbid = seed.mbid ?? await sharedMusicBrainzQueue.run(() =>
      resolveArtistMbid(seed.id, seed.name)
    )
    if (!mbid) continue

    await delay(LB_DELAY_MS)
    const similar = await listenbrainz.getSimilarArtists(mbid, { limit: Math.max(target * 3, 24) })
    const mbids = shuffle(
      similar.map((s) => s.artist_mbid).filter((m) => !seen.has(m))
    )

    for (const similarMbid of mbids) {
      if (result.length >= target) break
      if (seen.has(similarMbid)) continue
      seen.add(similarMbid)

      const artist = await sharedMusicBrainzQueue.run(() =>
        musicbrainz.getArtist(similarMbid)
      )
      if (artist) result.push(artist)
    }
  }

  return shuffle(result).slice(0, target)
}

export function useSimilarArtists(shuffleKey: number) {
  const { artists } = useArtists()
  const seeds = artists
    .slice(0, 5)
    .map((a) => ({ id: a.id, name: a.name, mbid: a.mbid }))
    .filter((a) => a.name.trim())

  const query = useQuery({
    queryKey: [QueryKeys.ExploreSimilarArtists, shuffleKey, seeds.map((s) => s.name).join(',')],
    queryFn: () => fetchSimilarArtists(seeds, TARGET),
    enabled: seeds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  return {
    data: (query.data ?? []).slice(0, TARGET),
    ready: !query.isLoading && (query.data ?? []).length > 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
