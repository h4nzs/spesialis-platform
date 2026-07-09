import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
import { n, t as r } from './Button-DyXtvLMV.js';
var i, a, o, s, c, l, u, d, f, p, m, h, g;
e(() => {
  (n(),
    (i = t()),
    (a = `/home/ken/Projects/spesialis/packages/ui/src/components/Button.stories.tsx`),
    (o = {
      title: `Primitives/Button`,
      component: r,
      parameters: {
        layout: `centered`,
        docs: {
          description: {
            component: `Primary action button with 5 variants and 3 sizes. Used across the entire platform for CTAs, form submissions, and toolbar actions.`,
          },
        },
      },
      tags: [`autodocs`],
      argTypes: {
        variant: {
          control: `select`,
          options: [`primary`, `secondary`, `outline`, `ghost`, `danger`],
          description: `Visual style of the button`,
        },
        size: { control: `select`, options: [`sm`, `md`, `lg`], description: `Button size` },
        disabled: { control: `boolean`, description: `Disables the button` },
        children: { control: `text`, description: `Button content` },
      },
      args: { children: `Simpan` },
    }),
    (s = { args: { variant: `primary`, children: `Simpan` } }),
    (c = { args: { variant: `secondary`, children: `Lihat Detail` } }),
    (l = { args: { variant: `outline`, children: `Batal` } }),
    (u = { args: { variant: `ghost`, children: `Hapus` } }),
    (d = { args: { variant: `danger`, children: `Hapus Akun` } }),
    (f = { args: { size: `sm`, children: `Edit` } }),
    (p = { args: { size: `lg`, children: `Booking Sekarang` } }),
    (m = { args: { disabled: !0, children: `Simpan` } }),
    (h = {
      args: {
        children: (0, i.jsxDEV)(
          i.Fragment,
          {
            children: [
              (0, i.jsxDEV)(
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
                    (0, i.jsxDEV)(
                      `path`,
                      { d: `M5 12h14` },
                      void 0,
                      !1,
                      { fileName: a, lineNumber: 92, columnNumber: 187 },
                      void 0,
                    ),
                    (0, i.jsxDEV)(
                      `path`,
                      { d: `M12 5v14` },
                      void 0,
                      !1,
                      { fileName: a, lineNumber: 92, columnNumber: 208 },
                      void 0,
                    ),
                  ],
                },
                void 0,
                !0,
                { fileName: a, lineNumber: 92, columnNumber: 9 },
                void 0,
              ),
              `Tambah Baru`,
            ],
          },
          void 0,
          !0,
          { fileName: a, lineNumber: 91, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (s.parameters = {
      ...s.parameters,
      docs: {
        ...s.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'primary',
    children: 'Simpan'
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
    variant: 'secondary',
    children: 'Lihat Detail'
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
    variant: 'outline',
    children: 'Batal'
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
    variant: 'ghost',
    children: 'Hapus'
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
    variant: 'danger',
    children: 'Hapus Akun'
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
    size: 'sm',
    children: 'Edit'
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
    size: 'lg',
    children: 'Booking Sekarang'
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
    disabled: true,
    children: 'Simpan'
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
    children: <>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
        Tambah Baru
      </>
  }
}`,
          ...h.parameters?.docs?.source,
        },
      },
    }),
    (g = [
      `Primary`,
      `Secondary`,
      `Outline`,
      `Ghost`,
      `Danger`,
      `Small`,
      `Large`,
      `Disabled`,
      `WithIcon`,
    ]));
})();
export {
  d as Danger,
  m as Disabled,
  u as Ghost,
  p as Large,
  l as Outline,
  s as Primary,
  c as Secondary,
  f as Small,
  h as WithIcon,
  g as __namedExportsOrder,
  o as default,
};
