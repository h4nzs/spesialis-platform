import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
import { n, t as r } from './Badge-BZAEx3df.js';
function i({
  columns: e,
  data: t,
  keyExtractor: n,
  emptyMessage: r = `Tidak ada data`,
  emptyState: i,
  emptyIcon: s,
}) {
  return t.length === 0
    ? i
      ? (0, a.jsxDEV)(
          a.Fragment,
          { children: i },
          void 0,
          !1,
          { fileName: o, lineNumber: 33, columnNumber: 28 },
          this,
        )
      : (0, a.jsxDEV)(
          `div`,
          {
            className: `flex flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface px-6 py-12 text-center`,
            children: [
              (0, a.jsxDEV)(
                `div`,
                {
                  className: `mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-text-muted`,
                  'aria-hidden': `true`,
                  dangerouslySetInnerHTML: {
                    __html:
                      s ??
                      `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
                  },
                },
                void 0,
                !1,
                { fileName: o, lineNumber: 36, columnNumber: 9 },
                this,
              ),
              (0, a.jsxDEV)(
                `p`,
                { className: `text-body text-text-muted`, children: r },
                void 0,
                !1,
                { fileName: o, lineNumber: 41, columnNumber: 9 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: o, lineNumber: 35, columnNumber: 7 },
          this,
        )
    : (0, a.jsxDEV)(
        `div`,
        {
          className: `overflow-x-auto rounded-xl border border-border-default`,
          children: (0, a.jsxDEV)(
            `table`,
            {
              className: `w-full text-sm`,
              children: [
                (0, a.jsxDEV)(
                  `thead`,
                  {
                    children: (0, a.jsxDEV)(
                      `tr`,
                      {
                        className: `border-b border-border-default bg-bg-page`,
                        children: e.map((e) =>
                          (0, a.jsxDEV)(
                            `th`,
                            {
                              className: `px-4 py-3 text-left font-medium text-text-muted ${e.className ?? ``}`,
                              children: e.header,
                            },
                            e.key,
                            !1,
                            { fileName: o, lineNumber: 52, columnNumber: 15 },
                            this,
                          ),
                        ),
                      },
                      void 0,
                      !1,
                      { fileName: o, lineNumber: 50, columnNumber: 11 },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  { fileName: o, lineNumber: 49, columnNumber: 9 },
                  this,
                ),
                (0, a.jsxDEV)(
                  `tbody`,
                  {
                    children: t.map((t) =>
                      (0, a.jsxDEV)(
                        `tr`,
                        {
                          className: `border-b border-border-default last:border-b-0 hover:bg-neutral-100/50`,
                          children: e.map((e) =>
                            (0, a.jsxDEV)(
                              `td`,
                              {
                                className: `px-4 py-3 text-text-primary ${e.className ?? ``}`,
                                children: e.render ? e.render(t) : String(t[e.key] ?? ``),
                              },
                              e.key,
                              !1,
                              { fileName: o, lineNumber: 68, columnNumber: 17 },
                              this,
                            ),
                          ),
                        },
                        n(t),
                        !1,
                        { fileName: o, lineNumber: 63, columnNumber: 13 },
                        this,
                      ),
                    ),
                  },
                  void 0,
                  !1,
                  { fileName: o, lineNumber: 61, columnNumber: 9 },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            { fileName: o, lineNumber: 48, columnNumber: 7 },
            this,
          ),
        },
        void 0,
        !1,
        { fileName: o, lineNumber: 47, columnNumber: 5 },
        this,
      );
}
var a,
  o,
  s = e(() => {
    ((a = t()),
      (o = `/home/ken/Projects/spesialis/packages/ui/src/components/Table.tsx`),
      (i.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Table`,
        props: {
          columns: {
            required: !0,
            tsType: {
              name: `Array`,
              elements: [{ name: `Column`, elements: [{ name: `T` }], raw: `Column<T>` }],
              raw: `Column<T>[]`,
            },
            description: ``,
          },
          data: {
            required: !0,
            tsType: { name: `Array`, elements: [{ name: `T` }], raw: `T[]` },
            description: ``,
          },
          keyExtractor: {
            required: !0,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `(item: T) => string`,
              signature: {
                arguments: [{ type: { name: `T` }, name: `item` }],
                return: { name: `string` },
              },
            },
            description: ``,
          },
          emptyMessage: {
            required: !1,
            tsType: { name: `string` },
            description: ``,
            defaultValue: { value: `'Tidak ada data'`, computed: !1 },
          },
          emptyState: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `If provided, overrides emptyMessage — passes full control of empty-state rendering.`,
          },
          emptyIcon: {
            required: !1,
            tsType: { name: `string` },
            description: `Icon SVG string used inside the default empty-state container.`,
          },
        },
      }));
  }),
  c,
  l,
  u,
  d,
  f,
  p,
  m,
  h,
  g;
