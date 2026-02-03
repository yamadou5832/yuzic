import { Song } from "@/types";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface GetStarredItemsResult {
  songs: Song[];
}

export async function getStarredItems(
  serverUrl: string,
  username: string,
  password: string
): Promise<GetStarredItemsResult> {
  const url =
    `${serverUrl}/rest/getStarred.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Navidrome getStarred failed: ${res.status}`);

  const raw = await res.json();

  const starred = raw?.["subsonic-response"]?.starred || {};

  return {
    songs: (starred.song || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      artistId: s.artistId ?? "",
      albumId: s.albumId ?? "",
      cover: s.coverArt
            ? { kind: "navidrome", coverArtId: s.coverArt }
            : { kind: "none" },
      duration: String(s.duration ?? 0),
      streamUrl:
        `${serverUrl}/rest/stream.view?id=${s.id}&u=${encodeURIComponent(
          username
        )}&p=${encodeURIComponent(password)}&v=${API_VERSION}&c=${CLIENT_NAME}`,
      filePath: s.path ?? undefined,
      bitrate: s.bitRate ?? undefined,
      sampleRate: s.samplingRate ?? undefined,
      bitsPerSample: s.bitDepth ?? undefined,
      mimeType: s.contentType ?? undefined,
      dateReleased: s.year != null ? String(s.year) : undefined,
      disc: s.discNumber ?? undefined,
      trackNumber: s.track ?? undefined,
      dateAdded: s.created ?? undefined,
      bpm: s.bpm ?? undefined,
      genres: Array.isArray(s.genres) && s.genres.length > 0
        ? s.genres.map((g: any) => g?.name ?? g).filter(Boolean)
        : undefined,
    })),
  };
}