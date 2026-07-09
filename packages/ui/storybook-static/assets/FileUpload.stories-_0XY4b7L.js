import { i as e, s as t } from './preload-helper-CT_b8DTk.js';
import { t as n } from './iframe-jHwL9Lyt.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
function i({
  label: e,
  error: t,
  accept: n = `image/*`,
  maxSizeMB: r = 10,
  multiple: i = !1,
  onChange: c,
}) {
  let l = (0, a.useRef)(null),
    [u, d] = (0, a.useState)([]),
    [f, p] = (0, a.useState)(null);
  function m(e) {
    let t = Array.from(e.target.files ?? []);
    if ((p(null), t.length === 0)) return;
    if (t.find((e) => e.size > r * 1024 * 1024)) {
      p(`Ukuran file maksimal ${r}MB`);
      return;
    }
    let n = t.map((e) => URL.createObjectURL(e));
    (d((e) => (i ? [...e, ...n] : n)), c?.(t));
  }
  return (0, o.jsxDEV)(
    `div`,
    {
      className: `flex flex-col gap-1.5`,
      children: [
        e &&
          (0, o.jsxDEV)(
            `span`,
            { className: `text-sm font-medium text-text-primary`, children: e },
            void 0,
            !1,
            { fileName: s, lineNumber: 43, columnNumber: 17 },
            this,
          ),
        (0, o.jsxDEV)(
          `button`,
          {
            type: `button`,
            onClick: () => l.current?.click(),
            className: `flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border-default bg-bg-surface px-4 py-6 text-sm text-text-muted hover:border-primary hover:text-primary transition-colors`,
            children: [
              (0, o.jsxDEV)(
                `svg`,
                {
                  xmlns: `http://www.w3.org/2000/svg`,
                  width: `20`,
                  height: `20`,
                  viewBox: `0 0 24 24`,
                  fill: `none`,
                  stroke: `currentColor`,
                  strokeWidth: `2`,
                  children: [
                    (0, o.jsxDEV)(
                      `path`,
                      { d: `M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4` },
                      void 0,
                      !1,
                      { fileName: s, lineNumber: 58, columnNumber: 11 },
                      this,
                    ),
                    (0, o.jsxDEV)(
                      `polyline`,
                      { points: `17 8 12 3 7 8` },
                      void 0,
                      !1,
                      { fileName: s, lineNumber: 59, columnNumber: 11 },
                      this,
                    ),
                    (0, o.jsxDEV)(
                      `line`,
                      { x1: `12`, y1: `3`, x2: `12`, y2: `15` },
                      void 0,
                      !1,
                      { fileName: s, lineNumber: 60, columnNumber: 11 },
                      this,
                    ),
                  ],
                },
                void 0,
                !0,
                { fileName: s, lineNumber: 49, columnNumber: 9 },
                this,
              ),
              `Klik untuk upload`,
            ],
          },
          void 0,
          !0,
          { fileName: s, lineNumber: 44, columnNumber: 7 },
          this,
        ),
        (0, o.jsxDEV)(
          `input`,
          {
            ref: l,
            type: `file`,
            accept: n,
            multiple: i,
            className: `hidden`,
            'aria-label': e ?? `Upload file`,
            'data-testid': `file-input`,
            onChange: m,
          },
          void 0,
          !1,
          { fileName: s, lineNumber: 64, columnNumber: 7 },
          this,
        ),
        (f ?? t) &&
          (0, o.jsxDEV)(
            `span`,
            { className: `text-xs text-danger-500`, children: f ?? t },
            void 0,
            !1,
            { fileName: s, lineNumber: 75, columnNumber: 9 },
            this,
          ),
        u.length > 0 &&
          (0, o.jsxDEV)(
            `div`,
            {
              className: `mt-1 flex flex-wrap gap-2`,
              children: u.map((e, t) =>
                (0, o.jsxDEV)(
                  `div`,
                  {
                    className: `relative h-16 w-16 overflow-hidden rounded-md border border-border-default`,
                    children: [
                      (0, o.jsxDEV)(
                        `img`,
                        {
                          src: e,
                          alt: `Preview ${t + 1}`,
                          className: `h-full w-full object-cover`,
                          onLoad: () => URL.revokeObjectURL(e),
                        },
                        void 0,
                        !1,
                        { fileName: s, lineNumber: 84, columnNumber: 15 },
                        this,
                      ),
                      (0, o.jsxDEV)(
                        `button`,
                        {
                          type: `button`,
                          onClick: () => d((e) => e.filter((e, n) => n !== t)),
                          className: `absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-white text-[10px] cursor-pointer`,
                          'aria-label': `Hapus`,
                          children: `×`,
                        },
                        void 0,
                        !1,
                        { fileName: s, lineNumber: 90, columnNumber: 15 },
                        this,
                      ),
                    ],
                  },
                  e,
                  !0,
                  { fileName: s, lineNumber: 80, columnNumber: 13 },
                  this,
                ),
              ),
            },
            void 0,
            !1,
            { fileName: s, lineNumber: 78, columnNumber: 9 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: s, lineNumber: 42, columnNumber: 5 },
    this,
  );
}
var a,
  o,
  s,
  c = e(() => {
    ((a = t(n(), 1)),
      (o = r()),
      (s = `/home/ken/Projects/spesialis/packages/ui/src/components/FileUpload.tsx`),
      (i.__docgenInfo = {
        description: ``,
        methods: [],
        displayName: `FileUpload`,
        props: {
          label: { required: !1, tsType: { name: `string` }, description: `` },
          error: { required: !1, tsType: { name: `string` }, description: `` },
          accept: {
            required: !1,
            tsType: { name: `string` },
            description: ``,
            defaultValue: { value: `'image/*'`, computed: !1 },
          },
          maxSizeMB: {
            required: !1,
            tsType: { name: `number` },
            description: ``,
            defaultValue: { value: `10`, computed: !1 },
          },
          multiple: {
            required: !1,
            tsType: { name: `boolean` },
            description: ``,
            defaultValue: { value: `false`, computed: !1 },
          },
          onChange: {
            required: !1,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `(files: File[]) => void`,
              signature: {
                arguments: [
                  {
                    type: { name: `Array`, elements: [{ name: `File` }], raw: `File[]` },
                    name: `files`,
                  },
                ],
                return: { name: `void` },
              },
            },
            description: ``,
          },
        },
      }));
  }),
  l,
  u,
  d,
  f,
  p;
e(() => {
  (c(),
    (l = {
      title: `Form/FileUpload`,
      component: i,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        accept: { control: `text` },
        maxSizeMB: { control: `number` },
        multiple: { control: `boolean` },
        label: { control: `text` },
        error: { control: `text` },
      },
      args: { label: `Upload Foto` },
    }),
    (u = {}),
    (d = { args: { error: `Ukuran file maksimal 10MB` } }),
    (f = { args: { label: `Upload Dokumentasi`, multiple: !0, accept: `image/*,.pdf` } }),
    (u.parameters = {
      ...u.parameters,
      docs: {
        ...u.parameters?.docs,
        source: { originalSource: `{}`, ...u.parameters?.docs?.source },
      },
    }),
    (d.parameters = {
      ...d.parameters,
      docs: {
        ...d.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    error: 'Ukuran file maksimal 10MB'
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
    label: 'Upload Dokumentasi',
    multiple: true,
    accept: 'image/*,.pdf'
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p = [`Default`, `WithError`, `MultipleFiles`]));
})();
export { u as Default, f as MultipleFiles, d as WithError, p as __namedExportsOrder, l as default };
