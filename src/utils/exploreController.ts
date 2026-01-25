import * as listenbrainz from '@/api/listenbrainz'
import * as musicbrainz from '@/api/musicbrainz'
import { resolveArtistMbid } from '@/utils/musicbrainz/resolveArtistMbid'
import {
  addArtist,
  addAlbums,
  mapServerArtistToMbid,
} from '@/utils/redux/slices/exploreSlice'
import { AppDispatch, RootState } from '@/utils/redux/store'

const DELAY_MS = 2000
const MAX_SIMILAR = 10
const MAX_ARTISTS_TOTAL = 300
const MAX_ALBUMS_TOTAL = 600

type SeedArtist = {
  id?: string
  name: string
}

export class ExploreController {
  private running = false
  private lastRun = 0
  private expandedMbids = new Set<string>()
  private albumFetchedMbids = new Set<string>()

  async tick(
    dispatch: AppDispatch,
    getState: () => RootState,
    seeds: SeedArtist[]
  ) {
    const now = Date.now()
    if (this.running) return
    if (now - this.lastRun < DELAY_MS) return
    if (!seeds.length) return

    const state = getState().explore

    if (
      state.artists.length >= MAX_ARTISTS_TOTAL &&
      state.albums.length >= MAX_ALBUMS_TOTAL
    ) {
      return
    }

    this.running = true
    this.lastRun = now

    try {
      const seed =
        seeds[Math.floor(Math.random() * seeds.length)]

      let seedMbid =
        seed.id &&
        state.serverArtistMbidMap[seed.id]

      if (!seedMbid) {
        const resolved = await resolveArtistMbid(
          seed.id,
          seed.name
        )
        if (!resolved) return

        seedMbid = resolved

        if (seed.id) {
          dispatch(
            mapServerArtistToMbid({
              serverArtistId: seed.id,
              mbid: resolved,
            })
          )
        }

        return
      }

      if (this.expandedMbids.has(seedMbid)) {
        return
      }

      this.expandedMbids.add(seedMbid)

      const similar = await listenbrainz.getSimilarArtists(
        seedMbid,
        { limit: MAX_SIMILAR }
      )

      for (const s of similar) {
        if (
          state.artists.some(a => a.id === s.artist_mbid)
        )
          continue

        if (state.artists.length >= MAX_ARTISTS_TOTAL)
          break

        const artist = await musicbrainz.getArtist(
          s.artist_mbid
        )
        if (!artist) continue

        dispatch(addArtist(artist))

        if (
          state.albums.length < MAX_ALBUMS_TOTAL &&
          !this.albumFetchedMbids.has(s.artist_mbid)
        ) {
          this.albumFetchedMbids.add(s.artist_mbid)

          const albums =
            await musicbrainz.getArtistAlbums(
              artist.id,
              artist.name
            )

          if (albums.length) {
            dispatch(addAlbums(albums))
          }
        }

        break
      }
    } finally {
      this.running = false
    }
  }
}

export const exploreController = new ExploreController()