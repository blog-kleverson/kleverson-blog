import DOMPurify from 'dompurify';
import InlineLeadCapture from './InlineLeadCapture';

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

// Add slug IDs to h2, h3, h4 elements in HTML
const addHeadingIds = (html: string): string => {
  return html.replace(
    /<(h[2-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      // Strip HTML tags from content to get plain text
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const slug = textToSlug(plainText);
      // Preserve existing attributes, add id
      if (attrs.includes('id=')) return match; // Don't overwrite existing ids
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
  // Parse the HTML content and replace {{lead-capture}} shortcodes with the component
  const parts = htmlContent.split(/\{\{lead-capture\}\}/gi);
  
  if (parts.length === 1) {
    // No shortcodes found, render normally with sanitized HTML + heading IDs
    const sanitizedContent = addHeadingIds(sanitizeHTML(htmlContent));
    return (
      <div 
        className="prose-article article-body" 
        dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
      />
    );
  }

  // Render with inline lead capture components and sanitized HTML
  return (
    <div className="prose-article article-body">
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
