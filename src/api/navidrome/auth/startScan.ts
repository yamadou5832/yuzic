const API_VERSION = "1.16.0";
const CLIENT_NAME = "Yuzic";

export async function startScan(
  serverUrl: string,
  username: string,
  password: string
) {
  if (!serverUrl || !username || !password) {
    return { success: false, message: "Missing Navidrome credentials." };
  }

  const startUrl =
    `${serverUrl}/rest/startScan.view` +
    `?u=${encodeURIComponent(username)}` +
    `&p=${encodeURIComponent(password)}` +
    `&v=${API_VERSION}` +
    `&c=${CLIENT_NAME}` +
    `&f=json`;

  try {
    const startRes = await fetch(startUrl, { method: "POST" });
    const startData = await startRes.json();
    const ok = startData["subsonic-response"]?.status === "ok";

    if (!ok) return { success: false, message: "Failed to start scan." };

    const statusUrl =
      `${serverUrl}/rest/getScanStatus.view` +
      `?u=${encodeURIComponent(username)}` +
      `&p=${encodeURIComponent(password)}` +
      `&v=${API_VERSION}` +
      `&c=${CLIENT_NAME}` +
      `&f=json`;

    const poll = async () => {
      const res = await fetch(statusUrl);
      const json = await res.json();
      return json["subsonic-response"]?.scanStatus?.scanning === "true";
    };

    let retry = 0;
    while (retry < 60 && (await poll())) {
      await new Promise((r) => setTimeout(r, 5000));
      retry++;
    }

    return retry >= 60
      ? { success: false, message: "Scan timed out." }
      : { success: true, message: "Scan completed." };
  } catch {
    return { success: false, message: "Navidrome scan failed." };
  }
}