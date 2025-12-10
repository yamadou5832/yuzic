const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface GetStarredItemsResult {
  albumIds: string[];
  artistIds: string[];
  songIds: string[];
}

async function fetchGetStarred(
  serverUrl: string,
  username: string,
  password: string
) {
  const url =
    `${serverUrl}/rest/getStarred.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Navidrome getStarred failed: ${res.status}`);

  return res.json();
}

function normalizeStarred(raw: any): GetStarredItemsResult {
  const starred = raw?.["subsonic-response"]?.starred || {};

  return {
    albumIds: (starred.album || []).map((a: any) => a.id),
    artistIds: (starred.artist || []).map((a: any) => a.id),
    songIds: (starred.song || []).map((s: any) => s.id),
  };
}

export async function getStarredItems(
  serverUrl: string,
  username: string,
  password: string
): Promise<GetStarredItemsResult> {
  const raw = await fetchGetStarred(serverUrl, username, password);
  return normalizeStarred(raw);
}