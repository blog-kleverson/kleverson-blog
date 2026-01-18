import InlineLeadCapture from './InlineLeadCapture';

interface ArticleContentProps {
  htmlContent: string;
  articleUrl?: string;
}

export default function ArticleContent({ htmlContent, articleUrl }: ArticleContentProps) {
  // Parse the HTML content and replace {{lead-capture}} shortcodes with the component
  const parts = htmlContent.split(/\{\{lead-capture\}\}/gi);
  
  if (parts.length === 1) {
    // No shortcodes found, render normally
    return (
      <div 
        className="prose-article article-body" 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    );
  }

  // Render with inline lead capture components
  return (
    <div className="prose-article article-body">
      {parts.map((part, index) => (
        <div key={index}>
          <div dangerouslySetInnerHTML={{ __html: part }} />
          {index < parts.length - 1 && (
            <InlineLeadCapture articleUrl={articleUrl} />
          )}
        </div>
      ))}
    </div>
  );
}
