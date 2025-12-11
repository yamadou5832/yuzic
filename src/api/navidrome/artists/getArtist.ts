import { ArtistData } from "@/types";
import { buildCoverArtUrl } from "@/utils/urlBuilders";
import { getArtistInfo } from "@/api/lastfm/getArtistInfo";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetArtistResult = ArtistData | null;

async function fetchGetArtist(
  serverUrl: string,
  username: string,
  password: string,
  artistId: string
) {
  const url =
    `${serverUrl}/rest/getArtist.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&id=${artistId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getArtist failed: ${res.status}`);

  return res.json();
}

function normalizeArtist(
  a: any,
  serverUrl: string,
  username: string,
  password: string,
): GetArtistResult {
  const cover = buildCoverArtUrl(a.coverArt, serverUrl, username, password);

  return {
    id: a.id ?? "",
    name: a.name ?? "Unknown Artist",
    cover,
    subtext: "Artist",
    bio: "",
  };
}

export async function getArtist(
  serverUrl: string,
  username: string,
  password: string,
  artistId: string
): Promise<GetArtistResult> {
  const raw = await fetchGetArtist(serverUrl, username, password, artistId);
  const artist = raw?.["subsonic-response"]?.artist;
  if (!artist) return null;
  return normalizeArtist(artist, serverUrl, username, password);
}