export interface GetStarredItemsResult {
  albumIds: string[];
  artistIds: string[];
  songIds: string[];
}

async function fetchGetStarred(
  serverUrl: string,
  userId: string,
  token: string
) {
  const url =
    `${serverUrl}/Users/${userId}/Items` +
    `?Recursive=true` +
    `&Filters=IsFavorite` +
    `&IncludeItemTypes=Audio,MusicAlbum,MusicArtist` +
    `&Fields=Id`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`
    }
  });

  if (!res.ok) throw new Error(`Jellyfin getStarred failed: ${res.status}`);
  return res.json();
}

function normalizeStarred(raw: any): GetStarredItemsResult {
  const items = raw?.Items ?? [];

  const songIds: string[] = [];
  const albumIds: string[] = [];
  const artistIds: string[] = [];

  for (const i of items) {
    if (i.Type === "Audio") songIds.push(i.Id);
    else if (i.Type === "MusicAlbum") albumIds.push(i.Id);
    else if (i.Type === "MusicArtist") artistIds.push(i.Id);
  }

  return { albumIds, artistIds, songIds };
}

export async function getStarredItems(
  serverUrl: string,
  userId: string,
  token: string
): Promise<GetStarredItemsResult> {
  try {
    const raw = await fetchGetStarred(serverUrl, userId, token);
    return normalizeStarred(raw);
  } catch (error) {
    console.error(`Failed to fetch starred items:`, error);
    // Return empty arrays rather than failing entirely
    return {
      albumIds: [],
      artistIds: [],
      songIds: [],
    };
  }
}