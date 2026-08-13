// Routes any Habbo-related image through the server-side proxy to avoid
// CORS / Opaque-Response-Blocking (ORB) issues in modern browsers.
//
// Previously avatarimage URLs were returned as-is (direct load), which
// caused them to be blocked by Chrome's ORB / cross-origin restrictions.
// They now go through /api/habbo/proxy-image like every other asset.
export function proxyImage(url: string) {
  if (!url) return "";
  return `/api/habbo/proxy-image?u=${encodeURIComponent(url)}`;
}

// Rewrites <img src="..."> in HTML string to use the proxy for Habbo-hosted images.
// Only transforms images whose src contains known Habbo domains to avoid
// proxying arbitrary external images.
export function proxyImagesInHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html; // SSR safety
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img");
    const habboHosts = [
      "images.habbo.com",
      "habbo.es",
      "habbo.com",
      "habbo.com.br",
      "habbo.de",
      "habbo.fi",
      "habbo.fr",
      "habbo.it",
      "habbo.nl",
      "habboassets.com",
      "www.habboassets.com",
      "static.habbo-happy.net",
    ];
    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (!src) return;
      try {
        const url = new URL(src);
        const isHabbo = habboHosts.some(
          (h) => url.hostname === h || url.hostname.endsWith("." + h),
        );
        if (isHabbo) {
          img.setAttribute("src", proxyImage(src));
        }
      } catch {
        // ignore invalid URLs
      }
    });
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}
