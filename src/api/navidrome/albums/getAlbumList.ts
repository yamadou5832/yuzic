import { AlbumData, ArtistData, SongData } from "@/types";
import { buildCoverArtUrl } from "@/utils/urlBuilders";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetAlbumListResult = AlbumData[];

async function fetchGetAlbumList(
  serverUrl: string,
  username: string,
  password: string,
  type: string = "newest",
  size: number = 500
) {
  const url =
    `${serverUrl}/rest/getAlbumList.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json&type=${type}&size=${size}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getAlbumList failed: ${res.status}`);

  return res.json();
}

function normalizeAlbumEntry(
  a: any,
  serverUrl: string,
  username: string,
  password: string
): AlbumData {
  const cover = buildCoverArtUrl(a.coverArt, serverUrl, username, password);

  const artist: ArtistData = {
    id: a.artistId ?? "",
    name: a.artist ?? "Unknown Artist",
    cover,
  };

  const songs: SongData[] = (a.song ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    duration: s.duration,
    cover,
    albumId: s.albumId,
    genres: [],
    globalPlayCount: 0,
    userPlayCount: 0,

    streamUrl:
      `${serverUrl}/rest/stream.view?id=${s.id}&u=${encodeURIComponent(
        username
      )}&p=${encodeURIComponent(password)}&v=${API_VERSION}&c=${CLIENT_NAME}`,
  }));

  return {
    id: a.id,
    cover,
    title: a.title,
    subtext:
      songs.length > 1
        ? `Album • ${artist.name}`
        : `Single • ${artist.name}`,
    artist,
    songs,
    genres: [],
    musicBrainzId: null,
    lastFmUrl: null,
    userPlayCount: songs.reduce((acc, cur) => acc + (cur.userPlayCount ?? 0), 0),
  };
}

export async function getAlbumList(
  serverUrl: string,
  username: string,
  password: string,
  type: string = "newest",
  size: number = 500
): Promise<GetAlbumListResult> {
  const raw = await fetchGetAlbumList(serverUrl, username, password, type, size);
  const albums = raw?.["subsonic-response"]?.albumList?.album ?? [];

  return albums.map((a: any) => normalizeAlbumEntry(a, serverUrl, username, password));
}