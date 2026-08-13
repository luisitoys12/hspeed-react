import { useEffect } from "react";
import type { ReactNode } from "react";

interface SEOMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function SEOMeta({
  title,
  description,
  image,
  url,
  type = "website",
  publishedTime,
  author,
  section,
  tags,
}: SEOMetaProps) {
  useEffect(() => {
    const fullTitle = title.includes("HabboSpeed")
      ? title
      : `${title} | HabboSpeed`;
    const fullUrl = url || window.location.href;
    const fullImage = image || "https://habbospeed.net/og-default.png";

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) meta.setAttribute("property", name);
        else meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMeta("title", fullTitle);
    updateMeta("description", description);
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", type, true);
    updateMeta("og:url", fullUrl, true);
    updateMeta("og:image", fullImage, true);
    updateMeta("og:site_name", "HabboSpeed", true);
    updateMeta("twitter:card", "summary_large_image", false);
    updateMeta("twitter:title", fullTitle, false);
    updateMeta("twitter:description", description, false);
    updateMeta("twitter:image", fullImage, false);
    updateMeta("twitter:site", "@HabboSpeed", false);

    if (type === "article") {
      if (publishedTime)
        updateMeta("article:published_time", publishedTime, true);
      if (author) updateMeta("article:author", author, true);
      if (section) updateMeta("article:section", section, true);
      if (tags?.length) {
        tags.forEach((tag) => {
          updateMeta("article:tag", tag, true);
        });
      }
    }

    // JSON-LD for article
    if (type === "article" && publishedTime) {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: fullTitle,
        description,
        image: fullImage,
        url: fullUrl,
        datePublished: publishedTime,
        author: {
          "@type": "Person",
          name: author || "HabboSpeed",
        },
        publisher: {
          "@type": "Organization",
          name: "HabboSpeed",
          logo: {
            "@type": "ImageObject",
            url: "https://habbospeed.net/logo.png",
          },
        },
      };

      const selector = 'script[type="application/ld+json"][data-seo="article"]';
      let script = document.querySelector(selector) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo", "article");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [
    title,
    description,
    image,
    url,
    type,
    publishedTime,
    author,
    section,
    tags,
  ]);
  return null;
}
