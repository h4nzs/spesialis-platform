import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './jsx-dev-runtime-CF1HYdPe.js';
var n = e(() => {}),
  r = e(() => {
    n();
  }),
  i = e(() => {
    r();
  }),
  a = e(() => {
    n();
  }),
  o = e(() => {
    n();
  }),
  s,
  c,
  l = e(() => {
    ((s = { debug: 0, info: 1, warn: 2, error: 3 }),
      (c = class {
        minLevel;
        prefix;
        useNativeLevels;
        handler;
        constructor(e = {}) {
          ((this.minLevel = e.minLevel ?? `info`),
            (this.prefix = e.prefix ?? `[Spesialis]`),
            (this.useNativeLevels = e.useNativeLevels ?? !0),
            (this.handler = e.handler));
        }
        shouldLog(e) {
          return s[e] >= s[this.minLevel];
        }
        log(e, t, n) {
          if (!this.shouldLog(e)) return;
          if (this.handler) {
            this.handler(e, t, n);
            return;
          }
          let r = `${this.prefix} ${t}`;
          if (!this.useNativeLevels) {
            console.log(`[${e.toUpperCase()}]`, r, n ?? ``);
            return;
          }
          switch (e) {
            case `debug`:
              console.debug(r, n ?? ``);
              break;
            case `info`:
              console.info(r, n ?? ``);
              break;
            case `warn`:
              console.warn(r, n ?? ``);
              break;
            case `error`:
              console.error(r, n ?? ``);
              break;
          }
        }
        debug(e, t) {
          this.log(`debug`, e, t);
        }
        info(e, t) {
          this.log(`info`, e, t);
        }
        warn(e, t) {
          this.log(`warn`, e, t);
        }
        error(e, t) {
          this.log(`error`, e, t);
        }
      }),
      new c());
  });
function u(e, t) {
  let n = (e) =>
    e.includes(`,`) ||
    e.includes(`"`) ||
    e.includes(`
`) ||
    e.includes(`\r`)
      ? `"${e.replace(/"/g, `""`)}"`
      : e;
  return `﻿${e.map(n).join(`,`)}\n${t.map((e) => e.map(n).join(`,`)).join(`
`)}`;
}
function d(e, t) {
  if (typeof document > `u`) {
    console.warn(`[downloadBlob] browser-only`);
    return;
  }
  let n = URL.createObjectURL(e),
    r = document.createElement(`a`);
  ((r.href = n),
    (r.download = t),
    document.body.appendChild(r),
    r.click(),
    document.body.removeChild(r),
    URL.revokeObjectURL(n));
}
function f(e, t, n) {
  if (typeof document > `u`) {
    console.warn(`[CSV] downloadCSV is browser-only`);
    return;
  }
  let r = u(e, t);
  d(new Blob([r], { type: `text/csv;charset=utf-8;` }), n);
}
var p = e(() => {}),
  m = e(() => {
    (a(), o(), l(), p());
  }),
  h = e(() => {
    (n(), i(), m());
  });
