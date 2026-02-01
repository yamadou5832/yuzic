import { CoverSource, Song } from "@/types";
import { buildJellyfinStreamUrl } from "@/utils/builders/buildStreamUrls";

export type GetInstantMixResult = Song[];

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
  return res.json();
}

function normalizeItem(s: any, serverUrl: string, token: string): Song | null {
  if (!s?.Id || s.Type !== "Audio") return null;

  const ticks = s.RunTimeTicks ?? s.MediaSources?.[0]?.RunTimeTicks ?? 0;
  const artistItem = s.ArtistItems?.[0];

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
