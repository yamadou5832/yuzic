const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface StarResult {
  success: boolean;
}

async function fetchStar(
  serverUrl: string,
  username: string,
  password: string,
  id: string
) {
  const url =
    `${serverUrl}/rest/star.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&id=${encodeURIComponent(id)}`;

  const res = await fetch(url);
  return res.json();
}

function normalizeStar(raw: any): StarResult {
  const status = raw?.["subsonic-response"]?.status;
  return { success: status === "ok" };
}

export async function star(
  serverUrl: string,
  username: string,
  password: string,
  id: string
): Promise<StarResult> {
  const raw = await fetchStar(serverUrl, username, password, id);
  return normalizeStar(raw);
}