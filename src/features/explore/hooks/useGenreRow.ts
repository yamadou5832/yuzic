import { useQuery } from '@tanstack/react-query'
import * as musicbrainz from '@/api/musicbrainz'
import { sharedMusicBrainzQueue } from '../utils/requestQueue'
import { QueryKeys } from '@/enums/queryKeys'
import type { ExternalAlbumBase } from '@/types'

const TARGET_ALBUMS = 8

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

async function fetchGenreRow(): Promise<{
  genre: string
  albums: ExternalAlbumBase[]
}> {
  const tags = await sharedMusicBrainzQueue.run(() => musicbrainz.getTags())
  if (tags.length === 0) return { genre: '', albums: [] }

  const picked = shuffle(tags)[0]!
  const albums = await sharedMusicBrainzQueue.run(() =>
    musicbrainz.getReleaseGroupsByTag(picked, TARGET_ALBUMS)
  )

  return { genre: picked, albums }
}

export function useGenreRow(shuffleKey: number) {
  const query = useQuery({
    queryKey: [QueryKeys.ExploreGenreRow, shuffleKey],
    queryFn: fetchGenreRow,
    staleTime: 1000 * 60 * 5,
  })

  const { genre, albums } = query.data ?? { genre: '', albums: [] }

  return {
    genre,
    data: albums.slice(0, TARGET_ALBUMS),
    ready: !query.isLoading && albums.length > 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}
