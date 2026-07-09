import { i as e, s as t } from './preload-helper-CT_b8DTk.js';
import { t as n } from './iframe-jHwL9Lyt.js';
import { n as r, t as i } from './cn-B_A6aTpF.js';
import { n as a, t as o } from './dist--7rmTAu9.js';
import { t as s } from './jsx-dev-runtime-CF1HYdPe.js';
function c({ src: e, alt: t, fallback: n, size: r, className: a }) {
  let [o, s] = (0, l.useState)(!1),
    c = e && !o,
    p =
      n ??
      t
        .split(` `)
        .map((e) => e[0])
        .join(``)
        .toUpperCase()
        .slice(0, 2),
    m = c;
  return (0, u.jsxDEV)(
    `div`,
    {
      className: i(f({ size: r }), a),
      ...(m ? { 'aria-hidden': !0 } : { role: `img`, 'aria-label': t }),
      children: c
        ? (0, u.jsxDEV)(
            `img`,
            { src: e, alt: t, onError: () => s(!0), className: `h-full w-full object-cover` },
            void 0,
            !1,
            { fileName: d, lineNumber: 68, columnNumber: 9 },
            this,
          )
        : (0, u.jsxDEV)(
            `span`,
            { 'aria-hidden': `true`, className: `select-none`, children: p },
            void 0,
            !1,
            { fileName: d, lineNumber: 75, columnNumber: 9 },
            this,
          ),
    },
    void 0,
    !1,
    { fileName: d, lineNumber: 61, columnNumber: 5 },
    this,
  );
}
var l,
  u,
  d,
  f,
  p = e(() => {
    ((l = t(n(), 1)),
      a(),
      r(),
      (u = s()),
      (d = `/home/ken/Projects/spesialis/packages/ui/src/components/Avatar.tsx`),
      (f = o(
        `relative inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold overflow-hidden shrink-0`,
        {
          variants: {
            size: {
              sm: `h-8 w-8 text-caption`,
              md: `h-10 w-10 text-body-sm`,
              lg: `h-12 w-12 text-body`,
              xl: `h-16 w-16 text-h5`,
            },
          },
          defaultVariants: { size: `md` },
        },
      )),
      (c.__docgenInfo = {
        description: `Avatar displays a circular photo with initials fallback.

When \`src\` fails to load, the component gracefully falls back
to displaying initials derived from \`alt\` or explicit \`fallback\`.

@example
<Avatar src="/photo.jpg" alt="John Doe" />
<Avatar alt="Admin" size="lg" />
<Avatar alt="Partner" fallback="PT" size="xl" />`,
        methods: [],
        displayName: `Avatar`,
        props: {
          src: {
            required: !1,
            tsType: { name: `string` },
            description: `Image source URL. When falsy or on error, initials are shown.`,
          },
          alt: {
            required: !0,
            tsType: { name: `string` },
            description: `Required accessible label. Also used to generate initials.`,
          },
          fallback: {
            required: !1,
            tsType: { name: `string` },
            description: `Explicit fallback initials (max 2 chars). Defaults from alt text.`,
          },
          className: { required: !1, tsType: { name: `string` }, description: `` },
        },
        composes: [`VariantProps`],
      }));
  }),
  m,
  h,
  g,
  _,
  v,
  y,
  b,
  x,
  S;
e(() => {
  (p(),
    (m = {
      title: `DataDisplay/Avatar`,
      component: c,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        size: { control: `select`, options: [`sm`, `md`, `lg`, `xl`] },
        src: { control: `text` },
        alt: { control: `text` },
        fallback: { control: `text` },
      },
      args: { alt: `John Doe` },
    }),
    (h = { args: { alt: `Admin User` } }),
    (g = { args: { alt: `John Doe`, src: `https://i.pravatar.cc/150?u=john` } }),
    (_ = { args: { size: `sm`, alt: `Small Avatar` } }),
    (v = { args: { size: `lg`, alt: `Large Avatar` } }),
    (y = { args: { size: `xl`, alt: `Extra Large Avatar` } }),
    (b = { args: { alt: `Partner Teknisi`, fallback: `PT` } }),
    (x = { args: { alt: `Admin`, size: `lg` } }),
    (h.parameters = {
      ...h.parameters,
      docs: {
        ...h.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    alt: 'Admin User'
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
    alt: 'John Doe',
    src: 'https://i.pravatar.cc/150?u=john'
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
    size: 'sm',
    alt: 'Small Avatar'
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
    size: 'lg',
    alt: 'Large Avatar'
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
    size: 'xl',
    alt: 'Extra Large Avatar'
  }
}`,
          ...y.parameters?.docs?.source,
        },
      },
    }),
    (b.parameters = {
      ...b.parameters,
      docs: {
        ...b.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    alt: 'Partner Teknisi',
    fallback: 'PT'
  }
}`,
          ...b.parameters?.docs?.source,
        },
      },
    }),
    (x.parameters = {
      ...x.parameters,
      docs: {
        ...x.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    alt: 'Admin',
    size: 'lg'
  }
}`,
          ...x.parameters?.docs?.source,
        },
      },
    }),
    (S = [
      `Initials`,
      `WithImage`,
      `Small`,
      `Large`,
      `ExtraLarge`,
      `CustomFallback`,
      `SingleInitial`,
    ]));
})();
export {
  b as CustomFallback,
  y as ExtraLarge,
  h as Initials,
  v as Large,
  x as SingleInitial,
  _ as Small,
  g as WithImage,
  S as __namedExportsOrder,
  m as default,
};
