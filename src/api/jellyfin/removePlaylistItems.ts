async function fetchRemovePlaylistItems(
  serverUrl: string,
  playlistId: string,
  token: string,
  entryIds: string[]
) {
  const ids = entryIds.join(",");
  const url =
    `${serverUrl}/Playlists/${playlistId}/Items` +
    `?EntryIds=${ids}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-Emby-Token": token,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) throw new Error(`Jellyfin removePlaylistItems failed: ${res.status}`);
}

function normalizeRemovePlaylistItems() {
  return;
}

export async function removePlaylistItems(
  serverUrl: string,
  playlistId: string,
  token: string,
  entryIds: string[]
): Promise<void> {
  await fetchRemovePlaylistItems(serverUrl, playlistId, token, entryIds);
  return normalizeRemovePlaylistItems();
}