import { ArtistData, AlbumSummary } from "@/types";
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

function fromLastFmSummary(album: any, artistName: string): AlbumSummary {
  const cover =
    album.image?.find((img: any) => img.size === "extralarge")?.["#text"] || "";

  const title = album.name ?? "";
  const artist = album.artist?.name ?? artistName;

  let subtext = "Album";
  const lower = title.toLowerCase();
  if (lower.includes("ep")) subtext = "EP";
  else if (lower.includes("single")) subtext = "Single";

  return {
    id: album.mbid || `${artist}-${title}`,
    cover,
    title,
    subtext,
    artist,
    playcount: album.playcount ? Number(album.playcount) : undefined,
    isDownloaded: false
  };
}

function normalizeArtist(
  raw: any,
  serverUrl: string,
  username: string,
  password: string,
  lastFmData: { albums: any[]; bio: string | null }
): GetArtistResult {
  const artist = raw?.["subsonic-response"]?.artist;
  if (!artist) return null;

  const cover = buildCoverArtUrl(artist.coverArt, serverUrl, username, password);

  const ndAlbums: AlbumSummary[] = (artist.album || []).map((a: any) =>
    toAlbumSummary(a, serverUrl, username, password)
  );

  const lfSummaries: AlbumSummary[] = (lastFmData.albums || []).map((a: any) =>
    fromLastFmSummary(a, artist.name)
  );

  const albums = [];
  const eps = [];
  const singles = [];

  for (const alb of lfSummaries) {
    const lower = alb.title.toLowerCase();

    if (alb.subtext === "EP") eps.push(alb);
    else if (alb.subtext === "Single") singles.push(alb);
    else albums.push(alb);
  }

  return {
    id: artist.id ?? "",
    name: artist.name ?? "Unknown Artist",
    cover,
    bio: lastFmData.bio ?? "",
    albums: [...ndAlbums, ...albums],
    eps,
    singles
  };
}

export async function getArtist(
  serverUrl: string,
  username: string,
  password: string,
  artistId: string
): Promise<GetArtistResult> {
  const raw = await fetchGetArtist(serverUrl, username, password, artistId);

  const artistName =
    raw?.["subsonic-response"]?.artist?.name ?? "";
  const lastFmData = artistName
    ? await getArtistInfo(artistName)
    : { albums: [], bio: null };

  return normalizeArtist(raw, serverUrl, username, password, lastFmData);
}