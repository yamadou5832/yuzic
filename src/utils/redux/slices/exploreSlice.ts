import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  ExternalArtistBase,
  ExternalAlbumBase,
} from '@/types'

type SimilarArtistEntry = {
  artist: ExternalArtistBase
  albums: ExternalAlbumBase[]
  fetchedAlbums: boolean
}

type GenreEntry = {
  genre: string
  albums: ExternalAlbumBase[]
  fetched: boolean
}

type ExploreState = {
  similarArtists: SimilarArtistEntry[]
  genres: GenreEntry[]
  serverArtistMbidMap: Record<string, string>
  expandedSeedMbids: Record<string, true>
  bootstrapped: boolean
  newDataAvailable: boolean
}

const initialState: ExploreState = {
  similarArtists: [],
  genres: [],
  serverArtistMbidMap: {},
  expandedSeedMbids: {},
  bootstrapped: false,
  newDataAvailable: false,
}

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    addSimilarArtist(
      state,
      action: PayloadAction<ExternalArtistBase>
    ) {
      if (
        state.similarArtists.some(
          e => e.artist.id === action.payload.id
        )
      ) {
        return
      }

      state.similarArtists.push({
        artist: action.payload,
        albums: [],
        fetchedAlbums: false,
      })

      state.newDataAvailable = true
    },

    addAlbumsToSimilarArtist(
      state,
      action: PayloadAction<{
        artistId: string
        albums: ExternalAlbumBase[]
      }>
    ) {
      const entry = state.similarArtists.find(
        e => e.artist.id === action.payload.artistId
      )
      if (!entry) return

      const existing = new Set(
        entry.albums.map(a => `${a.artist}-${a.title}`)
      )

      for (const album of action.payload.albums) {
        const key = `${album.artist}-${album.title}`
        if (!existing.has(key)) {
          entry.albums.push(album)
          state.newDataAvailable = true
        }
      }

      entry.fetchedAlbums = true
    },

    addGenre(state, action: PayloadAction<string>) {
      if (
        state.genres.some(
          g => g.genre === action.payload
        )
      ) {
        return
      }

      state.genres.push({
        genre: action.payload,
        albums: [],
        fetched: false,
      })
    },

    addAlbumsToGenre(
      state,
      action: PayloadAction<{
        genre: string
        albums: ExternalAlbumBase[]
      }>
    ) {
      const entry = state.genres.find(
        g => g.genre === action.payload.genre
      )
      if (!entry) return

      const existing = new Set(
        entry.albums.map(a => a.id)
      )

      for (const album of action.payload.albums) {
        if (!existing.has(album.id)) {
          entry.albums.push(album)
          state.newDataAvailable = true
        }
      }

      entry.fetched = true
    },

    mapServerArtistToMbid(
      state,
      action: PayloadAction<{
        serverArtistId: string
        mbid: string
      }>
    ) {
      state.serverArtistMbidMap[action.payload.serverArtistId] =
        action.payload.mbid
    },

    markSeedExpanded(
      state,
      action: PayloadAction<string>
    ) {
      state.expandedSeedMbids[action.payload] = true
    },

    markBootstrapped(state) {
      state.bootstrapped = true
    },

    clearExploreNewData(state) {
      state.newDataAvailable = false
    },

    resetExplore() {
      return initialState
    },
  },
})

export const {
  addSimilarArtist,
  addAlbumsToSimilarArtist,
  addGenre,
  addAlbumsToGenre,
  mapServerArtistToMbid,
  markSeedExpanded,
  markBootstrapped,
  clearExploreNewData,
  resetExplore,
} = exploreSlice.actions

export default exploreSlice.reducer