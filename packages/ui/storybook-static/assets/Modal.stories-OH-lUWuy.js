import { i as e, s as t } from './preload-helper-CT_b8DTk.js';
import { t as n } from './iframe-jHwL9Lyt.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
import { n as i, t as a } from './Button-DyXtvLMV.js';
function o({ open: e, onClose: t, title: n, children: r, footer: i }) {
  let a = (0, s.useRef)(null),
    o = (0, s.useRef)(null),
    d = (0, s.useId)(),
    f = (0, s.useId)(),
    p = (0, s.useCallback)(
      (e) => {
        if (e.key === `Escape`) {
          t();
          return;
        }
        if (e.key === `Tab` && a.current) {
          let t = a.current.querySelectorAll(u);
          if (t.length === 0) return;
          let n = t[0],
            r = t[t.length - 1];
          e.shiftKey
            ? document.activeElement === n && (e.preventDefault(), r.focus())
            : document.activeElement === r && (e.preventDefault(), n.focus());
        }
      },
      [t],
    );
  return (
    (0, s.useEffect)(() => {
      if (e) {
        if (((o.current = document.activeElement), a.current)) {
          let e = a.current.querySelectorAll(u);
          e.length > 0 && e[0].focus();
        }
        document.body.style.overflow = `hidden`;
      }
      return () => {
        (o.current?.focus(), (o.current = null), (document.body.style.overflow = ``));
      };
    }, [e]),
    e
      ? (0, c.jsxDEV)(
          `div`,
          {
            className: `fixed inset-0 z-50 flex items-center justify-center`,
            children: [
              (0, c.jsxDEV)(
                `div`,
                { className: `absolute inset-0 bg-black/50`, onClick: t, 'aria-hidden': `true` },
                void 0,
                !1,
                { fileName: l, lineNumber: 103, columnNumber: 7 },
                this,
              ),
              (0, c.jsxDEV)(
                `div`,
                {
                  ref: a,
                  role: `dialog`,
                  'aria-modal': `true`,
                  'aria-labelledby': n ? d : void 0,
                  'aria-describedby': f,
                  className: `relative z-10 mx-auto max-w-lg w-full rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg`,
                  onKeyDown: p,
                  children: [
                    n &&
                      (0, c.jsxDEV)(
                        `div`,
                        {
                          className: `mb-4 flex items-center justify-between`,
                          children: [
                            (0, c.jsxDEV)(
                              `h2`,
                              {
                                id: d,
                                className: `text-lg font-semibold text-text-primary`,
                                children: n,
                              },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 117, columnNumber: 13 },
                              this,
                            ),
                            (0, c.jsxDEV)(
                              `button`,
                              {
                                onClick: t,
                                className: `cursor-pointer text-text-muted hover:text-text-primary`,
                                'aria-label': `Tutup`,
                                children: (0, c.jsxDEV)(
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
                                      (0, c.jsxDEV)(
                                        `line`,
                                        { x1: `18`, y1: `6`, x2: `6`, y2: `18` },
                                        void 0,
                                        !1,
                                        { fileName: l, lineNumber: 134, columnNumber: 17 },
                                        this,
                                      ),
                                      (0, c.jsxDEV)(
                                        `line`,
                                        { x1: `6`, y1: `6`, x2: `18`, y2: `18` },
                                        void 0,
                                        !1,
                                        { fileName: l, lineNumber: 135, columnNumber: 17 },
                                        this,
                                      ),
                                    ],
                                  },
                                  void 0,
                                  !0,
                                  { fileName: l, lineNumber: 125, columnNumber: 15 },
                                  this,
                                ),
                              },
                              void 0,
                              !1,
                              { fileName: l, lineNumber: 120, columnNumber: 13 },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        { fileName: l, lineNumber: 116, columnNumber: 11 },
                        this,
                      ),
                    (0, c.jsxDEV)(
                      `div`,
                      { id: f, children: r },
                      void 0,
                      !1,
                      { fileName: l, lineNumber: 140, columnNumber: 9 },
                      this,
                    ),
                    i &&
                      (0, c.jsxDEV)(
                        `div`,
                        { className: `mt-6 flex justify-end gap-3`, children: i },
                        void 0,
                        !1,
                        { fileName: l, lineNumber: 141, columnNumber: 20 },
                        this,
                      ),
                  ],
                },
                void 0,
                !0,
                { fileName: l, lineNumber: 106, columnNumber: 7 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: l, lineNumber: 101, columnNumber: 5 },
          this,
        )
      : null
  );
}
var s,
  c,
  l,
  u,
  d = e(() => {
    ((s = t(n(), 1)),
      (c = r()),
      (l = `/home/ken/Projects/spesialis/packages/ui/src/components/Modal.tsx`),
      (u = `a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])`),
      (o.__docgenInfo = {
        description: `Accessible modal dialog with focus trap, ARIA attributes, and keyboard support.

- Traps focus within the modal while open (Tab / Shift+Tab cycle).
- Restores focus to the previously focused element on close.
- Closes on Escape key, backdrop click, or close button.
- Associates title via aria-labelledby and content via aria-describedby.

@example
<Modal open={show} onClose={() => setShow(false)} title="Edit Item">
  <p>Modal body content here.</p>
  <button>Simpan</button>
</Modal>`,
        methods: [],
        displayName: `Modal`,
        props: {
          open: {
            required: !0,
            tsType: { name: `boolean` },
            description: `Whether the modal is visible.`,
          },
          onClose: {
            required: !0,
            tsType: {
              name: `signature`,
              type: `function`,
              raw: `() => void`,
              signature: { arguments: [], return: { name: `void` } },
            },
            description: `Called when the modal should close (backdrop click, Escape, close button).`,
          },
          title: {
            required: !1,
            tsType: { name: `string` },
            description: `Modal title. When provided, aria-labelledby is set on the dialog.`,
          },
          children: {
            required: !0,
            tsType: { name: `ReactNode` },
            description: `Modal body content. Referenced via aria-describedby for screen readers.`,
          },
          footer: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `Optional footer area, typically action buttons.`,
          },
        },
      }));
  }),
  f,
  p,
  m,
  h,
  g,
  _,
  v,
  y;
e(() => {
  (d(),
    i(),
    (f = r()),
    (p = `/home/ken/Projects/spesialis/packages/ui/src/components/Modal.stories.tsx`),
    (m = {
      title: `Feedback/Modal`,
      component: o,
      parameters: {
        layout: `centered`,
        docs: {
          description: {
            component: `Accessible modal dialog with focus trap, Escape key, backdrop click, and ARIA attributes.`,
          },
        },
      },
      tags: [`autodocs`],
      argTypes: { open: { control: `boolean` }, title: { control: `text` } },
    }),
    (h = {
      args: {
        open: !0,
        title: `Edit Layanan`,
        children: (0, f.jsxDEV)(
          `p`,
          {
            className: `text-body text-text-secondary`,
            children: `Apakah Anda yakin ingin mengubah layanan ini?`,
          },
          void 0,
          !1,
          { fileName: p, lineNumber: 32, columnNumber: 15 },
          void 0,
        ),
        footer: (0, f.jsxDEV)(
          f.Fragment,
          {
            children: [
              (0, f.jsxDEV)(
                a,
                { variant: `outline`, children: `Batal` },
                void 0,
                !1,
                { fileName: p, lineNumber: 36, columnNumber: 9 },
                void 0,
              ),
              (0, f.jsxDEV)(
                a,
                { variant: `primary`, children: `Simpan` },
                void 0,
                !1,
                { fileName: p, lineNumber: 37, columnNumber: 9 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: p, lineNumber: 35, columnNumber: 13 },
          void 0,
        ),
        onClose: () => {},
      },
    }),
    (g = {
      args: {
        open: !0,
        children: (0, f.jsxDEV)(
          `p`,
          {
            className: `text-body text-text-secondary`,
            children: `Modal tanpa judul — hanya konten.`,
          },
          void 0,
          !1,
          { fileName: p, lineNumber: 45, columnNumber: 15 },
          void 0,
        ),
        onClose: () => {},
      },
    }),
    (_ = {
      args: {
        open: !0,
        title: `Informasi`,
        children: (0, f.jsxDEV)(
          `p`,
          {
            className: `text-body text-text-secondary`,
            children: `Modal tanpa footer — hanya konten body. Tutup dengan klik backdrop atau tombol X.`,
          },
          void 0,
          !1,
          { fileName: p, lineNumber: 55, columnNumber: 15 },
          void 0,
        ),
        onClose: () => {},
      },
    }),
    (v = {
      args: {
        open: !0,
        title: `Syarat & Ketentuan`,
        children: (0, f.jsxDEV)(
          `div`,
          {
            className: `space-y-3 text-body-sm text-text-secondary`,
            children: Array.from({ length: 8 }, (e, t) =>
              (0, f.jsxDEV)(
                `p`,
                {
                  children: [
                    t + 1,
                    `. Dengan menggunakan layanan Spesialis, Anda menyetujui ketentuan berikut ini. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.`,
                  ],
                },
                t,
                !0,
                { fileName: p, lineNumber: 68, columnNumber: 20 },
                void 0,
              ),
            ),
          },
          void 0,
          !1,
          { fileName: p, lineNumber: 65, columnNumber: 15 },
          void 0,
        ),
        footer: (0, f.jsxDEV)(
          f.Fragment,
          {
            children: [
              (0, f.jsxDEV)(
                a,
                { variant: `outline`, children: `Tutup` },
                void 0,
                !1,
                { fileName: p, lineNumber: 75, columnNumber: 9 },
                void 0,
              ),
              (0, f.jsxDEV)(
                a,
                { variant: `primary`, children: `Setuju` },
                void 0,
                !1,
                { fileName: p, lineNumber: 76, columnNumber: 9 },
                void 0,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: p, lineNumber: 74, columnNumber: 13 },
          void 0,
        ),
        onClose: () => {},
      },
    }),
    (h.parameters = {
      ...h.parameters,
      docs: {
        ...h.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    open: true,
    title: 'Edit Layanan',
    children: <p className="text-body text-text-secondary">
        Apakah Anda yakin ingin mengubah layanan ini?
      </p>,
    footer: <>
        <Button variant="outline">Batal</Button>
        <Button variant="primary">Simpan</Button>
      </>,
    onClose: () => {}
  }
}`,
          ...h.parameters?.docs?.source,
        },
      },
    }),
    (g.parameters = {
      ...g.parameters,
      docs: {
        ...g.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    open: true,
    children: <p className="text-body text-text-secondary">
        Modal tanpa judul — hanya konten.
      </p>,
    onClose: () => {}
  }
}`,
          ...g.parameters?.docs?.source,
        },
      },
    }),
    (_.parameters = {
      ..._.parameters,
      docs: {
        ..._.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    open: true,
    title: 'Informasi',
    children: <p className="text-body text-text-secondary">
        Modal tanpa footer — hanya konten body. Tutup dengan klik backdrop atau tombol X.
      </p>,
    onClose: () => {}
  }
}`,
          ..._.parameters?.docs?.source,
        },
      },
    }),
    (v.parameters = {
      ...v.parameters,
      docs: {
        ...v.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    open: true,
    title: 'Syarat & Ketentuan',
    children: <div className="space-y-3 text-body-sm text-text-secondary">
        {Array.from({
        length: 8
      }, (_, i) => <p key={i}>
            {i + 1}. Dengan menggunakan layanan Spesialis, Anda menyetujui
            ketentuan berikut ini. Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Quisquam, quos.
          </p>)}
      </div>,
    footer: <>
        <Button variant="outline">Tutup</Button>
        <Button variant="primary">Setuju</Button>
      </>,
    onClose: () => {}
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y = [`Default`, `WithoutTitle`, `WithoutFooter`, `LongContent`]));
})();
export {
  h as Default,
  v as LongContent,
  _ as WithoutFooter,
  g as WithoutTitle,
  y as __namedExportsOrder,
  m as default,
};
