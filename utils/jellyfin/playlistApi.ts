// utils/jellyfin/playlistApi.ts
import { PlaylistData, SongData } from '@/types';

const API_HEADERS = (token: string) => ({
  'Authorization': `MediaBrowser Token=${token}`,
  'Content-Type': 'application/json',
});

/**
 * Fetch all playlists for a Jellyfin user (including song IDs).
 */
export const fetchPlaylists = async (
  serverUrl: string,
  userId: string,
  token: string
): Promise<{
  id: string;
  name: string;
  entryIds: string[];
}[]> => {
  const listRes = await fetch(
    `${serverUrl}/Users/${userId}/Items?IncludeItemTypes=Playlist&Recursive=true&Fields=Id,Name`,
    { headers: API_HEADERS(token) }
  );
  if (!listRes.ok) throw new Error(`Failed to fetch playlists: ${listRes.statusText}`);

  const listJson = await listRes.json();
  const playlists = listJson.Items || [];

  const detailed = await Promise.all(
    playlists.map(async (pl: any) => {
      const itemsRes = await fetch(`${serverUrl}/Playlists/${pl.Id}/Items?userId=${userId}`, {
        headers: API_HEADERS(token),
      });
      const itemsJson = await itemsRes.json();
      const entryIds = (itemsJson.Items || []).map((it: any) => it.Id);
      return { id: pl.Id, name: pl.Name, entryIds };
    })
  );

  return detailed;
};

/**
 * Create a new playlist.
 */
export const createPlaylistJellyfin = async (
  serverUrl: string,
  userId: string,
  token: string,
  name: string
): Promise<string> => {
  const res = await fetch(`${serverUrl}/Playlists`, {
    method: 'POST',
    headers: API_HEADERS(token),
    body: JSON.stringify({ Name: name, UserId: userId, MediaType: 'Audio' }),
  });
  if (!res.ok) throw new Error(`Failed to create playlist: ${res.statusText}`);
  const json = await res.json();
  return json.Id;
};

/**
 * Add items to a playlist.
 */
export const addItemsToPlaylistJellyfin = async (
  serverUrl: string,
  playlistId: string,
  userId: string,
  token: string,
  itemIds: string[]
): Promise<void> => {
  const res = await fetch(`${serverUrl}/Playlists/${playlistId}/Items`, {
    method: 'POST',
    headers: API_HEADERS(token),
    body: JSON.stringify({ Ids: itemIds, UserId: userId }),
  });
  if (!res.ok) throw new Error(`Failed to add items: ${res.statusText}`);
};

/**
 * Remove items from a playlist.
 */
export const removeItemsFromPlaylistJellyfin = async (
  serverUrl: string,
  playlistId: string,
  token: string,
  entryIds: string[]
): Promise<void> => {
  const res = await fetch(`${serverUrl}/Playlists/${playlistId}/Items`, {
    method: 'DELETE',
    headers: API_HEADERS(token),
    body: JSON.stringify({ EntryIds: entryIds }),
  });
  if (!res.ok) throw new Error(`Failed to remove items: ${res.statusText}`);
};