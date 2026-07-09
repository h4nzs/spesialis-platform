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
          `textarea`,
          {
            id: s,
            'aria-label': e ? void 0 : o.placeholder || void 0,
            'aria-invalid': t ? !0 : void 0,
            'aria-describedby': c,
            className: `w-full rounded-md border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted bg-bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-y min-h-[80px] ${t ? `border-danger-500` : `border-border-default`} ${n}`,
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
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Textarea.tsx`),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Textarea`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
          className: { defaultValue: { value: `''`, computed: !1 }, required: !1 },
        },
        composes: [`TextareaHTMLAttributes`],
      }));
  }),
  o,
  s,
  c,
  l,
  u,
  d;
e(() => {
  (a(),
    (o = {
      title: `Form/Textarea`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        placeholder: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
        label: { control: `text` },
        rows: { control: `number` },
      },
      args: { placeholder: `Tulis deskripsi...`, label: `Deskripsi` },
    }),
    (s = {}),
    (c = {
      args: {
        value: `Layanan ini sangat membantu. Teknisi datang tepat waktu dan menyelesaikan pekerjaan dengan baik.`,
      },
    }),
    (l = { args: { value: `Pendek`, error: `Deskripsi minimal 20 karakter` } }),
    (u = { args: { disabled: !0, value: `Input tidak bisa diubah` } }),
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
    value: 'Layanan ini sangat membantu. Teknisi datang tepat waktu dan menyelesaikan pekerjaan dengan baik.'
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
    value: 'Pendek',
    error: 'Deskripsi minimal 20 karakter'
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
    value: 'Input tidak bisa diubah'
  }
}`,
          ...u.parameters?.docs?.source,
        },
      },
    }),
    (d = [`Default`, `WithValue`, `WithError`, `Disabled`]));
})();
export {
  s as Default,
  u as Disabled,
  l as WithError,
  c as WithValue,
  d as __namedExportsOrder,
  o as default,
};
