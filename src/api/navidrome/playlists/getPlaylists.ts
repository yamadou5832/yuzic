import { PlaylistData, SongData } from "@/types";
import { buildCoverArtUrl } from "@/utils/urlBuilders";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetPlaylistsResult = PlaylistData[];

async function fetchGetPlaylists(
  serverUrl: string,
  username: string,
  password: string
) {
  const url =
    `${serverUrl}/rest/getPlaylists.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&size=500`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getPlaylists failed: ${res.status}`);

  return res.json();
}

function normalizePlaylists(
  raw: any,
  serverUrl: string,
  username: string,
  password: string
): GetPlaylistsResult {
  const list = raw?.["subsonic-response"]?.playlists?.playlist || [];

  return list.map((pl: any) => {
    const cover = buildCoverArtUrl(pl.coverArt, serverUrl, username, password);

    return {
      id: pl.id,
      cover,
      title: pl.name ?? "Playlist",
      subtext: "Playlist",
      songs: [],
      songCount: pl.songCount
    };
  });
}

export async function getPlaylists(
  serverUrl: string,
  username: string,
  password: string
): Promise<GetPlaylistsResult> {
  const raw = await fetchGetPlaylists(serverUrl, username, password);
  return normalizePlaylists(raw, serverUrl, username, password);
}