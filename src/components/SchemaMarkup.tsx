import { useEffect } from "react";
import { SITE_NAME, SITE_URL, SUPPORT_PHONE_DISPLAY } from "@/lib/site-brand";

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
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Türkiye'nin oyuncu alışveriş platformu — e-pin, hesap, CD-Key ve dijital ürünler",
      sameAs: [
        "https://twitter.com/itemsatiscom",
        "https://www.instagram.com/itemsatiscom",
        "https://discord.gg/itemsatis",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: SUPPORT_PHONE_DISPLAY.replace(/\s/g, "-"),
        contactType: "customer service",
        availableLanguage: ["Turkish"],
        areaServed: "TR",
      },
    }}
  />
);

export const WebSiteSchema = () => (
  <SchemaMarkup
    type="WebSite"
    data={{
      name: `${SITE_NAME} — Oyuncu Pazarı`,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
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
