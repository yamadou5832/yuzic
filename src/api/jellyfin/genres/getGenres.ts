const API_CLIENT = 'Yuzic';

export type GetGenresResult = string[];

async function fetchGetGenres(
  serverUrl: string,
  token: string
) {
  const url = `${serverUrl}/Genres`;

  const res = await fetch(url, {
    headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="${API_CLIENT}", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`
    }
  });

  if (!res.ok) {
    throw new Error(`Jellyfin getGenres failed: ${res.status}`);
  }

  return res.json();
}

function normalizeGenres(raw: any): GetGenresResult {
  const items = raw?.Items ?? [];

  return items
    .map((g: any) => g?.Name)
    .filter((name: any): name is string => typeof name === "string" && name.length > 0);
}

export async function getGenres(
  serverUrl: string,
  token: string
): Promise<GetGenresResult> {
  const raw = await fetchGetGenres(serverUrl, token);
  return normalizeGenres(raw);
}