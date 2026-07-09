import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './cn-B_A6aTpF.js';
import { n as r, t as i } from './dist--7rmTAu9.js';
import { t as a } from './jsx-dev-runtime-CF1HYdPe.js';
function o({ variant: e, className: t, ...r }) {
  return (0, s.jsxDEV)(
    `div`,
    { className: n(l({ variant: e }), t), 'aria-hidden': `true`, ...r },
    void 0,
    !1,
    { fileName: c, lineNumber: 39, columnNumber: 5 },
    this,
  );
}
var s,
  c,
  l,
  u = e(() => {
    (r(),
      t(),
      (s = a()),
      (c = `/home/ken/Projects/spesialis/packages/ui/src/components/Skeleton.tsx`),
      (l = i(`animate-skeleton rounded-sm bg-neutral-200`, {
        variants: {
          variant: {
            text: `h-4 w-full`,
            heading: `h-8 w-3/4`,
            avatar: `h-10 w-10 rounded-full shrink-0`,
            card: `h-48 w-full rounded-xl`,
            table: `h-12 w-full rounded-md`,
            form: `h-10 w-full rounded-md`,
            dashboard: `h-32 w-full rounded-xl`,
            hero: `h-96 w-full rounded-xl`,
          },
        },
        defaultVariants: { variant: `text` },
      })),
      (o.__docgenInfo = {
        description: `Skeleton loading placeholder.

Use \`variant\` to match the shape of the content being loaded.
The shimmer animation runs via the \`animate-skeleton\` class
(defined in global.css keyframes).

@example
<Skeleton variant="card" />
<Skeleton variant="text" className="w-1/2" />`,
        methods: [],
        displayName: `Skeleton`,
        composes: [`HTMLAttributes`, `VariantProps`],
      }));
  }),
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
  (u(),
    (d = {
      title: `Feedback/Skeleton`,
      component: o,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        variant: {
          control: `select`,
          options: [`text`, `heading`, `avatar`, `card`, `table`, `form`, `dashboard`, `hero`],
        },
      },
    }),
    (f = { args: { variant: `text`, className: `w-64` } }),
    (p = { args: { variant: `heading` } }),
    (m = { args: { variant: `avatar` } }),
    (h = { args: { variant: `card`, className: `w-80` } }),
    (g = { args: { variant: `table`, className: `w-full max-w-xl` } }),
    (_ = { args: { variant: `form`, className: `w-80` } }),
    (v = { args: { variant: `dashboard`, className: `w-80` } }),
    (y = { args: { variant: `hero`, className: `w-full max-w-4xl` } }),
    (f.parameters = {
      ...f.parameters,
      docs: {
        ...f.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'text',
    className: 'w-64'
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
    variant: 'heading'
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
    variant: 'avatar'
  }
}`,
          ...m.parameters?.docs?.source,
        },
      },
    }),
    (h.parameters = {
      ...h.parameters,
      docs: {
        ...h.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'card',
    className: 'w-80'
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
    variant: 'table',
    className: 'w-full max-w-xl'
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
    variant: 'form',
    className: 'w-80'
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
    variant: 'dashboard',
    className: 'w-80'
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
    variant: 'hero',
    className: 'w-full max-w-4xl'
  }
}`,
          ...y.parameters?.docs?.source,
        },
      },
    }),
    (b = [
      `Text`,
      `Heading`,
      `Avatar`,
      `Card`,
      `TableRow`,
      `FormField`,
      `DashboardCard`,
      `HeroSection`,
    ]));
})();
export {
  m as Avatar,
  h as Card,
  v as DashboardCard,
  _ as FormField,
  p as Heading,
  y as HeroSection,
  g as TableRow,
  f as Text,
  b as __namedExportsOrder,
  d as default,
};
