import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
import { i as n, n as r } from './Typography-BCu9oHDA.js';
var i, a, o, s, c, l, u, d, f, p, m;
e(() => {
  (n(),
    (i = t()),
    (a = `/home/ken/Projects/spesialis/packages/ui/src/components/Heading.stories.tsx`),
    (o = {
      title: `Typography/Heading`,
      component: r,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: { level: { control: `select`, options: [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`] } },
      args: { children: `Judul Halaman` },
    }),
    (s = { args: { level: `h1`, children: `Heading 1 — Judul Utama` } }),
    (c = { args: { level: `h2`, children: `Heading 2 — Sub Judul` } }),
    (l = { args: { level: `h3`, children: `Heading 3 — Section Title` } }),
    (u = { args: { level: `h4`, children: `Heading 4 — Card Title` } }),
    (d = { args: { level: `h5`, children: `Heading 5 — Sub Section` } }),
    (f = { args: { level: `h6`, children: `Heading 6 — Label` } }),
    (p = {
      name: `Full Scale`,
      parameters: { layout: `padded` },
      render: () =>
        (0, i.jsxDEV)(
          `div`,
          {
            className: `space-y-4`,
            children: [
              (0, i.jsxDEV)(
                r,
                { level: `h1`, children: `H1 — Layanan Profesional` },
                void 0,
                !1,
                { fileName: a, lineNumber: 64, columnNumber: 7 },
                void 0,
              ),
              (0, i.jsxDEV)(
                r,
                { level: `h2`, children: `H2 — Mengapa Memilih Kami` },
                void 0,
                !1,
                { fileName: a, lineNumber: 65, columnNumber: 7 },
                void 0,
              ),
              (0, i.jsxDEV)(
                r,
                { level: `h3`, children: `H3 — Keunggulan Kami` },
                void 0,
                !1,
                { fileName: a, lineNumber: 66, columnNumber: 7 },
                void 0,
              ),
              (0, i.jsxDEV)(
                r,
                { level: `h4`, children: `H4 — Testimoni Pelanggan` },
                void 0,
                !1,
                { fileName: a, lineNumber: 67, columnNumber: 7 },
                void 0,
              ),
              (0, i.jsxDEV)(
                r,
                { level: `h5`, children: `H5 — Kontak Kami` },
                void 0,
                !1,
                { fileName: a, lineNumber: 68, columnNumber: 7 },
                void 0,
              ),
              (0, i.jsxDEV)(
                r,
                { level: `h6`, children: `H6 — Label Section` },
                void 0,
                !1,
                { fileName: a, lineNumber: 69, columnNumber: 7 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: a, lineNumber: 63, columnNumber: 17 },
          void 0,
        ),
    }),
    (s.parameters = {
      ...s.parameters,
      docs: {
        ...s.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    level: 'h1',
    children: 'Heading 1 — Judul Utama'
  }
}`,
          ...s.parameters?.docs?.source,
        },
      },
    }),
    (c.parameters = {
      ...c.parameters,
      docs: {
        ...c.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    level: 'h2',
    children: 'Heading 2 — Sub Judul'
  }
}`,
          ...c.parameters?.docs?.source,
        },
      },
    }),
    (l.parameters = {
      ...l.parameters,
      docs: {
        ...l.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    level: 'h3',
    children: 'Heading 3 — Section Title'
  }
}`,
          ...l.parameters?.docs?.source,
        },
      },
    }),
    (u.parameters = {
      ...u.parameters,
      docs: {
        ...u.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    level: 'h4',
    children: 'Heading 4 — Card Title'
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
  args: {
    level: 'h5',
    children: 'Heading 5 — Sub Section'
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
  args: {
    level: 'h6',
    children: 'Heading 6 — Label'
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
  name: 'Full Scale',
  parameters: {
    layout: 'padded'
  },
  render: () => <div className="space-y-4">
      <Heading level="h1">H1 — Layanan Profesional</Heading>
      <Heading level="h2">H2 — Mengapa Memilih Kami</Heading>
      <Heading level="h3">H3 — Keunggulan Kami</Heading>
      <Heading level="h4">H4 — Testimoni Pelanggan</Heading>
      <Heading level="h5">H5 — Kontak Kami</Heading>
      <Heading level="h6">H6 — Label Section</Heading>
    </div>
}`,
          ...p.parameters?.docs?.source,
        },
      },
    }),
    (m = [`H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `FullScale`]));
})();
export {
  p as FullScale,
  s as H1,
  c as H2,
  l as H3,
  u as H4,
  d as H5,
  f as H6,
  m as __namedExportsOrder,
  o as default,
};
