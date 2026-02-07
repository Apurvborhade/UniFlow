export async function safeJsonFetch(url: string, options?: any) {
  const res = await fetch(url, options);

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Expected JSON, got: ${contentType}\n${text}`);
  }

  return res.json();
}
