import { useQuery } from '@tanstack/react-query'
import { useArtists } from '@/hooks/artists'
import * as musicbrainz from '@/api/musicbrainz'
import { sharedMusicBrainzQueue } from '../utils/requestQueue'
import { QueryKeys } from '@/enums/queryKeys'
import type { ExternalAlbumBase } from '@/types'
import { fetchSimilarArtists } from './useSimilarArtists'

const TARGET_ALBUMS = 8
const MAX_ALBUMS_PER_ARTIST = 2
const POOL_SIZE = 24
const PICK_ARTISTS = 6

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

async function fetchSimilarArtistAlbums(
  seeds: { id?: string; name: string }[]
): Promise<ExternalAlbumBase[]> {
  const similar = await fetchSimilarArtists(seeds, POOL_SIZE)
  const picked = shuffle(similar).slice(0, PICK_ARTISTS)
  const seen = new Set<string>()
  const result: ExternalAlbumBase[] = []

  for (const artist of picked) {
    if (result.length >= TARGET_ALBUMS) break
    const albums = await sharedMusicBrainzQueue.run(() =>
      musicbrainz.getArtistAlbums(artist.id, artist.name, MAX_ALBUMS_PER_ARTIST + 2)
    )
    let taken = 0
    for (const a of albums) {
      if (taken >= MAX_ALBUMS_PER_ARTIST) break
      if (seen.has(a.id)) continue
      seen.add(a.id)
      result.push(a)
      taken++
      if (result.length >= TARGET_ALBUMS) break
    }
  }

  return shuffle(result).slice(0, TARGET_ALBUMS)
}

export function useSimilarArtistAlbums(shuffleKey: number) {
  const { artists } = useArtists()
  const seeds = artists
    .slice(0, 5)
    .map((a) => ({ id: a.id, name: a.name }))
    .filter((a) => a.name.trim())

  const query = useQuery({
    queryKey: [QueryKeys.ExploreSimilarArtistAlbums, shuffleKey, seeds.map((s) => s.name).join(',')],
    queryFn: () => fetchSimilarArtistAlbums(seeds),
    enabled: seeds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  return {
    data: (query.data ?? []).slice(0, TARGET_ALBUMS),
    ready: !query.isLoading && (query.data ?? []).length > 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
