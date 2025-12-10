const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export type GetGenresResult = string[];

async function fetchGetGenres(
  serverUrl: string,
  username: string,
  password: string
) {
  const url =
    `${serverUrl}/rest/getGenres.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Navidrome getGenres failed: ${res.status}`);

  return res.json();
}

function normalizeGenres(raw: any): GetGenresResult {
  const genres = raw?.["subsonic-response"]?.genres?.genre ?? [];
  return genres.map((g: any) => g.value).filter((x: any) => !!x);
}

export async function getGenres(
  serverUrl: string,
  username: string,
  password: string
): Promise<GetGenresResult> {
  const raw = await fetchGetGenres(serverUrl, username, password);
  return normalizeGenres(raw);
}
