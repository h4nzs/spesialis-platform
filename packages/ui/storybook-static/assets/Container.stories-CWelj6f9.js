import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ children: e, className: t = ``, ...n }) {
  return (0, r.jsxDEV)(
    `div`,
    { className: `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${t}`, ...n, children: e },
    void 0,
    !1,
    { fileName: i, lineNumber: 5, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Container.tsx`),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Container`,
        props: { className: { defaultValue: { value: `''`, computed: !1 }, required: !1 } },
      }));
  }),
  o,
  s,
  c,
  l,
  u;
e(() => {
  (a(),
    (o = t()),
    (s = `/home/ken/Projects/spesialis/packages/ui/src/components/Container.stories.tsx`),
    (c = {
      title: `Layout/Container`,
      component: n,
      parameters: { layout: `fullscreen` },
      tags: [`autodocs`],
      args: {
        children: (0, o.jsxDEV)(
          `div`,
          {
            className: `rounded-lg border border-dashed border-primary-300 bg-primary-50 p-8 text-center text-body-sm text-primary-700`,
            children: `Container content — this div is constrained to max-w-7xl with responsive padding.`,
          },
          void 0,
          !1,
          { fileName: s, lineNumber: 11, columnNumber: 15 },
          void 0,
        ),
      },
    }),
    (l = {}),
    (l.parameters = {
      ...l.parameters,
      docs: {
        ...l.parameters?.docs,
        source: { originalSource: `{}`, ...l.parameters?.docs?.source },
      },
    }),
    (u = [`Default`]));
})();
export { l as Default, u as __namedExportsOrder, c as default };
