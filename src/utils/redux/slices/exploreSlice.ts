import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  ExternalArtistBase,
  ExternalAlbumBase,
} from '@/types'

type ExploreState = {
  artists: ExternalArtistBase[]
  albums: ExternalAlbumBase[]
  serverArtistMbidMap: Record<string, string>
}

const initialState: ExploreState = {
  artists: [],
  albums: [],
  serverArtistMbidMap: {},
}

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    addArtist(state, action: PayloadAction<ExternalArtistBase>) {
      if (!state.artists.some(a => a.id === action.payload.id)) {
        state.artists.push(action.payload)
      }
    },

    addAlbums(state, action: PayloadAction<ExternalAlbumBase[]>) {
      for (const album of action.payload) {
        const key = `${album.artist}-${album.title}`
        if (
          !state.albums.some(
            a => `${a.artist}-${a.title}` === key
          )
        ) {
          state.albums.push(album)
        }
      }
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

    resetExplore() {
      return initialState
    },
  },
})

export const {
  addArtist,
  addAlbums,
  mapServerArtistToMbid,
  resetExplore,
} = exploreSlice.actions

export default exploreSlice.reducer