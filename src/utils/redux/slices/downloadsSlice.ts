import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DownloadsState {
  markedAlbums: string[];
  markedPlaylists: string[];
}

const initialState: DownloadsState = {
  markedAlbums: [],
  markedPlaylists: [],
};

const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    markAlbum(state, action: PayloadAction<string>) {
      if (!state.markedAlbums.includes(action.payload)) {
        state.markedAlbums.push(action.payload);
      }
    },
    unmarkAlbum(state, action: PayloadAction<string>) {
      state.markedAlbums = state.markedAlbums.filter(
        id => id !== action.payload
      );
    },
    markPlaylist(state, action: PayloadAction<string>) {
      if (!state.markedPlaylists.includes(action.payload)) {
        state.markedPlaylists.push(action.payload);
      }
    },
    unmarkPlaylist(state, action: PayloadAction<string>) {
      state.markedPlaylists = state.markedPlaylists.filter(
        id => id !== action.payload
      );
    },
    clearAllMarked(state) {
      state.markedAlbums = [];
      state.markedPlaylists = [];
    },
  },
});

export const {
  markAlbum,
  unmarkAlbum,
  markPlaylist,
  unmarkPlaylist,
  clearAllMarked,
} = downloadsSlice.actions;

export default downloadsSlice.reducer;