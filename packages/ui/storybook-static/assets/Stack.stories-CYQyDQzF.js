import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ direction: e, gap: t, align: r, justify: i, wrap: a, className: o, ...u }) {
  return (0, s.jsxDEV)(
    `div`,
    { className: n(l({ direction: e, gap: t, align: r, justify: i, wrap: a }), o), ...u },
    void 0,
    !1,
    { fileName: c, lineNumber: 69, columnNumber: 5 },
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
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Stack.tsx`),
      (l = i(`flex`, {
        variants: {
          direction: { vertical: `flex-col`, horizontal: `flex-row` },
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
            16: `gap-16`,
          },
          align: {
            start: `items-start`,
            center: `items-center`,
            end: `items-end`,
            stretch: `items-stretch`,
            baseline: `items-baseline`,
          },
          justify: {
            start: `justify-start`,
            center: `justify-center`,
            end: `justify-end`,
            between: `justify-between`,
            around: `justify-around`,
            evenly: `justify-evenly`,
          },
          wrap: { true: `flex-wrap` },
        },
        defaultVariants: { direction: `vertical`, gap: 4 },
      })),
      (o.__docgenInfo = {
        description: `Layout component for stacking children vertically or horizontally
with consistent gap.

@example
<Stack gap={6}>
  <p>Item 1</p>
  <p>Item 2</p>
</Stack>

<Stack direction="horizontal" gap={3} align="center">
  <Avatar />
  <span>Name</span>
</Stack>`,
        methods: [],
        displayName: `Stack`,
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
  y;
e(() => {
  (u(),
    (d = a()),
    (f = `/home/ken/Projects/spesialis/packages/ui/src/components/Stack.stories.tsx`),
    (p = {
      title: `Layout/Stack`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        direction: { control: `select`, options: [`vertical`, `horizontal`] },
        gap: { control: `select`, options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16] },
        align: { control: `select`, options: [`start`, `center`, `end`, `stretch`, `baseline`] },
        justify: {
          control: `select`,
          options: [`start`, `center`, `end`, `between`, `around`, `evenly`],
        },
        wrap: { control: `boolean` },
      },
    }),
    (m = (e) =>
      Array.from({ length: e }, (e, t) =>
        (0, d.jsxDEV)(
          `div`,
          {
            className: `rounded-md bg-primary-100 px-4 py-3 text-body-sm text-primary-700`,
            children: [`Item `, t + 1],
          },
          t,
          !0,
          { fileName: f, lineNumber: 36, columnNumber: 14 },
          void 0,
        ),
      )),
    (h = { args: { direction: `vertical`, gap: 4, children: m(3) } }),
    (g = { args: { direction: `horizontal`, gap: 4, children: m(3) } }),
    (_ = { args: { direction: `vertical`, gap: 1, children: m(3) } }),
    (v = {
      args: {
        direction: `horizontal`,
        gap: 6,
        align: `center`,
        justify: `between`,
        className: `w-96`,
        children: (0, d.jsxDEV)(
          d.Fragment,
          {
            children: [
              (0, d.jsxDEV)(
                `div`,
                { className: `rounded-md bg-primary-100 px-4 py-3 text-body-sm`, children: `Kiri` },
                void 0,
                !1,
                { fileName: f, lineNumber: 68, columnNumber: 9 },
                void 0,
              ),
              (0, d.jsxDEV)(
                `div`,
                {
                  className: `rounded-md bg-success-100 px-4 py-3 text-body-sm`,
                  children: `Kanan`,
                },
                void 0,
                !1,
                { fileName: f, lineNumber: 69, columnNumber: 9 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: f, lineNumber: 67, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (h.parameters = {
      ...h.parameters,
      docs: {
        ...h.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    direction: 'vertical',
    gap: 4,
    children: sampleBoxes(3)
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
    direction: 'horizontal',
    gap: 4,
    children: sampleBoxes(3)
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
    direction: 'vertical',
    gap: 1,
    children: sampleBoxes(3)
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
    direction: 'horizontal',
    gap: 6,
    align: 'center',
    justify: 'between',
    className: 'w-96',
    children: <>
        <div className="rounded-md bg-primary-100 px-4 py-3 text-body-sm">Kiri</div>
        <div className="rounded-md bg-success-100 px-4 py-3 text-body-sm">Kanan</div>
      </>
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y = [`Vertical`, `Horizontal`, `Tight`, `WithAlignment`]));
})();
export {
  g as Horizontal,
  _ as Tight,
  h as Vertical,
  v as WithAlignment,
  y as __namedExportsOrder,
  p as default,
};
