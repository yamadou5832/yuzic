import { PlaylistData } from "@/types";

export type GetPlaylistsResult = PlaylistData[];

async function fetchGetPlaylists(
  serverUrl: string,
  userId: string,
  token: string
) {
  const url =
    `${serverUrl}/Users/${userId}/Items` +
    `?IncludeItemTypes=Playlist` +
    `&Recursive=true` +
    `&Fields=Id,Name,PrimaryImageTag` +
    `&X-Emby-Token=${token}`;

  const res = await fetch(url, {
    headers: { "X-Emby-Token": token, "Content-Type": "application/json" }
  });

  if (!res.ok) throw new Error(`Jellyfin getPlaylists failed: ${res.status}`);
  return res.json();
}

function normalizePlaylistEntry(
  p: any,
  serverUrl: string,
  token: string
): PlaylistData {
  const id = p.Id;

  const cover =
    `${serverUrl}/Items/${id}/Images/Primary?quality=90&X-Emby-Token=${token}` +
    (p.ImageTags?.Primary ? `&tag=${p.ImageTags.Primary}` : "");

  return {
    id,
    cover,
    title: p.Name ?? "Playlist",
    subtext: "Playlist",
    songs: []
  };
}

export async function getPlaylists(
  serverUrl: string,
  userId: string,
  token: string
): Promise<GetPlaylistsResult> {
  const raw = await fetchGetPlaylists(serverUrl, userId, token);
  const items = raw?.Items ?? [];
  return items.map((p: any) =>
    normalizePlaylistEntry(p, serverUrl, token)
  );
}