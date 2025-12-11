import { ArtistData } from "@/types";
import { getArtist } from "./getArtist";
import { getArtistInfo } from "@/api/lastfm/getArtistInfo";
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

async function normalizeArtists(
  raw: any,
  serverUrl: string,
  username: string,
  password: string
): Promise<GetArtistsResult> {
  const root = raw?.["subsonic-response"]?.artists;
  if (!root) return [];

  const letters = root.index || [];

  const artistIds: string[] = [];
  for (const group of letters) {
    const items = group.artist || [];
    for (const a of items) {
      if (a.id) artistIds.push(a.id);
    }
  }

  const fullArtists = await Promise.all(
    artistIds.map(async (id) => {
      try {
        const info = await getArtist(serverUrl, username, password, id);
        return info!;
      } catch (err) {
        console.warn("Failed to load artist", id, err);
        return null;
      }
    })
  );

  return fullArtists.filter((x) => x !== null) as ArtistData[];
}

export async function getArtists(
  serverUrl: string,
  username: string,
  password: string
): Promise<GetArtistsResult> {
  const raw = await fetchGetArtists(serverUrl, username, password);
  return normalizeArtists(raw, serverUrl, username, password);
}