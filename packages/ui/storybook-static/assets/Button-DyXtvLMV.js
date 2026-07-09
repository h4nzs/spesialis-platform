import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ variant: e = `primary`, size: t = `md`, className: n = ``, children: s, ...c }) {
  return (0, r.jsxDEV)(
    `button`,
    {
      type: `button`,
      className: `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${a[e]} ${o[t]} ${n}`,
      ...c,
      children: s,
    },
    void 0,
    !1,
    { fileName: i, lineNumber: 31, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a,
  o,
  s = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Button.tsx`),
      (a = {
        primary: `bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-xs`,
        secondary: `bg-secondary text-white hover:bg-secondary/90`,
        outline: `border border-border-default bg-transparent text-text-primary hover:bg-neutral-100`,
        ghost: `bg-transparent text-text-muted hover:bg-neutral-100`,
        danger: `bg-danger-500 text-white hover:bg-danger-600`,
      }),
      (o = { sm: `px-3 py-1.5 text-sm`, md: `px-4 py-2 text-sm`, lg: `px-6 py-3 text-base` }),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Button`,
        props: {
          variant: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`,
              elements: [
                { name: `literal`, value: `'primary'` },
                { name: `literal`, value: `'secondary'` },
                { name: `literal`, value: `'outline'` },
                { name: `literal`, value: `'ghost'` },
                { name: `literal`, value: `'danger'` },
              ],
            },
            description: ``,
            defaultValue: { value: `'primary'`, computed: !1 },
          },
          size: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'sm' | 'md' | 'lg'`,
              elements: [
                { name: `literal`, value: `'sm'` },
                { name: `literal`, value: `'md'` },
                { name: `literal`, value: `'lg'` },
              ],
            },
            description: ``,
            defaultValue: { value: `'md'`, computed: !1 },
          },
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
          className: { defaultValue: { value: `''`, computed: !1 }, required: !1 },
        },
        composes: [`ButtonHTMLAttributes`],
      }));
  });
export { s as n, n as t };
