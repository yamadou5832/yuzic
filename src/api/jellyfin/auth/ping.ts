export async function ping(serverUrl: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${serverUrl}/System/Ping`, {
      headers: { "X-Emby-Token": token }
    });
    return res.ok;
  } catch {
    return false;
  }
}