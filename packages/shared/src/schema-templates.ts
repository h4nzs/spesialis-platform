// ── Schema Types ─────────────────────────────────────────────────

export type SchemaTemplateType =
  'Article' | 'FAQ' | 'Service' | 'LocalBusiness' | 'BreadcrumbList' | 'Organization';

export interface SchemaTemplate {
  type: SchemaTemplateType;
  label: string;
  description: string;
  icon: string;
  fields: SchemaField[];
  toJsonLD: (values: Record<string, string>) => Record<string, unknown>;
}

export interface SchemaField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'url' | 'textarea' | 'number' | 'array';
  hint?: string;
  required?: boolean;
}

// ── Template Definitions ─────────────────────────────────────────

const ARTICLE_FIELDS: SchemaField[] = [
  {
    key: 'headline',
    label: 'Headline',
    placeholder: 'Judul artikel',
    type: 'text',
    required: true,
  },
  {
    key: 'authorName',
    label: 'Author Name',
    placeholder: 'Nama penulis',
    type: 'text',
    required: true,
  },
  {
    key: 'datePublished',
    label: 'Date Published',
    placeholder: '2024-01-15',
    type: 'text',
    hint: 'Format: YYYY-MM-DD',
    required: true,
  },
  {
    key: 'dateModified',
    label: 'Date Modified',
    placeholder: '2024-01-20',
    type: 'text',
    hint: 'Format: YYYY-MM-DD',
  },
  {
    key: 'imageUrl',
    label: 'Image URL',
    placeholder: 'https://...',
    type: 'url',
    hint: 'URL gambar utama artikel',
  },
  { key: 'description', label: 'Description', placeholder: 'Ringkasan artikel', type: 'textarea' },
  { key: 'publisherName', label: 'Publisher Name', placeholder: 'Spesialis', type: 'text' },
  {
    key: 'publisherLogo',
    label: 'Publisher Logo URL',
    placeholder: 'https://spesialis.id/logo.png',
    type: 'url',
  },
];

const FAQ_FIELDS: SchemaField[] = [
  { key: 'question1', label: 'Question 1', placeholder: 'Pertanyaan pertama', type: 'text' },
  { key: 'answer1', label: 'Answer 1', placeholder: 'Jawaban pertama', type: 'textarea' },
  { key: 'question2', label: 'Question 2', placeholder: 'Pertanyaan kedua', type: 'text' },
  { key: 'answer2', label: 'Answer 2', placeholder: 'Jawaban kedua', type: 'textarea' },
  { key: 'question3', label: 'Question 3', placeholder: 'Pertanyaan ketiga', type: 'text' },
  { key: 'answer3', label: 'Answer 3', placeholder: 'Jawaban ketiga', type: 'textarea' },
  { key: 'question4', label: 'Question 4', placeholder: 'Pertanyaan keempat', type: 'text' },
  { key: 'answer4', label: 'Answer 4', placeholder: 'Jawaban keempat', type: 'textarea' },
  { key: 'question5', label: 'Question 5', placeholder: 'Pertanyaan kelima', type: 'text' },
  { key: 'answer5', label: 'Answer 5', placeholder: 'Jawaban kelima', type: 'textarea' },
];

const SERVICE_FIELDS: SchemaField[] = [
  { key: 'name', label: 'Service Name', placeholder: 'Nama layanan', type: 'text', required: true },
  { key: 'description', label: 'Description', placeholder: 'Deskripsi layanan', type: 'textarea' },
  { key: 'providerName', label: 'Provider Name', placeholder: 'Spesialis', type: 'text' },
  { key: 'serviceType', label: 'Service Type', placeholder: 'Home Cleaning', type: 'text' },
  { key: 'priceRange', label: 'Price Range', placeholder: 'Rp50,000 - Rp500,000', type: 'text' },
  {
    key: 'areaServed',
    label: 'Area Served',
    placeholder: 'Jakarta, Tangerang, Bekasi, Depok',
    type: 'text',
  },
  { key: 'imageUrl', label: 'Image URL', placeholder: 'https://...', type: 'url' },
];

