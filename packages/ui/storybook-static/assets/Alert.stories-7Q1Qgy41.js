import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({
  variant: e = `info`,
  title: t,
  dismissible: r,
  onDismiss: i,
  children: a,
  className: o,
  ...d
}) {
  return (0, s.jsxDEV)(
    `div`,
    {
      className: n(l({ variant: e }), o),
      role: `alert`,
      ...d,
      children: [
        (0, s.jsxDEV)(
          `span`,
          {
            className: `mt-0.5 shrink-0`,
            'aria-hidden': `true`,
            dangerouslySetInnerHTML: { __html: u[e ?? `info`] ?? `` },
          },
          void 0,
          !1,
          { fileName: c, lineNumber: 49, columnNumber: 7 },
          this,
        ),
        (0, s.jsxDEV)(
          `div`,
          {
            className: `flex-1 min-w-0`,
            children: [
              t &&
                (0, s.jsxDEV)(
                  `p`,
                  { className: `font-semibold text-body-sm`, children: t },
                  void 0,
                  !1,
                  { fileName: c, lineNumber: 55, columnNumber: 19 },
                  this,
                ),
              (0, s.jsxDEV)(
                `div`,
                { className: t ? `mt-1` : ``, children: a },
                void 0,
                !1,
                { fileName: c, lineNumber: 56, columnNumber: 9 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: c, lineNumber: 54, columnNumber: 7 },
          this,
        ),
        r &&
          (0, s.jsxDEV)(
            `button`,
            {
              type: `button`,
              onClick: i,
              className: `shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`,
              'aria-label': `Tutup`,
              children: (0, s.jsxDEV)(
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
                    (0, s.jsxDEV)(
                      `path`,
                      { d: `M18 6 6 18` },
                      void 0,
                      !1,
                      { fileName: c, lineNumber: 76, columnNumber: 13 },
                      this,
                    ),
                    (0, s.jsxDEV)(
                      `path`,
                      { d: `m6 6 12 12` },
                      void 0,
                      !1,
                      { fileName: c, lineNumber: 77, columnNumber: 13 },
                      this,
                    ),
                  ],
                },
                void 0,
                !0,
                { fileName: c, lineNumber: 65, columnNumber: 11 },
                this,
              ),
            },
            void 0,
            !1,
            { fileName: c, lineNumber: 59, columnNumber: 9 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: c, lineNumber: 48, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l,
  u,
  d = e(() => {
    (r(),
      t(),
      (s = a()),
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Alert.tsx`),
      (l = i(`flex items-start gap-3 rounded-xl border px-4 py-3 text-body-sm`, {
        variants: {
          variant: {
            info: `border-info-200 bg-info-50 text-info-800`,
            success: `border-success-200 bg-success-50 text-success-800`,
            warning: `border-warning-200 bg-warning-50 text-warning-800`,
            danger: `border-danger-200 bg-danger-50 text-danger-800`,
          },
        },
        defaultVariants: { variant: `info` },
      })),
      (u = {
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
        danger: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
      }),
      (o.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Alert`,
        props: {
          title: {
            required: !1,
            tsType: { name: `string` },
            description: `Optional title rendered in bold above the message.`,
          },
          dismissible: {
            required: !1,
            tsType: { name: `boolean` },
            description: `If true, renders a dismiss (X) button.`,
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
          variant: { defaultValue: { value: `'info'`, computed: !1 }, required: !1 },
        },
        composes: [`HTMLAttributes`, `VariantProps`],
      }));
  }),
  f,
  p,
  m,
  h,
  g,
  _,
  v,
  y;
e(() => {
  (d(),
    (f = {
      title: `Feedback/Alert`,
      component: o,
      parameters: { layout: `padded` },
      tags: [`autodocs`],
      argTypes: {
        variant: { control: `select`, options: [`info`, `success`, `warning`, `danger`] },
        dismissible: { control: `boolean` },
        title: { control: `text` },
      },
      args: { children: `Operasi berhasil dilakukan.` },
    }),
    (p = {
      args: {
        variant: `info`,
        title: `Informasi`,
        children: `Pembayaran akan diproses dalam 1x24 jam.`,
      },
    }),
    (m = {
      args: {
        variant: `success`,
        title: `Berhasil`,
        children: `Booking layanan berhasil dikonfirmasi.`,
      },
    }),
    (h = {
      args: {
        variant: `warning`,
        title: `Perhatian`,
        children: `Jadwal Anda akan berakhir dalam 2 jam.`,
      },
    }),
    (g = {
      args: {
        variant: `danger`,
        title: `Gagal`,
        children: `Pembayaran tidak dapat diproses. Silakan coba lagi.`,
      },
    }),
    (_ = {
      args: { variant: `info`, dismissible: !0, children: `Klik X untuk menutup alert ini.` },
    }),
    (v = { args: { variant: `success`, children: `Data berhasil disimpan.` } }),
    (p.parameters = {
      ...p.parameters,
      docs: {
        ...p.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'info',
    title: 'Informasi',
    children: 'Pembayaran akan diproses dalam 1x24 jam.'
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
    variant: 'success',
    title: 'Berhasil',
    children: 'Booking layanan berhasil dikonfirmasi.'
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
    variant: 'warning',
    title: 'Perhatian',
    children: 'Jadwal Anda akan berakhir dalam 2 jam.'
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
    variant: 'danger',
    title: 'Gagal',
    children: 'Pembayaran tidak dapat diproses. Silakan coba lagi.'
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
    variant: 'info',
    dismissible: true,
    children: 'Klik X untuk menutup alert ini.'
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
    variant: 'success',
    children: 'Data berhasil disimpan.'
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y = [`Info`, `Success`, `Warning`, `Danger`, `Dismissible`, `WithoutTitle`]));
})();
export {
  g as Danger,
  _ as Dismissible,
  p as Info,
  m as Success,
  h as Warning,
  v as WithoutTitle,
  y as __namedExportsOrder,
  f as default,
};
