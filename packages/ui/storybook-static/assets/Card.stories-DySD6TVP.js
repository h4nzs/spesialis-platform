import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ children: e, padding: t = `md`, className: n = ``, ...o }) {
  return (0, r.jsxDEV)(
    `div`,
    {
      className: `rounded-xl border border-border-default bg-bg-surface shadow-xs ${a[t]} ${n}`,
      ...o,
      children: e,
    },
    void 0,
    !1,
    { fileName: i, lineNumber: 16, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a,
  o = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Card.tsx`),
      (a = { sm: `p-3`, md: `p-4`, lg: `p-6` }),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Card`,
        props: {
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
          padding: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'sm' | 'md' | 'lg'`,
              elements: [
                { name: `literal`, value: `'sm'` },
                { name: `literal`, value: `'md'` },
                { name: `literal`, value: `'lg'` },
              ],
            },
            description: ``,
            defaultValue: { value: `'md'`, computed: !1 },
          },
          className: { defaultValue: { value: `''`, computed: !1 }, required: !1 },
        },
        composes: [`HTMLAttributes`],
      }));
  }),
  s,
  c,
  l,
  u,
  d,
  f,
  p,
  m;
e(() => {
  (o(),
    (s = t()),
    (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Card.stories.tsx`),
    (l = {
      title: `Layout/Card`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: { padding: { control: `select`, options: [`sm`, `md`, `lg`] } },
      args: { children: `Card content`, className: `w-80` },
    }),
    (u = {}),
    (d = { args: { padding: `sm`, children: `Compact card with small padding.` } }),
    (f = { args: { padding: `lg`, children: `Spacious card with large padding.` } }),
    (p = {
      args: {
        children: (0, s.jsxDEV)(
          `div`,
          {
            className: `space-y-3`,
            children: [
              (0, s.jsxDEV)(
                `h3`,
                { className: `text-h5 text-text-primary`, children: `Judul Card` },
                void 0,
                !1,
                { fileName: c, lineNumber: 39, columnNumber: 9 },
                void 0,
              ),
              (0, s.jsxDEV)(
                `p`,
                {
                  className: `text-body-sm text-text-secondary`,
                  children: `Deskripsi card dengan konten yang lebih kompleks.`,
                },
                void 0,
                !1,
                { fileName: c, lineNumber: 40, columnNumber: 9 },
                void 0,
              ),
              (0, s.jsxDEV)(
                `div`,
                {
                  className: `flex gap-2`,
                  children: [
                    (0, s.jsxDEV)(
                      `span`,
                      {
                        className: `inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-caption text-primary-700`,
                        children: `Label 1`,
                      },
                      void 0,
                      !1,
                      { fileName: c, lineNumber: 42, columnNumber: 11 },
                      void 0,
                    ),
                    (0, s.jsxDEV)(
                      `span`,
                      {
                        className: `inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-caption text-success-700`,
                        children: `Label 2`,
                      },
                      void 0,
                      !1,
                      { fileName: c, lineNumber: 43, columnNumber: 11 },
                      void 0,
                    ),
                  ],
                },
                void 0,
                !0,
                { fileName: c, lineNumber: 41, columnNumber: 9 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: c, lineNumber: 38, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (u.parameters = {
      ...u.parameters,
      docs: {
        ...u.parameters?.docs,
        source: { originalSource: `{}`, ...u.parameters?.docs?.source },
      },
    }),
    (d.parameters = {
      ...d.parameters,
      docs: {
        ...d.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    padding: 'sm',
    children: 'Compact card with small padding.'
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
    padding: 'lg',
    children: 'Spacious card with large padding.'
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
    children: <div className="space-y-3">
        <h3 className="text-h5 text-text-primary">Judul Card</h3>
        <p className="text-body-sm text-text-secondary">Deskripsi card dengan konten yang lebih kompleks.</p>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-caption text-primary-700">Label 1</span>
          <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-caption text-success-700">Label 2</span>
        </div>
      </div>
  }
}`,
          ...p.parameters?.docs?.source,
        },
      },
    }),
    (m = [`Default`, `SmallPadding`, `LargePadding`, `WithCustomContent`]));
})();
export {
  u as Default,
  f as LargePadding,
  d as SmallPadding,
  p as WithCustomContent,
  m as __namedExportsOrder,
  l as default,
};
