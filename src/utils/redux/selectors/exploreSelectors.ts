// exploreSelectors.ts
import { RootState } from '@/utils/redux/store'

export const selectExploreArtists = (state: RootState) =>
  state.explore.artists

export const selectExploreAlbums = (state: RootState) =>
  state.explore.albums

export const selectServerArtistMbidMap = (state: RootState) =>
  state.explore.serverArtistMbidMap

export const selectMbidForServerArtist =
  (serverArtistId: string) =>
  (state: RootState) =>
    state.explore.serverArtistMbidMap[serverArtistId] ?? null