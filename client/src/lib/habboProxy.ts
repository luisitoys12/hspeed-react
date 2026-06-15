export function proxyImage(url: string) {
  if (!url) return "";
  if (url.includes("/habbo-imaging/avatarimage")) {
    return url;
  }
  return `/api/habbo/proxy-image?u=${encodeURIComponent(url)}`;
}
