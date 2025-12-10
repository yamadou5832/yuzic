const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export interface UnstarResult {
  success: boolean;
}

async function fetchUnstar(
  serverUrl: string,
  username: string,
  password: string,
  id: string
) {
  const url =
    `${serverUrl}/rest/unstar.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json` +
    `&id=${encodeURIComponent(id)}`;

  const res = await fetch(url);
  return res.json();
}

function normalizeUnstar(raw: any): UnstarResult {
  const status = raw?.["subsonic-response"]?.status;
  return { success: status === "ok" };
}

export async function unstar(
  serverUrl: string,
  username: string,
  password: string,
  id: string
): Promise<UnstarResult> {
  const raw = await fetchUnstar(serverUrl, username, password, id);
  return normalizeUnstar(raw);
}