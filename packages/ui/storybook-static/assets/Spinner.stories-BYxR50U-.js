import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ size: e = `md`, className: t }) {
  return (0, s.jsxDEV)(
    `svg`,
    {
      className: n(l({ size: e }), t),
      viewBox: `0 0 24 24`,
      fill: `none`,
      role: `status`,
      'aria-label': `Memuat…`,
      children: [
        (0, s.jsxDEV)(
          `circle`,
          {
            cx: `12`,
            cy: `12`,
            r: `10`,
            stroke: `currentColor`,
            strokeWidth: `4`,
            className: `opacity-20`,
          },
          void 0,
          !1,
          { fileName: c, lineNumber: 30, columnNumber: 7 },
          this,
        ),
        (0, s.jsxDEV)(
          `path`,
          {
            d: `M12 2a10 10 0 0 1 10 10`,
            stroke: `currentColor`,
            strokeWidth: `4`,
            strokeLinecap: `round`,
          },
          void 0,
          !1,
          { fileName: c, lineNumber: 31, columnNumber: 7 },
          this,
        ),
      ],
    },
    void 0,
    !0,
    { fileName: c, lineNumber: 23, columnNumber: 5 },
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
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Spinner.tsx`),
      (l = i(`animate-spin text-primary-500`, {
        variants: { size: { sm: `h-4 w-4`, md: `h-6 w-6`, lg: `h-8 w-8` } },
        defaultVariants: { size: `md` },
      })),
      (o.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Spinner`,
        props: {
          className: { required: !1, tsType: { name: `string` }, description: `` },
          size: { defaultValue: { value: `'md'`, computed: !1 }, required: !1 },
        },
        composes: [`VariantProps`],
      }));
  }),
  d,
  f,
  p,
  m,
  h;
e(() => {
  (u(),
    (d = {
      title: `Feedback/Spinner`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: { size: { control: `select`, options: [`sm`, `md`, `lg`] } },
    }),
    (f = { args: { size: `sm` } }),
    (p = { args: { size: `md` } }),
    (m = { args: { size: `lg` } }),
    (f.parameters = {
      ...f.parameters,
      docs: {
        ...f.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    size: 'sm'
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
    size: 'md'
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
    size: 'lg'
  }
}`,
          ...m.parameters?.docs?.source,
        },
      },
    }),
    (h = [`Small`, `Medium`, `Large`]));
})();
export { m as Large, p as Medium, f as Small, h as __namedExportsOrder, d as default };
