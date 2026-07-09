import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
function n({ page: e, totalPages: t, onPageChange: n }) {
  if (t <= 1) return null;
  function a() {
    let n = [],
      r = Math.max(2, e - 2),
      i = Math.min(t - 1, e + 2);
    (n.push(1), r > 2 && n.push(`...`));
    for (let e = r; e <= i; e++) n.push(e);
    return (i < t - 1 && n.push(`...`), t > 1 && n.push(t), n);
  }
  return (0, r.jsxDEV)(
    `nav`,
    {
      className: `flex items-center justify-center gap-1`,
      'aria-label': `Pagination`,
      children: [
        (0, r.jsxDEV)(
          `button`,
          {
            onClick: () => n(e - 1),
            disabled: e <= 1,
            className: `rounded px-2 py-1 text-sm text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed`,
            'aria-label': `Halaman sebelumnya`,
            children: `«`,
          },
          void 0,
          !1,
          { fileName: i, lineNumber: 27, columnNumber: 7 },
          this,
        ),
        a().map((t, a) =>
          t === `...`
            ? (0, r.jsxDEV)(
                `span`,
                { className: `px-2 py-1 text-sm text-text-muted`, children: `...` },
                `ellipsis-${a}`,
                !1,
                { fileName: i, lineNumber: 37, columnNumber: 11 },
                this,
              )
            : (0, r.jsxDEV)(
                `button`,
                {
                  onClick: () => n(t),
                  className: `rounded px-3 py-1 text-sm font-medium cursor-pointer ${t === e ? `bg-primary text-white` : `text-text-muted hover:text-text-primary hover:bg-neutral-100`}`,
                  'aria-current': t === e ? `page` : void 0,
                  children: t,
                },
                t,
                !1,
                { fileName: i, lineNumber: 41, columnNumber: 11 },
                this,
              ),
        ),
        (0, r.jsxDEV)(
          `button`,
          {
            onClick: () => n(e + 1),
            disabled: e >= t,
            className: `rounded px-2 py-1 text-sm text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed`,
            'aria-label': `Halaman selanjutnya`,
            children: `»`,
          },
          void 0,
          !1,
          { fileName: i, lineNumber: 55, columnNumber: 7 },
          this,
        ),
      ],
    },
    void 0,
    !0,
    { fileName: i, lineNumber: 26, columnNumber: 5 },
    this,
  );
}
var r,
  i,
  a = e(() => {
    ((r = t()),
      (i = `/home/ken/Projects/spesialis/packages/ui/src/components/Pagination.tsx`),
      (n.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `Pagination`,
        props: {
          page: { required: !0, tsType: { name: `number` }, description: `` },
          totalPages: { required: !0, tsType: { name: `number` }, description: `` },
          onPageChange: {
            required: !0,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `(page: number) => void`,
              signature: {
                arguments: [{ type: { name: `number` }, name: `page` }],
                return: { name: `void` },
              },
            },
            description: ``,
          },
        },
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
      title: `Navigation/Pagination`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        page: { control: { type: `number`, min: 1 } },
        totalPages: { control: { type: `number`, min: 1 } },
      },
    }),
    (s = { args: { page: 1, totalPages: 3, onPageChange: () => {} } }),
    (c = { args: { page: 5, totalPages: 10, onPageChange: () => {} } }),
    (l = { args: { page: 1, totalPages: 8, onPageChange: () => {} } }),
    (u = { args: { page: 8, totalPages: 8, onPageChange: () => {} } }),
    (d = { args: { page: 6, totalPages: 12, onPageChange: () => {} } }),
    (f = {
      args: { page: 1, totalPages: 1, onPageChange: () => {} },
      parameters: {
        docs: {
          description: {
            story:
              'The component returns `null` when `totalPages <= 1`, so nothing renders. Pagination only appears when there are 2+ pages.',
          },
        },
      },
    }),
    (s.parameters = {
      ...s.parameters,
      docs: {
        ...s.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    page: 1,
    totalPages: 3,
    onPageChange: () => {}
  }
}`,
          ...s.parameters?.docs?.source,
        },
      },
    }),
    (c.parameters = {
      ...c.parameters,
      docs: {
        ...c.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    page: 5,
    totalPages: 10,
    onPageChange: () => {}
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
    page: 1,
    totalPages: 8,
    onPageChange: () => {}
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
    page: 8,
    totalPages: 8,
    onPageChange: () => {}
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
    page: 6,
    totalPages: 12,
    onPageChange: () => {}
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
    page: 1,
    totalPages: 1,
    onPageChange: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'The component returns \`null\` when \`totalPages <= 1\`, so nothing renders. Pagination only appears when there are 2+ pages.'
      }
    }
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p = [`FewPages`, `ManyPages`, `FirstPage`, `LastPage`, `MiddlePage`, `SinglePage`]));
})();
export {
  s as FewPages,
  l as FirstPage,
  u as LastPage,
  c as ManyPages,
  d as MiddlePage,
  f as SinglePage,
  p as __namedExportsOrder,
  o as default,
};
