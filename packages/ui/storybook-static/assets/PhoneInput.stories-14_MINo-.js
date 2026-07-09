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
            { fileName: o, lineNumber: 22, columnNumber: 9 },
            this,
          ),
        (0, a.jsxDEV)(
          `div`,
          {
            className: `relative`,
            children: [
              (0, a.jsxDEV)(
                `div`,
                {
                  className: `pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`,
                  'aria-hidden': `true`,
                  children: (0, a.jsxDEV)(
                    `span`,
                    { className: `text-body text-text-muted select-none`, children: `+62` },
                    void 0,
                    !1,
                    { fileName: o, lineNumber: 29, columnNumber: 11 },
                    this,
                  ),
                },
                void 0,
                !1,
                { fileName: o, lineNumber: 28, columnNumber: 9 },
                this,
              ),
              (0, a.jsxDEV)(
                `input`,
                {
                  id: c,
                  type: `tel`,
                  inputMode: `numeric`,
                  'aria-label': e ? void 0 : `Nomor Telepon`,
                  'aria-invalid': t ? !0 : void 0,
                  'aria-describedby': l,
                  className: n(
                    `h-10 w-full rounded-md border bg-bg-surface pl-12 pr-3 text-body text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500`,
                    t ? `border-danger-500` : `border-border-default`,
                    r,
                  ),
                  autoComplete: `tel-national`,
                  placeholder: `81234567890`,
                  ...s,
                },
                void 0,
                !1,
                { fileName: o, lineNumber: 31, columnNumber: 9 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: o, lineNumber: 26, columnNumber: 7 },
          this,
        ),
        t &&
          (0, a.jsxDEV)(
            `span`,
            { id: l, className: `text-caption text-danger-500`, role: `alert`, children: t },
            void 0,
            !1,
            { fileName: o, lineNumber: 48, columnNumber: 17 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: o, lineNumber: 20, columnNumber: 5 },
    this,
  );
}
var a,
  o,
  s = e(() => {
    (t(),
      (a = r()),
      (o = `/home/ken/Projects/spesialis/packages/ui/src/components/PhoneInput.tsx`),
      (i.__docgenInfo = {
        description: `Phone input with static +62 prefix.

@example
<PhoneInput label="No. HP" value={phone} onChange={setPhone} />`,
        methods: [],
        displayName: `PhoneInput`,
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
  p;
e(() => {
  (s(),
    (c = {
      title: `Form/PhoneInput`,
      component: i,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        label: { control: `text` },
        placeholder: { control: `text` },
        disabled: { control: `boolean` },
        error: { control: `text` },
      },
      args: { label: `No. HP`, placeholder: `81234567890` },
    }),
    (l = {}),
    (u = { args: { value: `81234567890` } }),
    (d = { args: { value: `123`, error: `Nomor HP tidak valid` } }),
    (f = { args: { disabled: !0, value: `81234567890` } }),
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
    value: '81234567890'
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
    value: '123',
    error: 'Nomor HP tidak valid'
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
    disabled: true,
    value: '81234567890'
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p = [`Default`, `WithValue`, `WithError`, `Disabled`]));
})();
export {
  l as Default,
  f as Disabled,
  d as WithError,
  u as WithValue,
  p as __namedExportsOrder,
  c as default,
};
