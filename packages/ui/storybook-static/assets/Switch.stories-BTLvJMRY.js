import { i as e, s as t } from './preload-helper-CT_b8DTk.js';
import { t as n } from './iframe-jHwL9Lyt.js';
import { n as r, t as i } from './cn-B_A6aTpF.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({
  label: e,
  size: t = `md`,
  checked: n,
  onChange: r,
  disabled: a,
  className: o,
  id: p,
  ...m
}) {
  let h = (0, s.useId)(),
    g = p ?? h,
    _ = f[t];
  return (0, c.jsxDEV)(
    `label`,
    {
      htmlFor: g,
      className: i(
        `inline-flex items-center gap-3`,
        a ? `cursor-not-allowed` : `cursor-pointer`,
        o,
      ),
      children: [
        e &&
          (0, c.jsxDEV)(
            `span`,
            { className: `text-body-sm font-medium text-text-primary select-none`, children: e },
            void 0,
            !1,
            { fileName: l, lineNumber: 55, columnNumber: 9 },
            this,
          ),
        (0, c.jsxDEV)(
          `span`,
          {
            className: i(u, _.track, n ? `bg-primary-500` : `bg-neutral-300`),
            children: [
              (0, c.jsxDEV)(
                `input`,
                {
                  id: g,
                  type: `checkbox`,
                  role: `switch`,
                  'aria-checked': n,
                  checked: n,
                  onChange: r,
                  disabled: a,
                  className: `peer sr-only`,
                  ...m,
                },
                void 0,
                !1,
                { fileName: l, lineNumber: 58, columnNumber: 9 },
                this,
              ),
              (0, c.jsxDEV)(
                `span`,
                {
                  'aria-hidden': `true`,
                  className: i(d, _.thumb, n ? `translate-x-full` : `translate-x-0`),
                },
                void 0,
                !1,
                { fileName: l, lineNumber: 69, columnNumber: 9 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: l, lineNumber: 57, columnNumber: 7 },
          this,
        ),
      ],
    },
    void 0,
    !0,
    { fileName: l, lineNumber: 46, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l,
  u,
  d,
  f,
  p = e(() => {
    ((s = t(n(), 1)),
      r(),
      (c = a()),
      (l = `/home/ken/Projects/spesialis/packages/ui/src/components/Switch.tsx`),
      (u = `relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50`),
      (d = `pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-150 ease-out`),
      (f = {
        sm: { track: `h-5 w-9`, thumb: `h-4 w-4` },
        md: { track: `h-6 w-11`, thumb: `h-5 w-5` },
      }),
      (o.__docgenInfo = {
        description: `Switch toggle input.

Accessible by default: uses \`role="switch"\`, \`aria-checked\`,
keyboard navigation, and focus-visible ring.

@example
<Switch label="Tersedia" checked={available} onChange={setAvailable} />
<Switch size="sm" />`,
        methods: [],
        displayName: `Switch`,
        props: {
          label: {
            required: !1,
            tsType: { name: `string` },
            description: `Accessible label rendered next to the switch.`,
          },
          size: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `keyof typeof sizes`,
              elements: [
                { name: `literal`, value: `sm` },
                { name: `literal`, value: `md` },
              ],
            },
            description: ``,
            defaultValue: { value: `'md'`, computed: !1 },
          },
        },
        composes: [`Omit`],
      }));
  }),
  m,
  h,
  g,
  _,
  v,
  y,
  b,
  x;
e(() => {
  (p(),
    (m = {
      title: `Form/Switch`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        size: { control: `select`, options: [`sm`, `md`] },
        disabled: { control: `boolean` },
        label: { control: `text` },
        checked: { control: `boolean` },
      },
      args: { label: `Tersedia`, onChange: () => {} },
    }),
    (h = { args: { checked: !1 } }),
    (g = { args: { checked: !0 } }),
    (_ = { args: { size: `sm`, checked: !0, label: `Mode Ringkas` } }),
    (v = { args: { checked: !1, disabled: !0, label: `Nonaktif` } }),
    (y = { args: { checked: !0, disabled: !0, label: `Aktif (dinonaktifkan)` } }),
    (b = { args: { label: void 0, checked: !0 } }),
    (h.parameters = {
      ...h.parameters,
      docs: {
        ...h.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    checked: false
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
    checked: true
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
    size: 'sm',
    checked: true,
    label: 'Mode Ringkas'
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
    checked: false,
    disabled: true,
    label: 'Nonaktif'
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
    checked: true,
    disabled: true,
    label: 'Aktif (dinonaktifkan)'
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
    label: undefined,
    checked: true
  }
}`,
          ...b.parameters?.docs?.source,
        },
      },
    }),
    (x = [`Off`, `On`, `Small`, `Disabled`, `DisabledOn`, `WithoutLabel`]));
})();
export {
  v as Disabled,
  y as DisabledOn,
  h as Off,
  g as On,
  _ as Small,
  b as WithoutLabel,
  x as __namedExportsOrder,
  m as default,
};
