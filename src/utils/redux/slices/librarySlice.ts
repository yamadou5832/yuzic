import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlbumData, PlaylistData, SongData, ArtistData } from "@/types";

interface StarredState {
  albumIds: string[];
  artistIds: string[];
  songIds: string[];
}

interface LibraryState {
    albums: AlbumData[];
    artists: ArtistData[];
    playlists: PlaylistData[];
    starred: StarredState;
}

const initialState: LibraryState = {
    albums: [],
    artists: [],
    playlists: [],
    starred: { albumIds: [], artistIds: [], songIds: [] },
};

const librarySlice = createSlice({
    name: 'library',
    initialState,
    reducers: {
        setAlbums(state, action: PayloadAction<AlbumData[]>) {
            state.albums = action.payload;
        },
        setArtists(state, action: PayloadAction<ArtistData[]>) {
            state.artists = action.payload;
        },
        setPlaylists(state, action: PayloadAction<PlaylistData[]>) {
            state.playlists = action.payload;
        },
        setStarred(state, action: PayloadAction<StarredState>) {
            state.starred = action.payload;
        },
        resetLibraryState(state) {
            return initialState;
        },
    },
});

export const {
    setAlbums,
    setArtists,
    setPlaylists,
    setStarred,
    resetLibraryState,
} = librarySlice.actions;

export default librarySlice.reducer;
