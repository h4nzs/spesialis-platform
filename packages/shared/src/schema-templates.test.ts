import { describe, it, expect } from 'vitest';
import { SCHEMA_TEMPLATES, getSchemaTemplate } from './schema-templates.ts';
import type { SchemaTemplateType } from './schema-templates.ts';

describe('SCHEMA_TEMPLATES', () => {
  it('has 6 template types', () => {
    expect(SCHEMA_TEMPLATES).toHaveLength(6);
  });

  it('each template has required properties', () => {
    for (const t of SCHEMA_TEMPLATES) {
      expect(t.type).toBeTruthy();
      expect(t.label).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.fields).toBeInstanceOf(Array);
      expect(typeof t.toJsonLD).toBe('function');
    }
  });

  it('each field has valid type', () => {
    const validTypes = ['text', 'url', 'textarea', 'number', 'array'];
    for (const t of SCHEMA_TEMPLATES) {
      for (const f of t.fields) {
        expect(validTypes).toContain(f.type);
        expect(f.key).toBeTruthy();
        expect(f.label).toBeTruthy();
        expect(f.placeholder).toBeDefined();
      }
    }
  });

  it('all field keys use camelCase', () => {
    const allKeys = SCHEMA_TEMPLATES.flatMap((t) => t.fields.map((f) => f.key));
    for (const key of allKeys) {
      expect(key).toMatch(/^[a-z][a-zA-Z0-9]*$/);
    }
  });
});

describe('getSchemaTemplate', () => {
  it('returns template for valid type', () => {
    const article = getSchemaTemplate('Article');
    expect(article).toBeDefined();
    expect(article!.type).toBe('Article');
  });

  it('returns template for FAQ type', () => {
    const faq = getSchemaTemplate('FAQ');
    expect(faq).toBeDefined();
    expect(faq!.type).toBe('FAQ');
  });

  it('returns undefined for unknown type', () => {
    const result = getSchemaTemplate('Unknown' as SchemaTemplateType);
    expect(result).toBeUndefined();
  });
});

describe('Article builder', () => {
  const template = getSchemaTemplate('Article')!;

  it('builds valid Article JSON-LD', () => {
    const result = template.toJsonLD({
      headline: 'Cara Membersihkan AC',
      authorName: 'Budi Santoso',
      datePublished: '2024-01-15',
    });

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Article');
    expect(result.headline).toBe('Cara Membersihkan AC');
    expect(result.author).toEqual({ '@type': 'Person', name: 'Budi Santoso' });
  });

  it('includes publisher when provided', () => {
    const result = template.toJsonLD({
      headline: 'Test',
      authorName: 'Author',
      datePublished: '2024-01-01',
      publisherName: 'Ahli Panggilan',
      publisherLogo: 'https://ahlipanggilan.id/logo.png',
    });

    expect(result.publisher).toEqual({
      '@type': 'Organization',
      name: 'Ahli Panggilan',
      logo: { '@type': 'ImageObject', url: 'https://ahlipanggilan.id/logo.png' },
    });
  });

  it('includes image when provided', () => {
    const result = template.toJsonLD({
      headline: 'Test',
      authorName: 'Author',
      datePublished: '2024-01-01',
      imageUrl: 'https://ahlipanggilan.id/image.jpg',
    });

    expect(result.image).toEqual({
      '@type': 'ImageObject',
      url: 'https://ahlipanggilan.id/image.jpg',
    });
  });

  it('strips empty fields from output', () => {
    const result = template.toJsonLD({
      headline: 'Test',
      authorName: 'Author',
      datePublished: '2024-01-01',
    }) as Record<string, unknown>;

    // dateModified falls back to datePublished when not provided
    expect(result.dateModified).toBe('2024-01-01');
    expect(result.description).toBeUndefined();
    expect(result.publisher).toBeUndefined();
    expect(result.image).toBeUndefined();
  });
});

describe('FAQ builder', () => {
  const template = getSchemaTemplate('FAQ')!;

  it('builds valid FAQPage JSON-LD', () => {
    const result = template.toJsonLD({
      question1: 'Apa itu SEO?',
      answer1: 'SEO adalah optimasi mesin pencari',
      question2: 'Mengapa SEO penting?',
      answer2: 'Karena meningkatkan visibilitas',
    }) as Record<string, unknown>;
    const mainEntity = result.mainEntity as Array<Record<string, unknown>>;

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('FAQPage');
    expect(mainEntity).toHaveLength(2);
    expect(mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'Apa itu SEO?',
      acceptedAnswer: { '@type': 'Answer', text: 'SEO adalah optimasi mesin pencari' },
    });
  });

  it('only includes question/answer pairs with both values', () => {
    const result = template.toJsonLD({
      question1: 'Pertanyaan 1',
      answer1: 'Jawaban 1',
      question2: 'Pertanyaan 2 tanpa jawaban',
      answer2: '',
    }) as Record<string, unknown>;
    const mainEntity = result.mainEntity as Array<unknown>;

    expect(mainEntity).toHaveLength(1);
  });

  it('returns empty mainEntity when no pairs provided', () => {
    const result = template.toJsonLD({}) as Record<string, unknown>;
    expect(result.mainEntity as Array<unknown>).toEqual([]);
  });
});

