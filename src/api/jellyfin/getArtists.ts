import { ArtistData, AlbumSummary } from "@/types";
import { getArtistInfo } from "@/api/lastfm/getArtistInfo";

export type GetArtistsResult = ArtistData[];

async function fetchGetArtists(serverUrl: string, token: string) {
  const url =
    `${serverUrl}/Items` +
    `?IncludeItemTypes=MusicArtist` +
    `&Recursive=true` +
    `&SortBy=SortName` +
    `&Fields=PrimaryImageTag,Overview,Genres,DateCreated`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`,
    },
  });

  if (!res.ok) throw new Error(`Jellyfin getArtists failed: ${res.status}`);
  return res.json();
}

function normalizeBaseArtist(a: any, serverUrl: string, token: string): ArtistData {
  const artistId = a.Id;
  const name = a.Name ?? "Unknown Artist";

  const cover =
    `${serverUrl}/Items/${artistId}/Images/Primary?quality=90&X-Emby-Token=${token}` +
    (a.ImageTags?.Primary ? `&tag=${a.ImageTags.Primary}` : "");

  return {
    id: artistId,
    name,
    cover,
    subtext: a.Genres?.[0] ?? "Artist",
    bio: a.Overview ?? "",
    albums: [],
    eps: [],
    singles: [],
  };
}

export async function getArtists(
  serverUrl: string,
  token: string
): Promise<GetArtistsResult> {
  try {
    const raw = await fetchGetArtists(serverUrl, token);
    const items = raw?.Items ?? [];

    // Convert base info
    const baseArtists = items.map((a) =>
      normalizeBaseArtist(a, serverUrl, token)
    );

    // Enrich with Last.fm album data
    const enriched = await Promise.all(
      baseArtists.map(async (artist) => {
        try {
          const lf = await getArtistInfo(artist.name);

          const rawAlbums = lf.albums ?? [];
          const lastFmAlbums: AlbumSummary[] = rawAlbums.map((album: any) => {
            const title = album.name ?? "";
            const cover =
              album.image?.find((img: any) => img.size === "extralarge")?.["#text"] ||
              "";

            let subtext = "Album";
            const lower = title.toLowerCase();
            if (lower.includes("ep")) subtext = "EP";
            else if (lower.includes("single")) subtext = "Single";

            return {
              id: album.mbid || `${artist.name}-${title}`,
              cover,
              title,
              subtext,
              artist: artist.name,
              playcount: album.playcount ? Number(album.playcount) : undefined,
              isDownloaded: false,
            };
          });

          return {
            ...artist,
            bio: lf.bio ?? artist.bio,
            albums: lastFmAlbums.filter((a) => a.subtext === "Album"),
            eps: lastFmAlbums.filter((a) => a.subtext === "EP"),
            singles: lastFmAlbums.filter((a) => a.subtext === "Single"),
          };
        } catch (err) {
          console.warn("Failed to fetch Last.fm for artist", artist.name, err);
          return artist;
        }
      })
    );

    return enriched;
  } catch (error) {
    console.error("Failed to fetch Jellyfin artists:", error);
    return [];
  }
}