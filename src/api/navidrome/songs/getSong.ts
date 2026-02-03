import { Song } from "@/types";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export async function getSong(
  serverUrl: string,
  username: string,
  password: string,
  songId: string
): Promise<Song | null> {
  try {
    const url =
      `${serverUrl}/rest/getSong.view` +
      `?u=${encodeURIComponent(username)}` +
      `&p=${encodeURIComponent(password)}` +
      `&v=${API_VERSION}` +
      `&c=${CLIENT_NAME}` +
      `&f=json` +
      `&id=${encodeURIComponent(songId)}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const raw = await res.json();
    const s = raw?.["subsonic-response"]?.song;
    if (!s) return null;

    const streamUrl =
      `${serverUrl}/rest/stream.view?id=${s.id}` +
      `&u=${encodeURIComponent(username)}` +
      `&p=${encodeURIComponent(password)}` +
      `&v=${API_VERSION}` +
      `&c=${CLIENT_NAME}`;

    return {
      id: s.id,
      title: s.title ?? "Unknown",
      artist: s.artist ?? "Unknown Artist",
      artistId: s.artistId ?? "",
      albumId: s.albumId ?? "",
      cover: s.coverArt
        ? { kind: "navidrome", coverArtId: s.coverArt }
        : { kind: "none" },
      duration: String(s.duration ?? 0),
      streamUrl,
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
    };
  } catch (error) {
    console.error("Failed to fetch Navidrome song:", error);
    return null;
  }
}
