import { SongData } from "@/types";
import { buildJellyfinStreamUrl } from "@/utils/urlBuilders";

export type GetPlaylistItemsResult = SongData[];

async function fetchGetPlaylistItems(
  serverUrl: string,
  playlistId: string,
  userId: string,
  token: string
) {
  const url =
    `${serverUrl}/Playlists/${playlistId}/Items` +
    `?userId=${userId}`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) throw new Error(`Jellyfin getPlaylistItems failed: ${res.status}`);
  return res.json();
}

function normalizePlaylistSongEntry(
  s: any,
  serverUrl: string,
  token: string
): SongData {
  const ticks =
    s.RunTimeTicks ??
    s.MediaSources?.[0]?.RunTimeTicks ??
    0;

  return {
    id: s.Id,
    title: s.Name,
    artist: s.AlbumArtist || s.Artists?.[0] || "Unknown Artist",
    cover:
      `${serverUrl}/Items/${s.Id}/Images/Primary?quality=90&X-Emby-Token=${token}` +
      (s.ImageTags?.Primary ? `&tag=${s.ImageTags.Primary}` : ""),
    duration: String(Math.round(Number(ticks) / 10_000_000)),
    streamUrl: buildJellyfinStreamUrl(serverUrl, token, s.Id),
    albumId: s.AlbumId,
    genres: s.Genres || [],
    globalPlayCount: s.PlayCount ?? 0,
    userPlayCount: s.UserData?.PlayCount ?? 0,
  };
}

export async function getPlaylistItems(
  serverUrl: string,
  playlistId: string,
  userId: string,
  token: string
): Promise<GetPlaylistItemsResult> {
  const raw = await fetchGetPlaylistItems(serverUrl, playlistId, userId, token);
  const items = raw?.Items ?? [];
  return items.map((s: any) =>
    normalizePlaylistSongEntry(s, serverUrl, token)
  );
}