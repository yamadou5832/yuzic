import { setAuthenticated } from "@/utils/redux/slices/serverSlice";
import store from "@/utils/redux/store";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export async function ping(
  serverUrl: string,
  username: string,
  password: string
): Promise<boolean> {
  if (!serverUrl || !username || !password) return false;

  const url =
    `${serverUrl}/rest/ping.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const success = data["subsonic-response"]?.status === "ok";

    store.dispatch(setAuthenticated(success));
    return success;
  } catch {
    return false;
  }
}