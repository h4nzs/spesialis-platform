import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ direction: e, align: t, justify: r, gap: i, wrap: a, className: o, ...u }) {
  return (0, s.jsxDEV)(
    `div`,
    { className: n(l({ direction: e, align: t, justify: r, gap: i, wrap: a }), o), ...u },
    void 0,
    !1,
    { fileName: c, lineNumber: 74, columnNumber: 5 },
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
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Flex.tsx`),
      (l = i(`flex`, {
        variants: {
          direction: {
            row: `flex-row`,
            'row-reverse': `flex-row-reverse`,
            col: `flex-col`,
            'col-reverse': `flex-col-reverse`,
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
          wrap: { true: `flex-wrap`, 'wrap-reverse': `flex-wrap-reverse`, nowrap: `flex-nowrap` },
        },
        defaultVariants: { direction: `row`, align: `center`, gap: 4 },
      })),
      (o.__docgenInfo = {
        description: `Flexible container with alignment, direction, gap, and wrap control.

A thin wrapper over CSS Flexbox using CVA variants.

@example
<Flex justify="between" align="center">
  <h2>Title</h2>
  <Button>Action</Button>
</Flex>

<Flex gap={2} wrap="true">
  <Badge>Tag 1</Badge>
  <Badge>Tag 2</Badge>
</Flex>`,
        methods: [],
        displayName: `Flex`,
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
    (f = `/home/ken/Projects/spesialis/packages/ui/src/components/Flex.stories.tsx`),
    (p = {
      title: `Layout/Flex`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        direction: { control: `select`, options: [`row`, `row-reverse`, `col`, `col-reverse`] },
        align: { control: `select`, options: [`start`, `center`, `end`, `stretch`, `baseline`] },
        justify: {
          control: `select`,
          options: [`start`, `center`, `end`, `between`, `around`, `evenly`],
        },
        gap: { control: `select`, options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
        wrap: { control: `select`, options: [`true`, `wrap-reverse`, `nowrap`] },
      },
    }),
    (m = (e, t) =>
      (0, d.jsxDEV)(
        `div`,
        { className: `rounded-md ${t} px-4 py-3 text-body-sm`, children: e },
        void 0,
        !1,
        { fileName: f, lineNumber: 35, columnNumber: 53 },
        void 0,
      )),
    (h = {
      args: {
        direction: `row`,
        gap: 4,
        children: (0, d.jsxDEV)(
          d.Fragment,
          {
            children: [
              m(`Satu`, `bg-primary-100 text-primary-700`),
              m(`Dua`, `bg-success-100 text-success-700`),
              m(`Tiga`, `bg-warning-100 text-warning-700`),
            ],
          },
          void 0,
          !0,
          { fileName: f, lineNumber: 40, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (g = {
      args: {
        direction: `col`,
        gap: 3,
        children: (0, d.jsxDEV)(
          d.Fragment,
          {
            children: [
              m(`Atas`, `bg-primary-100 text-primary-700`),
              m(`Tengah`, `bg-success-100 text-success-700`),
              m(`Bawah`, `bg-warning-100 text-warning-700`),
            ],
          },
          void 0,
          !0,
          { fileName: f, lineNumber: 51, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (_ = {
      args: {
        direction: `row`,
        justify: `between`,
        className: `w-96`,
        children: (0, d.jsxDEV)(
          d.Fragment,
          {
            children: [
              m(`Kiri`, `bg-primary-100 text-primary-700`),
              m(`Kanan`, `bg-warning-100 text-warning-700`),
            ],
          },
          void 0,
          !0,
          { fileName: f, lineNumber: 63, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (v = {
      args: {
        direction: `row`,
        gap: 2,
        wrap: `true`,
        className: `w-48`,
        children: (0, d.jsxDEV)(
          d.Fragment,
          {
            children: [
              m(`Tag 1`, `bg-info-100 text-info-700`),
              m(`Tag 2`, `bg-info-100 text-info-700`),
              m(`Tag 3`, `bg-info-100 text-info-700`),
              m(`Tag Panjang`, `bg-info-100 text-info-700`),
              m(`Tag 5`, `bg-info-100 text-info-700`),
              m(`Tag 6`, `bg-info-100 text-info-700`),
            ],
          },
          void 0,
          !0,
          { fileName: f, lineNumber: 75, columnNumber: 15 },
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
    direction: 'row',
    gap: 4,
    children: <>
        {sampleBox('Satu', 'bg-primary-100 text-primary-700')}
        {sampleBox('Dua', 'bg-success-100 text-success-700')}
        {sampleBox('Tiga', 'bg-warning-100 text-warning-700')}
      </>
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
    direction: 'col',
    gap: 3,
    children: <>
        {sampleBox('Atas', 'bg-primary-100 text-primary-700')}
        {sampleBox('Tengah', 'bg-success-100 text-success-700')}
        {sampleBox('Bawah', 'bg-warning-100 text-warning-700')}
      </>
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
    direction: 'row',
    justify: 'between',
    className: 'w-96',
    children: <>
        {sampleBox('Kiri', 'bg-primary-100 text-primary-700')}
        {sampleBox('Kanan', 'bg-warning-100 text-warning-700')}
      </>
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
    direction: 'row',
    gap: 2,
    wrap: 'true',
    className: 'w-48',
    children: <>
        {sampleBox('Tag 1', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 2', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 3', 'bg-info-100 text-info-700')}
        {sampleBox('Tag Panjang', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 5', 'bg-info-100 text-info-700')}
        {sampleBox('Tag 6', 'bg-info-100 text-info-700')}
      </>
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y = [`Row`, `Column`, `SpaceBetween`, `Wrapped`]));
})();
export {
  g as Column,
  h as Row,
  _ as SpaceBetween,
  v as Wrapped,
  y as __namedExportsOrder,
  p as default,
};