const LOCAL_BUSINESS_FIELDS: SchemaField[] = [
  { key: 'name', label: 'Business Name', placeholder: 'Spesialis', type: 'text', required: true },
  { key: 'description', label: 'Description', placeholder: 'Deskripsi bisnis', type: 'textarea' },
  {
    key: 'address',
    label: 'Address',
    placeholder: 'Jl. Contoh No. 123, Jakarta',
    type: 'text',
    required: true,
  },
  { key: 'telephone', label: 'Phone', placeholder: '+62812-3456-7890', type: 'text' },
  { key: 'email', label: 'Email', placeholder: 'info@spesialis.id', type: 'text' },
  {
    key: 'openingHours',
    label: 'Opening Hours',
    placeholder: 'Mo-Fr 08:00-17:00',
    type: 'text',
    hint: 'Format: Mo-Fr 08:00-17:00',
  },
  { key: 'imageUrl', label: 'Image URL', placeholder: 'https://...', type: 'url' },
  { key: 'priceRange', label: 'Price Range', placeholder: 'Rp50,000 - Rp500,000', type: 'text' },
];

const BREADCRUMB_FIELDS: SchemaField[] = [
  { key: 'item1Name', label: 'Item 1 Name', placeholder: 'Beranda', type: 'text', required: true },
  { key: 'item1Url', label: 'Item 1 URL', placeholder: 'https://spesialis.id/', type: 'url' },
  { key: 'item2Name', label: 'Item 2 Name', placeholder: 'Layanan', type: 'text' },
  {
    key: 'item2Url',
    label: 'Item 2 URL',
    placeholder: 'https://spesialis.id/services',
    type: 'url',
  },
  { key: 'item3Name', label: 'Item 3 Name', placeholder: 'Cuci AC', type: 'text' },
  {
    key: 'item3Url',
    label: 'Item 3 URL',
    placeholder: 'https://spesialis.id/services/cuci-ac',
    type: 'url',
  },
  { key: 'item4Name', label: 'Item 4 Name', placeholder: '', type: 'text' },
  { key: 'item4Url', label: 'Item 4 URL', placeholder: '', type: 'url' },
  { key: 'item5Name', label: 'Item 5 Name', placeholder: '', type: 'text' },
  { key: 'item5Url', label: 'Item 5 URL', placeholder: '', type: 'url' },
];

const ORGANIZATION_FIELDS: SchemaField[] = [
  {
    key: 'name',
    label: 'Organization Name',
    placeholder: 'Spesialis',
    type: 'text',
    required: true,
  },
  {
    key: 'url',
    label: 'Website URL',
    placeholder: 'https://spesialis.id',
    type: 'url',
    required: true,
  },
  { key: 'logo', label: 'Logo URL', placeholder: 'https://spesialis.id/logo.png', type: 'url' },
  {
    key: 'sameAs1',
    label: 'Social Link 1',
    placeholder: 'https://facebook.com/spesialis',
    type: 'url',
  },
  {
    key: 'sameAs2',
    label: 'Social Link 2',
    placeholder: 'https://instagram.com/spesialis',
    type: 'url',
  },
  {
    key: 'sameAs3',
    label: 'Social Link 3',
    placeholder: 'https://twitter.com/spesialis',
    type: 'url',
  },
  { key: 'sameAs4', label: 'Social Link 4', placeholder: '', type: 'url' },
  {
    key: 'description',
    label: 'Description',
    placeholder: 'Deskripsi organisasi',
    type: 'textarea',
  },
];

// ── JSON-LD Builders ────────────────────────────────────────────

function buildArticle(values: Record<string, string>): Record<string, unknown> {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: values.headline || undefined,
    author: values.authorName ? { '@type': 'Person', name: values.authorName } : undefined,
    datePublished: values.datePublished || undefined,
    dateModified: values.dateModified || values.datePublished || undefined,
    description: values.description || undefined,
    publisher: values.publisherName
      ? {
          '@type': 'Organization',
          name: values.publisherName,
          ...(values.publisherLogo
            ? { logo: { '@type': 'ImageObject', url: values.publisherLogo } }
            : {}),
        }
      : undefined,
    image: values.imageUrl ? { '@type': 'ImageObject', url: values.imageUrl } : undefined,
  };
  return cleanUndefined(json);
}

