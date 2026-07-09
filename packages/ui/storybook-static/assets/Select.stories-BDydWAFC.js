import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ label: e, error: t, options: n, placeholder: a, className: o = ``, id: s, ...c }) {
  let l = s ?? e?.toLowerCase().replace(/\s+/g, `-`),
    u = t ? `${l}-error` : void 0;
  return (0, r.jsxDEV)(
    `div`,
    {
      className: `flex flex-col gap-1.5`,
      children: [
        e &&
          (0, r.jsxDEV)(
            `label`,
            { htmlFor: l, className: `text-sm font-medium text-text-primary`, children: e },
            void 0,
            !1,
            { fileName: i, lineNumber: 30, columnNumber: 9 },
            this,
          ),
        (0, r.jsxDEV)(
          `select`,
          {
            id: l,
            'aria-label': e ? void 0 : a || void 0,
            'aria-invalid': t ? !0 : void 0,
            'aria-describedby': u,
            className: `w-full rounded-md border px-3 py-2 text-sm text-text-primary bg-bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${t ? `border-danger-500` : `border-border-default`} ${o}`,
            ...c,
            children: [
              a &&
                (0, r.jsxDEV)(
                  `option`,
                  { value: ``, disabled: !0, children: a },
                  void 0,
                  !1,
                  { fileName: i, lineNumber: 43, columnNumber: 11 },
                  this,
                ),
              n.map((e) =>
                (0, r.jsxDEV)(
                  `option`,
                  { value: e.value, children: e.label },
                  e.value,
                  !1,
                  { fileName: i, lineNumber: 48, columnNumber: 11 },
                  this,
                ),
              ),
            ],
          },
          void 0,
          !0,
          { fileName: i, lineNumber: 34, columnNumber: 7 },
          this,
        ),
        t &&
          (0, r.jsxDEV)(
            `span`,
            { id: u, className: `text-xs text-danger-500`, role: `alert`, children: t },
            void 0,
            !1,
            { fileName: i, lineNumber: 53, columnNumber: 17 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: i, lineNumber: 28, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Select.tsx`),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Select`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
          options: {
            required: !0,
            tsType: { name: `Array`, elements: [{ name: `SelectOption` }], raw: `SelectOption[]` },
            description: ``,
          },
          placeholder: { required: !1, tsType: { name: `string` }, description: `` },
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
      title: `Form/Select`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        disabled: { control: `boolean` },
        error: { control: `text` },
        label: { control: `text` },
        placeholder: { control: `text` },
      },
      args: {
        label: `Kategori`,
        placeholder: `Pilih kategori`,
        options: [
          { value: `elektronik`, label: `Elektronik` },
          { value: `kebersihan`, label: `Kebersihan` },
          { value: `taman`, label: `Taman & Outdoor` },
          { value: `renovasi`, label: `Renovasi` },
        ],
      },
    }),
    (s = {}),
    (c = { args: { value: `kebersihan` } }),
    (l = { args: { error: `Kategori wajib dipilih` } }),
    (u = { args: { disabled: !0, value: `elektronik` } }),
    (d = {
      args: {
        options: [
          { value: `1`, label: `Jakarta Pusat` },
          { value: `2`, label: `Jakarta Selatan` },
          { value: `3`, label: `Jakarta Barat` },
          { value: `4`, label: `Jakarta Timur` },
          { value: `5`, label: `Jakarta Utara` },
          { value: `6`, label: `Bandung` },
          { value: `7`, label: `Surabaya` },
          { value: `8`, label: `Yogyakarta` },
          { value: `9`, label: `Bali` },
          { value: `10`, label: `Medan` },
        ],
      },
    }),
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
    value: 'kebersihan'
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
    error: 'Kategori wajib dipilih'
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
    value: 'elektronik'
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
    options: [{
      value: '1',
      label: 'Jakarta Pusat'
    }, {
      value: '2',
      label: 'Jakarta Selatan'
    }, {
      value: '3',
      label: 'Jakarta Barat'
    }, {
      value: '4',
      label: 'Jakarta Timur'
    }, {
      value: '5',
      label: 'Jakarta Utara'
    }, {
      value: '6',
      label: 'Bandung'
    }, {
      value: '7',
      label: 'Surabaya'
    }, {
      value: '8',
      label: 'Yogyakarta'
    }, {
      value: '9',
      label: 'Bali'
    }, {
      value: '10',
      label: 'Medan'
    }]
  }
}`,
          ...d.parameters?.docs?.source,
        },
      },
    }),
    (f = [`Default`, `Selected`, `WithError`, `Disabled`, `ManyOptions`]));
})();
export {
  s as Default,
  u as Disabled,
  d as ManyOptions,
  c as Selected,
  l as WithError,
  f as __namedExportsOrder,
  o as default,
};
