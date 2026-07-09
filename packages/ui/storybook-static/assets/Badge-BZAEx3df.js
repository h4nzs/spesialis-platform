import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ variant: e = `default`, children: t }) {
  return (0, r.jsxDEV)(
    `span`,
    {
      className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium ${a[e]}`,
      children: t,
    },
    void 0,
    !1,
    { fileName: i, lineNumber: 18, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a,
  o = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Badge.tsx`),
      (a = {
        default: `bg-neutral-100 text-text-secondary`,
        success: `bg-success-50 text-success-700`,
        warning: `bg-warning-50 text-warning-700`,
        danger: `bg-danger-50 text-danger-700`,
        info: `bg-primary-50 text-primary-700`,
      }),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Badge`,
        props: {
          variant: {
            required: !1,
            tsType: {
              name: `union`,
              raw: `'default' | 'success' | 'warning' | 'danger' | 'info'`,
              elements: [
                { name: `literal`, value: `'default'` },
                { name: `literal`, value: `'success'` },
                { name: `literal`, value: `'warning'` },
                { name: `literal`, value: `'danger'` },
                { name: `literal`, value: `'info'` },
              ],
            },
            description: ``,
            defaultValue: { value: `'default'`, computed: !1 },
          },
          children: { required: !0, tsType: { name: `ReactNode` }, description: `` },
        },
      }));
  });
export { o as n, n as t };
