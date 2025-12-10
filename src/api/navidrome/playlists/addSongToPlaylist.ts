const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface AddSongToPlaylistResult {
  success: boolean;
}

async function fetchAddSongToPlaylist(
  serverUrl: string,
  username: string,
  password: string,
  playlistId: string,
  songId: string
) {
  const url =
    `${serverUrl}/rest/updatePlaylist.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&playlistId=${encodeURIComponent(playlistId)}` +
    `&songIdToAdd=${encodeURIComponent(songId)}`;

  const res = await fetch(url, { method: "POST" });
  return res.json();
}

function normalizeAddSongToPlaylist(raw: any): AddSongToPlaylistResult {
  const status = raw?.["subsonic-response"]?.status;
  return { success: status === "ok" };
}

export async function addSongToPlaylist(
  serverUrl: string,
  username: string,
  password: string,
  playlistId: string,
  songId: string
): Promise<AddSongToPlaylistResult> {
  const raw = await fetchAddSongToPlaylist(serverUrl, username, password, playlistId, songId);
  return normalizeAddSongToPlaylist(raw);
}