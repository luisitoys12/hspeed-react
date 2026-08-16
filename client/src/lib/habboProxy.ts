// Direct image URLs - no proxy needed
export function proxyImage(url: string) {
  if (!url) return "";
  return url;
}

// No proxy needed for HTML images - return as-is
export function proxyImagesInHtml(html: string): string {
  return html;
}
