import { AlbumSummary } from "@/types";

export type GetArtistAlbumsResult = AlbumSummary[];

async function fetchGetArtistAlbums(
  serverUrl: string,
  token: string,
  artistId: string
) {
  const url =
    `${serverUrl}/Items` +
    `?ArtistIds=${artistId}` +
    `&IncludeItemTypes=MusicAlbum` +
    `&Recursive=true` +
    `&SortBy=ProductionYear,SortName` +
    `&Fields=PrimaryImageAspectRatio,PrimaryImageTag,Genres,DateCreated,UserData,Artists,AlbumArtist`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`
    }
  });

  if (!res.ok) throw new Error(`Jellyfin getArtistAlbums failed: ${res.status}`);
  return res.json();
}

function normalizeArtistAlbumEntry(
  a: any,
  serverUrl: string,
  token: string
): AlbumSummary {
  const albumId = a.Id;
  const title = a.Name ?? "Unknown Album";
  const artist = a.AlbumArtist || a.Artists?.[0] || "Unknown Artist";

  const cover =
    `${serverUrl}/Items/${albumId}/Images/Primary?quality=90&X-Emby-Token=${token}` +
    (a.ImageTags?.Primary ? `&tag=${a.ImageTags.Primary}` : "");

  return {
    id: albumId,
    cover,
    title,
    subtext: `Album • ${artist}`,
    artist,
    playcount: a.UserData?.PlayCount ?? 0,
  };
}

export async function getArtistAlbums(
  serverUrl: string,
  token: string,
  artistId: string
): Promise<GetArtistAlbumsResult> {
  const raw = await fetchGetArtistAlbums(serverUrl, token, artistId);
  const items = raw?.Items ?? [];
  return items.map((a: any) =>
    normalizeArtistAlbumEntry(a, serverUrl, token)
  );
}