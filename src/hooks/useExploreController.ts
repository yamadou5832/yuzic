import { useEffect } from 'react'
import { useAppDispatch } from '@/utils/redux/hooks'
import { useArtists } from '@/hooks/artists'
import { exploreController } from '@/utils/exploreController'
import store from '@/utils/redux/store'

export function useExploreController() {
  const dispatch = useAppDispatch()
  const { artists } = useArtists()

  useEffect(() => {
    if (!artists.length) return

    const interval = setInterval(() => {
      exploreController.tick(
        dispatch,
        () => store.getState(),
        artists.map(a => ({
          id: a.id,
          name: a.name,
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [artists.map(a => a.id).join(',')])
}