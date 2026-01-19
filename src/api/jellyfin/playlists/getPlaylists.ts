import { CoverSource, PlaylistBase } from "@/types";

export type GetPlaylistsResult = PlaylistBase[];

async function fetchGetPlaylists(
  serverUrl: string,
  userId: string,
  token: string
) {
  const url =
    `${serverUrl}/Users/${userId}/Items` +
    `?IncludeItemTypes=Playlist` +
    `&Recursive=true` +
    `&Fields=Id,Name,PrimaryImageTag`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) throw new Error(`Jellyfin getPlaylists failed: ${res.status}`);
  return res.json();
}

function normalizePlaylistEntry(
  p: any
): PlaylistBase {
  const id = p.Id;

  const cover: CoverSource = id
        ? { kind: "jellyfin", itemId: id }
        : { kind: "none" };

  return {
    id,
    cover,
    title: p.Name ?? "Playlist",
    subtext: "Playlist",
    changed: new Date(p.DateLastMediaAdded),
    created: new Date(p.DateCreated)
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
    normalizePlaylistEntry(p)
  );
}