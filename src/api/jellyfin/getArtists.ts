import { ArtistData } from "@/types";

export type GetArtistsResult = ArtistData[];

async function fetchGetArtists(
  serverUrl: string,
  token: string
) {
  const url =
    `${serverUrl}/Items` +
    `?IncludeItemTypes=MusicArtist` +
    `&Recursive=true` +
    `&SortBy=SortName` +
    `&Fields=PrimaryImageTag,Overview,Genres,DateCreated` +
    `&X-Emby-Token=${token}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jellyfin getArtists failed: ${res.status}`);
  return res.json();
}

function normalizeArtistEntry(
  a: any,
  serverUrl: string,
  token: string
): ArtistData {
  const artistId = a.Id;
  const name = a.Name ?? "Unknown Artist";

  const cover =
    `${serverUrl}/Items/${artistId}/Images/Primary?quality=90&X-Emby-Token=${token}` +
    (a.ImageTags?.Primary ? `&tag=${a.ImageTags.Primary}` : "");

  return {
    id: artistId,
    name,
    cover,
    subtext: a.Genres?.[0] ?? "",
    bio: a.Overview ?? "",
  };
}

export async function getArtists(
  serverUrl: string,
  token: string
): Promise<GetArtistsResult> {
  const raw = await fetchGetArtists(serverUrl, token);
  const items = raw?.Items ?? [];
  return items.map((a: any) =>
    normalizeArtistEntry(a, serverUrl, token)
  );
}