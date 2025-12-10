import { AlbumData, ArtistData, SongData } from "@/types";
import { buildCoverArtUrl } from "@/utils/urlBuilders";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetAlbumResult = AlbumData | null;

async function fetchGetAlbum(
  serverUrl: string,
  username: string,
  password: string,
  albumId: string
) {
  const url =
    `${serverUrl}/rest/getAlbum.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&id=${albumId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getAlbum failed: ${res.status}`);

  return res.json();
}

function normalizeAlbum(
  raw: any,
  serverUrl: string,
  username: string,
  password: string
): GetAlbumResult {
  const album = raw?.["subsonic-response"]?.album;
  if (!album) return null;

  const cover = buildCoverArtUrl(album.coverArt, serverUrl, username, password);

  const artist: ArtistData = {
    id: album.artistId ?? "",
    name: album.artist ?? "Unknown Artist",
    cover,
  };

  const songs: SongData[] = (album.song || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    duration: s.duration,
    cover,
    albumId: s.albumId,
    globalPlayCount: 0,
    userPlayCount: 0,
    genres: [],
    streamUrl:
      `${serverUrl}/rest/stream.view?id=${s.id}&u=${encodeURIComponent(
        username
      )}&p=${encodeURIComponent(password)}&v=${API_VERSION}&c=${CLIENT_NAME}`,
  }));

  return {
    id: album.id,
    cover,
    title: album.name,
    subtext:
      songs.length > 1
        ? `Album • ${artist.name}`
        : `Single • ${artist.name}`,
    artist,
    songs,
    genres: [],
    musicBrainzId: null,
    lastFmUrl: null,
    userPlayCount: songs.reduce((a, b) => a + (b.userPlayCount ?? 0), 0),
  };
}

export async function getAlbum(
  serverUrl: string,
  username: string,
  password: string,
  albumId: string
): Promise<GetAlbumResult> {
  const raw = await fetchGetAlbum(serverUrl, username, password, albumId);
  return normalizeAlbum(raw, serverUrl, username, password);
}