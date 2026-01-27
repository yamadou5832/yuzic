import { RootState } from '@/utils/redux/store'

export const selectSimilarArtists = (state: RootState) =>
  state.explore.similarArtists

export const selectExploreBootstrapped = (
  state: RootState
) => state.explore.bootstrapped

export const selectServerArtistMbidMap = (
  state: RootState
) => state.explore.serverArtistMbidMap

export const selectExploreHasNewData = (
  state: RootState
) => state.explore.newDataAvailable