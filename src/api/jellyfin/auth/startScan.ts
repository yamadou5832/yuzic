export async function startScan(
  serverUrl: string,
  token: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${serverUrl}/Library/Refresh`, {
      method: "POST",
      headers: {
      "X-Emby-Token": token,
      "X-Emby-Authorization":
        `MediaBrowser Client="Yuzic", Device="Mobile", DeviceId="yuzic-device", Version="1.0.0", Token="${token}"`
    }
    });

    return res.ok
      ? { success: true }
      : { success: false, message: "Failed to start library scan" };
  } catch {
    return { success: false, message: "Scan failed" };
  }
}