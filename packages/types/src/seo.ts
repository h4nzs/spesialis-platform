export type SeoEntityType = 'Service' | 'Article' | 'Category' | 'Landing Page';

export interface SeoMetadata {
  id: string;
  entityType: SeoEntityType;
  entityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  robots: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  schemaJson: unknown | null;
}
