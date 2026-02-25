import { useEffect } from "react";

const DEFAULT_OG_IMAGE = "/images/profile.png";
const SITE_NAME = "KLEVERSON";

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  robots?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  schemaData?: Record<string, unknown>;
}

const SEOHead = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  robots = "index, follow",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Kleverson",
  schemaData,
}: SEOHeadProps) => {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Canonical URL
    const currentUrl = ogUrl || window.location.href;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

    // Meta description
    if (description) {
      setMeta("name", "description", description);
    }

    // Robots
    setMeta("name", "robots", robots);

    // Open Graph
    setMeta("property", "og:title", ogTitle || title || SITE_NAME);
    setMeta("property", "og:description", ogDescription || description || "");
    setMeta("property", "og:url", currentUrl);
    setMeta("property", "og:image", ogImage || `${window.location.origin}${DEFAULT_OG_IMAGE}`);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "pt_BR");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", ogTitle || title || SITE_NAME);
    setMeta("name", "twitter:description", ogDescription || description || "");
    setMeta("name", "twitter:image", ogImage || `${window.location.origin}${DEFAULT_OG_IMAGE}`);

    // Article specific
    if (type === "article") {
      if (publishedTime) setMeta("property", "article:published_time", publishedTime);
      if (modifiedTime) setMeta("property", "article:modified_time", modifiedTime);
      if (author) setMeta("property", "article:author", author);
    }

    // Schema JSON-LD
    if (schemaData) {
      let script = document.querySelector('script[data-seo-schema]') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-schema", "true");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaData);
    }

    // Cleanup
    return () => {
      const schema = document.querySelector('script[data-seo-schema]');
      if (schema) schema.remove();
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, robots, type, publishedTime, modifiedTime, author, schemaData]);

  return null;
};

export default SEOHead;
