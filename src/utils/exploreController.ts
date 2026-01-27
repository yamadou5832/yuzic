import * as listenbrainz from '@/api/listenbrainz'
import * as musicbrainz from '@/api/musicbrainz'
import { resolveArtistMbid } from '@/utils/musicbrainz/resolveArtistMbid'
import { getTopAlbumsForGenre } from '@/api/musicbrainz/genres/getTopAlbumsForGenre'
import {
  addSimilarArtist,
  addAlbumsToSimilarArtist,
  addAlbumsToGenre,
  mapServerArtistToMbid,
  markBootstrapped,
  markSeedExpanded,
} from '@/utils/redux/slices/exploreSlice'
import { AppDispatch, RootState } from '@/utils/redux/store'

const BOOTSTRAP_SIMILAR_ARTISTS = 20
const INCREMENT_SIMILAR_ARTISTS = 4
const REQUEST_DELAY_MS = 1000
const SIMILAR_PER_SEED = 8
const ALBUMS_PER_ARTIST = 3
const GENRE_ALBUM_TARGET = 12

type SeedArtist = {
  id?: string
  name: string
}

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export class ExploreController {
  private running = false
  private lastRequestAt = 0
  private generation = 0

  invalidateSession() {
    this.generation++
    this.running = false
  }

  private async rateLimit() {
    const now = Date.now()
    const delta = now - this.lastRequestAt
    if (delta < REQUEST_DELAY_MS) {
      await sleep(REQUEST_DELAY_MS - delta)
    }
    this.lastRequestAt = Date.now()
  }

  private async fetchSimilarArtists(
    dispatch: AppDispatch,
    getState: () => RootState,
    seeds: SeedArtist[],
    runGeneration: number
  ) {
    const explore = getState().explore
    const existingCount = explore.similarArtists.length

    const desiredTotal = explore.bootstrapped
      ? existingCount + INCREMENT_SIMILAR_ARTISTS
      : BOOTSTRAP_SIMILAR_ARTISTS

    for (const seed of seeds) {
      if (this.generation !== runGeneration) return

      if (
        getState().explore.similarArtists.length >=
        desiredTotal
      ) {
        break
      }

      let mbid =
        seed.id &&
        getState().explore.serverArtistMbidMap[
        seed.id
        ]

      if (!mbid) {
        await this.rateLimit()
        if (this.generation !== runGeneration) return

        const resolved = await resolveArtistMbid(
          seed.id,
          seed.name
        )
        if (!resolved) continue

        mbid = resolved

        if (seed.id) {
          dispatch(
            mapServerArtistToMbid({
              serverArtistId: seed.id,
              mbid: resolved,
            })
          )
        }
      }

      if (getState().explore.expandedSeedMbids[mbid]) {
        continue
      }

      await this.rateLimit()
      if (this.generation !== runGeneration) return

      const similar =
        await listenbrainz.getSimilarArtists(
          mbid,
          { limit: SIMILAR_PER_SEED }
        )

      for (const s of similar) {
        if (this.generation !== runGeneration) return

        if (
          getState().explore.similarArtists.some(
            e => e.artist.id === s.artist_mbid
          )
        ) {
          continue
        }

        await this.rateLimit()
        if (this.generation !== runGeneration) return

        const artist = await musicbrainz.getArtist(
          s.artist_mbid
        )
        if (!artist) continue

        dispatch(addSimilarArtist(artist))

        await this.rateLimit()
        if (this.generation !== runGeneration) return

        const albums =
          await musicbrainz.getArtistAlbums(
            artist.id,
            artist.name
          )

        dispatch(
          addAlbumsToSimilarArtist({
            artistId: artist.id,
            albums: albums.slice(0, ALBUMS_PER_ARTIST),
          })
        )

        if (
          getState().explore.similarArtists.length >=
          desiredTotal
        ) {
          break
        }
      }

      dispatch(markSeedExpanded(mbid))
    }
  }

  private async fetchGenres(
    dispatch: AppDispatch,
    getState: () => RootState,
    runGeneration: number
  ) {
    const explore = getState().explore

    for (const entry of explore.genres) {
      if (this.generation !== runGeneration) return
      if (entry.fetched) continue

      await this.rateLimit()
      if (this.generation !== runGeneration) return

      const albums = await getTopAlbumsForGenre(
        entry.genre,
        GENRE_ALBUM_TARGET
      )

      dispatch(
        addAlbumsToGenre({
          genre: entry.genre,
          albums,
        })
      )
    }
  }

  async run(
    dispatch: AppDispatch,
    getState: () => RootState,
    seeds: SeedArtist[]
  ) {
    if (this.running) return
    if (!seeds.length) return

    const state = getState()
    const activeServer =
      state.servers.servers.find(
        s => s.id === state.servers.activeServerId
      ) ?? null

    if (!activeServer || !activeServer.isAuthenticated) {
      return
    }

    const runGeneration = this.generation
    this.running = true

    try {
      await this.fetchSimilarArtists(
        dispatch,
        getState,
        seeds,
        runGeneration
      )

      await this.fetchGenres(
        dispatch,
        getState,
        runGeneration
      )

      if (
        !getState().explore.bootstrapped &&
        this.generation === runGeneration
      ) {
        dispatch(markBootstrapped())
      }
    } finally {
      if (this.generation === runGeneration) {
        this.running = false
      }
    }
  }
}

export const exploreController = new ExploreController()