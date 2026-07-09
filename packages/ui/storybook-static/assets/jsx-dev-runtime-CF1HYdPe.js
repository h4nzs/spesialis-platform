import { r as e } from './preload-helper-CT_b8DTk.js';
import { t } from './iframe-jHwL9Lyt.js';
var n = e((e) => {
    (function () {
      function n(e) {
        if (e == null) return null;
        if (typeof e == `function`)
          return e.$$typeof === O ? null : e.displayName || e.name || null;
        if (typeof e == `string`) return e;
        switch (e) {
          case _:
            return `Fragment`;
          case y:
            return `Profiler`;
          case v:
            return `StrictMode`;
          case C:
            return `Suspense`;
          case w:
            return `SuspenseList`;
          case D:
            return `Activity`;
        }
        if (typeof e == `object`)
          switch (
            (typeof e.tag == `number` &&
              console.error(
                `Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.`,
              ),
            e.$$typeof)
          ) {
            case g:
              return `Portal`;
            case x:
              return (e.displayName || `Context`) + `.Provider`;
            case b:
              return (e._context.displayName || `Context`) + `.Consumer`;
            case S:
              var t = e.render;
              return (
                (e = e.displayName),
                (e ||=
                  ((e = t.displayName || t.name || ``),
                  e === `` ? `ForwardRef` : `ForwardRef(` + e + `)`)),
                e
              );
            case T:
              return ((t = e.displayName || null), t === null ? n(e.type) || `Memo` : t);
            case E:
              ((t = e._payload), (e = e._init));
              try {
                return n(e(t));
              } catch {}
          }
        return null;
      }
      function r(e) {
        return `` + e;
      }
      function i(e) {
        try {
          r(e);
          var t = !1;
        } catch {
          t = !0;
        }
        if (t) {
          t = console;
          var n = t.error,
            i =
              (typeof Symbol == `function` && Symbol.toStringTag && e[Symbol.toStringTag]) ||
              e.constructor.name ||
              `Object`;
          return (
            n.call(
              t,
              `The provided key is an unsupported type %s. This value must be coerced to a string before using it here.`,
              i,
            ),
            r(e)
          );
        }
      }
      function a(e) {
        if (e === _) return `<>`;
        if (typeof e == `object` && e && e.$$typeof === E) return `<...>`;
        try {
          var t = n(e);
          return t ? `<` + t + `>` : `<...>`;
        } catch {
          return `<...>`;
        }
      }
      function o() {
        var e = k.A;
        return e === null ? null : e.getOwner();
      }
      function s() {
        return Error(`react-stack-top-frame`);
      }
      function c(e) {
        if (A.call(e, `key`)) {
          var t = Object.getOwnPropertyDescriptor(e, `key`).get;
          if (t && t.isReactWarning) return !1;
        }
        return e.key !== void 0;
      }
      function l(e, t) {
        function n() {
          N ||
            ((N = !0),
            console.error(
              '%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)',
              t,
            ));
        }
        ((n.isReactWarning = !0), Object.defineProperty(e, 'key', { get: n, configurable: !0 }));
      }
      function u() {
        var e = n(this.type);
        return (
          P[e] ||
            ((P[e] = !0),
            console.error(
              `Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.`,
            )),
          (e = this.props.ref),
          e === void 0 ? null : e
        );
      }
      function d(e, t, n, r, i, a, o, s) {
        return (
          (n = a.ref),
          (e = { $$typeof: h, type: e, key: t, props: a, _owner: i }),
          (n === void 0 ? null : n) === null
            ? Object.defineProperty(e, 'ref', { enumerable: !1, value: null })
            : Object.defineProperty(e, 'ref', { enumerable: !1, get: u }),
          (e._store = {}),
          Object.defineProperty(e._store, 'validated', {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(e, '_debugInfo', {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(e, '_debugStack', {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: o,
          }),
          Object.defineProperty(e, '_debugTask', {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: s,
          }),
          Object.freeze && (Object.freeze(e.props), Object.freeze(e)),
          e
        );
      }
      function f(e, t, r, a, s, u, f, m) {
        var h = t.children;
        if (h !== void 0)
          if (a)
            if (j(h)) {
              for (a = 0; a < h.length; a++) p(h[a]);
              Object.freeze && Object.freeze(h);
            } else
              console.error(
                `React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.`,
              );
          else p(h);
        if (A.call(t, `key`)) {
          h = n(e);
          var g = Object.keys(t).filter(function (e) {
            return e !== `key`;
          });
          ((a = 0 < g.length ? `{key: someKey, ` + g.join(`: ..., `) + `: ...}` : `{key: someKey}`),
            L[h + a] ||
              ((g = 0 < g.length ? `{` + g.join(`: ..., `) + `: ...}` : `{}`),
              console.error(
                `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
                a,
                h,
                g,
                h,
              ),
              (L[h + a] = !0)));
        }
        if (
          ((h = null),
          r !== void 0 && (i(r), (h = `` + r)),
          c(t) && (i(t.key), (h = `` + t.key)),
          `key` in t)
        )
          for (var _ in ((r = {}), t)) _ !== `key` && (r[_] = t[_]);
        else r = t;
        return (
          h && l(r, typeof e == `function` ? e.displayName || e.name || `Unknown` : e),
          d(e, h, u, s, o(), r, f, m)
        );
      }
      function p(e) {
        typeof e == `object` && e && e.$$typeof === h && e._store && (e._store.validated = 1);
      }
      var m = t(),
        h = Symbol.for(`react.transitional.element`),
        g = Symbol.for(`react.portal`),
        _ = Symbol.for(`react.fragment`),
        v = Symbol.for(`react.strict_mode`),
        y = Symbol.for(`react.profiler`),
        b = Symbol.for(`react.consumer`),
        x = Symbol.for(`react.context`),
        S = Symbol.for(`react.forward_ref`),
        C = Symbol.for(`react.suspense`),
        w = Symbol.for(`react.suspense_list`),
        T = Symbol.for(`react.memo`),
        E = Symbol.for(`react.lazy`),
        D = Symbol.for(`react.activity`),
        O = Symbol.for(`react.client.reference`),
        k = m.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
        A = Object.prototype.hasOwnProperty,
        j = Array.isArray,
        M = console.createTask
          ? console.createTask
          : function () {
              return null;
            };
      m = {
        'react-stack-bottom-frame': function (e) {
          return e();
        },
      };
      var N,
        P = {},
        F = m[`react-stack-bottom-frame`].bind(m, s)(),
        I = M(a(s)),
        L = {};
      ((e.Fragment = _),
        (e.jsxDEV = function (e, t, n, r, i, o) {
          var s = 1e4 > k.recentlyCreatedOwnerStacks++;
          return f(e, t, n, r, i, o, s ? Error(`react-stack-top-frame`) : F, s ? M(a(e)) : I);
        }));
    })();
  }),
  r = e((e, t) => {
    t.exports = n();
  });
export { r as t };
