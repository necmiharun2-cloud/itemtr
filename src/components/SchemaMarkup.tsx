import { useEffect } from 'react';

interface SchemaMarkupProps {
  type: 'Organization' | 'Product' | 'BreadcrumbList' | 'FAQPage' | 'WebSite';
  data: Record<string, any>;
}

export const SchemaMarkup = ({ type, data }: SchemaMarkupProps) => {
  useEffect(() => {
    const scriptId = `schema-${type.toLowerCase()}`;
    
    // Remove existing script if any
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new schema script
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [type, data]);

  return null;
};

// Predefined schemas
export const OrganizationSchema = () => (
  <SchemaMarkup
    type="Organization"
    data={{
      name: 'İtemTR',
      url: 'https://itemtr.com',
      logo: 'https://itemtr.com/logo.png',
      description: 'Türkiye\'nin güvenilir oyun hesabı pazaryeri',
      sameAs: [
        'https://twitter.com/itemtr',
        'https://instagram.com/itemtr',
        'https://discord.gg/itemtr'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+90-850-123-4567',
        contactType: 'customer service',
        availableLanguage: ['Turkish'],
        areaServed: 'TR'
      }
    }}
  />
);

export const WebSiteSchema = () => (
  <SchemaMarkup
    type="WebSite"
    data={{
      name: 'İtemTR - Oyun Hesabı Pazaryeri',
      url: 'https://itemtr.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://itemtr.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }}
  />
);

export const BreadcrumbSchema = ({ items }: { items: { name: string; url: string }[] }) => (
  <SchemaMarkup
    type="BreadcrumbList"
    data={{
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }}
  />
);

export default SchemaMarkup;
