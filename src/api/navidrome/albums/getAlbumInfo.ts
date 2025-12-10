const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface GetAlbumInfoResult {
  notes: string;
  musicBrainzId: string | null;
  lastFmUrl: string | null;
}

async function fetchGetAlbumInfo(
  serverUrl: string,
  username: string,
  password: string,
  albumId: string
) {
  const url =
    `${serverUrl}/rest/getAlbumInfo.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&id=${encodeURIComponent(albumId)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Navidrome getAlbumInfo failed: ${res.status}`);
  }

  return res.json();
}

function normalizeGetAlbumInfo(raw: any): GetAlbumInfoResult {
  const info = raw?.["subsonic-response"]?.albumInfo || {};

  return {
    notes: info.notes ?? "",
    musicBrainzId: info.musicBrainzId ?? null,
    lastFmUrl: info.lastFmUrl ?? null
  };
}

export async function getAlbumInfo(
  serverUrl: string,
  username: string,
  password: string,
  albumId: string
): Promise<GetAlbumInfoResult> {
  const raw = await fetchGetAlbumInfo(serverUrl, username, password, albumId);
  return normalizeGetAlbumInfo(raw);
}