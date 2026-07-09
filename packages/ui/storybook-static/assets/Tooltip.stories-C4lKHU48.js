import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ children: e, content: t, position: r, className: i }) {
  return (0, s.jsxDEV)(
    `span`,
    {
      className: n(`group relative inline-flex`, i),
      children: [
        e,
        (0, s.jsxDEV)(
          `span`,
          { role: `tooltip`, className: n(l({ position: r })), children: t },
          void 0,
          !1,
          { fileName: c, lineNumber: 51, columnNumber: 7 },
          this,
        ),
      ],
    },
    void 0,
    !0,
    { fileName: c, lineNumber: 49, columnNumber: 5 },
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
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Tooltip.tsx`),
      (l = i(
        `pointer-events-none absolute z-tooltip whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-caption text-white opacity-0 shadow-sm transition-all duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100`,
        {
          variants: {
            position: {
              top: `bottom-full left-1/2 -translate-x-1/2 -translate-y-1.5 mb-1.5 group-hover:-translate-y-0 group-focus-within:-translate-y-0`,
              bottom: `top-full left-1/2 -translate-x-1/2 translate-y-1.5 mt-1.5 group-hover:translate-y-0 group-focus-within:translate-y-0`,
              left: `right-full top-1/2 -translate-y-1/2 -translate-x-1.5 mr-1.5 group-hover:-translate-x-0 group-focus-within:-translate-x-0`,
              right: `left-full top-1/2 -translate-y-1/2 translate-x-1.5 ml-1.5 group-hover:translate-x-0 group-focus-within:translate-x-0`,
            },
          },
          defaultVariants: { position: `top` },
        },
      )),
      (o.__docgenInfo = {
        description: `CSS-only tooltip that appears on hover and focus.

Uses a wrapping \`<span>\` with \`group\` class so no JavaScript
is required. Respects \`prefers-reduced-motion\` via global CSS.

@example
<Tooltip content="Hapus booking">
  <button>X</button>
</Tooltip>

<Tooltip content="Detail" position="right">
  <button>...</button>
</Tooltip>`,
        methods: [],
        displayName: `Tooltip`,
        props: {
          children: {
            required: !0,
            tsType: { name: `ReactNode` },
            description: `The element that triggers the tooltip on hover/focus.`,
          },
          content: {
            required: !0,
            tsType: { name: `string` },
            description: `Tooltip content text.`,
          },
          className: { required: !1, tsType: { name: `string` }, description: `` },
        },
        composes: [`VariantProps`],
      }));
  }),
  d,
  f,
  p,
  m,
  h,
  g,
  _,
  v,
  y;
e(() => {
  (u(),
    (d = a()),
    (f = `/home/ken/Projects/spesialis/packages/ui/src/components/Tooltip.stories.tsx`),
    (p = {
      title: `DataDisplay/Tooltip`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        position: { control: `select`, options: [`top`, `bottom`, `left`, `right`] },
        content: { control: `text` },
      },
      args: {
        content: `Informasi detail`,
        children: (0, d.jsxDEV)(
          `span`,
          {
            className: `inline-flex rounded-md bg-primary-100 px-4 py-2 text-body-sm text-primary-700 cursor-default`,
            children: `Hover saya`,
          },
          void 0,
          !1,
          { fileName: f, lineNumber: 21, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (m = { args: { position: `top`, content: `Tooltip di atas` } }),
    (h = { args: { position: `bottom`, content: `Tooltip di bawah` } }),
    (g = { args: { position: `left`, content: `Tooltip di kiri` } }),
    (_ = { args: { position: `right`, content: `Tooltip di kanan` } }),
    (v = {
      args: {
        position: `top`,
        content: `Ini adalah tooltip dengan teks yang lebih panjang untuk demonstrasi`,
      },
    }),
    (m.parameters = {
      ...m.parameters,
      docs: {
        ...m.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    position: 'top',
    content: 'Tooltip di atas'
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
    position: 'bottom',
    content: 'Tooltip di bawah'
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
    position: 'left',
    content: 'Tooltip di kiri'
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
    position: 'right',
    content: 'Tooltip di kanan'
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
    position: 'top',
    content: 'Ini adalah tooltip dengan teks yang lebih panjang untuk demonstrasi'
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y = [`Top`, `Bottom`, `Left`, `Right`, `LongText`]));
})();
export {
  h as Bottom,
  g as Left,
  v as LongText,
  _ as Right,
  m as Top,
  y as __namedExportsOrder,
  p as default,
};
