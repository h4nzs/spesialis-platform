import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
function i({ rows: e = 3, showToolbar: t = !0, toolbarWidth: r = `w-32`, className: i, ...s }) {
  return (0, a.jsxDEV)(
    `div`,
    {
      className: n(`space-y-4`, i),
      ...s,
      'aria-label': `Memuat data...`,
      role: `status`,
      children: [
        t &&
          (0, a.jsxDEV)(
            `div`,
            {
              className: `flex justify-end`,
              children: (0, a.jsxDEV)(
                `div`,
                {
                  className: `animate-skeleton h-10 ${r} rounded-lg bg-neutral-200`,
                  'aria-hidden': `true`,
                },
                void 0,
                !1,
                { fileName: o, lineNumber: 45, columnNumber: 11 },
                this,
              ),
            },
            void 0,
            !1,
            { fileName: o, lineNumber: 44, columnNumber: 9 },
            this,
          ),
        Array.from({ length: e }, (e, t) =>
          (0, a.jsxDEV)(
            `div`,
            {
              className: `animate-skeleton h-12 w-full rounded-lg bg-neutral-200`,
              'aria-hidden': `true`,
            },
            t,
            !1,
            { fileName: o, lineNumber: 52, columnNumber: 9 },
            this,
          ),
        ),
      ],
    },
    void 0,
    !0,
    { fileName: o, lineNumber: 42, columnNumber: 5 },
    this,
  );
}
var a,
  o,
  s = e(() => {
    (t(),
      (a = r()),
      (o = `/home/ken/Projects/spesialis/packages/ui/src/components/TableSkeleton.tsx`),
      (i.__docgenInfo = {
        description: `Reusable table loading skeleton that replaces the duplicated
toolbar + table-row \`animate-skeleton\` block found across 15+ dashboard components.

- Renders a toolbar skeleton button on the right (unless \`showToolbar\` is false).
- Renders \`rows\` full-width row skeletons.
- Wrapped in a \`space-y-4\` container.
- All skeletons have \`aria-hidden="true"\`.

@example
\`\`\`tsx
// 3 rows with toolbar (default)
<TableSkeleton />

// 5 rows, no toolbar
<TableSkeleton rows={5} showToolbar={false} />

// Wider toolbar for two-button layouts
<TableSkeleton toolbarWidth="w-40" />
\`\`\``,
        methods: [],
        displayName: `TableSkeleton`,
        props: {
          rows: {
            required: !1,
            tsType: { name: `number` },
            description: `Number of table row skeletons to render. Default 3.`,
            defaultValue: { value: `3`, computed: !1 },
          },
          showToolbar: {
            required: !1,
            tsType: { name: `boolean` },
            description: `Show a toolbar skeleton (export button placeholder). Default true.`,
            defaultValue: { value: `true`, computed: !1 },
          },
          toolbarWidth: {
            required: !1,
            tsType: { name: `string` },
            description: `Width class for the toolbar skeleton. Default 'w-32'.`,
            defaultValue: { value: `'w-32'`, computed: !1 },
          },
        },
        composes: [`HTMLAttributes`],
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
      title: `Feedback/TableSkeleton`,
      component: i,
      parameters: {
        layout: `padded`,
        docs: {
          description: {
            component: `Reusable table loading skeleton that replaced the duplicated toolbar + row skeleton block across 15+ dashboard components.`,
          },
        },
      },
      tags: [`autodocs`],
      argTypes: {
        rows: { control: { type: `number`, min: 1, max: 20 } },
        showToolbar: { control: `boolean` },
      },
    }),
    (l = {}),
    (u = { args: { rows: 5 } }),
    (d = { args: { showToolbar: !1 } }),
    (f = { args: { rows: 1, showToolbar: !1 } }),
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
    rows: 5
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
    showToolbar: false
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
    rows: 1,
    showToolbar: false
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p = [`Default`, `FiveRows`, `WithoutToolbar`, `SingleRow`]));
})();
export {
  l as Default,
  u as FiveRows,
  f as SingleRow,
  d as WithoutToolbar,
  p as __namedExportsOrder,
  c as default,
};
