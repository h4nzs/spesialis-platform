import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ label: e, error: t, className: n = ``, id: a, ...o }) {
  let s = a ?? e?.toLowerCase().replace(/\s+/g, `-`),
    c = t ? `${s}-error` : void 0;
  return (0, r.jsxDEV)(
    `div`,
    {
      className: `flex flex-col gap-1.5`,
      children: [
        e &&
          (0, r.jsxDEV)(
            `label`,
            { htmlFor: s, className: `text-sm font-medium text-text-primary`, children: e },
            void 0,
            !1,
            { fileName: i, lineNumber: 15, columnNumber: 9 },
            this,
          ),
        (0, r.jsxDEV)(
          `input`,
          {
            id: s,
            type: `date`,
            'aria-label': void 0,
            'aria-invalid': t ? !0 : void 0,
            'aria-describedby': c,
            className: `w-full rounded-md border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted bg-bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${t ? `border-danger-500` : `border-border-default`} ${n}`,
            ...o,
          },
          void 0,
          !1,
          { fileName: i, lineNumber: 19, columnNumber: 7 },
          this,
        ),
        t &&
          (0, r.jsxDEV)(
            `span`,
            { id: c, className: `text-xs text-danger-500`, role: `alert`, children: t },
            void 0,
            !1,
            { fileName: i, lineNumber: 28, columnNumber: 17 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: i, lineNumber: 13, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/DatePicker.tsx`),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `DatePicker`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
          className: { defaultValue: { value: `''`, computed: !1 }, required: !1 },
        },
        composes: [`Omit`],
      }));
  }),
  o,
  s,
  c,
  l,
  u,
  d,
  f;
e(() => {
  (a(),
    (o = {
      title: `Form/DatePicker`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        label: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
      },
      args: { label: `Tanggal Booking` },
    }),
    (s = {}),
    (c = { args: { value: `2026-07-15` } }),
    (l = { args: { error: `Tanggal tidak boleh di masa lalu` } }),
    (u = { args: { disabled: !0, value: `2026-07-15` } }),
    (d = { args: { label: `Tanggal Mulai`, min: `2026-07-01`, max: `2026-12-31` } }),
    (s.parameters = {
      ...s.parameters,
      docs: {
        ...s.parameters?.docs,
        source: { originalSource: `{}`, ...s.parameters?.docs?.source },
      },
    }),
    (c.parameters = {
      ...c.parameters,
      docs: {
        ...c.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    value: '2026-07-15'
  }
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
    error: 'Tanggal tidak boleh di masa lalu'
  }
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
    disabled: true,
    value: '2026-07-15'
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
    label: 'Tanggal Mulai',
    min: '2026-07-01',
    max: '2026-12-31'
  }
}`,
          ...d.parameters?.docs?.source,
        },
      },
    }),
    (f = [`Default`, `WithValue`, `WithError`, `Disabled`, `MinMax`]));
})();
export {
  s as Default,
  u as Disabled,
  d as MinMax,
  l as WithError,
  c as WithValue,
  f as __namedExportsOrder,
  o as default,
};
