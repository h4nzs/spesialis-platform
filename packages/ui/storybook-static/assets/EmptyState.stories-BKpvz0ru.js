import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { t as r } from './jsx-dev-runtime-CF1HYdPe.js';
import { n as i, t as a } from './Button-DyXtvLMV.js';
function o({ icon: e, title: t, description: r, action: i, className: a }) {
  return (0, s.jsxDEV)(
    `div`,
    {
      className: n(`flex flex-col items-center justify-center px-6 py-16 text-center`, a),
      children: [
        e &&
          (0, s.jsxDEV)(
            `div`,
            {
              className: `mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-text-muted`,
              'aria-hidden': `true`,
              dangerouslySetInnerHTML: { __html: e },
            },
            void 0,
            !1,
            { fileName: c, lineNumber: 33, columnNumber: 9 },
            this,
          ),
        (0, s.jsxDEV)(
          `h3`,
          { className: `text-h5 text-text-primary`, children: t },
          void 0,
          !1,
          { fileName: c, lineNumber: 39, columnNumber: 7 },
          this,
        ),
        r &&
          (0, s.jsxDEV)(
            `p`,
            { className: `mt-2 max-w-sm text-body text-text-secondary`, children: r },
            void 0,
            !1,
            { fileName: c, lineNumber: 40, columnNumber: 23 },
            this,
          ),
        i &&
          (0, s.jsxDEV)(
            `div`,
            { className: `mt-6`, children: i },
            void 0,
            !1,
            { fileName: c, lineNumber: 41, columnNumber: 18 },
            this,
          ),
      ],
    },
    void 0,
    !0,
    { fileName: c, lineNumber: 29, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l = e(() => {
    (t(),
      (s = r()),
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/EmptyState.tsx`),
      (o.__docgenInfo = {
        description: `Empty state placeholder with icon, title, description, and optional action.

@example
<EmptyState
  icon='<svg .../>'
  title="Belum ada pesanan"
  description="Pesan layanan pertama Anda sekarang."
  action={<Button>Booking Sekarang</Button>}
/>`,
        methods: [],
        displayName: `EmptyState`,
        props: {
          icon: {
            required: !1,
            tsType: { name: `string` },
            description: `Optional icon rendered as inline SVG string (Lucide-compatible).`,
          },
          title: { required: !0, tsType: { name: `string` }, description: `Primary heading text.` },
          description: {
            required: !1,
            tsType: { name: `string` },
            description: `Supporting description.`,
          },
          action: {
            required: !1,
            tsType: { name: `ReactNode` },
            description: `Call-to-action element (button, link).`,
          },
          className: { required: !1, tsType: { name: `string` }, description: `` },
        },
      }));
  }),
  u,
  d,
  f,
  p,
  m,
  h,
  g,
  _,
  v,
  y,
  b;
e(() => {
  (l(),
    i(),
    (u = r()),
    (d = `/home/ken/Projects/spesialis/packages/ui/src/components/EmptyState.stories.tsx`),
    (f = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`),
    (p = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`),
    (m = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`),
    (h = {
      title: `Feedback/EmptyState`,
      component: o,
      parameters: { layout: `padded` },
      tags: [`autodocs`],
      argTypes: { title: { control: `text` }, description: { control: `text` } },
    }),
    (g = {
      args: {
        icon: f,
        title: `Belum ada data`,
        description: `Belum ada data yang tersedia untuk ditampilkan.`,
      },
    }),
    (_ = {
      args: {
        icon: p,
        title: `Belum ada pesanan`,
        description: `Pesan layanan pertama Anda sekarang untuk mulai menggunakan spesialis.`,
        action: (0, u.jsxDEV)(
          a,
          { children: `Booking Sekarang` },
          void 0,
          !1,
          { fileName: d, lineNumber: 37, columnNumber: 13 },
          void 0,
        ),
      },
    }),
    (v = {
      args: {
        icon: m,
        title: `Pencarian tidak ditemukan`,
        description: `Tidak ada hasil yang cocok dengan kata kunci Anda. Coba gunakan kata kunci lain.`,
      },
    }),
    (y = { args: { title: `Coming Soon`, description: `Fitur ini akan segera tersedia.` } }),
    (g.parameters = {
      ...g.parameters,
      docs: {
        ...g.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    icon: FOLDER_ICON,
    title: 'Belum ada data',
    description: 'Belum ada data yang tersedia untuk ditampilkan.'
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
    icon: INBOX_ICON,
    title: 'Belum ada pesanan',
    description: 'Pesan layanan pertama Anda sekarang untuk mulai menggunakan spesialis.',
    action: <Button>Booking Sekarang</Button>
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
    icon: SEARCH_ICON,
    title: 'Pencarian tidak ditemukan',
    description: 'Tidak ada hasil yang cocok dengan kata kunci Anda. Coba gunakan kata kunci lain.'
  }
}`,
          ...v.parameters?.docs?.source,
        },
      },
    }),
    (y.parameters = {
      ...y.parameters,
      docs: {
        ...y.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    title: 'Coming Soon',
    description: 'Fitur ini akan segera tersedia.'
  }
}`,
          ...y.parameters?.docs?.source,
        },
      },
    }),
    (b = [`Default`, `WithAction`, `NoResults`, `WithoutIcon`]));
})();
export {
  g as Default,
  v as NoResults,
  _ as WithAction,
  y as WithoutIcon,
  b as __namedExportsOrder,
  h as default,
};