e(() => {
  (s(),
    n(),
    (c = t()),
    (l = `/home/ken/Projects/spesialis/packages/ui/src/components/Table.stories.tsx`),
    (u = {
      title: `DataDisplay/Table`,
      component: i,
      parameters: { layout: `padded` },
      tags: [`autodocs`],
      argTypes: { emptyMessage: { control: `text` } },
    }),
    (d = [
      { id: `1`, name: `John Doe`, email: `john@example.com`, role: `Admin`, status: `Aktif` },
      { id: `2`, name: `Jane Smith`, email: `jane@example.com`, role: `Mitra`, status: `Aktif` },
      {
        id: `3`,
        name: `Bob Johnson`,
        email: `bob@example.com`,
        role: `Pelanggan`,
        status: `Nonaktif`,
      },
      { id: `4`, name: `Alice Brown`, email: `alice@example.com`, role: `Mitra`, status: `Aktif` },
      {
        id: `5`,
        name: `Charlie Wilson`,
        email: `charlie@example.com`,
        role: `Admin`,
        status: `Aktif`,
      },
    ]),
    (f = [
      {
        key: `name`,
        header: `Nama`,
        render: (e) =>
          (0, c.jsxDEV)(
            `span`,
            { className: `font-medium text-text-primary`, children: e.name },
            void 0,
            !1,
            { fileName: l, lineNumber: 60, columnNumber: 33 },
            void 0,
          ),
      },
      { key: `email`, header: `Email` },
      { key: `role`, header: `Role` },
      {
        key: `status`,
        header: `Status`,
        render: (e) =>
          (0, c.jsxDEV)(
            r,
            { variant: e.status === `Aktif` ? `success` : `danger`, children: e.status },
            void 0,
            !1,
            { fileName: l, lineNumber: 70, columnNumber: 33 },
            void 0,
          ),
      },
    ]),
    (p = { args: { data: d, columns: f, keyExtractor: (e) => e.id } }),
    (m = {
      args: {
        data: [],
        columns: f,
        keyExtractor: (e) => e.id,
        emptyMessage: `Tidak ada pengguna ditemukan`,
      },
    }),
    (h = { args: { data: [d[0]], columns: f, keyExtractor: (e) => e.id } }),
    (p.parameters = {
      ...p.parameters,
      docs: {
        ...p.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns,
    keyExtractor: (item: SampleUser) => item.id
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
    data: [],
    columns,
    keyExtractor: (item: SampleUser) => item.id,
    emptyMessage: 'Tidak ada pengguna ditemukan'
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
    data: [sampleUsers[0]],
    columns,
    keyExtractor: (item: SampleUser) => item.id
  }
}`,
          ...h.parameters?.docs?.source,
        },
      },
    }),
    (g = [`Default`, `Empty`, `SingleRow`]));
})();
export { p as Default, m as Empty, h as SingleRow, g as __namedExportsOrder, u as default };
