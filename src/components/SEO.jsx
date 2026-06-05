import { useEffect } from 'react';

export function SEO({ title, description, keywords, image, canonical }) {
  useEffect(() => {
    // Page Title
    const finalTitle = title ? `${title} | Aurora Wallpapers` : 'Aurora Wallpapers | Premium 4K & UHD Backgrounds';
    document.title = finalTitle;

    // Helper function to insert or update meta tags
    const setMetaTag = (name, content, attrType = 'name') => {
      if (!content) return;
      let tag = document.querySelector(`meta[${attrType}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrType, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Generic Meta Tags
    setMetaTag('description', description || 'Discover and download premium high-resolution 4K wallpapers for mobile and desktop. Curated abstract, cyberpunk, nature, mountains, ocean, and AI art.');
    setMetaTag('keywords', keywords || 'wallpapers, 4k backgrounds, download wallpapers, minimalist background, nature, cyberpunk, aurora wallpapers, pwa');

    // Open Graph Tags for social preview
    setMetaTag('og:title', finalTitle, 'property');
    setMetaTag('og:description', description || 'Elevate your screen with Aurora Wallpapers.', 'property');
    setMetaTag('og:type', 'website', 'property');
    setMetaTag('og:image', image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', 'property');
    setMetaTag('og:url', window.location.href, 'property');

    // Twitter Card Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', description || 'Elevate your screen with Aurora Wallpapers.');
    setMetaTag('twitter:image', image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80');

    // Canonical link tag
    const finalCanonical = canonical || window.location.href;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', finalCanonical);
    
  }, [title, description, keywords, image, canonical]);

  return null;
}
