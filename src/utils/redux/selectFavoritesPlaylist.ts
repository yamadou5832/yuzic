import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/utils/redux/store";

export const selectFavoritesPlaylist = createSelector(
  [
    (state: RootState) => state.library.starred.songIds,
    (state: RootState) => state.library.albumsById,
  ],
  (songIds, albumsById) => {
    const songs = [];

    for (const album of Object.values(albumsById)) {
      if (!album) continue;

      for (const song of album.songs) {
        if (songIds.includes(song.id)) {
          songs.push(song);
        }
      }
    }

    return {
      id: "favorites",
      title: "Favorites",
      cover: "heart-icon",
      subtext: `Playlist • ${songs.length} songs`,
      songs,
    };
  }
);