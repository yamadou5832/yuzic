import { CoverSource, Song } from "@/types";
import { buildJellyfinStreamUrl } from "@/utils/builders/buildStreamUrls";
import { normalizeGenres } from "../utils/normalizeGenres";

export type GetPlaylistItemsResult = Song[];

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
): Song {
  const ticks =
    s.RunTimeTicks ??
    s.MediaSources?.[0]?.RunTimeTicks ??
    0;

  const cover: CoverSource = s.AlbumId
        ? { kind: "jellyfin", itemId: s.AlbumId }
        : { kind: "none" };

  const ms = s.MediaSources?.[0];
  const audioStream = ms?.MediaStreams?.find((m: any) => m.Type === "Audio");

  return {
    id: s.Id,
    title: s.Name,
    artist: s.ArtistItems?.[0]?.Name || "Unknown Artist",
    artistId: s.ArtistItems?.[0]?.Id ?? "",
    cover,
    duration: String(Math.round(Number(ticks) / 10_000_000)),
    streamUrl: buildJellyfinStreamUrl(serverUrl, token, s.Id),
    albumId: s.AlbumId ?? "",
    bitrate: (audioStream?.BitRate ?? ms?.Bitrate) ?? undefined,
    sampleRate: audioStream?.SampleRate ?? undefined,
    bitsPerSample: audioStream?.BitDepth ?? undefined,
    mimeType: ms?.Container ? `audio/${ms.Container}` : undefined,
    dateReleased: s.PremiereDate ?? undefined,
    disc: s.ParentIndexNumber ?? undefined,
    trackNumber: s.IndexNumber ?? undefined,
    dateAdded: s.DateCreated ?? undefined,
    genres: normalizeGenres(s.Genres),
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
  return items.map((s: any) => normalizePlaylistSongEntry(s, serverUrl, token));
}

/** Resolve song ID to Jellyfin PlaylistItemId (required for remove). */
export async function getPlaylistEntryIdForSong(
  serverUrl: string,
  playlistId: string,
  userId: string,
  token: string,
  songId: string
): Promise<string | null> {
  const raw = await fetchGetPlaylistItems(serverUrl, playlistId, userId, token);
  const items = raw?.Items ?? [];
  const item = items.find((s: any) => s.Id === songId);
  return item?.PlaylistItemId ?? null;
}