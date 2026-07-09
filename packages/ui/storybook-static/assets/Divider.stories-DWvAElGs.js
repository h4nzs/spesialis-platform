import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
import { n, t as r } from './Divider-Cu44-Eta.js';
var i, a, o, s, c, l, u, d;
e(() => {
  (n(),
    (i = t()),
    (a = `/home/ken/Projects/spesialis/packages/ui/src/components/Divider.stories.tsx`),
    (o = {
      title: `Layout/Divider`,
      component: r,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        orientation: { control: `select`, options: [`horizontal`, `vertical`] },
        variant: { control: `select`, options: [`solid`, `dashed`, `light`] },
        label: { control: `text` },
      },
    }),
    (s = {
      args: { orientation: `horizontal` },
      decorators: [
        (e) =>
          (0, i.jsxDEV)(
            `div`,
            {
              className: `w-80`,
              children: (0, i.jsxDEV)(
                e,
                {},
                void 0,
                !1,
                { fileName: a, lineNumber: 30, columnNumber: 47 },
                void 0,
              ),
            },
            void 0,
            !1,
            { fileName: a, lineNumber: 30, columnNumber: 25 },
            void 0,
          ),
      ],
    }),
    (c = {
      args: { orientation: `horizontal`, label: `atau` },
      decorators: [
        (e) =>
          (0, i.jsxDEV)(
            `div`,
            {
              className: `w-80`,
              children: (0, i.jsxDEV)(
                e,
                {},
                void 0,
                !1,
                { fileName: a, lineNumber: 37, columnNumber: 47 },
                void 0,
              ),
            },
            void 0,
            !1,
            { fileName: a, lineNumber: 37, columnNumber: 25 },
            void 0,
          ),
      ],
    }),
    (l = {
      args: { orientation: `horizontal`, variant: `dashed` },
      decorators: [
        (e) =>
          (0, i.jsxDEV)(
            `div`,
            {
              className: `w-80`,
              children: (0, i.jsxDEV)(
                e,
                {},
                void 0,
                !1,
                { fileName: a, lineNumber: 44, columnNumber: 47 },
                void 0,
              ),
            },
            void 0,
            !1,
            { fileName: a, lineNumber: 44, columnNumber: 25 },
            void 0,
          ),
      ],
    }),
    (u = {
      args: { orientation: `vertical` },
      decorators: [
        (e) =>
          (0, i.jsxDEV)(
            `div`,
            {
              className: `flex h-16 gap-4`,
              children: [
                (0, i.jsxDEV)(
                  `span`,
                  { children: `Kiri` },
                  void 0,
                  !1,
                  { fileName: a, lineNumber: 50, columnNumber: 58 },
                  void 0,
                ),
                (0, i.jsxDEV)(
                  e,
                  {},
                  void 0,
                  !1,
                  { fileName: a, lineNumber: 50, columnNumber: 75 },
                  void 0,
                ),
                (0, i.jsxDEV)(
                  `span`,
                  { children: `Kanan` },
                  void 0,
                  !1,
                  { fileName: a, lineNumber: 50, columnNumber: 84 },
                  void 0,
                ),
              ],
            },
            void 0,
            !0,
            { fileName: a, lineNumber: 50, columnNumber: 25 },
            void 0,
          ),
      ],
    }),
    (s.parameters = {
      ...s.parameters,
      docs: {
        ...s.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    orientation: 'horizontal'
  },
  decorators: [Story => <div className="w-80"><Story /></div>]
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
    orientation: 'horizontal',
    label: 'atau'
  },
  decorators: [Story => <div className="w-80"><Story /></div>]
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
    orientation: 'horizontal',
    variant: 'dashed'
  },
  decorators: [Story => <div className="w-80"><Story /></div>]
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
    orientation: 'vertical'
  },
  decorators: [Story => <div className="flex h-16 gap-4"><span>Kiri</span><Story /><span>Kanan</span></div>]
}`,
          ...u.parameters?.docs?.source,
        },
      },
    }),
    (d = [`Horizontal`, `WithLabel`, `Dashed`, `Vertical`]));
})();
export {
  l as Dashed,
  s as Horizontal,
  u as Vertical,
  c as WithLabel,
  d as __namedExportsOrder,
  o as default,
};
