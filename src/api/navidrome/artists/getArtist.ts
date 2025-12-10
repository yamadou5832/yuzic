import { ArtistData, AlbumSummary } from "@/types";
import { buildCoverArtUrl } from "@/utils/urlBuilders";

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

function toAlbumSummary(
  album: any,
  serverUrl: string,
  username: string,
  password: string
): AlbumSummary {
  const cover = buildCoverArtUrl(album.coverArt, serverUrl, username, password);

  return {
    id: album.id,
    cover,
    title: album.title,
    subtext: album.artist,
    artist: album.artist,
    playcount: 0,
    isDownloaded: false
  };
}

function normalizeArtist(
  raw: any,
  serverUrl: string,
  username: string,
  password: string
): GetArtistResult {
  const artist = raw?.["subsonic-response"]?.artist;
  if (!artist) return null;

  const cover = buildCoverArtUrl(artist.coverArt, serverUrl, username, password);

  const albums: AlbumSummary[] = (artist.album || []).map((a: any) =>
    toAlbumSummary(a, serverUrl, username, password)
  );

  return {
    id: artist.id ?? "",
    name: artist.name ?? "Unknown Artist",
    cover,
    albums,
    eps: [],
    singles: []
  };
}

export async function getArtist(
  serverUrl: string,
  username: string,
  password: string,
  artistId: string
): Promise<GetArtistResult> {
  const raw = await fetchGetArtist(serverUrl, username, password, artistId);
  return normalizeArtist(raw, serverUrl, username, password);
}