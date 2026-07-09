import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({
  variant: e,
  padding: t,
  title: r,
  description: i,
  action: a,
  children: o,
  className: u,
  ...d
}) {
  return (0, s.jsxDEV)(
    `section`,
    {
      className: n(l({ variant: e, padding: t }), u),
      ...d,
      children: (0, s.jsxDEV)(
        `div`,
        {
          className: `container-page`,
          children: [
            (r || i || a) &&
              (0, s.jsxDEV)(
                `div`,
                {
                  className: `mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between`,
                  children: [
                    (0, s.jsxDEV)(
                      `div`,
                      {
                        children: [
                          r &&
                            (typeof r == `string`
                              ? (0, s.jsxDEV)(
                                  `h2`,
                                  { className: `text-h2 text-text-primary`, children: r },
                                  void 0,
                                  !1,
                                  { fileName: c, lineNumber: 70, columnNumber: 19 },
                                  this,
                                )
                              : r),
                          i &&
                            (typeof i == `string`
                              ? (0, s.jsxDEV)(
                                  `p`,
                                  {
                                    className: `mt-2 max-w-2xl text-body text-text-secondary`,
                                    children: i,
                                  },
                                  void 0,
                                  !1,
                                  { fileName: c, lineNumber: 76, columnNumber: 19 },
                                  this,
                                )
                              : i),
                        ],
                      },
                      void 0,
                      !0,
                      { fileName: c, lineNumber: 67, columnNumber: 13 },
                      this,
                    ),
                    a &&
                      (0, s.jsxDEV)(
                        `div`,
                        { className: `shrink-0`, children: a },
                        void 0,
                        !1,
                        { fileName: c, lineNumber: 81, columnNumber: 24 },
                        this,
                      ),
                  ],
                },
                void 0,
                !0,
                { fileName: c, lineNumber: 66, columnNumber: 11 },
                this,
              ),
            o,
          ],
        },
        void 0,
        !0,
        { fileName: c, lineNumber: 64, columnNumber: 7 },
        this,
      ),
    },
    void 0,
    !1,
    { fileName: c, lineNumber: 63, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l,
  u = e(() => {
    (r(),
      t(),
      (s = a()),
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Section.tsx`),
      (l = i(``, {
        variants: {
          variant: {
            default: `bg-bg-page`,
            alternate: `bg-bg-section`,
            brand: `bg-primary-900 text-white`,
          },
          padding: {
            none: `py-0`,
            sm: `py-8 md:py-12`,
            md: `py-12 md:py-20`,
            lg: `py-16 md:py-24`,
          },
        },
        defaultVariants: { variant: `default`, padding: `md` },
      })),
      (o.__docgenInfo = {
        description: `Page section with consistent vertical spacing.

Provides background variants (\`default\`, \`alternate\`, \`brand\`)
and padding scale. When \`title\` is provided, renders a header
with optional \`description\` and \`action\`.

@example
<Section title="Layanan Kami" description="Pilih layanan yang Anda butuhkan">
  <ServiceGrid />
</Section>

<Section variant="alternate" padding="sm">
  <p>Content</p>
</Section>`,
        methods: [],
        displayName: `Section`,
        props: {
          title: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `Optional heading rendered at the top of the section.`,
          },
          description: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `Optional description rendered below the title.`,
          },
          action: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `Optional action element (button, link) rendered next to the title.`,
          },
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
        },
        composes: [`Omit`, `VariantProps`],
      }));
  }),
  d,
  f,
  p,
  m,
  h,
  g,
  _,
  v;
e(() => {
  (u(),
    (d = a()),
    (f = `/home/ken/Projects/spesialis/packages/ui/src/components/Section.stories.tsx`),
    (p = {
      title: `Layout/Section`,
      component: o,
      parameters: { layout: `fullscreen` },
      tags: [`autodocs`],
      argTypes: {
        variant: { control: `select`, options: [`default`, `alternate`, `brand`] },
        padding: { control: `select`, options: [`none`, `sm`, `md`, `lg`] },
        title: { control: `text` },
        description: { control: `text` },
      },
      args: {
        children: (0, d.jsxDEV)(
          `div`,
          {
            className: `grid grid-cols-3 gap-4`,
            children: Array.from({ length: 3 }, (e, t) =>
              (0, d.jsxDEV)(
                `div`,
                {
                  className: `rounded-lg border border-border-default bg-bg-surface p-4 text-center text-body-sm text-text-secondary`,
                  children: [`Konten `, t + 1],
                },
                t,
                !0,
                { fileName: f, lineNumber: 30, columnNumber: 20 },
                void 0,
              ),
            ),
          },
          void 0,
          !1,
          { fileName: f, lineNumber: 27, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (m = {
      args: {
        title: `Layanan Kami`,
        description: `Pilih layanan profesional yang sesuai dengan kebutuhan Anda.`,
      },
    }),
    (h = { args: { variant: `alternate`, title: `Mengapa Memilih Kami` } }),
    (g = {
      args: {
        variant: `brand`,
        title: `Mulai Sekarang`,
        description: `Daftar dan temukan mitra terbaik untuk kebutuhan Anda.`,
        children: (0, d.jsxDEV)(
          `div`,
          {
            className: `flex justify-center gap-4`,
            children: [
              (0, d.jsxDEV)(
                `span`,
                {
                  className: `inline-flex items-center rounded-lg bg-white/20 px-6 py-3 text-body-sm font-medium text-white`,
                  children: `Daftar Mitra`,
                },
                void 0,
                !1,
                { fileName: f, lineNumber: 56, columnNumber: 9 },
                void 0,
              ),
              (0, d.jsxDEV)(
                `span`,
                {
                  className: `inline-flex items-center rounded-lg bg-white px-6 py-3 text-body-sm font-medium text-primary`,
                  children: `Hubungi Kami`,
                },
                void 0,
                !1,
                { fileName: f, lineNumber: 57, columnNumber: 9 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: f, lineNumber: 55, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (_ = {
      args: {
        children: (0, d.jsxDEV)(
          `div`,
          {
            className: `rounded-xl border border-border-default bg-bg-surface p-6 text-center text-body-sm text-text-secondary`,
            children: `Section tanpa title atau description.`,
          },
          void 0,
          !1,
          { fileName: f, lineNumber: 63, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (m.parameters = {
      ...m.parameters,
      docs: {
        ...m.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    title: 'Layanan Kami',
    description: 'Pilih layanan profesional yang sesuai dengan kebutuhan Anda.'
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
    variant: 'alternate',
    title: 'Mengapa Memilih Kami'
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
    variant: 'brand',
    title: 'Mulai Sekarang',
    description: 'Daftar dan temukan mitra terbaik untuk kebutuhan Anda.',
    children: <div className="flex justify-center gap-4">
        <span className="inline-flex items-center rounded-lg bg-white/20 px-6 py-3 text-body-sm font-medium text-white">Daftar Mitra</span>
        <span className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-body-sm font-medium text-primary">Hubungi Kami</span>
      </div>
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
  args: {
    children: <div className="rounded-xl border border-border-default bg-bg-surface p-6 text-center text-body-sm text-text-secondary">
        Section tanpa title atau description.
      </div>
  }
}`,
          ..._.parameters?.docs?.source,
        },
      },
    }),
    (v = [`Default`, `Alternate`, `Brand`, `WithoutHeader`]));
})();
export {
  h as Alternate,
  g as Brand,
  m as Default,
  _ as WithoutHeader,
  v as __namedExportsOrder,
  p as default,
};
