const CMS_URL = process.env.CMS_URL ?? 'http://localhost:8055';
const CMS_TOKEN = process.env.CMS_TOKEN ?? 'specialist-setup-token';

const headers = {
  Authorization: `Bearer ${CMS_TOKEN}`,
  'Content-Type': 'application/json',
};

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${CMS_URL}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`CMS API error ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data as T;
}

export interface CmsFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort: number | null;
}

export interface CmsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[] | null;
  author: string | null;
  published_at: string | null;
  status: string;
}

export interface CmsHomepageSection {
  id: string;
  section_type: string;
  title: string | null;
  content: string | null;
  image: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta: Record<string, unknown> | null;
}

export const cms = {
  faq: {
    list: (params?: { sort?: string }) =>
      request<CmsFaqItem[]>(`/items/cms_faq?${params?.sort ? `sort=${params.sort}` : 'sort=sort'}`),
  },
  articles: {
    list: (params?: { status?: string; limit?: number }) =>
      request<CmsArticle[]>(
        `/items/cms_articles?filter[status][_eq]=${params?.status ?? 'published'}&limit=${params?.limit ?? 50}`,
      ),
    bySlug: (slug: string) =>
      request<CmsArticle[]>(`/items/cms_articles?filter[slug][_eq]=${slug}&limit=1`),
  },
  homepageSections: {
    list: () =>
      request<CmsHomepageSection[]>(
        '/items/cms_homepage_sections?filter[is_active][_eq]=true&sort=sort_order',
      ),
  },
  pages: {
    bySlug: (slug: string) =>
      request<CmsPage[]>(`/items/cms_pages?filter[slug][_eq]=${slug}&limit=1`),
  },
};