function g({
  data: e,
  columns: t,
  filename: n,
  disabled: r = !1,
  loading: i = !1,
  loadingLabel: a = `Mengexport...`,
  onClick: o,
  onExport: s,
}) {
  return e.length === 0
    ? null
    : (0, _.jsxDEV)(
        `button`,
        {
          type: `button`,
          onClick: () => {
            if (o) {
              o();
              return;
            }
            let r = t.map((e) => e.label),
              i = e.map((e) =>
                t.map((t) => {
                  let n = e[t.key];
                  return t.format ? t.format(n, e) : String(n ?? ``);
                }),
              );
            (s ?? f)(r, i, n);
          },
          disabled: r,
          className: `inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-body-sm font-medium text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50`,
          children: [
            (0, _.jsxDEV)(
              `svg`,
              {
                xmlns: `http://www.w3.org/2000/svg`,
                width: `16`,
                height: `16`,
                viewBox: `0 0 24 24`,
                fill: `none`,
                stroke: `currentColor`,
                strokeWidth: `2`,
                strokeLinecap: `round`,
                strokeLinejoin: `round`,
                className: `shrink-0`,
                'aria-hidden': `true`,
                children: [
                  (0, _.jsxDEV)(
                    `path`,
                    { d: `M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4` },
                    void 0,
                    !1,
                    { fileName: v, lineNumber: 119, columnNumber: 9 },
                    this,
                  ),
                  (0, _.jsxDEV)(
                    `polyline`,
                    { points: `7 10 12 15 17 10` },
                    void 0,
                    !1,
                    { fileName: v, lineNumber: 120, columnNumber: 9 },
                    this,
                  ),
                  (0, _.jsxDEV)(
                    `line`,
                    { x1: `12`, y1: `15`, x2: `12`, y2: `3` },
                    void 0,
                    !1,
                    { fileName: v, lineNumber: 121, columnNumber: 9 },
                    this,
                  ),
                ],
              },
              void 0,
              !0,
              { fileName: v, lineNumber: 106, columnNumber: 7 },
              this,
            ),
            i ? a : `Export CSV`,
          ],
        },
        void 0,
        !0,
        { fileName: v, lineNumber: 100, columnNumber: 5 },
        this,
      );
}
var _,
  v,
  y = e(() => {
    (h(),
      (_ = t()),
      (v = `/home/ken/Projects/spesialis/packages/ui/src/components/CSVExportButton.tsx`),
      (g.__docgenInfo = {
        description: `Reusable CSV export button that replaces the duplicated
button + download-icon + \`handleExportCSV\` pattern found across 8+ dashboard components.

- **Hidden** when \`data\` is empty (prevents exporting empty files).
- Click builds CSV headers/rows from \`columns\` × \`data\` and calls \`downloadCSV\` (or \`onExport\`).
- Pass \`onClick\` to fully override the export logic (e.g. server-side streaming).

@example
\`\`\`tsx
<CSVExportButton
  data={users}
  columns={[
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', format: (v) => ROLE_LABELS[v as string] ?? String(v) },
    { key: 'createdAt', label: 'Dibuat', format: (v) => new Date(v as string).toLocaleDateString('id-ID') },
  ]}
  filename="users-export.csv"
/>
\`\`\``,
        methods: [],
        displayName: `CSVExportButton`,
        props: {
          data: {
            required: !0,
            tsType: { name: `Array`, elements: [{ name: `T` }], raw: `T[]` },
            description: `Data array to export. The button is **hidden** when this is empty.`,
          },
          columns: {
            required: !0,
            tsType: {
              name: `Array`,
              elements: [
                { name: `CSVExportColumn`, elements: [{ name: `T` }], raw: `CSVExportColumn<T>` },
              ],
              raw: `CSVExportColumn<T>[]`,
            },
            description:
              'Column definitions — each `key` is extracted from each item, each `label` becomes a CSV header.',
          },
          filename: {
            required: !0,
            tsType: { name: `string` },
            description: "Output filename (e.g. `'users-export.csv'`).",
          },
          disabled: {
            required: !1,
            tsType: { name: `boolean` },
            description: `Disable the button (e.g. while a server-side export is in progress).`,
            defaultValue: { value: `false`, computed: !1 },
          },
          loading: {
            required: !1,
            tsType: { name: `boolean` },
            description: `Show loading text instead of "Export CSV".`,
            defaultValue: { value: `false`, computed: !1 },
          },
          loadingLabel: {
            required: !1,
            tsType: { name: `string` },
            description: `Label shown while loading. Defaults to "Mengexport...".`,
            defaultValue: { value: `'Mengexport...'`, computed: !1 },
          },
          onClick: {
            required: !1,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `() => void`,
              signature: { arguments: [], return: { name: `void` } },
            },
            description:
              'Full override for the click handler.\nWhen provided, the default export logic (building headers/rows + calling `downloadCSV`) is skipped.\nUseful for server-side export flows (e.g. `AdminBookings`).',
          },
          onExport: {
            required: !1,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `(headers: string[], rows: string[][], filename: string) => void`,
              signature: {
                arguments: [
                  {
                    type: { name: `Array`, elements: [{ name: `string` }], raw: `string[]` },
                    name: `headers`,
                  },
                  {
                    type: {
                      name: `Array`,
                      elements: [
                        { name: `Array`, elements: [{ name: `string` }], raw: `string[]` },
                      ],
                      raw: `string[][]`,
                    },
                    name: `rows`,
                  },
                  { type: { name: `string` }, name: `filename` },
                ],
                return: { name: `void` },
              },
            },
            description:
              'Custom export function.\nReceives the computed headers, rows, and filename.\nDefaults to `downloadCSV` from `@specialist/shared`.',
          },
        },
      }));
  }),
  b,
  x,
  S,
  C,
  w,
  T,
  E,
  D,
  O,
  k,
  A,
  j,
  M,
  N;
