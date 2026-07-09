import { i as e, s as t } from './preload-helper-CT_b8DTk.js';
import { t as n } from './iframe-jHwL9Lyt.js';
import { n as r, t as i } from './cn-B_A6aTpF.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ label: e, error: t, className: n, id: r, ...a }) {
  let [o, u] = (0, s.useState)(!1),
    d = r ?? e?.toLowerCase().replace(/\s+/g, `-`),
    f = t ? `${d}-error` : void 0;
  return (0, c.jsxDEV)(
    `div`,
    {
      className: `flex flex-col gap-1.5`,
      children: [
        e &&
          (0, c.jsxDEV)(
            `label`,
            { htmlFor: d, className: `text-body-sm font-medium text-text-primary`, children: e },
            void 0,
            !1,
            { fileName: l, lineNumber: 29, columnNumber: 9 },
            this,
          ),
        (0, c.jsxDEV)(
          `div`,
          {
            className: `relative`,
            children: [
              (0, c.jsxDEV)(
                `input`,
                {
                  id: d,
                  type: o ? `text` : `password`,
                  'aria-label': e ? void 0 : `Password`,
                  'aria-invalid': t ? !0 : void 0,
                  'aria-describedby': f,
                  className: i(
                    `h-10 w-full rounded-md border bg-bg-surface px-3 pr-10 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500`,
                    t ? `border-danger-500` : `border-border-default`,
                    n,
                  ),
                  autoComplete: `current-password`,
                  ...a,
                },
                void 0,
                !1,
                { fileName: l, lineNumber: 34, columnNumber: 9 },
                this,
              ),
              (0, c.jsxDEV)(
                `button`,
                {
                  type: `button`,
                  onClick: () => u((e) => !e),
                  className: `absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-text-primary transition-colors`,
                  'aria-label': o ? `Sembunyikan password` : `Tampilkan password`,
                  tabIndex: -1,
                  children: o
                    ? (0, c.jsxDEV)(
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
                            (0, c.jsxDEV)(
                              `path`,
                              { d: `M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z` },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 67, columnNumber: 15 },
                              this,
                            ),
                            (0, c.jsxDEV)(
                              `circle`,
                              { cx: `12`, cy: `12`, r: `3` },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 68, columnNumber: 15 },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        { fileName: l, lineNumber: 56, columnNumber: 13 },
                        this,
                      )
                    : (0, c.jsxDEV)(
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
                            (0, c.jsxDEV)(
                              `path`,
                              { d: `M9.88 9.88a3 3 0 1 0 4.24 4.24` },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 82, columnNumber: 15 },
                              this,
                            ),
                            (0, c.jsxDEV)(
                              `path`,
                              {
                                d: `M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68`,
                              },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 83, columnNumber: 15 },
                              this,
                            ),
                            (0, c.jsxDEV)(
                              `path`,
                              {
                                d: `M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61`,
                              },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 84, columnNumber: 15 },
                              this,
                            ),
                            (0, c.jsxDEV)(
                              `line`,
                              { x1: `2`, x2: `22`, y1: `2`, y2: `22` },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 85, columnNumber: 15 },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        { fileName: l, lineNumber: 71, columnNumber: 13 },
                        this,
                      ),
                },
                void 0,
                !1,
                { fileName: l, lineNumber: 48, columnNumber: 9 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: l, lineNumber: 33, columnNumber: 7 },
          this,
        ),
        t &&
          (0, c.jsxDEV)(
            `span`,
            { id: f, className: `text-caption text-danger-500`, role: `alert`, children: t },
            void 0,
            !1,
            { fileName: l, lineNumber: 90, columnNumber: 17 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: l, lineNumber: 27, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l,
  u = e(() => {
    ((s = t(n(), 1)),
      r(),
      (c = a()),
      (l = `/home/ken/Projects/spesialis/packages/ui/src/components/PasswordInput.tsx`),
      (o.__docgenInfo = {
        description: `Password input with show/hide toggle.

@example
<PasswordInput label="Password" value={password} onChange={setPassword} />`,
        methods: [],
        displayName: `PasswordInput`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
        },
        composes: [`Omit`],
      }));
  }),
  d,
  f,
  p,
  m,
  h,
  g;
e(() => {
  (u(),
    (d = {
      title: `Form/PasswordInput`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        label: { control: `text` },
        placeholder: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
      },
      args: { label: `Password`, placeholder: `Masukkan password` },
    }),
    (f = {}),
    (p = { args: { value: `secret123` } }),
    (m = { args: { value: `123`, error: `Password minimal 8 karakter` } }),
    (h = { args: { disabled: !0, value: `secret123` } }),
    (f.parameters = {
      ...f.parameters,
      docs: {
        ...f.parameters?.docs,
        source: { originalSource: `{}`, ...f.parameters?.docs?.source },
      },
    }),
    (p.parameters = {
      ...p.parameters,
      docs: {
        ...p.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    value: 'secret123'
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
    value: '123',
    error: 'Password minimal 8 karakter'
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
    disabled: true,
    value: 'secret123'
  }
}`,
          ...h.parameters?.docs?.source,
        },
      },
    }),
    (g = [`Default`, `WithValue`, `WithError`, `Disabled`]));
})();
export {
  f as Default,
  h as Disabled,
  m as WithError,
  p as WithValue,
  g as __namedExportsOrder,
  d as default,
};
