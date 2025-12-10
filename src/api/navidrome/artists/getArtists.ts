import { ArtistData } from "@/types";
import { buildCoverArtUrl } from "@/utils/urlBuilders";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetArtistsResult = ArtistData[];

async function fetchGetArtists(
  serverUrl: string,
  username: string,
  password: string
) {
  const url =
    `${serverUrl}/rest/getArtists.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getArtists failed: ${res.status}`);

  return res.json();
}

function normalizeArtists(
  raw: any,
  serverUrl: string,
  username: string,
  password: string
): GetArtistsResult {
  const root = raw?.["subsonic-response"]?.artists;
  if (!root) return [];

  const letters = root.index || [];

  const result: ArtistData[] = [];

  for (const group of letters) {
    const items = group.artist || [];
    for (const a of items) {
      const cover = buildCoverArtUrl(a.coverArt, serverUrl, username, password);

      result.push({
        id: a.id ?? "",
        name: a.name ?? "Unknown Artist",
        cover,
        subtext: "",
        bio: "",
        albums: [],
        eps: [],
        singles: []
      });
    }
  }

  return result;
}

export async function getArtists(
  serverUrl: string,
  username: string,
  password: string
): Promise<GetArtistsResult> {
  const raw = await fetchGetArtists(serverUrl, username, password);
  return normalizeArtists(raw, serverUrl, username, password);
}