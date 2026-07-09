import { i as e } from './preload-helper-CT_b8DTk.js';
import { i as t, t as n } from './Typography-BCu9oHDA.js';
var r, i, a, o;
e(() => {
  (t(),
    (r = {
      title: `Typography/Display`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        size: { control: `select`, options: [`xl`, `lg`] },
        as: { control: `select`, options: [`h1`, `h2`, `h3`] },
      },
      args: { size: `xl`, children: `Layanan Profesional Tanpa Ribet` },
    }),
    (i = { name: `Display XL`, args: { size: `xl`, children: `Layanan Profesional Tanpa Ribet` } }),
    (a = { name: `Display LG`, args: { size: `lg`, as: `h2`, children: `Mengapa Memilih Kami` } }),
    (i.parameters = {
      ...i.parameters,
      docs: {
        ...i.parameters?.docs,
        source: {
          originalSource: `{
  name: 'Display XL',
  args: {
    size: 'xl',
    children: 'Layanan Profesional Tanpa Ribet'
  }
}`,
          ...i.parameters?.docs?.source,
        },
      },
    }),
    (a.parameters = {
      ...a.parameters,
      docs: {
        ...a.parameters?.docs,
        source: {
          originalSource: `{
  name: 'Display LG',
  args: {
    size: 'lg',
    as: 'h2',
    children: 'Mengapa Memilih Kami'
  }
}`,
          ...a.parameters?.docs?.source,
        },
      },
    }),
    (o = [`XL`, `LG`]));
})();
export { a as LG, i as XL, o as __namedExportsOrder, r as default };
