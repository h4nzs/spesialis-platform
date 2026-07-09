import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
function i({ label: e, error: t, clearable: r, onClear: i, className: s, id: c, value: l, ...u }) {
  let d = c ?? e?.toLowerCase().replace(/\s+/g, `-`),
    f = t ? `${d}-error` : void 0,
    p = typeof l == `string` && l.length > 0;
  return (0, a.jsxDEV)(
    `div`,
    {
      className: `flex flex-col gap-1.5`,
      children: [
        e &&
          (0, a.jsxDEV)(
            `label`,
            { htmlFor: d, className: `text-body-sm font-medium text-text-primary`, children: e },
            void 0,
            !1,
            { fileName: o, lineNumber: 39, columnNumber: 9 },
            this,
          ),
        (0, a.jsxDEV)(
          `div`,
          {
            className: `relative`,
            children: [
              (0, a.jsxDEV)(
                `div`,
                {
                  className: `pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted`,
                  'aria-hidden': `true`,
                  children: (0, a.jsxDEV)(
                    `svg`,
                    {
                      xmlns: `http://www.w3.org/2000/svg`,
                      width: `18`,
                      height: `18`,
                      viewBox: `0 0 24 24`,
                      fill: `none`,
                      stroke: `currentColor`,
                      strokeWidth: `2`,
                      strokeLinecap: `round`,
                      strokeLinejoin: `round`,
                      children: [
                        (0, a.jsxDEV)(
                          `circle`,
                          { cx: `11`, cy: `11`, r: `8` },
                          void 0,
                          !1,
                          { fileName: o, lineNumber: 60, columnNumber: 13 },
                          this,
                        ),
                        (0, a.jsxDEV)(
                          `path`,
                          { d: `m21 21-4.3-4.3` },
                          void 0,
                          !1,
                          { fileName: o, lineNumber: 61, columnNumber: 13 },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    !0,
                    { fileName: o, lineNumber: 49, columnNumber: 11 },
                    this,
                  ),
                },
                void 0,
                !1,
                { fileName: o, lineNumber: 45, columnNumber: 9 },
                this,
              ),
              (0, a.jsxDEV)(
                `input`,
                {
                  id: d,
                  type: `search`,
                  value: l,
                  'aria-label': e ? void 0 : u.placeholder || `Cari`,
                  'aria-invalid': t ? !0 : void 0,
                  'aria-describedby': f,
                  className: n(
                    `h-10 w-full rounded-md border bg-bg-surface pl-10 pr-9 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 [&::-webkit-search-cancel-button]:hidden`,
                    t ? `border-danger-500` : `border-border-default`,
                    s,
                  ),
                  ...u,
                },
                void 0,
                !1,
                { fileName: o, lineNumber: 65, columnNumber: 9 },
                this,
              ),
              r &&
                p &&
                (0, a.jsxDEV)(
                  `button`,
                  {
                    type: `button`,
                    onClick: i,
                    className: `absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-text-primary transition-colors`,
                    'aria-label': `Hapus pencarian`,
                    tabIndex: -1,
                    children: (0, a.jsxDEV)(
                      `svg`,
                      {
                        xmlns: `http://www.w3.org/2000/svg`,
                        width: `16`,
                        height: `16`,
                        viewBox: `0 0 24 24`,
                        fill: `none`,
                        stroke: `currentColor`,
                        strokeWidth: `2`,
                        strokeLinecap: `round`,
                        strokeLinejoin: `round`,
                        children: [
                          (0, a.jsxDEV)(
                            `path`,
                            { d: `M18 6 6 18` },
                            void 0,
                            !1,
                            { fileName: o, lineNumber: 100, columnNumber: 15 },
                            this,
                          ),
                          (0, a.jsxDEV)(
                            `path`,
                            { d: `m6 6 12 12` },
                            void 0,
                            !1,
                            { fileName: o, lineNumber: 101, columnNumber: 15 },
                            this,
                          ),
                        ],
                      },
                      void 0,
                      !0,
                      { fileName: o, lineNumber: 89, columnNumber: 13 },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  { fileName: o, lineNumber: 82, columnNumber: 11 },
                  this,
                ),
            ],
          },
          void 0,
          !0,
          { fileName: o, lineNumber: 43, columnNumber: 7 },
          this,
        ),
        t &&
          (0, a.jsxDEV)(
            `span`,
            { id: f, className: `text-caption text-danger-500`, role: `alert`, children: t },
            void 0,
            !1,
            { fileName: o, lineNumber: 106, columnNumber: 17 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: o, lineNumber: 37, columnNumber: 5 },
    this,
  );
}
var a,
  o,
  s = e(() => {
    (t(),
      (a = r()),
      (o = `/home/ken/Projects/spesialis/packages/ui/src/components/SearchInput.tsx`),
      (i.__docgenInfo = {
        description: `Search input with magnifying glass icon.

@example
<SearchInput placeholder="Cari layanan..." />
<SearchInput clearable onClear={() => setQuery('')} />`,
        methods: [],
        displayName: `SearchInput`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
          clearable: {
            required: !1,
            tsType: { name: `boolean` },
            description:
              'If true, shows a clear (X) button when the input has a value.\nRequires `onClear` to be provided.',
          },
          onClear: {
            required: !1,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `() => void`,
              signature: { arguments: [], return: { name: `void` } },
            },
            description: ``,
          },
        },
        composes: [`Omit`],
      }));
  }),
  c,
  l,
  u,
  d,
  f,
  p,
  m;
e(() => {
  (s(),
    (c = {
      title: `Form/SearchInput`,
      component: i,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        placeholder: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
        clearable: { control: `boolean` },
        label: { control: `text` },
      },
      args: { placeholder: `Cari layanan...` },
    }),
    (l = {}),
    (u = { args: { value: `kebersihan`, clearable: !0, onClear: () => {} } }),
    (d = { args: { clearable: !0, value: `AC`, onClear: () => {} } }),
    (f = { args: { error: `Pencarian terlalu pendek` } }),
    (p = { args: { label: `Cari Layanan` } }),
    (l.parameters = {
      ...l.parameters,
      docs: {
        ...l.parameters?.docs,
        source: { originalSource: `{}`, ...l.parameters?.docs?.source },
      },
    }),
    (u.parameters = {
      ...u.parameters,
      docs: {
        ...u.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    value: 'kebersihan',
    clearable: true,
    onClear: () => {}
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
    clearable: true,
    value: 'AC',
    onClear: () => {}
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
    error: 'Pencarian terlalu pendek'
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
    label: 'Cari Layanan'
  }
}`,
          ...p.parameters?.docs?.source,
        },
      },
    }),
    (m = [`Default`, `WithValue`, `Clearable`, `WithError`, `WithLabel`]));
})();
export {
  d as Clearable,
  l as Default,
  f as WithError,
  p as WithLabel,
  u as WithValue,
  m as __namedExportsOrder,
  c as default,
};
