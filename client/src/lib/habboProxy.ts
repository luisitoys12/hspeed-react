export function proxyImage(url: string) {
  if (!url) return url;
  return `/api/habbo/proxy-image?u=${encodeURIComponent(url)}`;
}
