export function proxyImage(url: string) {
  if (!url) return "";
  return `/api/habbo/proxy-image?u=${encodeURIComponent(url)}`;
}
