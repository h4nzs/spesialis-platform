import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
function i({ level: e = `h2`, children: t, className: r, ...i }) {
  return (0, s.jsxDEV)(
    e,
    { className: n(`text-text-primary`, l[e], r), ...i, children: t },
    void 0,
    !1,
    { fileName: c, lineNumber: 35, columnNumber: 5 },
    this,
  );
}
function a({ size: e = `xl`, as: t, children: r, className: i, ...a }) {
  return (0, s.jsxDEV)(
    t ?? { xl: `h1`, lg: `h2` }[e],
    { className: n(`text-text-primary`, u[e], i), ...a, children: r },
    void 0,
    !1,
    { fileName: c, lineNumber: 73, columnNumber: 5 },
    this,
  );
}
function o({ variant: e = `body`, children: t, className: r, as: i, ...a }) {
  return (0, s.jsxDEV)(
    i ?? f[e],
    { className: n(d[e], r), ...a, children: t },
    void 0,
    !1,
    { fileName: c, lineNumber: 142, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l,
  u,
  d,
  f,
  p = e(() => {
    (t(),
      (s = r()),
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Typography.tsx`),
      (l = {
        h1: `text-h1`,
        h2: `text-h2`,
        h3: `text-h3`,
        h4: `text-h4`,
        h5: `text-h5`,
        h6: `text-h6`,
      }),
      (u = { xl: `text-display-xl`, lg: `text-display` }),
      (d = {
        'body-lg': `text-body-lg text-text-secondary`,
        body: `text-body text-text-secondary`,
        'body-sm': `text-body-sm text-text-secondary`,
        caption: `text-caption text-text-muted`,
        overline: `text-overline text-text-muted`,
        lead: `text-body-lg text-text-secondary`,
        code: `text-body-sm font-mono text-text-secondary bg-neutral-100 rounded-sm px-1.5 py-0.5`,
      }),
      (f = {
        'body-lg': `p`,
        body: `p`,
        'body-sm': `p`,
        caption: `span`,
        overline: `span`,
        lead: `p`,
        code: `span`,
      }),
      (i.__docgenInfo = {
        description: `Semantic heading component.
Renders the specified HTML heading tag with the correct typography scale.

@example
<Heading level="h1">Page Title</Heading>
<Heading level="h3">Sub Section</Heading>`,
        methods: [],
        displayName: `Heading`,
        props: {
          level: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'`,
              elements: [
                { name: `literal`, value: `'h1'` },
                { name: `literal`, value: `'h2'` },
                { name: `literal`, value: `'h3'` },
                { name: `literal`, value: `'h4'` },
                { name: `literal`, value: `'h5'` },
                { name: `literal`, value: `'h6'` },
              ],
            },
            description: `Heading level: h1–h6. Defaults to h2.`,
            defaultValue: { value: `'h2'`, computed: !1 },
          },
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
        },
        composes: [`HTMLAttributes`],
      }),
      (a.__docgenInfo = {
        description: `Large display heading for hero sections.
Use sparingly — only on landing/marketing pages.

@example
<Display size="xl">Layanan Profesional Tanpa Ribet</Display>
<Display size="lg" as="h2">Mengapa Memilih Kami</Display>`,
        methods: [],
        displayName: `Display`,
        props: {
          size: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'xl' | 'lg'`,
              elements: [
                { name: `literal`, value: `'xl'` },
                { name: `literal`, value: `'lg'` },
              ],
            },
            description: `Display size: 'xl' (60px) for hero, 'lg' (48px) for sections.`,
            defaultValue: { value: `'xl'`, computed: !1 },
          },
          as: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'h1' | 'h2' | 'h3'`,
              elements: [
                { name: `literal`, value: `'h1'` },
                { name: `literal`, value: `'h2'` },
                { name: `literal`, value: `'h3'` },
              ],
            },
            description: `HTML element to render. Defaults to h1 for xl, h2 for lg.`,
          },
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
        },
        composes: [`HTMLAttributes`],
      }),
      (o.__docgenInfo = {
        description: `Text component with variant-based styling.

@example
<Text>Standard paragraph</Text>
<Text variant="body-sm">Description text</Text>
<Text variant="caption">12 Jan 2026</Text>
<Text variant="overline">Kategori</Text>
<Text variant="lead">Introductory paragraph</Text>`,
        methods: [],
        displayName: `Text`,
        props: {
          variant: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'body-lg' | 'body' | 'body-sm' | 'caption' | 'overline' | 'lead' | 'code'`,
              elements: [
                { name: `literal`, value: `'body-lg'` },
                { name: `literal`, value: `'body'` },
                { name: `literal`, value: `'body-sm'` },
                { name: `literal`, value: `'caption'` },
                { name: `literal`, value: `'overline'` },
                { name: `literal`, value: `'lead'` },
                { name: `literal`, value: `'code'` },
              ],
            },
            description:
              'Text variant.\n- `body` (default): standard paragraph\n- `body-lg`: larger paragraph\n- `body-sm`: smaller paragraph / description\n- `caption`: metadata, timestamps\n- `overline`: category labels (uppercase)\n- `lead`: intro paragraph (larger, muted)\n- `code`: inline code',
            defaultValue: { value: `'body'`, computed: !1 },
          },
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
          as: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'p' | 'span' | 'small' | 'div' | 'label'`,
              elements: [
                { name: `literal`, value: `'p'` },
                { name: `literal`, value: `'span'` },
                { name: `literal`, value: `'small'` },
                { name: `literal`, value: `'div'` },
                { name: `literal`, value: `'label'` },
              ],
            },
            description: `Override the rendered HTML tag.`,
          },
        },
        composes: [`HTMLAttributes`],
      }));
  });
export { p as i, i as n, o as r, a as t };
