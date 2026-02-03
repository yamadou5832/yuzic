import { Song } from "@/types";
import { buildJellyfinStreamUrl } from "@/utils/builders/buildStreamUrls";
import { normalizeGenres } from "../utils/normalizeGenres";

export interface GetStarredItemsResult {
  songs: Song[];
}

async function fetchGetStarredSongs(
  serverUrl: string,
  userId: string,
  token: string
) {
  const url =
    `${serverUrl}/Users/${userId}/Items` +
    `?Recursive=true` +
    `&Filters=IsFavorite` +
    `&IncludeItemTypes=Audio` +
    `&Fields=Id,Name,Artists,AlbumId,RunTimeTicks,ImageTags,MediaSources,Genres,PremiereDate,DateCreated`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`
    }
  });

  if (!res.ok) {
    throw new Error(`Jellyfin getStarred failed: ${res.status}`);
  }

  return res.json();
}

function normalizeStarred(
  raw: any,
  serverUrl: string,
  token: string
): GetStarredItemsResult {
  const items = raw?.Items ?? [];

  const songs: Song[] = items.map((i: any) => {
    const ms = i.MediaSources?.[0];
    const audioStream = ms?.MediaStreams?.find((m: any) => m.Type === "Audio");
    return {
      id: i.Id,
      title: i.Name,
      artist: i.ArtistItems?.[0]?.Name ?? "Unknown Artist",
      artistId: i.ArtistItems?.[0]?.Id ?? "",
      albumId: i.AlbumId ?? "",
      cover: i.Id
        ? { kind: "jellyfin", itemId: i.Id }
        : { kind: "none" },
      duration: String(Math.floor((i.RunTimeTicks ?? 0) / 10_000_000)),
      streamUrl: buildJellyfinStreamUrl(serverUrl, token, i.Id),
      bitrate: (audioStream?.BitRate ?? ms?.Bitrate) ?? undefined,
      sampleRate: audioStream?.SampleRate ?? undefined,
      bitsPerSample: audioStream?.BitDepth ?? undefined,
      mimeType: ms?.Container ? `audio/${ms.Container}` : undefined,
      dateReleased: i.PremiereDate ?? undefined,
      disc: i.ParentIndexNumber ?? undefined,
      trackNumber: i.IndexNumber ?? undefined,
      dateAdded: i.DateCreated ?? undefined,
      genres: normalizeGenres(i.Genres),
    };
  });

  return { songs };
}

export async function getStarredItems(
  serverUrl: string,
  userId: string,
  token: string
): Promise<GetStarredItemsResult> {
  try {
    const raw = await fetchGetStarredSongs(serverUrl, userId, token);
    return normalizeStarred(raw, serverUrl, token);
  } catch (error) {
    console.error("Failed to fetch Jellyfin starred items:", error);
    return { songs: [] };
  }
}