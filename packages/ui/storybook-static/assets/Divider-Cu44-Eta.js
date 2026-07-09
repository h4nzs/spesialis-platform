import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ orientation: e = `horizontal`, variant: t, label: r, className: i }) {
  return e === `vertical`
    ? (0, s.jsxDEV)(
        `div`,
        {
          className: n(l({ orientation: e, variant: t }), i),
          'aria-orientation': `vertical`,
          role: `separator`,
        },
        void 0,
        !1,
        { fileName: c, lineNumber: 44, columnNumber: 7 },
        this,
      )
    : r
      ? (0, s.jsxDEV)(
          `div`,
          {
            className: n(`flex w-full items-center gap-3`, i),
            role: `separator`,
            children: [
              (0, s.jsxDEV)(
                `span`,
                { className: n(l({ orientation: e, variant: t }), `flex-1`) },
                void 0,
                !1,
                { fileName: c, lineNumber: 55, columnNumber: 9 },
                this,
              ),
              r &&
                (0, s.jsxDEV)(
                  `span`,
                  { className: `shrink-0 text-caption font-medium text-text-muted`, children: r },
                  void 0,
                  !1,
                  { fileName: c, lineNumber: 57, columnNumber: 11 },
                  this,
                ),
              (0, s.jsxDEV)(
                `span`,
                { className: n(l({ orientation: e, variant: t }), `flex-1`) },
                void 0,
                !1,
                { fileName: c, lineNumber: 59, columnNumber: 9 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: c, lineNumber: 54, columnNumber: 7 },
          this,
        )
      : (0, s.jsxDEV)(
          `div`,
          { className: n(l({ orientation: e, variant: t }), i), role: `separator` },
          void 0,
          !1,
          { fileName: c, lineNumber: 65, columnNumber: 5 },
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
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Divider.tsx`),
      (l = i(`border-border-default`, {
        variants: {
          orientation: {
            horizontal: `w-full border-t`,
            vertical: `h-full min-h-4 border-l self-stretch`,
          },
          variant: { solid: ``, dashed: `border-dashed`, light: `border-neutral-100` },
        },
        defaultVariants: { orientation: `horizontal`, variant: `solid` },
      })),
      (o.__docgenInfo = {
        description: `Visual separator between content sections.

Supports horizontal and vertical orientations. When a \`label\` is
provided on a horizontal divider, it appears centered with lines
on both sides.

@example
<Divider />
<Divider orientation="vertical" />
<Divider label="atau" />`,
        methods: [],
        displayName: `Divider`,
        props: {
          label: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `Optional label rendered in the center of horizontal dividers.`,
          },
          className: { required: !1, tsType: { name: `string` }, description: `` },
          orientation: { defaultValue: { value: `'horizontal'`, computed: !1 }, required: !1 },
        },
        composes: [`VariantProps`],
      }));
  });
export { u as n, o as t };
