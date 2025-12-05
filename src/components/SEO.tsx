import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const siteTitle = 'Flex';
  const fullTitle = `${title} | ${siteTitle}`;
  const defaultDescription = 'Engage your audience with real-time word clouds, polls, and Q&A sessions.';
  const defaultImage = 'https://flex-app.com/og-image.png';
  const defaultUrl = window.location.href;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Helper to update meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const desc = description || defaultDescription;
    const img = image || defaultImage;
    const currentUrl = url || defaultUrl;

    // Standard Meta
    updateMeta('description', desc);

    // Open Graph
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', desc, 'property');
    updateMeta('og:image', img, 'property');
    updateMeta('og:url', currentUrl, 'property');

    // Twitter
    updateMeta('twitter:title', fullTitle, 'property'); // Twitter sometimes uses name, sometimes property. keeping consistent with OG for now or standardizing.
    updateMeta('twitter:description', desc, 'property');
    updateMeta('twitter:image', img, 'property');

    // Cleanup (optional, but good for SPA navigation)
    return () => {
      // Resetting to default might be jarring, usually we just let the next page overwrite.
    };
  }, [fullTitle, description, image, url]);

  return null;
};

export default SEO;
