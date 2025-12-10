export async function testServerUrl(
  url: string
): Promise<{ success: boolean; message?: string }> {
  if (!url) return { success: false, message: "Server URL is required." };

  try {
    const res = await fetch(url);
    return res.ok
      ? { success: true }
      : { success: false, message: `Status code ${res.status}` };
  } catch {
    return { success: false, message: "Failed to connect to the server." };
  }
}