export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = import.meta.env.VITE_API_URL ?? "";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
