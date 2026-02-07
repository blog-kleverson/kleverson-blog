import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import InlineLeadCapture from './InlineLeadCapture';
import { toast } from 'sonner';

interface ArticleContentProps {
  htmlContent: string;
  articleUrl?: string;
}

// Generate a URL-friendly slug from text
const textToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .trim()
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-');            // Collapse multiple hyphens
};

// SVG for the anchor icon (link icon)
const anchorIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

// Add slug IDs to h2, h3, h4 elements in HTML + anchor buttons on h2
const addHeadingIds = (html: string): string => {
  return html.replace(
    /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const slug = textToSlug(plainText);
      if (attrs.includes('id=')) return match;
      
      // Only add anchor button to h2
      if (tag.toLowerCase() === 'h2') {
        return `<${tag}${attrs} id="${slug}" class="heading-with-anchor">${content}<a class="heading-anchor-link" href="#${slug}" data-slug="${slug}" aria-label="Copiar link para ${plainText}">${anchorIconSvg}</a></${tag}>`;
      }
      
      return `<${tag}${attrs} id="${slug}">${content}</${tag}>`;
    }
  );
};

// Configure DOMPurify to allow safe HTML tags for article content
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img', 'figure', 'figcaption',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr',
      'iframe', // For embedded videos (YouTube, Vimeo, etc.)
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', // For links
      'width', 'height', 'style', // For images and iframes
      'frameborder', 'allowfullscreen', 'allow', // For iframes
      'loading', // For lazy loading
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'], // Ensure links can open in new tab
  });
};

export default function ArticleContent({ htmlContent, articleUrl }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Attach click handlers to anchor links
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleAnchorClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest('.heading-anchor-link') as HTMLAnchorElement | null;
      if (!target) return;

      e.preventDefault();
      const slug = target.dataset.slug;
      if (!slug) return;

      // Build full URL with hash
      const url = new URL(window.location.href);
      url.hash = slug;
      const fullLink = url.toString();

      // Copy to clipboard
      navigator.clipboard.writeText(fullLink).then(() => {
        toast.success('Link copiado!');
      }).catch(() => {
        toast.error('Erro ao copiar link');
      });

      // Scroll to the heading with offset for fixed header
      const heading = document.getElementById(slug);
      if (heading) {
        const headerOffset = 80;
        const elementPosition = heading.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
        window.history.pushState(null, '', `#${slug}`);
      }
    };

    container.addEventListener('click', handleAnchorClick);
    return () => container.removeEventListener('click', handleAnchorClick);
  }, []);

  // Handle initial scroll when page loads with a hash in the URL
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const timer = setTimeout(() => {
      const heading = document.getElementById(hash);
      if (heading) {
        const headerOffset = 80;
        const elementPosition = heading.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Parse the HTML content and replace {{lead-capture}} shortcodes with the component
  const parts = htmlContent.split(/\{\{lead-capture\}\}/gi);
  
  if (parts.length === 1) {
    const sanitizedContent = addHeadingIds(sanitizeHTML(htmlContent));
    return (
      <div ref={containerRef} className="prose-article article-body" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    );
  }

  return (
    <div ref={containerRef} className="prose-article article-body">
      {parts.map((part, index) => {
        const sanitizedPart = addHeadingIds(sanitizeHTML(part));
        return (
          <div key={index}>
            <div dangerouslySetInnerHTML={{ __html: sanitizedPart }} />
            {index < parts.length - 1 && (
              <InlineLeadCapture articleUrl={articleUrl} />
            )}
          </div>
        );
      })}
    </div>
  );
}
