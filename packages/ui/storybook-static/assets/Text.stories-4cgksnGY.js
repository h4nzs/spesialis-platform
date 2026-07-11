import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
import { i as n, n as r, r as i } from './Typography-BCu9oHDA.js';
import { n as a, t as o } from './Divider-Cu44-Eta.js';
var s, c, l, u, d, f, p, m, h, g, _, v;
e(() => {
  (n(),
    a(),
    (s = t()),
    (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Text.stories.tsx`),
    (l = {
      title: `Typography/Text`,
      component: i,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        variant: {
          control: `select`,
          options: [`body-lg`, `body`, `body-sm`, `caption`, `overline`, `lead`, `code`],
        },
      },
      args: { variant: `body`, children: `Standard body text for paragraphs and descriptions.` },
    }),
    (u = {
      args: { variant: `body`, children: `Standard body text for paragraphs and descriptions.` },
    }),
    (d = {
      name: `Body Large`,
      args: { variant: `body-lg`, children: `Larger body text for intro paragraphs.` },
    }),
    (f = {
      name: `Body Small`,
      args: { variant: `body-sm`, children: `Smaller body text for descriptions and metadata.` },
    }),
    (p = { args: { variant: `caption`, children: `12 Jan 2026 · 3 menit lalu` } }),
    (m = { args: { variant: `overline`, children: `Kategori Layanan` } }),
    (h = {
      args: {
        variant: `lead`,
        children: `Temukan mitra terbaik untuk kebutuhan profesional Anda.`,
      },
    }),
    (g = { args: { variant: `code`, children: `npm install @ahlipanggilan/ui` } }),
    (_ = {
      name: `Full Scale`,
      parameters: { layout: `padded` },
      render: () =>
        (0, s.jsxDEV)(
          `div`,
          {
            className: `space-y-3`,
            children: [
              (0, s.jsxDEV)(
                r,
                { level: `h4`, children: `Text Scale` },
                void 0,
                !1,
                { fileName: c, lineNumber: 74, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                o,
                {},
                void 0,
                !1,
                { fileName: c, lineNumber: 75, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `body-lg`, children: `body-lg — Intro paragraph for landing sections` },
                void 0,
                !1,
                { fileName: c, lineNumber: 76, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `body`, children: `body — Default body text for all pages` },
                void 0,
                !1,
                { fileName: c, lineNumber: 77, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `body-sm`, children: `body-sm — Description, helper text` },
                void 0,
                !1,
                { fileName: c, lineNumber: 78, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `caption`, children: `caption — Timestamps, metadata, small labels` },
                void 0,
                !1,
                { fileName: c, lineNumber: 79, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `overline`, children: `OVERLINE — Category labels, uppercase` },
                void 0,
                !1,
                { fileName: c, lineNumber: 80, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `lead`, children: `lead — Lead paragraph for articles` },
                void 0,
                !1,
                { fileName: c, lineNumber: 81, columnNumber: 7 },
                void 0,
              ),
              (0, s.jsxDEV)(
                i,
                { variant: `code`, children: `code — Inline code snippets` },
                void 0,
                !1,
                { fileName: c, lineNumber: 82, columnNumber: 7 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: c, lineNumber: 73, columnNumber: 17 },
          void 0,
        ),
    }),
    (u.parameters = {
      ...u.parameters,
      docs: {
        ...u.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'body',
    children: 'Standard body text for paragraphs and descriptions.'
  }
}`,
          ...u.parameters?.docs?.source,
        },
      },
    }),
    (d.parameters = {
      ...d.parameters,
      docs: {
        ...d.parameters?.docs,
        source: {
          originalSource: `{
  name: 'Body Large',
  args: {
    variant: 'body-lg',
    children: 'Larger body text for intro paragraphs.'
  }
}`,
          ...d.parameters?.docs?.source,
        },
      },
    }),
    (f.parameters = {
      ...f.parameters,
      docs: {
        ...f.parameters?.docs,
        source: {
          originalSource: `{
  name: 'Body Small',
  args: {
    variant: 'body-sm',
    children: 'Smaller body text for descriptions and metadata.'
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p.parameters = {
      ...p.parameters,
      docs: {
        ...p.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'caption',
    children: '12 Jan 2026 · 3 menit lalu'
  }
}`,
          ...p.parameters?.docs?.source,
        },
      },
    }),
    (m.parameters = {
      ...m.parameters,
      docs: {
        ...m.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'overline',
    children: 'Kategori Layanan'
  }
}`,
          ...m.parameters?.docs?.source,
        },
      },
    }),
    (h.parameters = {
      ...h.parameters,
      docs: {
        ...h.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'lead',
    children: 'Temukan mitra terbaik untuk kebutuhan profesional Anda.'
  }
}`,
          ...h.parameters?.docs?.source,
        },
      },
    }),
    (g.parameters = {
      ...g.parameters,
      docs: {
        ...g.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'code',
    children: 'npm install @ahlipanggilan/ui'
  }
}`,
          ...g.parameters?.docs?.source,
        },
      },
    }),
    (_.parameters = {
      ..._.parameters,
      docs: {
        ..._.parameters?.docs,
        source: {
          originalSource: `{
  name: 'Full Scale',
  parameters: {
    layout: 'padded'
  },
  render: () => <div className="space-y-3">
      <Heading level="h4">Text Scale</Heading>
      <Divider />
      <Text variant="body-lg">body-lg — Intro paragraph for landing sections</Text>
      <Text variant="body">body — Default body text for all pages</Text>
      <Text variant="body-sm">body-sm — Description, helper text</Text>
      <Text variant="caption">caption — Timestamps, metadata, small labels</Text>
      <Text variant="overline">OVERLINE — Category labels, uppercase</Text>
      <Text variant="lead">lead — Lead paragraph for articles</Text>
      <Text variant="code">code — Inline code snippets</Text>
    </div>
}`,
          ..._.parameters?.docs?.source,
        },
      },
    }),
    (v = [`Body`, `BodyLarge`, `BodySmall`, `Caption`, `Overline`, `Lead`, `Code`, `FullScale`]));
})();
export {
  u as Body,
  d as BodyLarge,
  f as BodySmall,
  p as Caption,
  g as Code,
  _ as FullScale,
  h as Lead,
  m as Overline,
  v as __namedExportsOrder,
  l as default,
};
