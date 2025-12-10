const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface CreatePlaylistResult {
  id: string | null;
}

async function fetchCreatePlaylist(
  serverUrl: string,
  username: string,
  password: string,
  name: string
) {
  const url =
    `${serverUrl}/rest/createPlaylist.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&name=${encodeURIComponent(name)}`;

  const res = await fetch(url, { method: "POST" });

  if (!res.ok) {
    throw new Error(`Failed to create playlist: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function normalizeCreatePlaylist(raw: any): CreatePlaylistResult {
  const response = raw?.["subsonic-response"];

  const id =
    response?.playlist?.id ??
    response?.playlistId ??
    null;

  return { id };
}

export async function createPlaylist(
  serverUrl: string,
  username: string,
  password: string,
  name: string
): Promise<CreatePlaylistResult> {
  const raw = await fetchCreatePlaylist(serverUrl, username, password, name);
  return normalizeCreatePlaylist(raw);
}