import { CoverSource, Song } from "@/types";
import { buildJellyfinStreamUrl } from "@/utils/builders/buildStreamUrls";
import { normalizeGenres } from "../utils/normalizeGenres";

export type GetInstantMixResult = Song[];

function parseInstantMixResponse(text: string): { Items?: any[] } {
  const trimmed = text.trim();
  if (trimmed.startsWith("data:")) {
    const commaIdx = trimmed.indexOf(",");
    if (commaIdx >= 0) {
      const decoded = decodeURIComponent(trimmed.slice(commaIdx + 1).trim());
      return JSON.parse(decoded);
    }
  }
  return JSON.parse(trimmed);
}

async function fetchInstantMix(
  serverUrl: string,
  itemId: string,
  userId: string,
  token: string,
  limit = 50
) {
  const url =
    `${serverUrl}/Items/${itemId}/InstantMix` +
    `?UserId=${userId}` +
    `&Limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Jellyfin getInstantMix failed: ${res.status}`);
  }
  const text = await res.text();
  return parseInstantMixResponse(text);
}

function normalizeItem(s: any, serverUrl: string, token: string): Song | null {
  if (!s?.Id || s.Type !== "Audio") return null;

  const ticks = s.RunTimeTicks ?? s.MediaSources?.[0]?.RunTimeTicks ?? 0;
  const artistItem = s.ArtistItems?.[0];
  const ms = s.MediaSources?.[0];
  const audioStream = ms?.MediaStreams?.find((m: any) => m.Type === "Audio");

  const cover: CoverSource = s.AlbumId
    ? { kind: "jellyfin", itemId: s.AlbumId }
    : { kind: "none" };

  return {
    id: s.Id,
    title: s.Name ?? "Unknown",
    artist: artistItem?.Name ?? "Unknown Artist",
    artistId: artistItem?.Id ?? "",
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

export async function getInstantMix(
  serverUrl: string,
  itemId: string,
  userId: string,
  token: string,
  limit = 50
): Promise<GetInstantMixResult> {
  const raw = await fetchInstantMix(serverUrl, itemId, userId, token, limit);
  const items = raw?.Items ?? [];
  return items
    .map((s: any) => normalizeItem(s, serverUrl, token))
    .filter((s): s is Song => s !== null);
}