e(() => {
  (y(),
    (b = {
      title: `DataExport/CSVExportButton`,
      component: g,
      parameters: {
        layout: `centered`,
        docs: {
          description: {
            component:
              'A reusable button that exports table data to CSV. Replaces the duplicated `handleExportCSV` + button+SVG pattern previously found across 8+ dashboard components.',
          },
        },
      },
      tags: [`autodocs`],
      argTypes: {
        disabled: { control: `boolean`, description: `Disables the button and prevents export` },
        loading: { control: `boolean`, description: `Shows loading label instead of "Export CSV"` },
        loadingLabel: {
          control: `text`,
          description: `Custom label shown while loading (default: "Mengexport...")`,
        },
        filename: { control: `text`, description: `Output CSV filename (e.g. "users-export.csv")` },
      },
      args: {
        onClick: () => console.log(`Custom onClick triggered`),
        onExport: () => console.log(`Custom onExport triggered`),
      },
    }),
    (x = [
      { name: `John Doe`, email: `john@example.com`, role: `admin`, joinedAt: `2024-01-15` },
      { name: `Jane Smith`, email: `jane@example.com`, role: `customer`, joinedAt: `2024-03-22` },
      { name: `Bob Johnson`, email: `bob@example.com`, role: `partner`, joinedAt: `2024-06-10` },
    ]),
    (S = [
      { key: `name`, label: `Nama` },
      { key: `email`, label: `Email` },
      { key: `role`, label: `Role` },
      { key: `joinedAt`, label: `Bergabung` },
    ]),
    (C = { args: { data: x, columns: S, filename: `users-export.csv` } }),
    (w = {
      args: { data: [], columns: S, filename: `users-export.csv` },
      parameters: {
        docs: {
          description: {
            story:
              'The component returns `null` when `data.length === 0`, so nothing is rendered. Check the DOM — no button will appear.',
          },
        },
      },
    }),
    (T = { args: { data: x, columns: S, filename: `users-export.csv`, loading: !0 } }),
    (E = {
      args: {
        data: x,
        columns: S,
        filename: `users-export.csv`,
        loading: !0,
        loadingLabel: `Exporting...`,
      },
    }),
    (D = { args: { data: x, columns: S, filename: `users-export.csv`, disabled: !0 } }),
    (O = { admin: `Admin`, customer: `Pelanggan`, partner: `Mitra`, corporate: `Perusahaan` }),
    (k = {
      args: {
        data: x,
        columns: [
          { key: `name`, label: `Nama` },
          { key: `email`, label: `Email` },
          { key: `role`, label: `Role`, format: (e) => O[String(e)] ?? String(e) },
          {
            key: `joinedAt`,
            label: `Bergabung`,
            format: (e) =>
              new Date(e).toLocaleDateString(`id-ID`, {
                year: `numeric`,
                month: `long`,
                day: `numeric`,
              }),
          },
        ],
        filename: `users-export.csv`,
      },
    }),
    (A = {
      args: {
        data: x,
        columns: S,
        filename: `users-export.csv`,
        onClick: () => {
          console.log(`Custom export triggered — would call API here`);
        },
      },
      parameters: {
        docs: {
          description: {
            story:
              'When `onClick` is provided, the default CSV building and `downloadCSV` call are skipped entirely. Useful for server-side streaming exports.',
          },
        },
      },
    }),
    (j = {
      args: {
        data: x,
        columns: S,
        filename: `users-export.csv`,
        onExport: (e, t, n) => {
          console.log(`Custom export:`, { headers: e, rows: t, filename: n });
        },
      },
      parameters: {
        docs: {
          description: {
            story:
              '`onExport` receives the pre-built `headers`, `rows`, and `filename`. Use this to send data to an API instead of triggering a browser download.',
          },
        },
      },
    }),
    (M = {
      args: {
        data: [
          { name: `John`, phone: null, notes: void 0 },
          { name: `Jane`, phone: `08123456789`, notes: `Priority customer` },
        ],
        columns: [
          { key: `name`, label: `Nama` },
          { key: `phone`, label: `Telepon` },
          { key: `notes`, label: `Catatan` },
        ],
        filename: `contacts-export.csv`,
      },
    }),
    (C.parameters = {
      ...C.parameters,
      docs: {
        ...C.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: userColumns,
    filename: 'users-export.csv'
  }
}`,
          ...C.parameters?.docs?.source,
        },
        description: {
          story:
            'Default state — renders as a small button with a download icon and "Export CSV" label.\nThe button is hidden automatically when `data` is empty.',
          ...C.parameters?.docs?.description,
        },
      },
    }),
    (w.parameters = {
      ...w.parameters,
      docs: {
        ...w.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: [],
    columns: userColumns,
    filename: 'users-export.csv'
  },
  parameters: {
    docs: {
      description: {
        story: 'The component returns \`null\` when \`data.length === 0\`, so nothing is rendered. Check the DOM — no button will appear.'
      }
    }
  }
}`,
          ...w.parameters?.docs?.source,
        },
        description: {
          story:
            'When `data` is an empty array, the component returns `null` and renders nothing.\nThis prevents exporting empty CSV files.',
          ...w.parameters?.docs?.description,
        },
      },
    }),
    (T.parameters = {
      ...T.parameters,
      docs: {
        ...T.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: userColumns,
    filename: 'users-export.csv',
    loading: true
  }
}`,
          ...T.parameters?.docs?.source,
        },
        description: {
          story: `Loading state — shows "Mengexport..." text and disables interaction.
Useful for server-side export flows where the export takes time.`,
          ...T.parameters?.docs?.description,
        },
      },
    }),
    (E.parameters = {
      ...E.parameters,
      docs: {
        ...E.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: userColumns,
    filename: 'users-export.csv',
    loading: true,
    loadingLabel: 'Exporting...'
  }
}`,
          ...E.parameters?.docs?.source,
        },
        description: {
          story: `Custom loading label — overrides the default "Mengexport..." text.`,
          ...E.parameters?.docs?.description,
        },
      },
    }),
    (D.parameters = {
      ...D.parameters,
      docs: {
        ...D.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: userColumns,
    filename: 'users-export.csv',
    disabled: true
  }
}`,
          ...D.parameters?.docs?.source,
        },
        description: {
          story: `Disabled state — the button appears muted and cannot be clicked.
Useful when a prerequisite (e.g., date range selection) is not yet satisfied.`,
          ...D.parameters?.docs?.description,
        },
      },
    }),
    (k.parameters = {
      ...k.parameters,
      docs: {
        ...k.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: [{
      key: 'name' as const,
      label: 'Nama'
    }, {
      key: 'email' as const,
      label: 'Email'
    }, {
      key: 'role' as const,
      label: 'Role',
      format: (v: unknown) => ROLE_LABELS[String(v)] ?? String(v)
    }, {
      key: 'joinedAt' as const,
      label: 'Bergabung',
      format: (v: unknown) => new Date(v as string).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }],
    filename: 'users-export.csv'
  }
}`,
          ...k.parameters?.docs?.source,
        },
      },
    }),
    (A.parameters = {
      ...A.parameters,
      docs: {
        ...A.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: userColumns,
    filename: 'users-export.csv',
    onClick: () => {
      console.log('Custom export triggered — would call API here');
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'When \`onClick\` is provided, the default CSV building and \`downloadCSV\` call are skipped entirely. Useful for server-side streaming exports.'
      }
    }
  }
}`,
          ...A.parameters?.docs?.source,
        },
        description: {
          story:
            'Custom `onClick` handler — overrides the default export logic entirely.\nUseful for server-side export flows (e.g., `AdminBookings`).',
          ...A.parameters?.docs?.description,
        },
      },
    }),
    (j.parameters = {
      ...j.parameters,
      docs: {
        ...j.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: sampleUsers,
    columns: userColumns,
    filename: 'users-export.csv',
    onExport: (headers, rows, filename) => {
      console.log('Custom export:', {
        headers,
        rows,
        filename
      });
    }
  },
  parameters: {
    docs: {
      description: {
        story: '\`onExport\` receives the pre-built \`headers\`, \`rows\`, and \`filename\`. Use this to send data to an API instead of triggering a browser download.'
      }
    }
  }
}`,
          ...j.parameters?.docs?.source,
        },
        description: {
          story: `Custom \`onExport\` function — receives the computed headers, rows, and filename.
This lets you send the CSV data to a custom destination (e.g., an API endpoint)
while keeping the header/row building logic from the component.`,
          ...j.parameters?.docs?.description,
        },
      },
    }),
    (M.parameters = {
      ...M.parameters,
      docs: {
        ...M.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    data: [{
      name: 'John',
      phone: null,
      notes: undefined
    }, {
      name: 'Jane',
      phone: '08123456789',
      notes: 'Priority customer'
    }] as Record<string, unknown>[],
    columns: [{
      key: 'name' as const,
      label: 'Nama'
    }, {
      key: 'phone' as const,
      label: 'Telepon'
    }, {
      key: 'notes' as const,
      label: 'Catatan'
    }],
    filename: 'contacts-export.csv'
  }
}`,
          ...M.parameters?.docs?.source,
        },
        description: {
          story: `Null and undefined values — the component safely handles missing data
by converting null/undefined to empty strings.`,
          ...M.parameters?.docs?.description,
        },
      },
    }),
    (N = [
      `Default`,
      `EmptyData`,
      `Loading`,
      `CustomLoadingLabel`,
      `Disabled`,
      `WithFormatCallbacks`,
      `CustomOnClick`,
      `CustomOnExport`,
      `NullValues`,
    ]));
})();
export {
  E as CustomLoadingLabel,
  A as CustomOnClick,
  j as CustomOnExport,
  C as Default,
  D as Disabled,
  w as EmptyData,
  T as Loading,
  M as NullValues,
  k as WithFormatCallbacks,
  N as __namedExportsOrder,
  b as default,
};
