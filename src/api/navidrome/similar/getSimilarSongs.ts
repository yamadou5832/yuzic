import { CoverSource, Song } from "@/types";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export async function getSimilarSongs(
  serverUrl: string,
  username: string,
  password: string,
  id: string,
  count = 50
): Promise<Song[]> {
  try {
    const url =
      `${serverUrl}/rest/getSimilarSongs.view` +
      `?u=${encodeURIComponent(username)}` +
      `&p=${encodeURIComponent(password)}` +
      `&v=${API_VERSION}` +
      `&c=${CLIENT_NAME}` +
      `&f=json` +
      `&id=${encodeURIComponent(id)}` +
      `&count=${count}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const raw = await res.json();
    const similar = raw?.["subsonic-response"]?.similarSongs?.song ?? [];
    if (!Array.isArray(similar)) return [];

    return similar.map((s: any) => {
      const streamUrl =
        `${serverUrl}/rest/stream.view?id=${s.id}` +
        `&u=${encodeURIComponent(username)}` +
        `&p=${encodeURIComponent(password)}` +
        `&v=${API_VERSION}` +
        `&c=${CLIENT_NAME}`;

      const cover: CoverSource = s.coverArt
        ? { kind: "navidrome", coverArtId: s.coverArt }
        : { kind: "none" };

      return {
        id: s.id,
        title: s.title ?? "Unknown",
        artist: s.artist ?? "Unknown Artist",
        artistId: s.artistId ?? "",
        albumId: s.albumId ?? "",
        cover,
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
    });
  } catch (error) {
    console.error("Navidrome getSimilarSongs failed:", error);
    return [];
  }
}