describe('Service builder', () => {
  const template = getSchemaTemplate('Service')!;

  it('builds valid Service JSON-LD', () => {
    const result = template.toJsonLD({
      name: 'Cuci AC',
      description: 'Layanan cuci AC profesional',
      providerName: 'Ahli Panggilan',
      priceRange: 'Rp100,000',
    });

    expect(result['@type']).toBe('Service');
    expect(result.name).toBe('Cuci AC');
    expect(result.provider).toEqual({ '@type': 'Organization', name: 'Ahli Panggilan' });
    expect(result.offers).toEqual({ '@type': 'Offer', price: 'Rp100,000' });
  });

  it('omits offers when no priceRange', () => {
    const result = template.toJsonLD({
      name: 'Cuci AC',
    });

    expect(result.offers).toBeUndefined();
  });
});

describe('LocalBusiness builder', () => {
  const template = getSchemaTemplate('LocalBusiness')!;

  it('builds valid LocalBusiness JSON-LD', () => {
    const result = template.toJsonLD({
      name: 'Ahli Panggilan',
      address: 'Jl. Raya No. 123, Jakarta',
      telephone: '+62812-3456-7890',
    });

    expect(result['@type']).toBe('LocalBusiness');
    expect(result.name).toBe('Ahli Panggilan');
    expect(result.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Raya No. 123, Jakarta',
    });
    expect(result.telephone).toBe('+62812-3456-7890');
  });
});

describe('BreadcrumbList builder', () => {
  const template = getSchemaTemplate('BreadcrumbList')!;

  it('builds valid BreadcrumbList JSON-LD', () => {
    const result = template.toJsonLD({
      item1Name: 'Beranda',
      item1Url: 'https://ahlipanggilan.id/',
      item2Name: 'Layanan',
      item2Url: 'https://ahlipanggilan.id/services',
    }) as Record<string, unknown>;
    const items = result.itemListElement as Array<Record<string, unknown>>;

    expect(result['@type']).toBe('BreadcrumbList');
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: 'https://ahlipanggilan.id/',
    });
  });

  it('assigns correct positions', () => {
    const result = template.toJsonLD({
      item1Name: 'A',
      item2Name: 'B',
      item3Name: 'C',
    }) as Record<string, unknown>;
    const items = result.itemListElement as Array<{ position: number }>;

    expect(items).toHaveLength(3);
    expect(items[0]!.position).toBe(1);
    expect(items[1]!.position).toBe(2);
    expect(items[2]!.position).toBe(3);
  });
});

describe('Organization builder', () => {
  const template = getSchemaTemplate('Organization')!;

  it('builds valid Organization JSON-LD', () => {
    const result = template.toJsonLD({
      name: 'Ahli Panggilan',
      url: 'https://ahlipanggilan.id',
      logo: 'https://ahlipanggilan.id/logo.png',
    });

    expect(result['@type']).toBe('Organization');
    expect(result.name).toBe('Ahli Panggilan');
    expect(result.url).toBe('https://ahlipanggilan.id');
    expect(result.logo).toEqual({
      '@type': 'ImageObject',
      url: 'https://ahlipanggilan.id/logo.png',
    });
  });

  it('includes sameAs array for social links', () => {
    const result = template.toJsonLD({
      name: 'Ahli Panggilan',
      url: 'https://ahlipanggilan.id',
      sameAs1: 'https://facebook.com/ahlipanggilan',
      sameAs2: 'https://instagram.com/ahlipanggilan',
    });

    expect(result.sameAs).toEqual([
      'https://facebook.com/ahlipanggilan',
      'https://instagram.com/ahlipanggilan',
    ]);
  });

  it('omits sameAs when no links provided', () => {
    const result = template.toJsonLD({
      name: 'Ahli Panggilan',
      url: 'https://ahlipanggilan.id',
    });

    expect(result.sameAs).toBeUndefined();
  });
});
