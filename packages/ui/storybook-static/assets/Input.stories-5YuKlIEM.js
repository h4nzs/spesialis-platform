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
            'aria-label': e ? void 0 : o.placeholder || void 0,
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
            { fileName: i, lineNumber: 27, columnNumber: 17 },
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
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Input.tsx`),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Input`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
          className: { defaultValue: { value: `''`, computed: !1 }, required: !1 },
        },
        composes: [`InputHTMLAttributes`],
      }));
  }),
  o,
  s,
  c,
  l,
  u,
  d,
  f,
  p;
e(() => {
  (a(),
    (o = {
      title: `Form/Input`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        type: { control: `select`, options: [`text`, `email`, `url`, `tel`] },
        placeholder: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
        label: { control: `text` },
      },
      args: { placeholder: `Masukkan teks...`, label: `Nama Lengkap` },
    }),
    (s = {}),
    (c = { args: { value: `John Doe` } }),
    (l = { args: { value: `john`, error: `Nama lengkap harus diisi` } }),
    (u = { args: { disabled: !0, value: `John Doe` } }),
    (d = { args: { type: `email`, label: `Email`, placeholder: `email@example.com` } }),
    (f = { args: { label: void 0, placeholder: `Cari...` } }),
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
    value: 'John Doe'
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
    value: 'john',
    error: 'Nama lengkap harus diisi'
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
    value: 'John Doe'
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
    type: 'email',
    label: 'Email',
    placeholder: 'email@example.com'
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
    label: undefined,
    placeholder: 'Cari...'
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p = [`Default`, `WithValue`, `WithError`, `Disabled`, `Email`, `WithoutLabel`]));
})();
export {
  s as Default,
  u as Disabled,
  d as Email,
  l as WithError,
  c as WithValue,
  f as WithoutLabel,
  p as __namedExportsOrder,
  o as default,
};