function buildFaq(values: Record<string, string>): Record<string, unknown> {
  const questions = [];
  for (let i = 1; i <= 5; i++) {
    const q = values[`question${i}`];
    const a = values[`answer${i}`];
    if (q && a) {
      questions.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      });
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

function buildService(values: Record<string, string>): Record<string, unknown> {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: values.name || undefined,
    description: values.description || undefined,
    provider: values.providerName
      ? { '@type': 'Organization', name: values.providerName }
      : undefined,
    serviceType: values.serviceType || undefined,
    areaServed: values.areaServed || undefined,
    image: values.imageUrl ? { '@type': 'ImageObject', url: values.imageUrl } : undefined,
  };
  if (values.priceRange) {
    json.offers = { '@type': 'Offer', price: values.priceRange };
  }
  return cleanUndefined(json);
}

function buildLocalBusiness(values: Record<string, string>): Record<string, unknown> {
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: values.name || undefined,
    description: values.description || undefined,
    image: values.imageUrl ? { '@type': 'ImageObject', url: values.imageUrl } : undefined,
    address: values.address
      ? { '@type': 'PostalAddress', streetAddress: values.address }
      : undefined,
    telephone: values.telephone || undefined,
    email: values.email || undefined,
    openingHours: values.openingHours || undefined,
    priceRange: values.priceRange || undefined,
  };
  return cleanUndefined(json);
}

function buildBreadcrumbList(values: Record<string, string>): Record<string, unknown> {
  const items = [];
  for (let i = 1; i <= 5; i++) {
    const name = values[`item${i}Name`];
    const url = values[`item${i}Url`];
    if (name) {
      const item: Record<string, unknown> = {
        '@type': 'ListItem',
        position: i,
        name,
      };
      if (url) item.item = url;
      items.push(item);
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function buildOrganization(values: Record<string, string>): Record<string, unknown> {
  const sameAs: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const url = values[`sameAs${i}`];
    if (url) sameAs.push(url);
  }
  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: values.name || undefined,
    url: values.url || undefined,
    description: values.description || undefined,
    logo: values.logo ? { '@type': 'ImageObject', url: values.logo } : undefined,
  };
  if (sameAs.length > 0) json.sameAs = sameAs;
  return cleanUndefined(json);
}

// ── Helpers ──────────────────────────────────────────────────────

function cleanUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = cleanUndefined(value as Record<string, unknown>);
        if (Object.keys(nested).length > 0) {
          cleaned[key] = nested;
        }
      } else if (Array.isArray(value)) {
        const filtered = value.filter((v) => v !== undefined && v !== null);
        if (filtered.length > 0) {
          cleaned[key] = filtered;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

// ── Registry ─────────────────────────────────────────────────────

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    type: 'Article',
    label: 'Article',
    description: 'Artikel blog dan berita',
    icon: 'fileText',
    fields: ARTICLE_FIELDS,
    toJsonLD: buildArticle,
  },
  {
    type: 'FAQ',
    label: 'FAQ',
    description: 'Halaman pertanyaan & jawaban',
    icon: 'helpCircle',
    fields: FAQ_FIELDS,
    toJsonLD: buildFaq,
  },
  {
    type: 'Service',
    label: 'Service',
    description: 'Layanan jasa profesional',
    icon: 'wrench',
    fields: SERVICE_FIELDS,
    toJsonLD: buildService,
  },
  {
    type: 'LocalBusiness',
    label: 'Local Business',
    description: 'Bisnis lokal dengan alamat fisik',
    icon: 'building',
    fields: LOCAL_BUSINESS_FIELDS,
    toJsonLD: buildLocalBusiness,
  },
  {
    type: 'BreadcrumbList',
    label: 'Breadcrumb List',
    description: 'Navigasi breadcrumb untuk halaman',
    icon: 'home',
    fields: BREADCRUMB_FIELDS,
    toJsonLD: buildBreadcrumbList,
  },
  {
    type: 'Organization',
    label: 'Organization',
    description: 'Profil organisasi/perusahaan',
    icon: 'building',
    fields: ORGANIZATION_FIELDS,
    toJsonLD: buildOrganization,
  },
];

export function getSchemaTemplate(type: SchemaTemplateType): SchemaTemplate | undefined {
  return SCHEMA_TEMPLATES.find((t) => t.type === type);
}
