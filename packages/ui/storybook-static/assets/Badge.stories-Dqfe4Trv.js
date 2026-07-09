import { i as e } from './preload-helper-CT_b8DTk.js';
import { n as t, t as n } from './Badge-BZAEx3df.js';
var r, i, a, o, s, c, l;
e(() => {
  (t(),
    (r = {
      title: `DataDisplay/Badge`,
      component: n,
      parameters: { layout: `centered` },
      tags: [`autodocs`],
      argTypes: {
        variant: {
          control: `select`,
          options: [`default`, `success`, `warning`, `danger`, `info`],
        },
      },
      args: { children: `Label` },
    }),
    (i = { args: { children: `Default` } }),
    (a = { args: { variant: `success`, children: `Selesai` } }),
    (o = { args: { variant: `warning`, children: `Pending` } }),
    (s = { args: { variant: `danger`, children: `Gagal` } }),
    (c = { args: { variant: `info`, children: `Info` } }),
    (i.parameters = {
      ...i.parameters,
      docs: {
        ...i.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    children: 'Default'
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
  args: {
    variant: 'success',
    children: 'Selesai'
  }
}`,
          ...a.parameters?.docs?.source,
        },
      },
    }),
    (o.parameters = {
      ...o.parameters,
      docs: {
        ...o.parameters?.docs,
        source: {
          originalSource: `{
  args: {
    variant: 'warning',
    children: 'Pending'
  }
}`,
          ...o.parameters?.docs?.source,
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
    variant: 'danger',
    children: 'Gagal'
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
    variant: 'info',
    children: 'Info'
  }
}`,
          ...c.parameters?.docs?.source,
        },
      },
    }),
    (l = [`Default`, `Success`, `Warning`, `Danger`, `Info`]));
})();
export {
  s as Danger,
  i as Default,
  c as Info,
  a as Success,
  o as Warning,
  l as __namedExportsOrder,
  r as default,
};
