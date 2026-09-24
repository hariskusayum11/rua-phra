/**
 * A missing image is null, never a nonexistent asset.
 * Callers must render an empty state. Remote providers also need to be
 * allowlisted in Next's image configuration before use with Next/Image.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  const value = path?.trim();
  if (!value || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}
