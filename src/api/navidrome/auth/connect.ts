import { setAuthenticated } from "@/utils/redux/slices/serverSlice";
import store from "@/utils/redux/store";

const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export async function connect(
  serverUrl: string,
  username: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  if (!serverUrl || !username || !password) {
    return { success: false, message: "Missing credentials or server URL." };
  }

  const url =
    `${serverUrl.replace(/\/+$/, "")}/rest/getMusicFolders.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { success: false, message: `Server returned ${res.status}` };

    const data = await res.json().catch(() => ({} as any));
    const status = data["subsonic-response"]?.status;

    if (status === "ok") {
      store.dispatch(setAuthenticated(true));
      return { success: true };
    }

    return {
      success: false,
      message:
        data["subsonic-response"]?.error?.message ??
        "Invalid credentials or unreachable server.",
    };
  } catch {
    return { success: false, message: "Failed to reach Navidrome server." };
  }
}