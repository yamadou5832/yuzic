import { AlbumData, ArtistData, SongData } from "@/types";
import { getAlbumSongs } from "./getAlbumSongs";
import { buildJellyfinStreamUrl } from "@/utils/urlBuilders";

export type GetAlbumResult = AlbumData | null;

async function fetchGetAlbum(
  serverUrl: string,
  token: string,
  albumId: string
) {
  const url =
    `${serverUrl}/Items` +
    `?Ids=${albumId}` +
    `&Fields=Genres,AlbumArtist,ArtistItems,Artists,PrimaryImageAspectRatio,PrimaryImageTag` +
    `&X-Emby-Token=${token}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jellyfin getAlbum failed: ${res.status}`);
  return res.json();
}

function normalizeAlbum(
  raw: any,
  serverUrl: string,
  token: string
): AlbumData | null {
  const a = raw?.Items?.[0];
  if (!a) return null;

  const albumId = a.Id;
  const albumTitle = a.Name;
  const artistName = a.AlbumArtist || a.Artists?.[0] || "Unknown Artist";

  const cover =
    `${serverUrl}/Items/${albumId}/Images/Primary?quality=90&X-Emby-Token=${token}` +
    (a.ImageTags?.Primary ? `&tag=${a.ImageTags.Primary}` : "");

  return {
    id: albumId,
    cover,
    title: albumTitle,
    subtext: `Album • ${artistName}`,
    artist: {
      id: a.AlbumArtistId || a.ArtistItems?.[0]?.Id || "",
      name: artistName,
      cover,
    },
    songs: [],
    genres: a.Genres || [],
    musicBrainzId: null,
    lastFmUrl: null,
    userPlayCount: 0,
  };
}

export async function getAlbum(
  serverUrl: string,
  token: string,
  albumId: string
): Promise<GetAlbumResult> {
  const raw = await fetchGetAlbum(serverUrl, token, albumId);
  const base = normalizeAlbum(raw, serverUrl, token);
  if (!base) return null;

  const songItems = await getAlbumSongs(serverUrl, token, albumId);

  const songs: SongData[] = songItems.map((s: any) => ({
    id: s.Id,
    title: s.Name,
    artist: s.AlbumArtist || s.Artists?.[0] || "Unknown Artist",
    cover: base.cover,
    duration: String(
      Math.round(
        Number(
          s.RunTimeTicks ??
            s.MediaSources?.[0]?.RunTimeTicks ??
            0
        ) / 10_000_000
      )
    ),
    streamUrl: buildJellyfinStreamUrl(serverUrl, token, s.Id),
    albumId,
    genres: s.Genres || [],
    globalPlayCount: s.PlayCount ?? 0,
    userPlayCount: s.UserData?.PlayCount ?? 0,
  }));

  return {
    ...base,
    subtext:
      songs.length > 1
        ? `Album • ${base.artist.name}`
        : `Single • ${base.artist.name}`,
    songs,
    userPlayCount: songs.reduce(
      (sum, s) => sum + (s.userPlayCount || 0),
      0
    ),
  };
}