import { i as e } from './preload-helper-CT_b8DTk.js';
import { t } from './react-dom-CkkJXQdF.js';
import { n, t as r } from './cn-B_A6aTpF.js';
import { t as i } from './jsx-dev-runtime-CF1HYdPe.js';
function a({
  open: e,
  title: t,
  children: n,
  confirmLabel: i = `Konfirmasi`,
  cancelLabel: a = `Batal`,
  confirmVariant: l = `primary`,
  onConfirm: u,
  onCancel: d,
  loading: f,
}) {
  return e
    ? (0, o.createPortal)(
        (0, s.jsxDEV)(
          `div`,
          {
            className: `fixed inset-0 z-modal flex items-center justify-center`,
            role: `alertdialog`,
            'aria-modal': `true`,
            'aria-labelledby': `confirm-title`,
            children: [
              (0, s.jsxDEV)(
                `div`,
                { className: `absolute inset-0 bg-bg-overlay`, onClick: d },
                void 0,
                !1,
                { fileName: c, lineNumber: 64, columnNumber: 7 },
                this,
              ),
              (0, s.jsxDEV)(
                `div`,
                {
                  className: `relative z-10 mx-auto w-full max-w-md animate-scale-in rounded-2xl border border-border-default bg-bg-modal p-6 shadow-xl`,
                  onKeyDown: (e) => e.key === `Escape` && d(),
                  children: [
                    (0, s.jsxDEV)(
                      `h2`,
                      { id: `confirm-title`, className: `text-h5 text-text-primary`, children: t },
                      void 0,
                      !1,
                      { fileName: c, lineNumber: 71, columnNumber: 9 },
                      this,
                    ),
                    (0, s.jsxDEV)(
                      `div`,
                      { className: `mt-3 text-body text-text-secondary`, children: n },
                      void 0,
                      !1,
                      { fileName: c, lineNumber: 74, columnNumber: 9 },
                      this,
                    ),
                    (0, s.jsxDEV)(
                      `div`,
                      {
                        className: `mt-6 flex justify-end gap-3`,
                        children: [
                          (0, s.jsxDEV)(
                            `button`,
                            {
                              type: `button`,
                              onClick: d,
                              disabled: f,
                              className: `inline-flex h-10 items-center justify-center rounded-md border border-border-default bg-bg-surface px-4 text-body-sm font-medium text-text-primary transition-colors hover:bg-neutral-100 disabled:opacity-50`,
                              children: a,
                            },
                            void 0,
                            !1,
                            { fileName: c, lineNumber: 76, columnNumber: 11 },
                            this,
                          ),
                          (0, s.jsxDEV)(
                            `button`,
                            {
                              type: `button`,
                              onClick: u,
                              disabled: f,
                              className: r(
                                `inline-flex h-10 items-center justify-center rounded-md px-4 text-body-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50`,
                                l === `danger`
                                  ? `bg-danger-500 hover:bg-danger-600`
                                  : `bg-primary-500 hover:bg-primary-600`,
                              ),
                              children: f ? `Memproses...` : i,
                            },
                            void 0,
                            !1,
                            { fileName: c, lineNumber: 84, columnNumber: 11 },
                            this,
                          ),
                        ],
                      },
                      void 0,
                      !0,
                      { fileName: c, lineNumber: 75, columnNumber: 9 },
                      this,
                    ),
                  ],
                },
                void 0,
                !0,
                { fileName: c, lineNumber: 67, columnNumber: 7 },
                this,
              ),
            ],
          },
          void 0,
          !0,
          { fileName: c, lineNumber: 57, columnNumber: 5 },
          this,
        ),
        document.body,
      )
    : null;
}
var o,
  s,
  c,
  l = e(() => {
    ((o = t()),
      n(),
      (s = i()),
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/ConfirmDialog.tsx`));
  }),
  u,
  d,
  f,
  p,
  m,
  h;
e(() => {
  (l(),
    (u = {
      title: `Feedback/ConfirmDialog`,
      component: a,
      parameters: {
        layout: `centered`,
        docs: {
          description: {
            component: `Confirmation dialog with backdrop, portal rendering, and loading state for async actions.`,
          },
        },
      },
      tags: [`autodocs`],
      argTypes: {
        confirmVariant: { control: `select`, options: [`primary`, `danger`] },
        loading: { control: `boolean` },
      },
      args: {
        open: !0,
        title: `Konfirmasi`,
        children: `Apakah Anda yakin ingin melanjutkan?`,
        confirmLabel: `Konfirmasi`,
        cancelLabel: `Batal`,
        onConfirm: () => {},
        onCancel: () => {},
      },
    }),
    (d = {}),
    (f = {
      args: {
        title: `Hapus Data`,
        children: `Data ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
        confirmLabel: `Hapus`,
        confirmVariant: `danger`,
      },
    }),
    (p = {
      args: {
        title: `Memproses...`,
        children: `Mohon tunggu sebentar.`,
        confirmLabel: `Simpan`,
        loading: !0,
      },
    }),
    (m = {
      args: {
        title: `Booking Ulang`,
        children: `Apakah Anda yakin ingin melakukan booking ulang untuk layanan ini? Jadwal yang sudah ada akan dibatalkan dan diganti dengan jadwal baru. Pastikan Anda telah menghubungi mitra terkait sebelum melanjutkan.`,
        confirmLabel: `Ya, Booking Ulang`,
      },
    }),
    (d.parameters = {
      ...d.parameters,
      docs: {
        ...d.parameters?.docs,
        source: { originalSource: `{}`, ...d.parameters?.docs?.source },
      },
    }),
    (f.parameters = {
      ...f.parameters,
      docs: {
        ...f.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    title: 'Hapus Data',
    children: 'Data ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.',
    confirmLabel: 'Hapus',
    confirmVariant: 'danger'
  }
}`,
          ...f.parameters?.docs?.source,
        },
      },
    }),
    (p.parameters = {
      ...p.parameters,
      docs: {
        ...p.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    title: 'Memproses...',
    children: 'Mohon tunggu sebentar.',
    confirmLabel: 'Simpan',
    loading: true
  }
}`,
          ...p.parameters?.docs?.source,
        },
      },
    }),
    (m.parameters = {
      ...m.parameters,
      docs: {
        ...m.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    title: 'Booking Ulang',
    children: 'Apakah Anda yakin ingin melakukan booking ulang untuk layanan ini? Jadwal yang sudah ada akan dibatalkan dan diganti dengan jadwal baru. Pastikan Anda telah menghubungi mitra terkait sebelum melanjutkan.',
    confirmLabel: 'Ya, Booking Ulang'
  }
}`,
          ...m.parameters?.docs?.source,
        },
      },
    }),
    (h = [`Default`, `DangerConfirm`, `Loading`, `LongText`]));
})();
export {
  f as DangerConfirm,
  d as Default,
  p as Loading,
  m as LongText,
  h as __namedExportsOrder,
  u as default,
};
