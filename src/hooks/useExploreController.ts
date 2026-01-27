import { useEffect, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '@/utils/redux/hooks'
import { useArtists } from '@/hooks/artists'
import { useGenres } from '@/hooks/genres'
import { exploreController } from '@/utils/exploreController'
import { selectActiveServer } from '@/utils/redux/selectors/serversSelectors'
import { addGenre } from '@/utils/redux/slices/exploreSlice'
import store from '@/utils/redux/store'

type SeedArtist = {
  id?: string
  name: string
}

const SEED_ARTIST_COUNT = 25

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function useExploreController() {
  const dispatch = useAppDispatch()
  const { artists } = useArtists()
  const { genres } = useGenres()
  const activeServer = useSelector(selectActiveServer)

  const bootstrappedServerRef = useRef<string | null>(null)

  const artistSeeds: SeedArtist[] = useMemo(() => {
    return shuffle(artists)
      .slice(0, SEED_ARTIST_COUNT)
      .map(a => ({
        id: a.id,
        name: a.name,
      }))
  }, [artists])

  useEffect(() => {
    if (!activeServer?.isAuthenticated) return
    if (!artistSeeds.length) return

    for (const genre of genres) {
      dispatch(addGenre(genre.name))
    }

    if (bootstrappedServerRef.current === activeServer.id) {
      return
    }

    bootstrappedServerRef.current = activeServer.id

    exploreController.run(
      dispatch,
      () => store.getState(),
      artistSeeds
    )
  }, [
    activeServer?.id,
    activeServer?.isAuthenticated,
    artistSeeds,
    genres.length,
  ])
}