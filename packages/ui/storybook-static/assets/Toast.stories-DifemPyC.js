import { i as e, s as t } from './preload-helper-CT_b8DTk.js';
import { t as n } from './iframe-jHwL9Lyt.js';
import { n as r, t as i } from './cn-B_A6aTpF.js';
import { n as a, t as o } from './dist--7rmTAu9.js';
import { t as s } from './jsx-dev-runtime-CF1HYdPe.js';
function c({
  variant: e = `info`,
  children: t,
  duration: n = 4e3,
  dismissible: r = !0,
  onDismiss: a,
  className: o,
}) {
  let [s, c] = (0, l.useState)(!1),
    [m, h] = (0, l.useState)(!1);
  ((0, l.useEffect)(() => {
    let e = requestAnimationFrame(() => c(!0));
    return () => cancelAnimationFrame(e);
  }, []),
    (0, l.useEffect)(() => {
      if (!n || n <= 0) return;
      let e = setTimeout(() => {
        (h(!0), setTimeout(() => a?.(), 200));
      }, n);
      return () => clearTimeout(e);
    }, [n, a]));
  function g() {
    (h(!0), setTimeout(() => a?.(), 200));
  }
  return s
    ? (0, u.jsxDEV)(
        `div`,
        {
          className: i(
            f({ variant: e }),
            m ? `opacity-0 translate-y-2` : `opacity-100 translate-y-0`,
            `transition-all duration-200 ease-out`,
            o,
          ),
          role: `status`,
          'aria-live': `polite`,
          children: [
            (0, u.jsxDEV)(
              `span`,
              {
                className: `mt-0.5 shrink-0`,
                'aria-hidden': `true`,
                dangerouslySetInnerHTML: { __html: p[e ?? `info`] ?? `` },
              },
              void 0,
              !1,
              { fileName: d, lineNumber: 87, columnNumber: 7 },
              this,
            ),
            (0, u.jsxDEV)(
              `div`,
              { className: `flex-1 min-w-0`, children: t },
              void 0,
              !1,
              { fileName: d, lineNumber: 92, columnNumber: 7 },
              this,
            ),
            r &&
              (0, u.jsxDEV)(
                `button`,
                {
                  type: `button`,
                  onClick: g,
                  className: `shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100`,
                  'aria-label': `Tutup`,
                  children: (0, u.jsxDEV)(
                    `svg`,
                    {
                      xmlns: `http://www.w3.org/2000/svg`,
                      width: `16`,
                      height: `16`,
                      viewBox: `0 0 24 24`,
                      fill: `none`,
                      stroke: `currentColor`,
                      'stroke-width': `2`,
                      'stroke-linecap': `round`,
                      'stroke-linejoin': `round`,
                      children: [
                        (0, u.jsxDEV)(
                          `path`,
                          { d: `M18 6 6 18` },
                          void 0,
                          !1,
                          { fileName: d, lineNumber: 111, columnNumber: 13 },
                          this,
                        ),
                        (0, u.jsxDEV)(
                          `path`,
                          { d: `m6 6 12 12` },
                          void 0,
                          !1,
                          { fileName: d, lineNumber: 112, columnNumber: 13 },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    !0,
                    { fileName: d, lineNumber: 100, columnNumber: 11 },
                    this,
                  ),
                },
                void 0,
                !1,
                { fileName: d, lineNumber: 94, columnNumber: 9 },
                this,
              ),
          ],
        },
        void 0,
        !0,
        { fileName: d, lineNumber: 77, columnNumber: 5 },
        this,
      )
    : null;
}
var l,
  u,
  d,
  f,
  p,
  m = e(() => {
    ((l = t(n(), 1)),
      a(),
      r(),
      (u = s()),
      (d = `/home/ken/Projects/spesialis/packages/ui/src/components/Toast.tsx`),
      (f = o(
        `pointer-events-auto flex items-start gap-3 rounded-xl border bg-bg-surface px-4 py-3 text-body-sm shadow-lg transition-all duration-200 ease-out`,
        {
          variants: {
            variant: {
              info: `border-info-200`,
              success: `border-success-200`,
              warning: `border-warning-200`,
              danger: `border-danger-200`,
            },
          },
          defaultVariants: { variant: `info` },
        },
      )),
      (p = {
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        danger: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
      }),
      (c.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Toast`,
        props: {
          children: {
            required: !0,
            tsType: { name: `ReactReactNode`, raw: `React.ReactNode` },
            description: `Toast content.`,
          },
          duration: {
            required: !1,
            tsType: { name: `number` },
            description: `Auto-dismiss duration in ms. Set to 0 to disable.`,
            defaultValue: { value: `4000`, computed: !1 },
          },
          dismissible: {
            required: !1,
            tsType: { name: `boolean` },
            description: `If true, renders a dismiss button.`,
            defaultValue: { value: `true`, computed: !1 },
          },
          onDismiss: {
            required: !1,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `() => void`,
              signature: { arguments: [], return: { name: `void` } },
            },
            description: ``,
          },
          className: { required: !1, tsType: { name: `string` }, description: `` },
          variant: { defaultValue: { value: `'info'`, computed: !1 }, required: !1 },
        },
        composes: [`VariantProps`],
      }));
  }),
  h,
  g,
  _,
  v,
  y,
  b,
  x;
e(() => {
  (m(),
    (h = {
      title: `Feedback/Toast`,
      component: c,
      parameters: {
        layout: `centered`,
        docs: {
          description: {
            component:
              'Transient notification with auto-dismiss. Use `showToast()` for imperative usage.',
          },
        },
      },
      tags: [`autodocs`],
      argTypes: {
        variant: { control: `select`, options: [`info`, `success`, `warning`, `danger`] },
        duration: { control: `number` },
        dismissible: { control: `boolean` },
      },
      args: { children: `Notifikasi toast`, duration: 0, dismissible: !0, onDismiss: () => {} },
    }),
    (g = { args: { variant: `info`, children: `Pembayaran sedang diproses.` } }),
    (_ = { args: { variant: `success`, children: `Booking berhasil dibuat!` } }),
    (v = { args: { variant: `warning`, children: `Sisa kuota tinggal 2 kali lagi.` } }),
    (y = { args: { variant: `danger`, children: `Gagal memproses pembayaran.` } }),
    (b = { args: { dismissible: !1, variant: `info`, children: `Toast tanpa tombol tutup.` } }),
    (g.parameters = {
      ...g.parameters,
      docs: {
        ...g.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'info',
    children: 'Pembayaran sedang diproses.'
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
    variant: 'success',
    children: 'Booking berhasil dibuat!'
  }
}`,
          ..._.parameters?.docs?.source,
        },
      },
    }),
    (v.parameters = {
      ...v.parameters,
      docs: {
        ...v.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'warning',
    children: 'Sisa kuota tinggal 2 kali lagi.'
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y.parameters = {
      ...y.parameters,
      docs: {
        ...y.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'danger',
    children: 'Gagal memproses pembayaran.'
  }
}`,
          ...y.parameters?.docs?.source,
        },
      },
    }),
    (b.parameters = {
      ...b.parameters,
      docs: {
        ...b.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    dismissible: false,
    variant: 'info',
    children: 'Toast tanpa tombol tutup.'
  }
}`,
          ...b.parameters?.docs?.source,
        },
      },
    }),
    (x = [`Info`, `Success`, `Warning`, `Danger`, `NonDismissible`]));
})();
export {
  y as Danger,
  g as Info,
  b as NonDismissible,
  _ as Success,
  v as Warning,
  x as __namedExportsOrder,
  h as default,
};
