import { SongData } from "@/types";
import { buildJellyfinStreamUrl } from "@/utils/urlBuilders";

export type GetAlbumSongsResult = SongData[];

async function fetchGetAlbumSongs(
  serverUrl: string,
  token: string,
  albumId: string
) {
  const url =
    `${serverUrl}/Items` +
    `?ParentId=${albumId}` +
    `&IncludeItemTypes=Audio` +
    `&Recursive=true` +
    `&SortBy=IndexNumber` +
    `&Fields=MediaSources,RunTimeTicks,Genres,Album,AlbumArtist,Artists,UserData,PlayCount`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`
    }
  });

  if (!res.ok) throw new Error(`Jellyfin getAlbumSongs failed: ${res.status}`);
  return res.json();
}


function normalizeSongEntry(
  s: any,
  albumId: string,
  serverUrl: string,
  token: string
): SongData {
  const ticks = s.RunTimeTicks ?? 0;

  const cover =
    `${serverUrl}/Items/${albumId}/Images/Primary?quality=90&X-Emby-Token=${token}` +
    (s.ImageTags?.Primary ? `&tag=${s.ImageTags.Primary}` : "");

  const artist = s.ArtistItems[0].Name || "Unknown Artist";

  return {
    id: s.Id,
    title: s.Name,
    artist,
    cover,
    duration: String(Math.round(Number(ticks) / 10_000_000)),
    streamUrl: buildJellyfinStreamUrl(serverUrl, token, s.Id),
    albumId,
    userPlayCount: s.UserData.PlayCount ?? 0,
  };
}

export async function getAlbumSongs(
  serverUrl: string,
  token: string,
  albumId: string,
): Promise<GetAlbumSongsResult> {
  const raw = await fetchGetAlbumSongs(serverUrl, token, albumId);
  const items = raw?.Items ?? [];

  return items.map((s: any) =>
    normalizeSongEntry(
      s,
      albumId,
      serverUrl,
      token
    )
  );
}