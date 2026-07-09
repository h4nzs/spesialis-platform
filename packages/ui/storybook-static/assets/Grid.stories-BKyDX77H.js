import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ cols: e, gap: t, className: r, ...i }) {
  return (0, s.jsxDEV)(
    `div`,
    { className: n(l({ cols: e, gap: t }), r), ...i },
    void 0,
    !1,
    { fileName: c, lineNumber: 59, columnNumber: 10 },
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
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Grid.tsx`),
      (l = i(`grid`, {
        variants: {
          cols: {
            1: `grid-cols-1`,
            2: `grid-cols-1 sm:grid-cols-2`,
            3: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`,
            4: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`,
            5: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5`,
            6: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6`,
            12: `grid-cols-12`,
          },
          gap: {
            0: `gap-0`,
            1: `gap-1`,
            2: `gap-2`,
            3: `gap-3`,
            4: `gap-4`,
            5: `gap-5`,
            6: `gap-6`,
            8: `gap-8`,
            10: `gap-10`,
            12: `gap-12`,
          },
        },
        defaultVariants: { cols: 1, gap: 6 },
      })),
      (o.__docgenInfo = {
        description: `Responsive grid layout.

Columns automatically adjust at breakpoints:
- 1 col on mobile
- 2 cols on sm (640px)
- 3-6 cols on lg (1024px+), depending on the \`cols\` prop

@example
<Grid cols={3} gap={6}>
  <ServiceCard />
  <ServiceCard />
  <ServiceCard />
</Grid>

<Grid cols={2} gap={4}>
  <div>Left</div>
  <div>Right</div>
</Grid>`,
        methods: [],
        displayName: `Grid`,
        composes: [`HTMLAttributes`, `VariantProps`],
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
  y,
  b,
  x;
e(() => {
  (u(),
    (d = a()),
    (f = `/home/ken/Projects/spesialis/packages/ui/src/components/Grid.stories.tsx`),
    (p = {
      title: `Layout/Grid`,
      component: o,
      parameters: { layout: `padded` },
      tags: [`autodocs`],
      argTypes: {
        cols: { control: `select`, options: [1, 2, 3, 4, 5, 6, 12] },
        gap: { control: `select`, options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
      },
    }),
    (m = (e) =>
      (0, d.jsxDEV)(
        `div`,
        {
          className: `rounded-lg border border-border-default bg-bg-surface p-4 text-center text-body-sm text-text-secondary`,
          children: e,
        },
        void 0,
        !1,
        { fileName: f, lineNumber: 23, columnNumber: 39 },
        void 0,
      )),
    (h = (e) => Array.from({ length: e }, (e, t) => m(`Item ${t + 1}`))),
    (g = { args: { cols: 1, gap: 4, children: h(3) } }),
    (_ = { args: { cols: 2, gap: 4, children: h(4) } }),
    (v = { args: { cols: 3, gap: 6, children: h(6) } }),
    (y = { args: { cols: 4, gap: 4, children: h(8) } }),
    (b = { args: { cols: 6, gap: 3, children: h(6) } }),
    (g.parameters = {
      ...g.parameters,
      docs: {
        ...g.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    cols: 1,
    gap: 4,
    children: sampleCards(3)
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
    cols: 2,
    gap: 4,
    children: sampleCards(4)
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
    cols: 3,
    gap: 6,
    children: sampleCards(6)
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
    cols: 4,
    gap: 4,
    children: sampleCards(8)
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
    cols: 6,
    gap: 3,
    children: sampleCards(6)
  }
}`,
          ...b.parameters?.docs?.source,
        },
      },
    }),
    (x = [`SingleColumn`, `TwoColumns`, `ThreeColumns`, `FourColumns`, `SixColumns`]));
})();
export {
  y as FourColumns,
  g as SingleColumn,
  b as SixColumns,
  v as ThreeColumns,
  _ as TwoColumns,
  x as __namedExportsOrder,
  p as default,
};
