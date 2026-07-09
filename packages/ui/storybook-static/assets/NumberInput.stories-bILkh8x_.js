import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
function i({ label: e, error: t, className: r, id: i, ...s }) {
  let c = i ?? e?.toLowerCase().replace(/\s+/g, `-`),
    l = t ? `${c}-error` : void 0;
  return (0, a.jsxDEV)(
    `div`,
    {
      className: `flex flex-col gap-1.5`,
      children: [
        e &&
          (0, a.jsxDEV)(
            `label`,
            { htmlFor: c, className: `text-body-sm font-medium text-text-primary`, children: e },
            void 0,
            !1,
            { fileName: o, lineNumber: 28, columnNumber: 9 },
            this,
          ),
        (0, a.jsxDEV)(
          `input`,
          {
            id: c,
            type: `number`,
            'aria-label': e ? void 0 : s.placeholder || void 0,
            'aria-invalid': t ? !0 : void 0,
            'aria-describedby': l,
            className: n(
              `h-10 w-full rounded-md border bg-bg-surface px-3 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`,
              t ? `border-danger-500` : `border-border-default`,
              r,
            ),
            ...s,
          },
          void 0,
          !1,
          { fileName: o, lineNumber: 32, columnNumber: 7 },
          this,
        ),
        t &&
          (0, a.jsxDEV)(
            `span`,
            { id: l, className: `text-caption text-danger-500`, role: `alert`, children: t },
            void 0,
            !1,
            { fileName: o, lineNumber: 45, columnNumber: 17 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: o, lineNumber: 26, columnNumber: 5 },
    this,
  );
}
var a,
  o,
  s = e(() => {
    (t(),
      (a = r()),
      (o = `/home/ken/Projects/spesialis/packages/ui/src/components/NumberInput.tsx`),
      (i.__docgenInfo = {
        description: `Number input with min/max/step support.

@example
<NumberInput label="Jumlah" min={0} max={100} step={1} value={qty} onChange={setQty} />`,
        methods: [],
        displayName: `NumberInput`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
        },
        composes: [`Omit`],
      }));
  }),
  c,
  l,
  u,
  d,
  f,
  p,
  m;
e(() => {
  (s(),
    (c = {
      title: `Form/NumberInput`,
      component: i,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        label: { control: `text` },
        placeholder: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
        min: { control: `number` },
        max: { control: `number` },
        step: { control: `number` },
      },
      args: { label: `Jumlah`, placeholder: `0` },
    }),
    (l = {}),
    (u = { args: { value: 42, min: 0, max: 100 } }),
    (d = { args: { value: -1, error: `Nilai tidak boleh negatif` } }),
    (f = { args: { value: 2.5, step: 0.5, min: 0, max: 10 } }),
    (p = { args: { disabled: !0, value: 10 } }),
    (l.parameters = {
      ...l.parameters,
      docs: {
        ...l.parameters?.docs,
        source: { originalSource: `{}`, ...l.parameters?.docs?.source },
      },
    }),
    (u.parameters = {
      ...u.parameters,
      docs: {
        ...u.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    value: 42,
    min: 0,
    max: 100
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
    value: -1,
    error: 'Nilai tidak boleh negatif'
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
    value: 2.5,
    step: 0.5,
    min: 0,
    max: 10
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
    disabled: true,
    value: 10
  }
}`,
          ...p.parameters?.docs?.source,
        },
      },
    }),
    (m = [`Default`, `WithValue`, `WithError`, `WithStep`, `Disabled`]));
})();
export {
  l as Default,
  p as Disabled,
  d as WithError,
  f as WithStep,
  u as WithValue,
  m as __namedExportsOrder,
  c as default,
};
