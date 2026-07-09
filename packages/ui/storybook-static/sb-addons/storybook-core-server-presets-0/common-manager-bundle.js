try {
  (() => {
    var qm = Object.defineProperty;
    var tr = ((e) =>
      typeof require < 'u'
        ? require
        : typeof Proxy < 'u'
          ? new Proxy(e, { get: (t, r) => (typeof require < 'u' ? require : t)[r] })
          : e)(function (e) {
      if (typeof require < 'u') return require.apply(this, arguments);
      throw Error('Dynamic require of "' + e + '" is not supported');
    });
    var mt = (e, t, r) => () => {
      if (r) throw r[0];
      try {
        return (e && (t = e((e = 0))), t);
      } catch (n) {
        throw ((r = [n]), n);
      }
    };
    var zm = (e, t) => {
      for (var r in t) qm(e, r, { get: t[r], enumerable: !0 });
    };
    var U = mt(() => {});
    var V = mt(() => {});
    var H = mt(() => {});
    var Ke,
      Yr,
      Uo = mt(() => {
        U();
        V();
        H();
        ((Ke = (e, t) => {
          let r = e.replace(/\s+/g, '-');
          return t ? `control-${t}-${r}` : `control-${r}`;
        }),
          (Yr = (e, t) => {
            let r = e.replace(/\s+/g, '-');
            return t ? `set-${t}-${r}` : `set-${r}`;
          }));
      });
    var jh,
      Ko,
      Uh,
      js,
      Vh,
      Hh,
      en,
      de,
      Xo,
      Jh,
      We,
      it = mt(() => {
        U();
        V();
        H();
        ((jh = Object.create),
          (Ko = Object.defineProperty),
          (Uh = Object.getOwnPropertyDescriptor),
          (js = Object.getOwnPropertyNames),
          (Vh = Object.getPrototypeOf),
          (Hh = Object.prototype.hasOwnProperty),
          (en = ((e) =>
            typeof tr < 'u'
              ? tr
              : typeof Proxy < 'u'
                ? new Proxy(e, { get: (t, r) => (typeof tr < 'u' ? tr : t)[r] })
                : e)(function (e) {
            if (typeof tr < 'u') return tr.apply(this, arguments);
            throw Error('Dynamic require of "' + e + '" is not supported');
          })),
          (de = (e, t) =>
            function () {
              try {
                return (t || (0, e[js(e)[0]])((t = { exports: {} }).exports, t), t.exports);
              } catch (r) {
                throw ((t = 0), r);
              }
            }),
          (Xo = (e, t) => {
            for (var r in t) Ko(e, r, { get: t[r], enumerable: !0 });
          }),
          (Jh = (e, t, r, n) => {
            if ((t && typeof t == 'object') || typeof t == 'function')
              for (let o of js(t))
                !Hh.call(e, o) &&
                  o !== r &&
                  Ko(e, o, { get: () => t[o], enumerable: !(n = Uh(t, o)) || n.enumerable });
            return e;
          }),
          (We = (e, t, r) => (
            (r = e != null ? jh(Vh(e)) : {}),
            Jh(t || !e || !e.__esModule ? Ko(r, 'default', { value: e, enumerable: !0 }) : r, e)
          )));
      });
    var u,
      Ks,
      Ot,
      Ht,
      ax,
      ix,
      sx,
      Xs,
      lx,
      ux,
      je,
      In,
      te,
      cx,
      dx,
      Zs,
      px,
      Qs,
      Ze,
      mx,
      hx,
      se,
      Dn,
      fx,
      gx,
      ee,
      yx,
      bx,
      Ex,
      Pn,
      we,
      Sx,
      he,
      X,
      Ax,
      Tx,
      wx,
      G = mt(() => {
        U();
        V();
        H();
        ((u = __REACT__),
          ({
            Children: Ks,
            Component: Ot,
            Fragment: Ht,
            Profiler: ax,
            PureComponent: ix,
            StrictMode: sx,
            Suspense: Xs,
            __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: lx,
            act: ux,
            cloneElement: je,
            createContext: In,
            createElement: te,
            createFactory: cx,
            createRef: dx,
            forwardRef: Zs,
            isValidElement: px,
            lazy: Qs,
            memo: Ze,
            startTransition: mx,
            unstable_act: hx,
            useCallback: se,
            useContext: Dn,
            useDebugValue: fx,
            useDeferredValue: gx,
            useEffect: ee,
            useId: yx,
            useImperativeHandle: bx,
            useInsertionEffect: Ex,
            useLayoutEffect: Pn,
            useMemo: we,
            useReducer: Sx,
            useRef: he,
            useState: X,
            useSyncExternalStore: Ax,
            useTransition: Tx,
            version: wx,
          } = __REACT__));
      });
    var Cx,
      Ox,
      Rx,
      el,
      Ix,
      kn,
      Rr,
      tl,
      Dx,
      Ee,
      Px,
      Nx,
      kx,
      Fx,
      Lx,
      Bx,
      Mx,
      Fn,
      $x,
      jx,
      Ye,
      Ux,
      Vx,
      Hx,
      Jx,
      qx,
      zx,
      Gx,
      Wx,
      Yx,
      Kx,
      ot,
      Xx,
      Zx,
      Rt,
      Qx,
      eC,
      rl,
      tC,
      rC,
      Ln,
      nC,
      oC,
      nl,
      ol,
      Bn,
      al,
      aC,
      iC,
      sC,
      lC,
      uC,
      cC,
      dC,
      pC,
      il,
      mC,
      hC,
      fC,
      gC,
      yC,
      bC,
      EC,
      SC,
      AC,
      TC,
      Jt,
      sl,
      wC,
      _C,
      vC,
      ll,
      xC,
      CC,
      ul,
      OC,
      RC,
      sr,
      IC,
      DC,
      PC,
      NC,
      kC,
      FC,
      LC,
      BC,
      cl,
      ce = mt(() => {
        U();
        V();
        H();
        ((Cx = __STORYBOOK_COMPONENTS__),
          ({
            A: Ox,
            AbstractToolbar: Rx,
            ActionBar: el,
            ActionList: Ix,
            AddonPanel: kn,
            Badge: Rr,
            Bar: tl,
            Blockquote: Dx,
            Button: Ee,
            Card: Px,
            ClipboardCode: Nx,
            Code: kx,
            Collapsible: Fx,
            DL: Lx,
            Div: Bx,
            DocumentWrapper: Mx,
            EmptyTabContent: Fn,
            ErrorFormatter: $x,
            FlexBar: jx,
            Form: Ye,
            H1: Ux,
            H2: Vx,
            H3: Hx,
            H4: Jx,
            H5: qx,
            H6: zx,
            HR: Gx,
            IconButton: Wx,
            Img: Yx,
            LI: Kx,
            Link: ot,
            ListItem: Xx,
            Loader: Zx,
            Modal: Rt,
            ModalDecorator: Qx,
            OL: eC,
            P: rl,
            Placeholder: tC,
            Popover: rC,
            PopoverProvider: Ln,
            Pre: nC,
            ProgressSpinner: oC,
            ResetWrapper: nl,
            ScrollArea: ol,
            Select: Bn,
            Separator: al,
            Spaced: aC,
            Span: iC,
            StatelessTab: sC,
            StatelessTabList: lC,
            StatelessTabPanel: uC,
            StatelessTabsView: cC,
            StorybookIcon: dC,
            StorybookLogo: pC,
            SyntaxHighlighter: il,
            TT: mC,
            TabBar: hC,
            TabButton: fC,
            TabList: gC,
            TabPanel: yC,
            TabWrapper: bC,
            Table: EC,
            Tabs: SC,
            TabsState: AC,
            TabsView: TC,
            ToggleButton: Jt,
            Toolbar: sl,
            Tooltip: wC,
            TooltipLinkList: _C,
            TooltipMessage: vC,
            TooltipNote: ll,
            TooltipProvider: xC,
            UL: CC,
            WithTooltip: ul,
            WithTooltipPure: OC,
            Zoom: RC,
            codeCommon: sr,
            components: IC,
            convertToReactAriaPlacement: DC,
            createCopyToClipboardFunction: PC,
            getStoryHref: NC,
            interleaveSeparators: kC,
            nameSpaceClassNames: FC,
            resetComponents: LC,
            useTabsState: BC,
            withReset: cl,
          } = __STORYBOOK_COMPONENTS__));
      });
    var xO,
      CO,
      OO,
      RO,
      $n,
      IO,
      DO,
      PO,
      NO,
      kO,
      FO,
      LO,
      BO,
      MO,
      $O,
      jO,
      UO,
      VO,
      HO,
      JO,
      qO,
      zO,
      GO,
      WO,
      YO,
      KO,
      XO,
      ZO,
      QO,
      eR,
      tR,
      rR,
      nR,
      oR,
      aR,
      iR,
      sR,
      lR,
      uR,
      bl,
      cR,
      dR,
      pR,
      mR,
      hR,
      fR,
      gR,
      yR,
      bR,
      ER,
      jn,
      SR,
      Un,
      AR,
      El,
      Vn,
      TR,
      wR,
      Sl,
      Al,
      _R,
      vR,
      xR,
      Hn,
      CR,
      OR,
      RR,
      IR,
      DR,
      PR,
      NR,
      kR,
      FR,
      LR,
      BR,
      MR,
      $R,
      jR,
      UR,
      VR,
      HR,
      JR,
      qR,
      zR,
      GR,
      WR,
      YR,
      KR,
      Tl,
      XR,
      ZR,
      QR,
      eI,
      lr,
      tI,
      rI,
      wl,
      nI,
      oI,
      aI,
      iI,
      sI,
      lI,
      uI,
      cI,
      dI,
      pI,
      mI,
      _l,
      vl,
      hI,
      fI,
      gI,
      yI,
      bI,
      EI,
      SI,
      AI,
      TI,
      wI,
      _I,
      vI,
      xI,
      CI,
      OI,
      RI,
      xl,
      Cl,
      II,
      DI,
      PI,
      NI,
      kI,
      FI,
      LI,
      BI,
      MI,
      $I,
      jI,
      UI,
      VI,
      HI,
      JI,
      qI,
      zI,
      GI,
      WI,
      Ol,
      YI,
      KI,
      XI,
      ZI,
      QI,
      Rl,
      e5,
      t5,
      r5,
      Il,
      n5,
      o5,
      a5,
      i5,
      Ia,
      s5,
      l5,
      Dl,
      u5,
      c5,
      d5,
      p5,
      Pl,
      m5,
      Nl,
      kl,
      h5,
      f5,
      g5,
      y5,
      b5,
      E5,
      S5,
      A5,
      T5,
      w5,
      _5,
      v5,
      x5,
      C5,
      O5,
      R5,
      I5,
      Fl,
      Ll,
      D5,
      P5,
      N5,
      k5,
      F5,
      L5,
      B5,
      M5,
      $5,
      j5,
      U5,
      V5,
      H5,
      J5,
      q5,
      z5,
      G5,
      W5,
      Y5,
      K5,
      X5,
      Z5,
      Q5,
      Bl,
      eD,
      tD,
      rD,
      Ml,
      nD,
      oD,
      aD,
      iD,
      $l,
      jl,
      sD,
      lD,
      uD,
      cD,
      dD,
      pD,
      mD,
      hD,
      Jn,
      fD,
      gD,
      yD,
      bD,
      ED,
      SD,
      AD,
      TD,
      wD,
      _D,
      vD,
      xD,
      Ul,
      CD,
      OD,
      RD,
      ID,
      DD,
      PD,
      ND,
      kD,
      ke = mt(() => {
        U();
        V();
        H();
        ((xO = __STORYBOOK_ICONS__),
          ({
            AccessibilityAltIcon: CO,
            AccessibilityIcon: OO,
            AccessibilityIgnoredIcon: RO,
            AddIcon: $n,
            AdminIcon: IO,
            AlertAltIcon: DO,
            AlertIcon: PO,
            AlignLeftIcon: NO,
            AlignRightIcon: kO,
            AppleIcon: FO,
            ArrowBottomLeftIcon: LO,
            ArrowBottomRightIcon: BO,
            ArrowDownIcon: MO,
            ArrowLeftIcon: $O,
            ArrowRightIcon: jO,
            ArrowSolidDownIcon: UO,
            ArrowSolidLeftIcon: VO,
            ArrowSolidRightIcon: HO,
            ArrowSolidUpIcon: JO,
            ArrowTopLeftIcon: qO,
            ArrowTopRightIcon: zO,
            ArrowUpIcon: GO,
            AzureDevOpsIcon: WO,
            BackIcon: YO,
            BasketIcon: KO,
            BatchAcceptIcon: XO,
            BatchDenyIcon: ZO,
            BeakerIcon: QO,
            BellIcon: eR,
            BitbucketIcon: tR,
            BoldIcon: rR,
            BookIcon: nR,
            BookmarkHollowIcon: oR,
            BookmarkIcon: aR,
            BottomBarIcon: iR,
            BottomBarToggleIcon: sR,
            BoxIcon: lR,
            BranchIcon: uR,
            BrowserIcon: bl,
            BugIcon: cR,
            ButtonIcon: dR,
            CPUIcon: pR,
            CalendarIcon: mR,
            CameraIcon: hR,
            CameraStabilizeIcon: fR,
            CategoryIcon: gR,
            CertificateIcon: yR,
            ChangedIcon: bR,
            ChatIcon: ER,
            CheckIcon: jn,
            ChecklistIcon: SR,
            ChevronDownIcon: Un,
            ChevronLeftIcon: AR,
            ChevronRightIcon: El,
            ChevronSmallDownIcon: Vn,
            ChevronSmallLeftIcon: TR,
            ChevronSmallRightIcon: wR,
            ChevronSmallUpIcon: Sl,
            ChevronUpIcon: Al,
            ChromaticIcon: _R,
            ChromeIcon: vR,
            CircleHollowIcon: xR,
            CircleIcon: Hn,
            ClearIcon: CR,
            CloseAltIcon: OR,
            CloseIcon: RR,
            CloudHollowIcon: IR,
            CloudIcon: DR,
            CogIcon: PR,
            CollapseIcon: NR,
            CommandIcon: kR,
            CommentAddIcon: FR,
            CommentIcon: LR,
            CommentsIcon: BR,
            CommitIcon: MR,
            CompassIcon: $R,
            ComponentDrivenIcon: jR,
            ComponentIcon: UR,
            ContrastIcon: VR,
            ContrastIgnoredIcon: HR,
            ControlsIcon: JR,
            CopyIcon: qR,
            CreditIcon: zR,
            CrossIcon: GR,
            DashboardIcon: WR,
            DatabaseIcon: YR,
            DeleteIcon: KR,
            DiamondIcon: Tl,
            DirectionIcon: XR,
            DiscordIcon: ZR,
            DocChartIcon: QR,
            DocListIcon: eI,
            DocumentIcon: lr,
            DownloadIcon: tI,
            DragIcon: rI,
            EditIcon: wl,
            EditorIcon: nI,
            EllipsisIcon: oI,
            EmailIcon: aI,
            ExpandAltIcon: iI,
            ExpandIcon: sI,
            EyeCloseIcon: lI,
            EyeIcon: uI,
            FaceHappyIcon: cI,
            FaceNeutralIcon: dI,
            FaceSadIcon: pI,
            FacebookIcon: mI,
            FailedIcon: _l,
            FastForwardIcon: vl,
            FigmaIcon: hI,
            FilesIcon: fI,
            FilterIcon: gI,
            FlagIcon: yI,
            FolderIcon: bI,
            FormIcon: EI,
            GDriveIcon: SI,
            GiftIcon: AI,
            GithubIcon: TI,
            GitlabIcon: wI,
            GlobeIcon: _I,
            GoogleIcon: vI,
            GraphBarIcon: xI,
            GraphLineIcon: CI,
            GraphqlIcon: OI,
            GridAltIcon: RI,
            GridIcon: xl,
            GrowIcon: Cl,
            HeartHollowIcon: II,
            HeartIcon: DI,
            HomeIcon: PI,
            HourglassIcon: NI,
            InfoIcon: kI,
            ItalicIcon: FI,
            JumpToIcon: LI,
            KeyIcon: BI,
            LightningIcon: MI,
            LightningOffIcon: $I,
            LinkBrokenIcon: jI,
            LinkIcon: UI,
            LinkedinIcon: VI,
            LinuxIcon: HI,
            ListOrderedIcon: JI,
            ListUnorderedIcon: qI,
            LocationIcon: zI,
            LockIcon: GI,
            MarkdownIcon: WI,
            MarkupIcon: Ol,
            MediumIcon: YI,
            MemoryIcon: KI,
            MenuIcon: XI,
            MergeIcon: ZI,
            MirrorIcon: QI,
            MobileIcon: Rl,
            MoonIcon: e5,
            NutIcon: t5,
            OutboxIcon: r5,
            OutlineIcon: Il,
            PaintBrushAltIcon: n5,
            PaintBrushIcon: o5,
            PaperClipIcon: a5,
            ParagraphIcon: i5,
            PassedIcon: Ia,
            PhoneIcon: s5,
            PhotoDragIcon: l5,
            PhotoIcon: Dl,
            PhotoStabilizeIcon: u5,
            PinAltIcon: c5,
            PinIcon: d5,
            PlayAllHollowIcon: p5,
            PlayBackIcon: Pl,
            PlayHollowIcon: m5,
            PlayIcon: Nl,
            PlayNextIcon: kl,
            PlusIcon: h5,
            PointerDefaultIcon: f5,
            PointerHandIcon: g5,
            PopOutIcon: y5,
            PowerIcon: b5,
            PrintIcon: E5,
            ProceedIcon: S5,
            ProfileIcon: A5,
            PullRequestIcon: T5,
            QuestionIcon: w5,
            RSSIcon: _5,
            RedirectIcon: v5,
            ReduxIcon: x5,
            RefreshIcon: C5,
            ReplyIcon: O5,
            RepoIcon: R5,
            RequestChangeIcon: I5,
            RewindIcon: Fl,
            RulerIcon: Ll,
            SaveIcon: D5,
            SearchIcon: P5,
            ShareAltIcon: N5,
            ShareIcon: k5,
            ShieldIcon: F5,
            SideBySideIcon: L5,
            SidebarAltIcon: B5,
            SidebarAltToggleIcon: M5,
            SidebarIcon: $5,
            SidebarToggleIcon: j5,
            SortDownIcon: U5,
            SortUpIcon: V5,
            SpeakerIcon: H5,
            StackedIcon: J5,
            StarHollowIcon: q5,
            StarIcon: z5,
            StatusFailIcon: G5,
            StatusIcon: W5,
            StatusNewIcon: Y5,
            StatusPassIcon: K5,
            StatusWarnIcon: X5,
            StickerIcon: Z5,
            StopAltHollowIcon: Q5,
            StopAltIcon: Bl,
            StopIcon: eD,
            StorybookIcon: tD,
            StructureIcon: rD,
            SubtractIcon: Ml,
            SunIcon: nD,
            SupportIcon: oD,
            SweepIcon: aD,
            SwitchAltIcon: iD,
            SyncIcon: $l,
            TabletIcon: jl,
            ThumbsUpIcon: sD,
            TimeIcon: lD,
            TimerIcon: uD,
            TransferIcon: cD,
            TrashIcon: dD,
            TwitterIcon: pD,
            TypeIcon: mD,
            UbuntuIcon: hD,
            UndoIcon: Jn,
            UnfoldIcon: fD,
            UnlockIcon: gD,
            UnpinIcon: yD,
            UploadIcon: bD,
            UserAddIcon: ED,
            UserAltIcon: SD,
            UserIcon: AD,
            UsersIcon: TD,
            VSCodeIcon: wD,
            VerifiedIcon: _D,
            VideoIcon: vD,
            WandIcon: xD,
            WatchIcon: Ul,
            WindowsIcon: CD,
            WrenchIcon: OD,
            XIcon: RD,
            YoutubeIcon: ID,
            ZoomIcon: DD,
            ZoomOutIcon: PD,
            ZoomResetIcon: ND,
            iconList: kD,
          } = __STORYBOOK_ICONS__));
      });
    var _P,
      vP,
      xP,
      CP,
      OP,
      RP,
      Wn,
      IP,
      DP,
      PP,
      NP,
      kP,
      FP,
      LP,
      BP,
      MP,
      $P,
      jP,
      UP,
      Pa,
      VP,
      Yn,
      P,
      HP,
      JP,
      ft,
      st,
      ql,
      le = mt(() => {
        U();
        V();
        H();
        ((_P = __STORYBOOK_THEMING__),
          ({
            CacheProvider: vP,
            ClassNames: xP,
            Global: CP,
            ThemeProvider: OP,
            background: RP,
            color: Wn,
            convert: IP,
            create: DP,
            createCache: PP,
            createGlobal: NP,
            createReset: kP,
            css: FP,
            darken: LP,
            ensure: BP,
            getPreferredColorScheme: MP,
            ignoreSsrWarning: $P,
            isPropValid: jP,
            jsx: UP,
            keyframes: Pa,
            lighten: VP,
            srOnlyStyles: Yn,
            styled: P,
            themes: HP,
            tokens: JP,
            typography: ft,
            useTheme: st,
            withTheme: ql,
          } = __STORYBOOK_THEMING__));
      });
    var tn = mt(() => {
      U();
      V();
      H();
    });
    var $d = {};
    zm($d, { ColorControl: () => Md, default: () => aE });
    function g1(e, t, { signal: r, edges: n } = {}) {
      let o,
        i = null,
        a = n != null && n.includes('leading'),
        l = n == null || n.includes('trailing'),
        s = () => {
          i !== null && (e.apply(o, i), (o = void 0), (i = null));
        },
        d = () => {
          (l && s(), g());
        },
        p = null,
        m = () => {
          (p != null && clearTimeout(p),
            (p = setTimeout(() => {
              ((p = null), d());
            }, t)));
        },
        h = () => {
          p !== null && (clearTimeout(p), (p = null));
        },
        g = () => {
          (h(), (o = void 0), (i = null));
        },
        E = () => {
          s();
        },
        b = function (..._) {
          if (r?.aborted) return;
          ((o = this), (i = _));
          let y = p == null;
          (m(), a && y && s());
        };
      return (
        (b.schedule = m),
        (b.cancel = g),
        (b.flush = E),
        r?.addEventListener('abort', g, { once: !0 }),
        b
      );
    }
    function y1(e, ...t) {
      return b1(e, wd, ...t);
    }
    function b1(e, t, ...r) {
      let n = function (...o) {
        let i = 0,
          a = r.slice().map((s) => (s === t ? o[i++] : s)),
          l = o.slice(i);
        return e.apply(this, a.concat(l));
      };
      return (e.prototype && (n.prototype = Object.create(e.prototype)), n);
    }
    function E1(e, ...t) {
      return S1(e, _d, ...t);
    }
    function S1(e, t, ...r) {
      let n = function (...o) {
        let i = r.filter((p) => p === t).length,
          a = Math.max(o.length - i, 0),
          l = o.slice(0, a),
          s = a,
          d = r.slice().map((p) => (p === t ? o[s++] : p));
        return e.apply(this, l.concat(d));
      };
      return (e.prototype && (n.prototype = Object.create(e.prototype)), n);
    }
    function fr() {
      return (fr =
        Object.assign ||
        function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }).apply(this, arguments);
    }
    function xi(e, t) {
      if (e == null) return {};
      var r,
        n,
        o = {},
        i = Object.keys(e);
      for (n = 0; n < i.length; n++) t.indexOf((r = i[n])) >= 0 || (o[r] = e[r]);
      return o;
    }
    function Ai(e) {
      var t = he(e),
        r = he(function (n) {
          t.current && t.current(n);
        });
      return ((t.current = e), r.current);
    }
    function Pd(e, t, r) {
      var n = Ai(r),
        o = X(function () {
          return e.toHsva(t);
        }),
        i = o[0],
        a = o[1],
        l = he({ color: t, hsva: i });
      (ee(
        function () {
          if (!e.equal(t, l.current.color)) {
            var d = e.toHsva(t);
            ((l.current = { hsva: d, color: t }), a(d));
          }
        },
        [t, e],
      ),
        ee(
          function () {
            var d;
            Id(i, l.current.hsva) ||
              e.equal((d = e.fromHsva(i)), l.current.color) ||
              ((l.current = { hsva: i, color: d }), n(d));
          },
          [i, e, n],
        ));
      var s = se(function (d) {
        a(function (p) {
          return Object.assign({}, p, d);
        });
      }, []);
      return [i, s];
    }
    var m1,
      Td,
      h1,
      f1,
      ut,
      wd,
      _d,
      B4,
      Ur,
      dn,
      Ti,
      Ed,
      Sd,
      Ci,
      pn,
      Oi,
      $e,
      A1,
      T1,
      wi,
      w1,
      _1,
      v1,
      x1,
      vd,
      _i,
      fo,
      xd,
      C1,
      mo,
      O1,
      Cd,
      Od,
      Rd,
      Id,
      Dd,
      R1,
      I1,
      D1,
      P1,
      Ad,
      Nd,
      N1,
      k1,
      F1,
      L1,
      kd,
      B1,
      M1,
      $1,
      j1,
      U1,
      V1,
      H1,
      J1,
      Fd,
      q1,
      z1,
      G1,
      Ld,
      Si,
      W1,
      Y1,
      K1,
      vi,
      X1,
      Z1,
      ho,
      Bd,
      Q1,
      eE,
      tE,
      jr,
      rE,
      nE,
      go,
      oE,
      Md,
      aE,
      jd = mt(() => {
        U();
        V();
        H();
        Uo();
        tn();
        it();
        G();
        ce();
        ke();
        G();
        le();
        ((m1 = de({
          '../../node_modules/color-name/index.js'(e, t) {
            'use strict';
            t.exports = {
              aliceblue: [240, 248, 255],
              antiquewhite: [250, 235, 215],
              aqua: [0, 255, 255],
              aquamarine: [127, 255, 212],
              azure: [240, 255, 255],
              beige: [245, 245, 220],
              bisque: [255, 228, 196],
              black: [0, 0, 0],
              blanchedalmond: [255, 235, 205],
              blue: [0, 0, 255],
              blueviolet: [138, 43, 226],
              brown: [165, 42, 42],
              burlywood: [222, 184, 135],
              cadetblue: [95, 158, 160],
              chartreuse: [127, 255, 0],
              chocolate: [210, 105, 30],
              coral: [255, 127, 80],
              cornflowerblue: [100, 149, 237],
              cornsilk: [255, 248, 220],
              crimson: [220, 20, 60],
              cyan: [0, 255, 255],
              darkblue: [0, 0, 139],
              darkcyan: [0, 139, 139],
              darkgoldenrod: [184, 134, 11],
              darkgray: [169, 169, 169],
              darkgreen: [0, 100, 0],
              darkgrey: [169, 169, 169],
              darkkhaki: [189, 183, 107],
              darkmagenta: [139, 0, 139],
              darkolivegreen: [85, 107, 47],
              darkorange: [255, 140, 0],
              darkorchid: [153, 50, 204],
              darkred: [139, 0, 0],
              darksalmon: [233, 150, 122],
              darkseagreen: [143, 188, 143],
              darkslateblue: [72, 61, 139],
              darkslategray: [47, 79, 79],
              darkslategrey: [47, 79, 79],
              darkturquoise: [0, 206, 209],
              darkviolet: [148, 0, 211],
              deeppink: [255, 20, 147],
              deepskyblue: [0, 191, 255],
              dimgray: [105, 105, 105],
              dimgrey: [105, 105, 105],
              dodgerblue: [30, 144, 255],
              firebrick: [178, 34, 34],
              floralwhite: [255, 250, 240],
              forestgreen: [34, 139, 34],
              fuchsia: [255, 0, 255],
              gainsboro: [220, 220, 220],
              ghostwhite: [248, 248, 255],
              gold: [255, 215, 0],
              goldenrod: [218, 165, 32],
              gray: [128, 128, 128],
              green: [0, 128, 0],
              greenyellow: [173, 255, 47],
              grey: [128, 128, 128],
              honeydew: [240, 255, 240],
              hotpink: [255, 105, 180],
              indianred: [205, 92, 92],
              indigo: [75, 0, 130],
              ivory: [255, 255, 240],
              khaki: [240, 230, 140],
              lavender: [230, 230, 250],
              lavenderblush: [255, 240, 245],
              lawngreen: [124, 252, 0],
              lemonchiffon: [255, 250, 205],
              lightblue: [173, 216, 230],
              lightcoral: [240, 128, 128],
              lightcyan: [224, 255, 255],
              lightgoldenrodyellow: [250, 250, 210],
              lightgray: [211, 211, 211],
              lightgreen: [144, 238, 144],
              lightgrey: [211, 211, 211],
              lightpink: [255, 182, 193],
              lightsalmon: [255, 160, 122],
              lightseagreen: [32, 178, 170],
              lightskyblue: [135, 206, 250],
              lightslategray: [119, 136, 153],
              lightslategrey: [119, 136, 153],
              lightsteelblue: [176, 196, 222],
              lightyellow: [255, 255, 224],
              lime: [0, 255, 0],
              limegreen: [50, 205, 50],
              linen: [250, 240, 230],
              magenta: [255, 0, 255],
              maroon: [128, 0, 0],
              mediumaquamarine: [102, 205, 170],
              mediumblue: [0, 0, 205],
              mediumorchid: [186, 85, 211],
              mediumpurple: [147, 112, 219],
              mediumseagreen: [60, 179, 113],
              mediumslateblue: [123, 104, 238],
              mediumspringgreen: [0, 250, 154],
              mediumturquoise: [72, 209, 204],
              mediumvioletred: [199, 21, 133],
              midnightblue: [25, 25, 112],
              mintcream: [245, 255, 250],
              mistyrose: [255, 228, 225],
              moccasin: [255, 228, 181],
              navajowhite: [255, 222, 173],
              navy: [0, 0, 128],
              oldlace: [253, 245, 230],
              olive: [128, 128, 0],
              olivedrab: [107, 142, 35],
              orange: [255, 165, 0],
              orangered: [255, 69, 0],
              orchid: [218, 112, 214],
              palegoldenrod: [238, 232, 170],
              palegreen: [152, 251, 152],
              paleturquoise: [175, 238, 238],
              palevioletred: [219, 112, 147],
              papayawhip: [255, 239, 213],
              peachpuff: [255, 218, 185],
              peru: [205, 133, 63],
              pink: [255, 192, 203],
              plum: [221, 160, 221],
              powderblue: [176, 224, 230],
              purple: [128, 0, 128],
              rebeccapurple: [102, 51, 153],
              red: [255, 0, 0],
              rosybrown: [188, 143, 143],
              royalblue: [65, 105, 225],
              saddlebrown: [139, 69, 19],
              salmon: [250, 128, 114],
              sandybrown: [244, 164, 96],
              seagreen: [46, 139, 87],
              seashell: [255, 245, 238],
              sienna: [160, 82, 45],
              silver: [192, 192, 192],
              skyblue: [135, 206, 235],
              slateblue: [106, 90, 205],
              slategray: [112, 128, 144],
              slategrey: [112, 128, 144],
              snow: [255, 250, 250],
              springgreen: [0, 255, 127],
              steelblue: [70, 130, 180],
              tan: [210, 180, 140],
              teal: [0, 128, 128],
              thistle: [216, 191, 216],
              tomato: [255, 99, 71],
              turquoise: [64, 224, 208],
              violet: [238, 130, 238],
              wheat: [245, 222, 179],
              white: [255, 255, 255],
              whitesmoke: [245, 245, 245],
              yellow: [255, 255, 0],
              yellowgreen: [154, 205, 50],
            };
          },
        })),
          (Td = de({
            '../../node_modules/color-convert/conversions.js'(e, t) {
              var r = m1(),
                n = {};
              for (let a of Object.keys(r)) n[r[a]] = a;
              var o = {
                rgb: { channels: 3, labels: 'rgb' },
                hsl: { channels: 3, labels: 'hsl' },
                hsv: { channels: 3, labels: 'hsv' },
                hwb: { channels: 3, labels: 'hwb' },
                cmyk: { channels: 4, labels: 'cmyk' },
                xyz: { channels: 3, labels: 'xyz' },
                lab: { channels: 3, labels: 'lab' },
                lch: { channels: 3, labels: 'lch' },
                hex: { channels: 1, labels: ['hex'] },
                keyword: { channels: 1, labels: ['keyword'] },
                ansi16: { channels: 1, labels: ['ansi16'] },
                ansi256: { channels: 1, labels: ['ansi256'] },
                hcg: { channels: 3, labels: ['h', 'c', 'g'] },
                apple: { channels: 3, labels: ['r16', 'g16', 'b16'] },
                gray: { channels: 1, labels: ['gray'] },
              };
              t.exports = o;
              for (let a of Object.keys(o)) {
                if (!('channels' in o[a])) throw new Error('missing channels property: ' + a);
                if (!('labels' in o[a])) throw new Error('missing channel labels property: ' + a);
                if (o[a].labels.length !== o[a].channels)
                  throw new Error('channel and label counts mismatch: ' + a);
                let { channels: l, labels: s } = o[a];
                (delete o[a].channels,
                  delete o[a].labels,
                  Object.defineProperty(o[a], 'channels', { value: l }),
                  Object.defineProperty(o[a], 'labels', { value: s }));
              }
              ((o.rgb.hsl = function (a) {
                let l = a[0] / 255,
                  s = a[1] / 255,
                  d = a[2] / 255,
                  p = Math.min(l, s, d),
                  m = Math.max(l, s, d),
                  h = m - p,
                  g,
                  E;
                (m === p
                  ? (g = 0)
                  : l === m
                    ? (g = (s - d) / h)
                    : s === m
                      ? (g = 2 + (d - l) / h)
                      : d === m && (g = 4 + (l - s) / h),
                  (g = Math.min(g * 60, 360)),
                  g < 0 && (g += 360));
                let b = (p + m) / 2;
                return (
                  m === p ? (E = 0) : b <= 0.5 ? (E = h / (m + p)) : (E = h / (2 - m - p)),
                  [g, E * 100, b * 100]
                );
              }),
                (o.rgb.hsv = function (a) {
                  let l,
                    s,
                    d,
                    p,
                    m,
                    h = a[0] / 255,
                    g = a[1] / 255,
                    E = a[2] / 255,
                    b = Math.max(h, g, E),
                    _ = b - Math.min(h, g, E),
                    y = function (S) {
                      return (b - S) / 6 / _ + 1 / 2;
                    };
                  return (
                    _ === 0
                      ? ((p = 0), (m = 0))
                      : ((m = _ / b),
                        (l = y(h)),
                        (s = y(g)),
                        (d = y(E)),
                        h === b
                          ? (p = d - s)
                          : g === b
                            ? (p = 1 / 3 + l - d)
                            : E === b && (p = 2 / 3 + s - l),
                        p < 0 ? (p += 1) : p > 1 && (p -= 1)),
                    [p * 360, m * 100, b * 100]
                  );
                }),
                (o.rgb.hwb = function (a) {
                  let l = a[0],
                    s = a[1],
                    d = a[2],
                    p = o.rgb.hsl(a)[0],
                    m = (1 / 255) * Math.min(l, Math.min(s, d));
                  return ((d = 1 - (1 / 255) * Math.max(l, Math.max(s, d))), [p, m * 100, d * 100]);
                }),
                (o.rgb.cmyk = function (a) {
                  let l = a[0] / 255,
                    s = a[1] / 255,
                    d = a[2] / 255,
                    p = Math.min(1 - l, 1 - s, 1 - d),
                    m = (1 - l - p) / (1 - p) || 0,
                    h = (1 - s - p) / (1 - p) || 0,
                    g = (1 - d - p) / (1 - p) || 0;
                  return [m * 100, h * 100, g * 100, p * 100];
                }));
              function i(a, l) {
                return (a[0] - l[0]) ** 2 + (a[1] - l[1]) ** 2 + (a[2] - l[2]) ** 2;
              }
              ((o.rgb.keyword = function (a) {
                let l = n[a];
                if (l) return l;
                let s = 1 / 0,
                  d;
                for (let p of Object.keys(r)) {
                  let m = r[p],
                    h = i(a, m);
                  h < s && ((s = h), (d = p));
                }
                return d;
              }),
                (o.keyword.rgb = function (a) {
                  return r[a];
                }),
                (o.rgb.xyz = function (a) {
                  let l = a[0] / 255,
                    s = a[1] / 255,
                    d = a[2] / 255;
                  ((l = l > 0.04045 ? ((l + 0.055) / 1.055) ** 2.4 : l / 12.92),
                    (s = s > 0.04045 ? ((s + 0.055) / 1.055) ** 2.4 : s / 12.92),
                    (d = d > 0.04045 ? ((d + 0.055) / 1.055) ** 2.4 : d / 12.92));
                  let p = l * 0.4124 + s * 0.3576 + d * 0.1805,
                    m = l * 0.2126 + s * 0.7152 + d * 0.0722,
                    h = l * 0.0193 + s * 0.1192 + d * 0.9505;
                  return [p * 100, m * 100, h * 100];
                }),
                (o.rgb.lab = function (a) {
                  let l = o.rgb.xyz(a),
                    s = l[0],
                    d = l[1],
                    p = l[2];
                  ((s /= 95.047),
                    (d /= 100),
                    (p /= 108.883),
                    (s = s > 0.008856 ? s ** (1 / 3) : 7.787 * s + 16 / 116),
                    (d = d > 0.008856 ? d ** (1 / 3) : 7.787 * d + 16 / 116),
                    (p = p > 0.008856 ? p ** (1 / 3) : 7.787 * p + 16 / 116));
                  let m = 116 * d - 16,
                    h = 500 * (s - d),
                    g = 200 * (d - p);
                  return [m, h, g];
                }),
                (o.hsl.rgb = function (a) {
                  let l = a[0] / 360,
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p,
                    m,
                    h;
                  if (s === 0) return ((h = d * 255), [h, h, h]);
                  d < 0.5 ? (p = d * (1 + s)) : (p = d + s - d * s);
                  let g = 2 * d - p,
                    E = [0, 0, 0];
                  for (let b = 0; b < 3; b++)
                    ((m = l + (1 / 3) * -(b - 1)),
                      m < 0 && m++,
                      m > 1 && m--,
                      6 * m < 1
                        ? (h = g + (p - g) * 6 * m)
                        : 2 * m < 1
                          ? (h = p)
                          : 3 * m < 2
                            ? (h = g + (p - g) * (2 / 3 - m) * 6)
                            : (h = g),
                      (E[b] = h * 255));
                  return E;
                }),
                (o.hsl.hsv = function (a) {
                  let l = a[0],
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p = s,
                    m = Math.max(d, 0.01);
                  ((d *= 2), (s *= d <= 1 ? d : 2 - d), (p *= m <= 1 ? m : 2 - m));
                  let h = (d + s) / 2,
                    g = d === 0 ? (2 * p) / (m + p) : (2 * s) / (d + s);
                  return [l, g * 100, h * 100];
                }),
                (o.hsv.rgb = function (a) {
                  let l = a[0] / 60,
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p = Math.floor(l) % 6,
                    m = l - Math.floor(l),
                    h = 255 * d * (1 - s),
                    g = 255 * d * (1 - s * m),
                    E = 255 * d * (1 - s * (1 - m));
                  switch (((d *= 255), p)) {
                    case 0:
                      return [d, E, h];
                    case 1:
                      return [g, d, h];
                    case 2:
                      return [h, d, E];
                    case 3:
                      return [h, g, d];
                    case 4:
                      return [E, h, d];
                    case 5:
                      return [d, h, g];
                  }
                }),
                (o.hsv.hsl = function (a) {
                  let l = a[0],
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p = Math.max(d, 0.01),
                    m,
                    h;
                  h = (2 - s) * d;
                  let g = (2 - s) * p;
                  return (
                    (m = s * p),
                    (m /= g <= 1 ? g : 2 - g),
                    (m = m || 0),
                    (h /= 2),
                    [l, m * 100, h * 100]
                  );
                }),
                (o.hwb.rgb = function (a) {
                  let l = a[0] / 360,
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p = s + d,
                    m;
                  p > 1 && ((s /= p), (d /= p));
                  let h = Math.floor(6 * l),
                    g = 1 - d;
                  ((m = 6 * l - h), (h & 1) !== 0 && (m = 1 - m));
                  let E = s + m * (g - s),
                    b,
                    _,
                    y;
                  switch (h) {
                    default:
                    case 6:
                    case 0:
                      ((b = g), (_ = E), (y = s));
                      break;
                    case 1:
                      ((b = E), (_ = g), (y = s));
                      break;
                    case 2:
                      ((b = s), (_ = g), (y = E));
                      break;
                    case 3:
                      ((b = s), (_ = E), (y = g));
                      break;
                    case 4:
                      ((b = E), (_ = s), (y = g));
                      break;
                    case 5:
                      ((b = g), (_ = s), (y = E));
                      break;
                  }
                  return [b * 255, _ * 255, y * 255];
                }),
                (o.cmyk.rgb = function (a) {
                  let l = a[0] / 100,
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p = a[3] / 100,
                    m = 1 - Math.min(1, l * (1 - p) + p),
                    h = 1 - Math.min(1, s * (1 - p) + p),
                    g = 1 - Math.min(1, d * (1 - p) + p);
                  return [m * 255, h * 255, g * 255];
                }),
                (o.xyz.rgb = function (a) {
                  let l = a[0] / 100,
                    s = a[1] / 100,
                    d = a[2] / 100,
                    p,
                    m,
                    h;
                  return (
                    (p = l * 3.2406 + s * -1.5372 + d * -0.4986),
                    (m = l * -0.9689 + s * 1.8758 + d * 0.0415),
                    (h = l * 0.0557 + s * -0.204 + d * 1.057),
                    (p = p > 0.0031308 ? 1.055 * p ** (1 / 2.4) - 0.055 : p * 12.92),
                    (m = m > 0.0031308 ? 1.055 * m ** (1 / 2.4) - 0.055 : m * 12.92),
                    (h = h > 0.0031308 ? 1.055 * h ** (1 / 2.4) - 0.055 : h * 12.92),
                    (p = Math.min(Math.max(0, p), 1)),
                    (m = Math.min(Math.max(0, m), 1)),
                    (h = Math.min(Math.max(0, h), 1)),
                    [p * 255, m * 255, h * 255]
                  );
                }),
                (o.xyz.lab = function (a) {
                  let l = a[0],
                    s = a[1],
                    d = a[2];
                  ((l /= 95.047),
                    (s /= 100),
                    (d /= 108.883),
                    (l = l > 0.008856 ? l ** (1 / 3) : 7.787 * l + 16 / 116),
                    (s = s > 0.008856 ? s ** (1 / 3) : 7.787 * s + 16 / 116),
                    (d = d > 0.008856 ? d ** (1 / 3) : 7.787 * d + 16 / 116));
                  let p = 116 * s - 16,
                    m = 500 * (l - s),
                    h = 200 * (s - d);
                  return [p, m, h];
                }),
                (o.lab.xyz = function (a) {
                  let l = a[0],
                    s = a[1],
                    d = a[2],
                    p,
                    m,
                    h;
                  ((m = (l + 16) / 116), (p = s / 500 + m), (h = m - d / 200));
                  let g = m ** 3,
                    E = p ** 3,
                    b = h ** 3;
                  return (
                    (m = g > 0.008856 ? g : (m - 16 / 116) / 7.787),
                    (p = E > 0.008856 ? E : (p - 16 / 116) / 7.787),
                    (h = b > 0.008856 ? b : (h - 16 / 116) / 7.787),
                    (p *= 95.047),
                    (m *= 100),
                    (h *= 108.883),
                    [p, m, h]
                  );
                }),
                (o.lab.lch = function (a) {
                  let l = a[0],
                    s = a[1],
                    d = a[2],
                    p;
                  ((p = (Math.atan2(d, s) * 360) / 2 / Math.PI), p < 0 && (p += 360));
                  let m = Math.sqrt(s * s + d * d);
                  return [l, m, p];
                }),
                (o.lch.lab = function (a) {
                  let l = a[0],
                    s = a[1],
                    d = (a[2] / 360) * 2 * Math.PI,
                    p = s * Math.cos(d),
                    m = s * Math.sin(d);
                  return [l, p, m];
                }),
                (o.rgb.ansi16 = function (a, l = null) {
                  let [s, d, p] = a,
                    m = l === null ? o.rgb.hsv(a)[2] : l;
                  if (((m = Math.round(m / 50)), m === 0)) return 30;
                  let h =
                    30 +
                    ((Math.round(p / 255) << 2) | (Math.round(d / 255) << 1) | Math.round(s / 255));
                  return (m === 2 && (h += 60), h);
                }),
                (o.hsv.ansi16 = function (a) {
                  return o.rgb.ansi16(o.hsv.rgb(a), a[2]);
                }),
                (o.rgb.ansi256 = function (a) {
                  let l = a[0],
                    s = a[1],
                    d = a[2];
                  return l === s && s === d
                    ? l < 8
                      ? 16
                      : l > 248
                        ? 231
                        : Math.round(((l - 8) / 247) * 24) + 232
                    : 16 +
                        36 * Math.round((l / 255) * 5) +
                        6 * Math.round((s / 255) * 5) +
                        Math.round((d / 255) * 5);
                }),
                (o.ansi16.rgb = function (a) {
                  let l = a % 10;
                  if (l === 0 || l === 7)
                    return (a > 50 && (l += 3.5), (l = (l / 10.5) * 255), [l, l, l]);
                  let s = (~~(a > 50) + 1) * 0.5,
                    d = (l & 1) * s * 255,
                    p = ((l >> 1) & 1) * s * 255,
                    m = ((l >> 2) & 1) * s * 255;
                  return [d, p, m];
                }),
                (o.ansi256.rgb = function (a) {
                  if (a >= 232) {
                    let m = (a - 232) * 10 + 8;
                    return [m, m, m];
                  }
                  a -= 16;
                  let l,
                    s = (Math.floor(a / 36) / 5) * 255,
                    d = (Math.floor((l = a % 36) / 6) / 5) * 255,
                    p = ((l % 6) / 5) * 255;
                  return [s, d, p];
                }),
                (o.rgb.hex = function (a) {
                  let l = (
                    ((Math.round(a[0]) & 255) << 16) +
                    ((Math.round(a[1]) & 255) << 8) +
                    (Math.round(a[2]) & 255)
                  )
                    .toString(16)
                    .toUpperCase();
                  return '000000'.substring(l.length) + l;
                }),
                (o.hex.rgb = function (a) {
                  let l = a.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
                  if (!l) return [0, 0, 0];
                  let s = l[0];
                  l[0].length === 3 &&
                    (s = s
                      .split('')
                      .map((g) => g + g)
                      .join(''));
                  let d = parseInt(s, 16),
                    p = (d >> 16) & 255,
                    m = (d >> 8) & 255,
                    h = d & 255;
                  return [p, m, h];
                }),
                (o.rgb.hcg = function (a) {
                  let l = a[0] / 255,
                    s = a[1] / 255,
                    d = a[2] / 255,
                    p = Math.max(Math.max(l, s), d),
                    m = Math.min(Math.min(l, s), d),
                    h = p - m,
                    g,
                    E;
                  return (
                    h < 1 ? (g = m / (1 - h)) : (g = 0),
                    h <= 0
                      ? (E = 0)
                      : p === l
                        ? (E = ((s - d) / h) % 6)
                        : p === s
                          ? (E = 2 + (d - l) / h)
                          : (E = 4 + (l - s) / h),
                    (E /= 6),
                    (E %= 1),
                    [E * 360, h * 100, g * 100]
                  );
                }),
                (o.hsl.hcg = function (a) {
                  let l = a[1] / 100,
                    s = a[2] / 100,
                    d = s < 0.5 ? 2 * l * s : 2 * l * (1 - s),
                    p = 0;
                  return (d < 1 && (p = (s - 0.5 * d) / (1 - d)), [a[0], d * 100, p * 100]);
                }),
                (o.hsv.hcg = function (a) {
                  let l = a[1] / 100,
                    s = a[2] / 100,
                    d = l * s,
                    p = 0;
                  return (d < 1 && (p = (s - d) / (1 - d)), [a[0], d * 100, p * 100]);
                }),
                (o.hcg.rgb = function (a) {
                  let l = a[0] / 360,
                    s = a[1] / 100,
                    d = a[2] / 100;
                  if (s === 0) return [d * 255, d * 255, d * 255];
                  let p = [0, 0, 0],
                    m = (l % 1) * 6,
                    h = m % 1,
                    g = 1 - h,
                    E = 0;
                  switch (Math.floor(m)) {
                    case 0:
                      ((p[0] = 1), (p[1] = h), (p[2] = 0));
                      break;
                    case 1:
                      ((p[0] = g), (p[1] = 1), (p[2] = 0));
                      break;
                    case 2:
                      ((p[0] = 0), (p[1] = 1), (p[2] = h));
                      break;
                    case 3:
                      ((p[0] = 0), (p[1] = g), (p[2] = 1));
                      break;
                    case 4:
                      ((p[0] = h), (p[1] = 0), (p[2] = 1));
                      break;
                    default:
                      ((p[0] = 1), (p[1] = 0), (p[2] = g));
                  }
                  return (
                    (E = (1 - s) * d),
                    [(s * p[0] + E) * 255, (s * p[1] + E) * 255, (s * p[2] + E) * 255]
                  );
                }),
                (o.hcg.hsv = function (a) {
                  let l = a[1] / 100,
                    s = a[2] / 100,
                    d = l + s * (1 - l),
                    p = 0;
                  return (d > 0 && (p = l / d), [a[0], p * 100, d * 100]);
                }),
                (o.hcg.hsl = function (a) {
                  let l = a[1] / 100,
                    s = (a[2] / 100) * (1 - l) + 0.5 * l,
                    d = 0;
                  return (
                    s > 0 && s < 0.5
                      ? (d = l / (2 * s))
                      : s >= 0.5 && s < 1 && (d = l / (2 * (1 - s))),
                    [a[0], d * 100, s * 100]
                  );
                }),
                (o.hcg.hwb = function (a) {
                  let l = a[1] / 100,
                    s = a[2] / 100,
                    d = l + s * (1 - l);
                  return [a[0], (d - l) * 100, (1 - d) * 100];
                }),
                (o.hwb.hcg = function (a) {
                  let l = a[1] / 100,
                    s = 1 - a[2] / 100,
                    d = s - l,
                    p = 0;
                  return (d < 1 && (p = (s - d) / (1 - d)), [a[0], d * 100, p * 100]);
                }),
                (o.apple.rgb = function (a) {
                  return [(a[0] / 65535) * 255, (a[1] / 65535) * 255, (a[2] / 65535) * 255];
                }),
                (o.rgb.apple = function (a) {
                  return [(a[0] / 255) * 65535, (a[1] / 255) * 65535, (a[2] / 255) * 65535];
                }),
                (o.gray.rgb = function (a) {
                  return [(a[0] / 100) * 255, (a[0] / 100) * 255, (a[0] / 100) * 255];
                }),
                (o.gray.hsl = function (a) {
                  return [0, 0, a[0]];
                }),
                (o.gray.hsv = o.gray.hsl),
                (o.gray.hwb = function (a) {
                  return [0, 100, a[0]];
                }),
                (o.gray.cmyk = function (a) {
                  return [0, 0, 0, a[0]];
                }),
                (o.gray.lab = function (a) {
                  return [a[0], 0, 0];
                }),
                (o.gray.hex = function (a) {
                  let l = Math.round((a[0] / 100) * 255) & 255,
                    s = ((l << 16) + (l << 8) + l).toString(16).toUpperCase();
                  return '000000'.substring(s.length) + s;
                }),
                (o.rgb.gray = function (a) {
                  return [((a[0] + a[1] + a[2]) / 3 / 255) * 100];
                }));
            },
          })),
          (h1 = de({
            '../../node_modules/color-convert/route.js'(e, t) {
              var r = Td();
              function n() {
                let l = {},
                  s = Object.keys(r);
                for (let d = s.length, p = 0; p < d; p++) l[s[p]] = { distance: -1, parent: null };
                return l;
              }
              function o(l) {
                let s = n(),
                  d = [l];
                for (s[l].distance = 0; d.length;) {
                  let p = d.pop(),
                    m = Object.keys(r[p]);
                  for (let h = m.length, g = 0; g < h; g++) {
                    let E = m[g],
                      b = s[E];
                    b.distance === -1 &&
                      ((b.distance = s[p].distance + 1), (b.parent = p), d.unshift(E));
                  }
                }
                return s;
              }
              function i(l, s) {
                return function (d) {
                  return s(l(d));
                };
              }
              function a(l, s) {
                let d = [s[l].parent, l],
                  p = r[s[l].parent][l],
                  m = s[l].parent;
                for (; s[m].parent;)
                  (d.unshift(s[m].parent), (p = i(r[s[m].parent][m], p)), (m = s[m].parent));
                return ((p.conversion = d), p);
              }
              t.exports = function (l) {
                let s = o(l),
                  d = {},
                  p = Object.keys(s);
                for (let m = p.length, h = 0; h < m; h++) {
                  let g = p[h];
                  s[g].parent !== null && (d[g] = a(g, s));
                }
                return d;
              };
            },
          })),
          (f1 = de({
            '../../node_modules/color-convert/index.js'(e, t) {
              var r = Td(),
                n = h1(),
                o = {},
                i = Object.keys(r);
              function a(s) {
                let d = function (...p) {
                  let m = p[0];
                  return m == null ? m : (m.length > 1 && (p = m), s(p));
                };
                return ('conversion' in s && (d.conversion = s.conversion), d);
              }
              function l(s) {
                let d = function (...p) {
                  let m = p[0];
                  if (m == null) return m;
                  m.length > 1 && (p = m);
                  let h = s(p);
                  if (typeof h == 'object')
                    for (let g = h.length, E = 0; E < g; E++) h[E] = Math.round(h[E]);
                  return h;
                };
                return ('conversion' in s && (d.conversion = s.conversion), d);
              }
              (i.forEach((s) => {
                ((o[s] = {}),
                  Object.defineProperty(o[s], 'channels', { value: r[s].channels }),
                  Object.defineProperty(o[s], 'labels', { value: r[s].labels }));
                let d = n(s);
                Object.keys(d).forEach((p) => {
                  let m = d[p];
                  ((o[s][p] = l(m)), (o[s][p].raw = a(m)));
                });
              }),
                (t.exports = o));
            },
          })),
          (ut = We(f1(), 1)));
        wd = Symbol('partial.placeholder');
        y1.placeholder = wd;
        _d = Symbol('partialRight.placeholder');
        E1.placeholder = _d;
        B4 = Number.POSITIVE_INFINITY;
        ((Ur = function (e, t, r) {
          return (t === void 0 && (t = 0), r === void 0 && (r = 1), e > r ? r : e < t ? t : e);
        }),
          (dn = function (e) {
            return 'touches' in e;
          }),
          (Ti = function (e) {
            return (e && e.ownerDocument.defaultView) || self;
          }),
          (Ed = function (e, t, r) {
            var n = e.getBoundingClientRect(),
              o = dn(t)
                ? (function (i, a) {
                    for (var l = 0; l < i.length; l++) if (i[l].identifier === a) return i[l];
                    return i[0];
                  })(t.touches, r)
                : t;
            return {
              left: Ur((o.pageX - (n.left + Ti(e).pageXOffset)) / n.width),
              top: Ur((o.pageY - (n.top + Ti(e).pageYOffset)) / n.height),
            };
          }),
          (Sd = function (e) {
            !dn(e) && e.preventDefault();
          }),
          (Ci = u.memo(function (e) {
            var t = e.onMove,
              r = e.onKey,
              n = xi(e, ['onMove', 'onKey']),
              o = he(null),
              i = Ai(t),
              a = Ai(r),
              l = he(null),
              s = he(!1),
              d = we(
                function () {
                  var g = function (_) {
                      (Sd(_),
                        (dn(_) ? _.touches.length > 0 : _.buttons > 0) && o.current
                          ? i(Ed(o.current, _, l.current))
                          : b(!1));
                    },
                    E = function () {
                      return b(!1);
                    };
                  function b(_) {
                    var y = s.current,
                      S = Ti(o.current),
                      A = _ ? S.addEventListener : S.removeEventListener;
                    (A(y ? 'touchmove' : 'mousemove', g), A(y ? 'touchend' : 'mouseup', E));
                  }
                  return [
                    function (_) {
                      var y = _.nativeEvent,
                        S = o.current;
                      if (
                        S &&
                        (Sd(y),
                        !(function (T, C) {
                          return C && !dn(T);
                        })(y, s.current) && S)
                      ) {
                        if (dn(y)) {
                          s.current = !0;
                          var A = y.changedTouches || [];
                          A.length && (l.current = A[0].identifier);
                        }
                        (S.focus(), i(Ed(S, y, l.current)), b(!0));
                      }
                    },
                    function (_) {
                      var y = _.which || _.keyCode;
                      y < 37 ||
                        y > 40 ||
                        (_.preventDefault(),
                        a({
                          left: y === 39 ? 0.05 : y === 37 ? -0.05 : 0,
                          top: y === 40 ? 0.05 : y === 38 ? -0.05 : 0,
                        }));
                    },
                    b,
                  ];
                },
                [a, i],
              ),
              p = d[0],
              m = d[1],
              h = d[2];
            return (
              ee(
                function () {
                  return h;
                },
                [h],
              ),
              u.createElement(
                'div',
                fr({}, n, {
                  onTouchStart: p,
                  onMouseDown: p,
                  className: 'react-colorful__interactive',
                  ref: o,
                  onKeyDown: m,
                  tabIndex: 0,
                  role: 'slider',
                }),
              )
            );
          })),
          (pn = function (e) {
            return e.filter(Boolean).join(' ');
          }),
          (Oi = function (e) {
            var t = e.color,
              r = e.left,
              n = e.top,
              o = n === void 0 ? 0.5 : n,
              i = pn(['react-colorful__pointer', e.className]);
            return u.createElement(
              'div',
              { className: i, style: { top: 100 * o + '%', left: 100 * r + '%' } },
              u.createElement('div', {
                className: 'react-colorful__pointer-fill',
                style: { backgroundColor: t },
              }),
            );
          }),
          ($e = function (e, t, r) {
            return (
              t === void 0 && (t = 0),
              r === void 0 && (r = Math.pow(10, t)),
              Math.round(r * e) / r
            );
          }),
          (A1 = { grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) }),
          (T1 = function (e) {
            return Cd(wi(e));
          }),
          (wi = function (e) {
            return (
              e[0] === '#' && (e = e.substring(1)),
              e.length < 6
                ? {
                    r: parseInt(e[0] + e[0], 16),
                    g: parseInt(e[1] + e[1], 16),
                    b: parseInt(e[2] + e[2], 16),
                    a: e.length === 4 ? $e(parseInt(e[3] + e[3], 16) / 255, 2) : 1,
                  }
                : {
                    r: parseInt(e.substring(0, 2), 16),
                    g: parseInt(e.substring(2, 4), 16),
                    b: parseInt(e.substring(4, 6), 16),
                    a: e.length === 8 ? $e(parseInt(e.substring(6, 8), 16) / 255, 2) : 1,
                  }
            );
          }),
          (w1 = function (e, t) {
            return (t === void 0 && (t = 'deg'), Number(e) * (A1[t] || 1));
          }),
          (_1 = function (e) {
            var t =
              /hsla?\(?\s*(-?\d*\.?\d+)(deg|rad|grad|turn)?[,\s]+(-?\d*\.?\d+)%?[,\s]+(-?\d*\.?\d+)%?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i.exec(
                e,
              );
            return t
              ? v1({
                  h: w1(t[1], t[2]),
                  s: Number(t[3]),
                  l: Number(t[4]),
                  a: t[5] === void 0 ? 1 : Number(t[5]) / (t[6] ? 100 : 1),
                })
              : { h: 0, s: 0, v: 0, a: 1 };
          }),
          (v1 = function (e) {
            var t = e.s,
              r = e.l;
            return {
              h: e.h,
              s: (t *= (r < 50 ? r : 100 - r) / 100) > 0 ? ((2 * t) / (r + t)) * 100 : 0,
              v: r + t,
              a: e.a,
            };
          }),
          (x1 = function (e) {
            return O1(xd(e));
          }),
          (vd = function (e) {
            var t = e.s,
              r = e.v,
              n = e.a,
              o = ((200 - t) * r) / 100;
            return {
              h: $e(e.h),
              s: $e(o > 0 && o < 200 ? ((t * r) / 100 / (o <= 100 ? o : 200 - o)) * 100 : 0),
              l: $e(o / 2),
              a: $e(n, 2),
            };
          }),
          (_i = function (e) {
            var t = vd(e);
            return 'hsl(' + t.h + ', ' + t.s + '%, ' + t.l + '%)';
          }),
          (fo = function (e) {
            var t = vd(e);
            return 'hsla(' + t.h + ', ' + t.s + '%, ' + t.l + '%, ' + t.a + ')';
          }),
          (xd = function (e) {
            var t = e.h,
              r = e.s,
              n = e.v,
              o = e.a;
            ((t = (t / 360) * 6), (r /= 100), (n /= 100));
            var i = Math.floor(t),
              a = n * (1 - r),
              l = n * (1 - (t - i) * r),
              s = n * (1 - (1 - t + i) * r),
              d = i % 6;
            return {
              r: $e(255 * [n, l, a, a, s, n][d]),
              g: $e(255 * [s, n, n, l, a, a][d]),
              b: $e(255 * [a, a, s, n, n, l][d]),
              a: $e(o, 2),
            };
          }),
          (C1 = function (e) {
            var t =
              /rgba?\(?\s*(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?[,\s]+(-?\d*\.?\d+)(%)?,?\s*[/\s]*(-?\d*\.?\d+)?(%)?\s*\)?/i.exec(
                e,
              );
            return t
              ? Cd({
                  r: Number(t[1]) / (t[2] ? 100 / 255 : 1),
                  g: Number(t[3]) / (t[4] ? 100 / 255 : 1),
                  b: Number(t[5]) / (t[6] ? 100 / 255 : 1),
                  a: t[7] === void 0 ? 1 : Number(t[7]) / (t[8] ? 100 : 1),
                })
              : { h: 0, s: 0, v: 0, a: 1 };
          }),
          (mo = function (e) {
            var t = e.toString(16);
            return t.length < 2 ? '0' + t : t;
          }),
          (O1 = function (e) {
            var t = e.r,
              r = e.g,
              n = e.b,
              o = e.a,
              i = o < 1 ? mo($e(255 * o)) : '';
            return '#' + mo(t) + mo(r) + mo(n) + i;
          }),
          (Cd = function (e) {
            var t = e.r,
              r = e.g,
              n = e.b,
              o = e.a,
              i = Math.max(t, r, n),
              a = i - Math.min(t, r, n),
              l = a ? (i === t ? (r - n) / a : i === r ? 2 + (n - t) / a : 4 + (t - r) / a) : 0;
            return {
              h: $e(60 * (l < 0 ? l + 6 : l)),
              s: $e(i ? (a / i) * 100 : 0),
              v: $e((i / 255) * 100),
              a: o,
            };
          }),
          (Od = u.memo(function (e) {
            var t = e.hue,
              r = e.onChange,
              n = pn(['react-colorful__hue', e.className]);
            return u.createElement(
              'div',
              { className: n },
              u.createElement(
                Ci,
                {
                  onMove: function (o) {
                    r({ h: 360 * o.left });
                  },
                  onKey: function (o) {
                    r({ h: Ur(t + 360 * o.left, 0, 360) });
                  },
                  'aria-label': 'Hue',
                  'aria-valuenow': $e(t),
                  'aria-valuemax': '360',
                  'aria-valuemin': '0',
                },
                u.createElement(Oi, {
                  className: 'react-colorful__hue-pointer',
                  left: t / 360,
                  color: _i({ h: t, s: 100, v: 100, a: 1 }),
                }),
              ),
            );
          })),
          (Rd = u.memo(function (e) {
            var t = e.hsva,
              r = e.onChange,
              n = { backgroundColor: _i({ h: t.h, s: 100, v: 100, a: 1 }) };
            return u.createElement(
              'div',
              { className: 'react-colorful__saturation', style: n },
              u.createElement(
                Ci,
                {
                  onMove: function (o) {
                    r({ s: 100 * o.left, v: 100 - 100 * o.top });
                  },
                  onKey: function (o) {
                    r({ s: Ur(t.s + 100 * o.left, 0, 100), v: Ur(t.v - 100 * o.top, 0, 100) });
                  },
                  'aria-label': 'Color',
                  'aria-valuetext': 'Saturation ' + $e(t.s) + '%, Brightness ' + $e(t.v) + '%',
                },
                u.createElement(Oi, {
                  className: 'react-colorful__saturation-pointer',
                  top: 1 - t.v / 100,
                  left: t.s / 100,
                  color: _i(t),
                }),
              ),
            );
          })),
          (Id = function (e, t) {
            if (e === t) return !0;
            for (var r in e) if (e[r] !== t[r]) return !1;
            return !0;
          }),
          (Dd = function (e, t) {
            return e.replace(/\s/g, '') === t.replace(/\s/g, '');
          }),
          (R1 = function (e, t) {
            return e.toLowerCase() === t.toLowerCase() || Id(wi(e), wi(t));
          }));
        ((D1 = typeof window < 'u' ? Pn : ee),
          (P1 = function () {
            return I1 || (typeof __webpack_nonce__ < 'u' ? __webpack_nonce__ : void 0);
          }),
          (Ad = new Map()),
          (Nd = function (e) {
            D1(function () {
              var t = e.current ? e.current.ownerDocument : document;
              if (t !== void 0 && !Ad.has(t)) {
                var r = t.createElement('style');
                ((r.innerHTML = `.react-colorful{position:relative;display:flex;flex-direction:column;width:200px;height:200px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}.react-colorful__saturation{position:relative;flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,hsla(0,0%,100%,0))}.react-colorful__alpha-gradient,.react-colorful__pointer-fill{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;border-radius:inherit}.react-colorful__alpha-gradient,.react-colorful__saturation{box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}.react-colorful__alpha,.react-colorful__hue{position:relative;height:24px}.react-colorful__hue{background:linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)}.react-colorful__last-control{border-radius:0 0 8px 8px}.react-colorful__interactive{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;outline:none;touch-action:none}.react-colorful__pointer{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}.react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.1)}.react-colorful__alpha,.react-colorful__alpha-pointer{background-color:#fff;background-image:url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>')}.react-colorful__saturation-pointer{z-index:3}.react-colorful__hue-pointer{z-index:2}`),
                  Ad.set(t, r));
                var n = P1();
                (n && r.setAttribute('nonce', n), t.head.appendChild(r));
              }
            }, []);
          }),
          (N1 = function (e) {
            var t = e.className,
              r = e.colorModel,
              n = e.color,
              o = n === void 0 ? r.defaultColor : n,
              i = e.onChange,
              a = xi(e, ['className', 'colorModel', 'color', 'onChange']),
              l = he(null);
            Nd(l);
            var s = Pd(r, o, i),
              d = s[0],
              p = s[1],
              m = pn(['react-colorful', t]);
            return u.createElement(
              'div',
              fr({}, a, { ref: l, className: m }),
              u.createElement(Rd, { hsva: d, onChange: p }),
              u.createElement(Od, {
                hue: d.h,
                onChange: p,
                className: 'react-colorful__last-control',
              }),
            );
          }),
          (k1 = {
            defaultColor: '000',
            toHsva: T1,
            fromHsva: function (e) {
              return x1({ h: e.h, s: e.s, v: e.v, a: 1 });
            },
            equal: R1,
          }),
          (F1 = function (e) {
            return u.createElement(N1, fr({}, e, { colorModel: k1 }));
          }),
          (L1 = function (e) {
            var t = e.className,
              r = e.hsva,
              n = e.onChange,
              o = {
                backgroundImage:
                  'linear-gradient(90deg, ' +
                  fo(Object.assign({}, r, { a: 0 })) +
                  ', ' +
                  fo(Object.assign({}, r, { a: 1 })) +
                  ')',
              },
              i = pn(['react-colorful__alpha', t]),
              a = $e(100 * r.a);
            return u.createElement(
              'div',
              { className: i },
              u.createElement('div', { className: 'react-colorful__alpha-gradient', style: o }),
              u.createElement(
                Ci,
                {
                  onMove: function (l) {
                    n({ a: l.left });
                  },
                  onKey: function (l) {
                    n({ a: Ur(r.a + l.left) });
                  },
                  'aria-label': 'Alpha',
                  'aria-valuetext': a + '%',
                  'aria-valuenow': a,
                  'aria-valuemin': '0',
                  'aria-valuemax': '100',
                },
                u.createElement(Oi, {
                  className: 'react-colorful__alpha-pointer',
                  left: r.a,
                  color: fo(r),
                }),
              ),
            );
          }),
          (kd = function (e) {
            var t = e.className,
              r = e.colorModel,
              n = e.color,
              o = n === void 0 ? r.defaultColor : n,
              i = e.onChange,
              a = xi(e, ['className', 'colorModel', 'color', 'onChange']),
              l = he(null);
            Nd(l);
            var s = Pd(r, o, i),
              d = s[0],
              p = s[1],
              m = pn(['react-colorful', t]);
            return u.createElement(
              'div',
              fr({}, a, { ref: l, className: m }),
              u.createElement(Rd, { hsva: d, onChange: p }),
              u.createElement(Od, { hue: d.h, onChange: p }),
              u.createElement(L1, {
                hsva: d,
                onChange: p,
                className: 'react-colorful__last-control',
              }),
            );
          }),
          (B1 = { defaultColor: 'hsla(0, 0%, 0%, 1)', toHsva: _1, fromHsva: fo, equal: Dd }),
          (M1 = function (e) {
            return u.createElement(kd, fr({}, e, { colorModel: B1 }));
          }),
          ($1 = {
            defaultColor: 'rgba(0, 0, 0, 1)',
            toHsva: C1,
            fromHsva: function (e) {
              var t = xd(e);
              return 'rgba(' + t.r + ', ' + t.g + ', ' + t.b + ', ' + t.a + ')';
            },
            equal: Dd,
          }),
          (j1 = function (e) {
            return u.createElement(kd, fr({}, e, { colorModel: $1 }));
          }),
          (U1 = P.div({ position: 'relative', maxWidth: 250 })),
          (V1 = P.div({
            width: 200,
            margin: 5,
            '.react-colorful__saturation': { borderRadius: '4px 4px 0 0' },
            '.react-colorful__hue': { boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 5%)' },
            '.react-colorful__last-control': { borderRadius: '0 0 4px 4px' },
          })),
          (H1 = P.div({
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 16px)',
            gap: 6,
            padding: 3,
            marginTop: 5,
            width: 200,
          })),
          (J1 = (e) =>
            `url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity="0.05" fill="${e ? 'white' : 'black'}"><path d="M8 0h8v8H8zM0 8h8v8H0z"/></svg>')`),
          (Fd = P(Ee)(({ value: e, selected: t, theme: r }) => ({
            width: 16,
            height: 16,
            boxShadow: t
              ? `${r.appBorderColor} 0 0 0 1px inset, ${r.textMutedColor}50 0 0 0 4px`
              : `${r.appBorderColor} 0 0 0 1px inset`,
            border: 'none',
            borderRadius: r.appBorderRadius,
            '&, &:hover': {
              background: 'unset',
              backgroundColor: 'unset',
              backgroundImage: `linear-gradient(${e}, ${e}), ${J1(r.base === 'dark')}`,
            },
          }))),
          (q1 = P(Ye.Input)(({ theme: e }) => ({
            width: '100%',
            paddingLeft: 30,
            paddingRight: 30,
            boxSizing: 'border-box',
            fontFamily: e.typography.fonts.base,
            '[aria-readonly="true"] > &': {
              background: e.base === 'light' ? e.color.lighter : 'transparent',
            },
          }))),
          (z1 = P(Fd)(({ disabled: e }) => ({
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 1,
            cursor: e ? 'not-allowed' : 'pointer',
          }))),
          (G1 = P(Ee)(({ theme: e }) => ({
            position: 'absolute',
            zIndex: 1,
            top: 6,
            right: 7,
            width: 20,
            height: 20,
            padding: 4,
            boxSizing: 'border-box',
            cursor: 'pointer',
            color: e.input.color,
          }))),
          (Ld = ((e) => ((e.RGB = 'rgb'), (e.HSL = 'hsl'), (e.HEX = 'hex'), e))(Ld || {})),
          (Si = Object.values(Ld)),
          (W1 = /\(([0-9]+),\s*([0-9]+)%?,\s*([0-9]+)%?,?\s*([0-9.]+)?\)/),
          (Y1 = /^\s*rgba?\(([0-9]+),\s*([0-9]+),\s*([0-9]+),?\s*([0-9.]+)?\)\s*$/i),
          (K1 = /^\s*hsla?\(([0-9]+),\s*([0-9]+)%,\s*([0-9]+)%,?\s*([0-9.]+)?\)\s*$/i),
          (vi = /^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i),
          (X1 = /^\s*#?([0-9a-f]{3})\s*$/i),
          (Z1 = { hex: F1, rgb: j1, hsl: M1 }),
          (ho = { hex: 'transparent', rgb: 'rgba(0, 0, 0, 0)', hsl: 'hsla(0, 0%, 0%, 0)' }),
          (Bd = (e) => {
            let t = e?.match(W1);
            if (!t) return [0, 0, 0, 1];
            let [, r, n, o, i = 1] = t;
            return [r, n, o, i].map(Number);
          }),
          (Q1 = (e) => {
            let [t, r, n, o] = Bd(e),
              [i, a, l] = ut.default.rgb.hsl([t, r, n]) || [0, 0, 0];
            return {
              valid: !0,
              value: e,
              keyword: ut.default.rgb.keyword([t, r, n]),
              colorSpace: 'rgb',
              rgb: e,
              hsl: `hsla(${i}, ${a}%, ${l}%, ${o})`,
              hex: `#${ut.default.rgb.hex([t, r, n]).toLowerCase()}`,
            };
          }),
          (eE = (e) => {
            let [t, r, n, o] = Bd(e),
              [i, a, l] = ut.default.hsl.rgb([t, r, n]) || [0, 0, 0];
            return {
              valid: !0,
              value: e,
              keyword: ut.default.hsl.keyword([t, r, n]),
              colorSpace: 'hsl',
              rgb: `rgba(${i}, ${a}, ${l}, ${o})`,
              hsl: e,
              hex: `#${ut.default.hsl.hex([t, r, n]).toLowerCase()}`,
            };
          }),
          (tE = (e) => {
            let t = e.replace('#', ''),
              r = ut.default.keyword.rgb(t) || ut.default.hex.rgb(t),
              n = ut.default.rgb.hsl(r),
              o = e;
            /[^#a-f0-9]/i.test(e) ? (o = t) : vi.test(e) && (o = `#${t}`);
            let i = !0;
            if (o.startsWith('#')) i = vi.test(o);
            else
              try {
                ut.default.keyword.hex(o);
              } catch {
                i = !1;
              }
            return {
              valid: i,
              value: o,
              keyword: ut.default.rgb.keyword(r),
              colorSpace: 'hex',
              rgb: `rgba(${r[0]}, ${r[1]}, ${r[2]}, 1)`,
              hsl: `hsla(${n[0]}, ${n[1]}%, ${n[2]}%, 1)`,
              hex: o,
            };
          }),
          (jr = (e) => {
            if (e) return Y1.test(e) ? Q1(e) : K1.test(e) ? eE(e) : tE(e);
          }),
          (rE = (e, t, r) => {
            if (!e || !t?.valid) return ho[r];
            if (r !== 'hex') return t?.[r] || ho[r];
            if (!t.hex.startsWith('#'))
              try {
                return `#${ut.default.keyword.hex(t.hex)}`;
              } catch {
                return ho.hex;
              }
            let n = t.hex.match(X1);
            if (!n) return vi.test(t.hex) ? t.hex : ho.hex;
            let [o, i, a] = n[1].split('');
            return `#${o}${o}${i}${i}${a}${a}`;
          }),
          (nE = (e, t) => {
            let [r, n] = X(e || ''),
              [o, i] = X(() => jr(r)),
              [a, l] = X(o?.colorSpace || 'hex');
            ee(() => {
              let m = e || '',
                h = jr(m);
              (n(m), i(h), l(h?.colorSpace || 'hex'));
            }, [e]);
            let s = we(() => rE(r, o, a).toLowerCase(), [r, o, a]),
              d = se(
                (m) => {
                  let h = jr(m),
                    g = h?.value || m || '';
                  (n(g),
                    g === '' && (i(void 0), t(void 0)),
                    h && (i(h), l(h.colorSpace), t(h.value)));
                },
                [t],
              ),
              p = se(() => {
                let m = (Si.indexOf(a) + 1) % Si.length,
                  h = Si[m];
                l(h);
                let g = o?.[h] || '';
                (n(g), t(g));
              }, [o, a, t]);
            return {
              value: r,
              realValue: s,
              updateValue: d,
              color: o,
              colorSpace: a,
              cycleColorSpace: p,
            };
          }),
          (go = (e) => e.replace(/\s*/, '').toLowerCase()),
          (oE = (e, t, r, n = 27) => {
            let [o, i] = X(t?.valid ? [t] : []);
            ee(() => {
              t === void 0 && i([]);
            }, [t]);
            let a = we(() => {
                let s = (e || [])
                  .map((p) =>
                    typeof p == 'string'
                      ? jr(p)
                      : p.title
                        ? { ...jr(p.color), keyword: p.title }
                        : jr(p.color),
                  )
                  .concat(o)
                  .filter(Boolean);
                if (n === 0 || n === 1 / 0) return s;
                let d = Number.isInteger(n) && n > 0 ? n : 27;
                return s.slice(-d);
              }, [e, o, n]),
              l = se(
                (s) => {
                  s?.valid &&
                    (a.some((d) => d && d[r] && go(d[r] || '') === go(s[r] || '')) ||
                      i((d) => d.concat(s)));
                },
                [r, a],
              );
            return { presets: a, addPreset: l };
          }),
          (Md = ({
            name: e,
            storyId: t,
            value: r,
            onChange: n,
            onFocus: o,
            onBlur: i,
            presetColors: a,
            maxPresetColors: l,
            startOpen: s = !1,
            argType: d,
          }) => {
            let p = se(g1(n, 200), [n]),
              {
                value: m,
                realValue: h,
                updateValue: g,
                color: E,
                colorSpace: b,
                cycleColorSpace: _,
              } = nE(r, p),
              { presets: y, addPreset: S } = oE(a ?? [], E, b, l),
              A = Z1[b],
              T = !!d?.table?.readonly,
              C = Ke(e, t);
            return u.createElement(
              U1,
              null,
              u.createElement('label', { htmlFor: C, className: 'sb-sr-only' }, e),
              u.createElement(q1, {
                id: C,
                value: m,
                onChange: (x) => g(x.target.value),
                onFocus: (x) => x.target.select(),
                readOnly: T,
                placeholder: 'Choose color...',
              }),
              u.createElement(
                Ln,
                {
                  ariaLabel: 'Color picker',
                  defaultVisible: s,
                  visible: T ? !1 : void 0,
                  onVisibleChange: () => E && S(E),
                  popover: u.createElement(
                    V1,
                    null,
                    u.createElement(A, {
                      color: h === 'transparent' ? '#000000' : h,
                      onChange: g,
                      onFocus: o,
                      onBlur: i,
                    }),
                    y.length > 0 &&
                      u.createElement(
                        H1,
                        null,
                        y.map((x, v) =>
                          u.createElement(Fd, {
                            key: `${x?.value || v}-${v}`,
                            variant: 'ghost',
                            padding: 'small',
                            size: 'small',
                            ariaLabel: 'Pick this color',
                            tooltip: x?.keyword || x?.value || '',
                            value: x?.value || '',
                            selected: !!(E && x && x[b] && go(x[b] || '') === go(E[b])),
                            onClick: () => x && g(x.value || ''),
                          }),
                        ),
                      ),
                  ),
                },
                u.createElement(z1, {
                  variant: 'ghost',
                  padding: 'small',
                  size: 'small',
                  ariaLabel: 'Open color picker',
                  value: h,
                  style: { margin: 4 },
                  disabled: T,
                }),
              ),
              m
                ? u.createElement(
                    G1,
                    {
                      variant: 'ghost',
                      padding: 'small',
                      size: 'small',
                      ariaLabel: 'Cycle through color spaces',
                      disabled: T,
                      onClick: T ? void 0 : _,
                    },
                    u.createElement(Ol, null),
                  )
                : null,
            );
          }),
          (aE = Md));
      });
    U();
    V();
    H();
    U();
    V();
    H();
    Uo();
    U();
    V();
    H();
    U();
    V();
    H();
    function vs(e, t) {
      if (e == null) return {};
      var r = {};
      for (var n in e)
        if ({}.hasOwnProperty.call(e, n)) {
          if (t.indexOf(n) !== -1) continue;
          r[n] = e[n];
        }
      return r;
    }
    function Kr(e) {
      '@babel/helpers - typeof';
      return (
        (Kr =
          typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
            ? function (t) {
                return typeof t;
              }
            : function (t) {
                return t &&
                  typeof Symbol == 'function' &&
                  t.constructor === Symbol &&
                  t !== Symbol.prototype
                  ? 'symbol'
                  : typeof t;
              }),
        Kr(e)
      );
    }
    function Gm(e, t) {
      if (Kr(e) != 'object' || !e) return e;
      var r = e[Symbol.toPrimitive];
      if (r !== void 0) {
        var n = r.call(e, t || 'default');
        if (Kr(n) != 'object') return n;
        throw new TypeError('@@toPrimitive must return a primitive value.');
      }
      return (t === 'string' ? String : Number)(e);
    }
    function Wm(e) {
      var t = Gm(e, 'string');
      return Kr(t) == 'symbol' ? t : t + '';
    }
    function xs(e, t, r) {
      return (
        (t = Wm(t)) in e
          ? Object.defineProperty(e, t, {
              value: r,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = r),
        e
      );
    }
    function Sr(e, t) {
      if (e == null) return {};
      var r,
        n,
        o = vs(e, t);
      if (Object.getOwnPropertySymbols) {
        var i = Object.getOwnPropertySymbols(e);
        for (n = 0; n < i.length; n++)
          ((r = i[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (o[r] = e[r]));
      }
      return o;
    }
    U();
    V();
    H();
    var Ar = null;
    function Cs(e, t = 'assertive', r = 7e3) {
      Ar
        ? Ar.announce(e, t, r)
        : ((Ar = new Ym()),
          (
            typeof IS_REACT_ACT_ENVIRONMENT == 'boolean'
              ? IS_REACT_ACT_ENVIRONMENT
              : typeof jest < 'u'
          )
            ? Ar.announce(e, t, r)
            : setTimeout(() => {
                Ar?.isAttached() && Ar?.announce(e, t, r);
              }, 100));
    }
    var Ym = class {
      isAttached() {
        var e;
        return (e = this.node) === null || e === void 0 ? void 0 : e.isConnected;
      }
      createLog(e) {
        let t = document.createElement('div');
        return (
          t.setAttribute('role', 'log'),
          t.setAttribute('aria-live', e),
          t.setAttribute('aria-relevant', 'additions'),
          t
        );
      }
      destroy() {
        this.node && (document.body.removeChild(this.node), (this.node = null));
      }
      announce(e, t = 'assertive', r = 7e3) {
        var n, o;
        if (!this.node) return;
        let i = document.createElement('div');
        (typeof e == 'object'
          ? (i.setAttribute('role', 'img'), i.setAttribute('aria-labelledby', e['aria-labelledby']))
          : (i.textContent = e),
          t === 'assertive'
            ? (n = this.assertiveLog) === null || n === void 0 || n.appendChild(i)
            : (o = this.politeLog) === null || o === void 0 || o.appendChild(i),
          e !== '' &&
            setTimeout(() => {
              i.remove();
            }, r));
      }
      clear(e) {
        this.node &&
          ((!e || e === 'assertive') && this.assertiveLog && (this.assertiveLog.innerHTML = ''),
          (!e || e === 'polite') && this.politeLog && (this.politeLog.innerHTML = ''));
      }
      constructor() {
        ((this.node = null),
          (this.assertiveLog = null),
          (this.politeLog = null),
          typeof document < 'u' &&
            ((this.node = document.createElement('div')),
            (this.node.dataset.liveAnnouncer = 'true'),
            Object.assign(this.node.style, {
              border: 0,
              clip: 'rect(0 0 0 0)',
              clipPath: 'inset(50%)',
              height: '1px',
              margin: '-1px',
              overflow: 'hidden',
              padding: 0,
              position: 'absolute',
              width: '1px',
              whiteSpace: 'nowrap',
            }),
            (this.assertiveLog = this.createLog('assertive')),
            this.node.appendChild(this.assertiveLog),
            (this.politeLog = this.createLog('polite')),
            this.node.appendChild(this.politeLog),
            document.body.prepend(this.node)));
      }
    };
    U();
    V();
    H();
    var Os = Object.prototype.hasOwnProperty;
    function Rs(e, t, r) {
      for (r of e.keys()) if ($t(r, t)) return r;
    }
    function $t(e, t) {
      var r, n, o;
      if (e === t) return !0;
      if (e && t && (r = e.constructor) === t.constructor) {
        if (r === Date) return e.getTime() === t.getTime();
        if (r === RegExp) return e.toString() === t.toString();
        if (r === Array) {
          if ((n = e.length) === t.length) for (; n-- && $t(e[n], t[n]););
          return n === -1;
        }
        if (r === Set) {
          if (e.size !== t.size) return !1;
          for (n of e)
            if (((o = n), (o && typeof o == 'object' && ((o = Rs(t, o)), !o)) || !t.has(o)))
              return !1;
          return !0;
        }
        if (r === Map) {
          if (e.size !== t.size) return !1;
          for (n of e)
            if (
              ((o = n[0]),
              (o && typeof o == 'object' && ((o = Rs(t, o)), !o)) || !$t(n[1], t.get(o)))
            )
              return !1;
          return !0;
        }
        if (r === ArrayBuffer) ((e = new Uint8Array(e)), (t = new Uint8Array(t)));
        else if (r === DataView) {
          if ((n = e.byteLength) === t.byteLength) for (; n-- && e.getInt8(n) === t.getInt8(n););
          return n === -1;
        }
        if (ArrayBuffer.isView(e)) {
          if ((n = e.byteLength) === t.byteLength) for (; n-- && e[n] === t[n];);
          return n === -1;
        }
        if (!r || typeof e == 'object') {
          n = 0;
          for (r in e)
            if ((Os.call(e, r) && ++n && !Os.call(t, r)) || !(r in t) || !$t(e[r], t[r])) return !1;
          return Object.keys(t).length === n;
        }
      }
      return e !== e && t !== t;
    }
    function Is(e) {
      return [...new Set(e)];
    }
    U();
    V();
    H();
    var Tn = 'storybook/background',
      St = 'backgrounds',
      X_ = { UPDATE: `${Tn}/update` },
      rr = 'storybook/measure-addon',
      Vo = `${rr}/tool`,
      Ds = 'measureEnabled',
      Z_ = { RESULT: `${rr}/result`, REQUEST: `${rr}/request`, CLEAR: `${rr}/clear` },
      wn = 'storybook/outline',
      Tr = 'outline',
      _n = { light: { name: 'light', value: '#F8F8F8' }, dark: { name: 'dark', value: '#333' } };
    U();
    V();
    H();
    U();
    V();
    H();
    function ge() {
      return (
        (ge = Object.assign
          ? Object.assign.bind()
          : function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var r = arguments[t];
                for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
              }
              return e;
            }),
        ge.apply(null, arguments)
      );
    }
    function Km(e) {
      if (e === void 0)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return e;
    }
    function Xr(e, t) {
      return (
        (Xr = Object.setPrototypeOf
          ? Object.setPrototypeOf.bind()
          : function (r, n) {
              return ((r.__proto__ = n), r);
            }),
        Xr(e, t)
      );
    }
    function Xm(e, t) {
      ((e.prototype = Object.create(t.prototype)), (e.prototype.constructor = e), Xr(e, t));
    }
    function zo(e) {
      return (
        (zo = Object.setPrototypeOf
          ? Object.getPrototypeOf.bind()
          : function (t) {
              return t.__proto__ || Object.getPrototypeOf(t);
            }),
        zo(e)
      );
    }
    function Zm(e) {
      try {
        return Function.toString.call(e).indexOf('[native code]') !== -1;
      } catch {
        return typeof e == 'function';
      }
    }
    function Fs() {
      try {
        var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      } catch {}
      return (Fs = function () {
        return !!e;
      })();
    }
    function Qm(e, t, r) {
      if (Fs()) return Reflect.construct.apply(null, arguments);
      var n = [null];
      n.push.apply(n, t);
      var o = new (e.bind.apply(e, n))();
      return (r && Xr(o, r.prototype), o);
    }
    function Go(e) {
      var t = typeof Map == 'function' ? new Map() : void 0;
      return (
        (Go = function (r) {
          if (r === null || !Zm(r)) return r;
          if (typeof r != 'function')
            throw new TypeError('Super expression must either be null or a function');
          if (t !== void 0) {
            if (t.has(r)) return t.get(r);
            t.set(r, n);
          }
          function n() {
            return Qm(r, arguments, zo(this).constructor);
          }
          return (
            (n.prototype = Object.create(r.prototype, {
              constructor: { value: n, enumerable: !1, writable: !0, configurable: !0 },
            })),
            Xr(n, r)
          );
        }),
        Go(e)
      );
    }
    var eh = {
      1: `Passed invalid arguments to hsl, please pass multiple numbers e.g. hsl(360, 0.75, 0.4) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75 }).

`,
      2: `Passed invalid arguments to hsla, please pass multiple numbers e.g. hsla(360, 0.75, 0.4, 0.7) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75, alpha: 0.7 }).

`,
      3: `Passed an incorrect argument to a color function, please pass a string representation of a color.

`,
      4: `Couldn't generate valid rgb string from %s, it returned %s.

`,
      5: `Couldn't parse the color string. Please provide the color as a string in hex, rgb, rgba, hsl or hsla notation.

`,
      6: `Passed invalid arguments to rgb, please pass multiple numbers e.g. rgb(255, 205, 100) or an object e.g. rgb({ red: 255, green: 205, blue: 100 }).

`,
      7: `Passed invalid arguments to rgba, please pass multiple numbers e.g. rgb(255, 205, 100, 0.75) or an object e.g. rgb({ red: 255, green: 205, blue: 100, alpha: 0.75 }).

`,
      8: `Passed invalid argument to toColorString, please pass a RgbColor, RgbaColor, HslColor or HslaColor object.

`,
      9: `Please provide a number of steps to the modularScale helper.

`,
      10: `Please pass a number or one of the predefined scales to the modularScale helper as the ratio.

`,
      11: `Invalid value passed as base to modularScale, expected number or em string but got "%s"

`,
      12: `Expected a string ending in "px" or a number passed as the first argument to %s(), got "%s" instead.

`,
      13: `Expected a string ending in "px" or a number passed as the second argument to %s(), got "%s" instead.

`,
      14: `Passed invalid pixel value ("%s") to %s(), please pass a value like "12px" or 12.

`,
      15: `Passed invalid base value ("%s") to %s(), please pass a value like "12px" or 12.

`,
      16: `You must provide a template to this method.

`,
      17: `You passed an unsupported selector state to this method.

`,
      18: `minScreen and maxScreen must be provided as stringified numbers with the same units.

`,
      19: `fromSize and toSize must be provided as stringified numbers with the same units.

`,
      20: `expects either an array of objects or a single object with the properties prop, fromSize, and toSize.

`,
      21: 'expects the objects in the first argument array to have the properties `prop`, `fromSize`, and `toSize`.\n\n',
      22: 'expects the first argument object to have the properties `prop`, `fromSize`, and `toSize`.\n\n',
      23: `fontFace expects a name of a font-family.

`,
      24: `fontFace expects either the path to the font file(s) or a name of a local copy.

`,
      25: `fontFace expects localFonts to be an array.

`,
      26: `fontFace expects fileFormats to be an array.

`,
      27: `radialGradient requries at least 2 color-stops to properly render.

`,
      28: `Please supply a filename to retinaImage() as the first argument.

`,
      29: `Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.

`,
      30: 'Passed an invalid value to `height` or `width`. Please provide a pixel based unit.\n\n',
      31: `The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation

`,
      32: `To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])
To pass a single animation please supply them in simple values, e.g. animation('rotate', '2s')

`,
      33: `The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation

`,
      34: `borderRadius expects a radius value as a string or number as the second argument.

`,
      35: `borderRadius expects one of "top", "bottom", "left" or "right" as the first argument.

`,
      36: `Property must be a string value.

`,
      37: `Syntax Error at %s.

`,
      38: `Formula contains a function that needs parentheses at %s.

`,
      39: `Formula is missing closing parenthesis at %s.

`,
      40: `Formula has too many closing parentheses at %s.

`,
      41: `All values in a formula must have the same unit or be unitless.

`,
      42: `Please provide a number of steps to the modularScale helper.

`,
      43: `Please pass a number or one of the predefined scales to the modularScale helper as the ratio.

`,
      44: `Invalid value passed as base to modularScale, expected number or em/rem string but got %s.

`,
      45: `Passed invalid argument to hslToColorString, please pass a HslColor or HslaColor object.

`,
      46: `Passed invalid argument to rgbToColorString, please pass a RgbColor or RgbaColor object.

`,
      47: `minScreen and maxScreen must be provided as stringified numbers with the same units.

`,
      48: `fromSize and toSize must be provided as stringified numbers with the same units.

`,
      49: `Expects either an array of objects or a single object with the properties prop, fromSize, and toSize.

`,
      50: `Expects the objects in the first argument array to have the properties prop, fromSize, and toSize.

`,
      51: `Expects the first argument object to have the properties prop, fromSize, and toSize.

`,
      52: `fontFace expects either the path to the font file(s) or a name of a local copy.

`,
      53: `fontFace expects localFonts to be an array.

`,
      54: `fontFace expects fileFormats to be an array.

`,
      55: `fontFace expects a name of a font-family.

`,
      56: `linearGradient requries at least 2 color-stops to properly render.

`,
      57: `radialGradient requries at least 2 color-stops to properly render.

`,
      58: `Please supply a filename to retinaImage() as the first argument.

`,
      59: `Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.

`,
      60: 'Passed an invalid value to `height` or `width`. Please provide a pixel based unit.\n\n',
      61: `Property must be a string value.

`,
      62: `borderRadius expects a radius value as a string or number as the second argument.

`,
      63: `borderRadius expects one of "top", "bottom", "left" or "right" as the first argument.

`,
      64: `The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation.

`,
      65: `To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])\\nTo pass a single animation please supply them in simple values, e.g. animation('rotate', '2s').

`,
      66: `The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation.

`,
      67: `You must provide a template to this method.

`,
      68: `You passed an unsupported selector state to this method.

`,
      69: `Expected a string ending in "px" or a number passed as the first argument to %s(), got %s instead.

`,
      70: `Expected a string ending in "px" or a number passed as the second argument to %s(), got %s instead.

`,
      71: `Passed invalid pixel value %s to %s(), please pass a value like "12px" or 12.

`,
      72: `Passed invalid base value %s to %s(), please pass a value like "12px" or 12.

`,
      73: `Please provide a valid CSS variable.

`,
      74: `CSS variable not found and no default was provided.

`,
      75: `important requires a valid style object, got a %s instead.

`,
      76: `fromSize and toSize must be provided as stringified numbers with the same units as minScreen and maxScreen.

`,
      77: `remToPx expects a value in "rem" but you provided it in "%s".

`,
      78: `base must be set in "px" or "%" but you set it in "%s".
`,
    };
    function th() {
      for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
      var n = t[0],
        o = [],
        i;
      for (i = 1; i < t.length; i += 1) o.push(t[i]);
      return (
        o.forEach(function (a) {
          n = n.replace(/%[a-z]/, a);
        }),
        n
      );
    }
    var Xe = (function (e) {
      Xm(t, e);
      function t(r) {
        for (var n, o = arguments.length, i = new Array(o > 1 ? o - 1 : 0), a = 1; a < o; a++)
          i[a - 1] = arguments[a];
        return ((n = e.call(this, th.apply(void 0, [eh[r]].concat(i))) || this), Km(n));
      }
      return t;
    })(Go(Error));
    function Ps(e, t) {
      return e.substr(-t.length) === t;
    }
    var rh = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;
    function Ns(e) {
      if (typeof e != 'string') return e;
      var t = e.match(rh);
      return t ? parseFloat(e) : e;
    }
    var nh = function (e) {
        return function (t, r) {
          r === void 0 && (r = '16px');
          var n = t,
            o = r;
          if (typeof t == 'string') {
            if (!Ps(t, 'px')) throw new Xe(69, e, t);
            n = Ns(t);
          }
          if (typeof r == 'string') {
            if (!Ps(r, 'px')) throw new Xe(70, e, r);
            o = Ns(r);
          }
          if (typeof n == 'string') throw new Xe(71, t, e);
          if (typeof o == 'string') throw new Xe(72, r, e);
          return '' + n / o + e;
        };
      },
      Ls = nh,
      lv = Ls('em'),
      uv = Ls('rem');
    function Ho(e) {
      return Math.round(e * 255);
    }
    function oh(e, t, r) {
      return Ho(e) + ',' + Ho(t) + ',' + Ho(r);
    }
    function Zr(e, t, r, n) {
      if ((n === void 0 && (n = oh), t === 0)) return n(r, r, r);
      var o = (((e % 360) + 360) % 360) / 60,
        i = (1 - Math.abs(2 * r - 1)) * t,
        a = i * (1 - Math.abs((o % 2) - 1)),
        l = 0,
        s = 0,
        d = 0;
      o >= 0 && o < 1
        ? ((l = i), (s = a))
        : o >= 1 && o < 2
          ? ((l = a), (s = i))
          : o >= 2 && o < 3
            ? ((s = i), (d = a))
            : o >= 3 && o < 4
              ? ((s = a), (d = i))
              : o >= 4 && o < 5
                ? ((l = a), (d = i))
                : o >= 5 && o < 6 && ((l = i), (d = a));
      var p = r - i / 2,
        m = l + p,
        h = s + p,
        g = d + p;
      return n(m, h, g);
    }
    var ks = {
      aliceblue: 'f0f8ff',
      antiquewhite: 'faebd7',
      aqua: '00ffff',
      aquamarine: '7fffd4',
      azure: 'f0ffff',
      beige: 'f5f5dc',
      bisque: 'ffe4c4',
      black: '000',
      blanchedalmond: 'ffebcd',
      blue: '0000ff',
      blueviolet: '8a2be2',
      brown: 'a52a2a',
      burlywood: 'deb887',
      cadetblue: '5f9ea0',
      chartreuse: '7fff00',
      chocolate: 'd2691e',
      coral: 'ff7f50',
      cornflowerblue: '6495ed',
      cornsilk: 'fff8dc',
      crimson: 'dc143c',
      cyan: '00ffff',
      darkblue: '00008b',
      darkcyan: '008b8b',
      darkgoldenrod: 'b8860b',
      darkgray: 'a9a9a9',
      darkgreen: '006400',
      darkgrey: 'a9a9a9',
      darkkhaki: 'bdb76b',
      darkmagenta: '8b008b',
      darkolivegreen: '556b2f',
      darkorange: 'ff8c00',
      darkorchid: '9932cc',
      darkred: '8b0000',
      darksalmon: 'e9967a',
      darkseagreen: '8fbc8f',
      darkslateblue: '483d8b',
      darkslategray: '2f4f4f',
      darkslategrey: '2f4f4f',
      darkturquoise: '00ced1',
      darkviolet: '9400d3',
      deeppink: 'ff1493',
      deepskyblue: '00bfff',
      dimgray: '696969',
      dimgrey: '696969',
      dodgerblue: '1e90ff',
      firebrick: 'b22222',
      floralwhite: 'fffaf0',
      forestgreen: '228b22',
      fuchsia: 'ff00ff',
      gainsboro: 'dcdcdc',
      ghostwhite: 'f8f8ff',
      gold: 'ffd700',
      goldenrod: 'daa520',
      gray: '808080',
      green: '008000',
      greenyellow: 'adff2f',
      grey: '808080',
      honeydew: 'f0fff0',
      hotpink: 'ff69b4',
      indianred: 'cd5c5c',
      indigo: '4b0082',
      ivory: 'fffff0',
      khaki: 'f0e68c',
      lavender: 'e6e6fa',
      lavenderblush: 'fff0f5',
      lawngreen: '7cfc00',
      lemonchiffon: 'fffacd',
      lightblue: 'add8e6',
      lightcoral: 'f08080',
      lightcyan: 'e0ffff',
      lightgoldenrodyellow: 'fafad2',
      lightgray: 'd3d3d3',
      lightgreen: '90ee90',
      lightgrey: 'd3d3d3',
      lightpink: 'ffb6c1',
      lightsalmon: 'ffa07a',
      lightseagreen: '20b2aa',
      lightskyblue: '87cefa',
      lightslategray: '789',
      lightslategrey: '789',
      lightsteelblue: 'b0c4de',
      lightyellow: 'ffffe0',
      lime: '0f0',
      limegreen: '32cd32',
      linen: 'faf0e6',
      magenta: 'f0f',
      maroon: '800000',
      mediumaquamarine: '66cdaa',
      mediumblue: '0000cd',
      mediumorchid: 'ba55d3',
      mediumpurple: '9370db',
      mediumseagreen: '3cb371',
      mediumslateblue: '7b68ee',
      mediumspringgreen: '00fa9a',
      mediumturquoise: '48d1cc',
      mediumvioletred: 'c71585',
      midnightblue: '191970',
      mintcream: 'f5fffa',
      mistyrose: 'ffe4e1',
      moccasin: 'ffe4b5',
      navajowhite: 'ffdead',
      navy: '000080',
      oldlace: 'fdf5e6',
      olive: '808000',
      olivedrab: '6b8e23',
      orange: 'ffa500',
      orangered: 'ff4500',
      orchid: 'da70d6',
      palegoldenrod: 'eee8aa',
      palegreen: '98fb98',
      paleturquoise: 'afeeee',
      palevioletred: 'db7093',
      papayawhip: 'ffefd5',
      peachpuff: 'ffdab9',
      peru: 'cd853f',
      pink: 'ffc0cb',
      plum: 'dda0dd',
      powderblue: 'b0e0e6',
      purple: '800080',
      rebeccapurple: '639',
      red: 'f00',
      rosybrown: 'bc8f8f',
      royalblue: '4169e1',
      saddlebrown: '8b4513',
      salmon: 'fa8072',
      sandybrown: 'f4a460',
      seagreen: '2e8b57',
      seashell: 'fff5ee',
      sienna: 'a0522d',
      silver: 'c0c0c0',
      skyblue: '87ceeb',
      slateblue: '6a5acd',
      slategray: '708090',
      slategrey: '708090',
      snow: 'fffafa',
      springgreen: '00ff7f',
      steelblue: '4682b4',
      tan: 'd2b48c',
      teal: '008080',
      thistle: 'd8bfd8',
      tomato: 'ff6347',
      turquoise: '40e0d0',
      violet: 'ee82ee',
      wheat: 'f5deb3',
      white: 'fff',
      whitesmoke: 'f5f5f5',
      yellow: 'ff0',
      yellowgreen: '9acd32',
    };
    function ah(e) {
      if (typeof e != 'string') return e;
      var t = e.toLowerCase();
      return ks[t] ? '#' + ks[t] : e;
    }
    var ih = /^#[a-fA-F0-9]{6}$/,
      sh = /^#[a-fA-F0-9]{8}$/,
      lh = /^#[a-fA-F0-9]{3}$/,
      uh = /^#[a-fA-F0-9]{4}$/,
      Jo = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i,
      ch =
        /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i,
      dh =
        /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i,
      ph =
        /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
    function wr(e) {
      if (typeof e != 'string') throw new Xe(3);
      var t = ah(e);
      if (t.match(ih))
        return {
          red: parseInt('' + t[1] + t[2], 16),
          green: parseInt('' + t[3] + t[4], 16),
          blue: parseInt('' + t[5] + t[6], 16),
        };
      if (t.match(sh)) {
        var r = parseFloat((parseInt('' + t[7] + t[8], 16) / 255).toFixed(2));
        return {
          red: parseInt('' + t[1] + t[2], 16),
          green: parseInt('' + t[3] + t[4], 16),
          blue: parseInt('' + t[5] + t[6], 16),
          alpha: r,
        };
      }
      if (t.match(lh))
        return {
          red: parseInt('' + t[1] + t[1], 16),
          green: parseInt('' + t[2] + t[2], 16),
          blue: parseInt('' + t[3] + t[3], 16),
        };
      if (t.match(uh)) {
        var n = parseFloat((parseInt('' + t[4] + t[4], 16) / 255).toFixed(2));
        return {
          red: parseInt('' + t[1] + t[1], 16),
          green: parseInt('' + t[2] + t[2], 16),
          blue: parseInt('' + t[3] + t[3], 16),
          alpha: n,
        };
      }
      var o = Jo.exec(t);
      if (o)
        return {
          red: parseInt('' + o[1], 10),
          green: parseInt('' + o[2], 10),
          blue: parseInt('' + o[3], 10),
        };
      var i = ch.exec(t.substring(0, 50));
      if (i)
        return {
          red: parseInt('' + i[1], 10),
          green: parseInt('' + i[2], 10),
          blue: parseInt('' + i[3], 10),
          alpha: parseFloat('' + i[4]) > 1 ? parseFloat('' + i[4]) / 100 : parseFloat('' + i[4]),
        };
      var a = dh.exec(t);
      if (a) {
        var l = parseInt('' + a[1], 10),
          s = parseInt('' + a[2], 10) / 100,
          d = parseInt('' + a[3], 10) / 100,
          p = 'rgb(' + Zr(l, s, d) + ')',
          m = Jo.exec(p);
        if (!m) throw new Xe(4, t, p);
        return {
          red: parseInt('' + m[1], 10),
          green: parseInt('' + m[2], 10),
          blue: parseInt('' + m[3], 10),
        };
      }
      var h = ph.exec(t.substring(0, 50));
      if (h) {
        var g = parseInt('' + h[1], 10),
          E = parseInt('' + h[2], 10) / 100,
          b = parseInt('' + h[3], 10) / 100,
          _ = 'rgb(' + Zr(g, E, b) + ')',
          y = Jo.exec(_);
        if (!y) throw new Xe(4, t, _);
        return {
          red: parseInt('' + y[1], 10),
          green: parseInt('' + y[2], 10),
          blue: parseInt('' + y[3], 10),
          alpha: parseFloat('' + h[4]) > 1 ? parseFloat('' + h[4]) / 100 : parseFloat('' + h[4]),
        };
      }
      throw new Xe(5);
    }
    function mh(e) {
      var t = e.red / 255,
        r = e.green / 255,
        n = e.blue / 255,
        o = Math.max(t, r, n),
        i = Math.min(t, r, n),
        a = (o + i) / 2;
      if (o === i)
        return e.alpha !== void 0
          ? { hue: 0, saturation: 0, lightness: a, alpha: e.alpha }
          : { hue: 0, saturation: 0, lightness: a };
      var l,
        s = o - i,
        d = a > 0.5 ? s / (2 - o - i) : s / (o + i);
      switch (o) {
        case t:
          l = (r - n) / s + (r < n ? 6 : 0);
          break;
        case r:
          l = (n - t) / s + 2;
          break;
        default:
          l = (t - r) / s + 4;
          break;
      }
      return (
        (l *= 60),
        e.alpha !== void 0
          ? { hue: l, saturation: d, lightness: a, alpha: e.alpha }
          : { hue: l, saturation: d, lightness: a }
      );
    }
    function jt(e) {
      return mh(wr(e));
    }
    var hh = function (e) {
        return e.length === 7 && e[1] === e[2] && e[3] === e[4] && e[5] === e[6]
          ? '#' + e[1] + e[3] + e[5]
          : e;
      },
      Wo = hh;
    function nr(e) {
      var t = e.toString(16);
      return t.length === 1 ? '0' + t : t;
    }
    function qo(e) {
      return nr(Math.round(e * 255));
    }
    function fh(e, t, r) {
      return Wo('#' + qo(e) + qo(t) + qo(r));
    }
    function vn(e, t, r) {
      return Zr(e, t, r, fh);
    }
    function gh(e, t, r) {
      if (typeof e == 'number' && typeof t == 'number' && typeof r == 'number') return vn(e, t, r);
      if (typeof e == 'object' && t === void 0 && r === void 0)
        return vn(e.hue, e.saturation, e.lightness);
      throw new Xe(1);
    }
    function yh(e, t, r, n) {
      if (
        typeof e == 'number' &&
        typeof t == 'number' &&
        typeof r == 'number' &&
        typeof n == 'number'
      )
        return n >= 1 ? vn(e, t, r) : 'rgba(' + Zr(e, t, r) + ',' + n + ')';
      if (typeof e == 'object' && t === void 0 && r === void 0 && n === void 0)
        return e.alpha >= 1
          ? vn(e.hue, e.saturation, e.lightness)
          : 'rgba(' + Zr(e.hue, e.saturation, e.lightness) + ',' + e.alpha + ')';
      throw new Xe(2);
    }
    function Yo(e, t, r) {
      if (typeof e == 'number' && typeof t == 'number' && typeof r == 'number')
        return Wo('#' + nr(e) + nr(t) + nr(r));
      if (typeof e == 'object' && t === void 0 && r === void 0)
        return Wo('#' + nr(e.red) + nr(e.green) + nr(e.blue));
      throw new Xe(6);
    }
    function or(e, t, r, n) {
      if (typeof e == 'string' && typeof t == 'number') {
        var o = wr(e);
        return 'rgba(' + o.red + ',' + o.green + ',' + o.blue + ',' + t + ')';
      } else {
        if (
          typeof e == 'number' &&
          typeof t == 'number' &&
          typeof r == 'number' &&
          typeof n == 'number'
        )
          return n >= 1 ? Yo(e, t, r) : 'rgba(' + e + ',' + t + ',' + r + ',' + n + ')';
        if (typeof e == 'object' && t === void 0 && r === void 0 && n === void 0)
          return e.alpha >= 1
            ? Yo(e.red, e.green, e.blue)
            : 'rgba(' + e.red + ',' + e.green + ',' + e.blue + ',' + e.alpha + ')';
      }
      throw new Xe(7);
    }
    var bh = function (e) {
        return (
          typeof e.red == 'number' &&
          typeof e.green == 'number' &&
          typeof e.blue == 'number' &&
          (typeof e.alpha != 'number' || typeof e.alpha > 'u')
        );
      },
      Eh = function (e) {
        return (
          typeof e.red == 'number' &&
          typeof e.green == 'number' &&
          typeof e.blue == 'number' &&
          typeof e.alpha == 'number'
        );
      },
      Sh = function (e) {
        return (
          typeof e.hue == 'number' &&
          typeof e.saturation == 'number' &&
          typeof e.lightness == 'number' &&
          (typeof e.alpha != 'number' || typeof e.alpha > 'u')
        );
      },
      Ah = function (e) {
        return (
          typeof e.hue == 'number' &&
          typeof e.saturation == 'number' &&
          typeof e.lightness == 'number' &&
          typeof e.alpha == 'number'
        );
      };
    function Ut(e) {
      if (typeof e != 'object') throw new Xe(8);
      if (Eh(e)) return or(e);
      if (bh(e)) return Yo(e);
      if (Ah(e)) return yh(e);
      if (Sh(e)) return gh(e);
      throw new Xe(8);
    }
    function Bs(e, t, r) {
      return function () {
        var n = r.concat(Array.prototype.slice.call(arguments));
        return n.length >= t ? e.apply(this, n) : Bs(e, t, n);
      };
    }
    function nt(e) {
      return Bs(e, e.length, []);
    }
    function Th(e, t) {
      if (t === 'transparent') return t;
      var r = jt(t);
      return Ut(ge({}, r, { hue: r.hue + parseFloat(e) }));
    }
    var cv = nt(Th);
    function _r(e, t, r) {
      return Math.max(e, Math.min(t, r));
    }
    function wh(e, t) {
      if (t === 'transparent') return t;
      var r = jt(t);
      return Ut(ge({}, r, { lightness: _r(0, 1, r.lightness - parseFloat(e)) }));
    }
    var _h = nt(wh),
      xn = _h;
    function vh(e, t) {
      if (t === 'transparent') return t;
      var r = jt(t);
      return Ut(ge({}, r, { saturation: _r(0, 1, r.saturation - parseFloat(e)) }));
    }
    var dv = nt(vh);
    function xh(e, t) {
      if (t === 'transparent') return t;
      var r = jt(t);
      return Ut(ge({}, r, { lightness: _r(0, 1, r.lightness + parseFloat(e)) }));
    }
    var Ch = nt(xh),
      Cn = Ch;
    function Oh(e, t, r) {
      if (t === 'transparent') return r;
      if (r === 'transparent') return t;
      if (e === 0) return r;
      var n = wr(t),
        o = ge({}, n, { alpha: typeof n.alpha == 'number' ? n.alpha : 1 }),
        i = wr(r),
        a = ge({}, i, { alpha: typeof i.alpha == 'number' ? i.alpha : 1 }),
        l = o.alpha - a.alpha,
        s = parseFloat(e) * 2 - 1,
        d = s * l === -1 ? s : s + l,
        p = 1 + s * l,
        m = (d / p + 1) / 2,
        h = 1 - m,
        g = {
          red: Math.floor(o.red * m + a.red * h),
          green: Math.floor(o.green * m + a.green * h),
          blue: Math.floor(o.blue * m + a.blue * h),
          alpha: o.alpha * parseFloat(e) + a.alpha * (1 - parseFloat(e)),
        };
      return or(g);
    }
    var Rh = nt(Oh),
      Ms = Rh;
    function Ih(e, t) {
      if (t === 'transparent') return t;
      var r = wr(t),
        n = typeof r.alpha == 'number' ? r.alpha : 1,
        o = ge({}, r, { alpha: _r(0, 1, (n * 100 + parseFloat(e) * 100) / 100) });
      return or(o);
    }
    var Dh = nt(Ih),
      Qr = Dh;
    function Ph(e, t) {
      if (t === 'transparent') return t;
      var r = jt(t);
      return Ut(ge({}, r, { saturation: _r(0, 1, r.saturation + parseFloat(e)) }));
    }
    var pv = nt(Ph);
    function Nh(e, t) {
      return t === 'transparent' ? t : Ut(ge({}, jt(t), { hue: parseFloat(e) }));
    }
    var mv = nt(Nh);
    function kh(e, t) {
      return t === 'transparent' ? t : Ut(ge({}, jt(t), { lightness: parseFloat(e) }));
    }
    var hv = nt(kh);
    function Fh(e, t) {
      return t === 'transparent' ? t : Ut(ge({}, jt(t), { saturation: parseFloat(e) }));
    }
    var fv = nt(Fh);
    function Lh(e, t) {
      return t === 'transparent' ? t : Ms(parseFloat(e), 'rgb(0, 0, 0)', t);
    }
    var gv = nt(Lh);
    function Bh(e, t) {
      return t === 'transparent' ? t : Ms(parseFloat(e), 'rgb(255, 255, 255)', t);
    }
    var yv = nt(Bh);
    function Mh(e, t) {
      if (t === 'transparent') return t;
      var r = wr(t),
        n = typeof r.alpha == 'number' ? r.alpha : 1,
        o = ge({}, r, { alpha: _r(0, 1, +(n * 100 - parseFloat(e) * 100).toFixed(2) / 100) });
      return or(o);
    }
    var $h = nt(Mh),
      Je = $h;
    U();
    V();
    H();
    var Me = {
        CALL: 'storybook/instrumenter/call',
        SYNC: 'storybook/instrumenter/sync',
        START: 'storybook/instrumenter/start',
        BACK: 'storybook/instrumenter/back',
        GOTO: 'storybook/instrumenter/goto',
        NEXT: 'storybook/instrumenter/next',
        END: 'storybook/instrumenter/end',
      },
      $s = ((e) => (
        (e.DONE = 'done'),
        (e.ERROR = 'error'),
        (e.ACTIVE = 'active'),
        (e.WAITING = 'waiting'),
        e
      ))($s || {});
    U();
    V();
    H();
    it();
    var Hs = de({
        '../../node_modules/entities/lib/maps/entities.json'(e, t) {
          t.exports = {
            Aacute: '\xC1',
            aacute: '\xE1',
            Abreve: '\u0102',
            abreve: '\u0103',
            ac: '\u223E',
            acd: '\u223F',
            acE: '\u223E\u0333',
            Acirc: '\xC2',
            acirc: '\xE2',
            acute: '\xB4',
            Acy: '\u0410',
            acy: '\u0430',
            AElig: '\xC6',
            aelig: '\xE6',
            af: '\u2061',
            Afr: '\u{1D504}',
            afr: '\u{1D51E}',
            Agrave: '\xC0',
            agrave: '\xE0',
            alefsym: '\u2135',
            aleph: '\u2135',
            Alpha: '\u0391',
            alpha: '\u03B1',
            Amacr: '\u0100',
            amacr: '\u0101',
            amalg: '\u2A3F',
            amp: '&',
            AMP: '&',
            andand: '\u2A55',
            And: '\u2A53',
            and: '\u2227',
            andd: '\u2A5C',
            andslope: '\u2A58',
            andv: '\u2A5A',
            ang: '\u2220',
            ange: '\u29A4',
            angle: '\u2220',
            angmsdaa: '\u29A8',
            angmsdab: '\u29A9',
            angmsdac: '\u29AA',
            angmsdad: '\u29AB',
            angmsdae: '\u29AC',
            angmsdaf: '\u29AD',
            angmsdag: '\u29AE',
            angmsdah: '\u29AF',
            angmsd: '\u2221',
            angrt: '\u221F',
            angrtvb: '\u22BE',
            angrtvbd: '\u299D',
            angsph: '\u2222',
            angst: '\xC5',
            angzarr: '\u237C',
            Aogon: '\u0104',
            aogon: '\u0105',
            Aopf: '\u{1D538}',
            aopf: '\u{1D552}',
            apacir: '\u2A6F',
            ap: '\u2248',
            apE: '\u2A70',
            ape: '\u224A',
            apid: '\u224B',
            apos: "'",
            ApplyFunction: '\u2061',
            approx: '\u2248',
            approxeq: '\u224A',
            Aring: '\xC5',
            aring: '\xE5',
            Ascr: '\u{1D49C}',
            ascr: '\u{1D4B6}',
            Assign: '\u2254',
            ast: '*',
            asymp: '\u2248',
            asympeq: '\u224D',
            Atilde: '\xC3',
            atilde: '\xE3',
            Auml: '\xC4',
            auml: '\xE4',
            awconint: '\u2233',
            awint: '\u2A11',
            backcong: '\u224C',
            backepsilon: '\u03F6',
            backprime: '\u2035',
            backsim: '\u223D',
            backsimeq: '\u22CD',
            Backslash: '\u2216',
            Barv: '\u2AE7',
            barvee: '\u22BD',
            barwed: '\u2305',
            Barwed: '\u2306',
            barwedge: '\u2305',
            bbrk: '\u23B5',
            bbrktbrk: '\u23B6',
            bcong: '\u224C',
            Bcy: '\u0411',
            bcy: '\u0431',
            bdquo: '\u201E',
            becaus: '\u2235',
            because: '\u2235',
            Because: '\u2235',
            bemptyv: '\u29B0',
            bepsi: '\u03F6',
            bernou: '\u212C',
            Bernoullis: '\u212C',
            Beta: '\u0392',
            beta: '\u03B2',
            beth: '\u2136',
            between: '\u226C',
            Bfr: '\u{1D505}',
            bfr: '\u{1D51F}',
            bigcap: '\u22C2',
            bigcirc: '\u25EF',
            bigcup: '\u22C3',
            bigodot: '\u2A00',
            bigoplus: '\u2A01',
            bigotimes: '\u2A02',
            bigsqcup: '\u2A06',
            bigstar: '\u2605',
            bigtriangledown: '\u25BD',
            bigtriangleup: '\u25B3',
            biguplus: '\u2A04',
            bigvee: '\u22C1',
            bigwedge: '\u22C0',
            bkarow: '\u290D',
            blacklozenge: '\u29EB',
            blacksquare: '\u25AA',
            blacktriangle: '\u25B4',
            blacktriangledown: '\u25BE',
            blacktriangleleft: '\u25C2',
            blacktriangleright: '\u25B8',
            blank: '\u2423',
            blk12: '\u2592',
            blk14: '\u2591',
            blk34: '\u2593',
            block: '\u2588',
            bne: '=\u20E5',
            bnequiv: '\u2261\u20E5',
            bNot: '\u2AED',
            bnot: '\u2310',
            Bopf: '\u{1D539}',
            bopf: '\u{1D553}',
            bot: '\u22A5',
            bottom: '\u22A5',
            bowtie: '\u22C8',
            boxbox: '\u29C9',
            boxdl: '\u2510',
            boxdL: '\u2555',
            boxDl: '\u2556',
            boxDL: '\u2557',
            boxdr: '\u250C',
            boxdR: '\u2552',
            boxDr: '\u2553',
            boxDR: '\u2554',
            boxh: '\u2500',
            boxH: '\u2550',
            boxhd: '\u252C',
            boxHd: '\u2564',
            boxhD: '\u2565',
            boxHD: '\u2566',
            boxhu: '\u2534',
            boxHu: '\u2567',
            boxhU: '\u2568',
            boxHU: '\u2569',
            boxminus: '\u229F',
            boxplus: '\u229E',
            boxtimes: '\u22A0',
            boxul: '\u2518',
            boxuL: '\u255B',
            boxUl: '\u255C',
            boxUL: '\u255D',
            boxur: '\u2514',
            boxuR: '\u2558',
            boxUr: '\u2559',
            boxUR: '\u255A',
            boxv: '\u2502',
            boxV: '\u2551',
            boxvh: '\u253C',
            boxvH: '\u256A',
            boxVh: '\u256B',
            boxVH: '\u256C',
            boxvl: '\u2524',
            boxvL: '\u2561',
            boxVl: '\u2562',
            boxVL: '\u2563',
            boxvr: '\u251C',
            boxvR: '\u255E',
            boxVr: '\u255F',
            boxVR: '\u2560',
            bprime: '\u2035',
            breve: '\u02D8',
            Breve: '\u02D8',
            brvbar: '\xA6',
            bscr: '\u{1D4B7}',
            Bscr: '\u212C',
            bsemi: '\u204F',
            bsim: '\u223D',
            bsime: '\u22CD',
            bsolb: '\u29C5',
            bsol: '\\',
            bsolhsub: '\u27C8',
            bull: '\u2022',
            bullet: '\u2022',
            bump: '\u224E',
            bumpE: '\u2AAE',
            bumpe: '\u224F',
            Bumpeq: '\u224E',
            bumpeq: '\u224F',
            Cacute: '\u0106',
            cacute: '\u0107',
            capand: '\u2A44',
            capbrcup: '\u2A49',
            capcap: '\u2A4B',
            cap: '\u2229',
            Cap: '\u22D2',
            capcup: '\u2A47',
            capdot: '\u2A40',
            CapitalDifferentialD: '\u2145',
            caps: '\u2229\uFE00',
            caret: '\u2041',
            caron: '\u02C7',
            Cayleys: '\u212D',
            ccaps: '\u2A4D',
            Ccaron: '\u010C',
            ccaron: '\u010D',
            Ccedil: '\xC7',
            ccedil: '\xE7',
            Ccirc: '\u0108',
            ccirc: '\u0109',
            Cconint: '\u2230',
            ccups: '\u2A4C',
            ccupssm: '\u2A50',
            Cdot: '\u010A',
            cdot: '\u010B',
            cedil: '\xB8',
            Cedilla: '\xB8',
            cemptyv: '\u29B2',
            cent: '\xA2',
            centerdot: '\xB7',
            CenterDot: '\xB7',
            cfr: '\u{1D520}',
            Cfr: '\u212D',
            CHcy: '\u0427',
            chcy: '\u0447',
            check: '\u2713',
            checkmark: '\u2713',
            Chi: '\u03A7',
            chi: '\u03C7',
            circ: '\u02C6',
            circeq: '\u2257',
            circlearrowleft: '\u21BA',
            circlearrowright: '\u21BB',
            circledast: '\u229B',
            circledcirc: '\u229A',
            circleddash: '\u229D',
            CircleDot: '\u2299',
            circledR: '\xAE',
            circledS: '\u24C8',
            CircleMinus: '\u2296',
            CirclePlus: '\u2295',
            CircleTimes: '\u2297',
            cir: '\u25CB',
            cirE: '\u29C3',
            cire: '\u2257',
            cirfnint: '\u2A10',
            cirmid: '\u2AEF',
            cirscir: '\u29C2',
            ClockwiseContourIntegral: '\u2232',
            CloseCurlyDoubleQuote: '\u201D',
            CloseCurlyQuote: '\u2019',
            clubs: '\u2663',
            clubsuit: '\u2663',
            colon: ':',
            Colon: '\u2237',
            Colone: '\u2A74',
            colone: '\u2254',
            coloneq: '\u2254',
            comma: ',',
            commat: '@',
            comp: '\u2201',
            compfn: '\u2218',
            complement: '\u2201',
            complexes: '\u2102',
            cong: '\u2245',
            congdot: '\u2A6D',
            Congruent: '\u2261',
            conint: '\u222E',
            Conint: '\u222F',
            ContourIntegral: '\u222E',
            copf: '\u{1D554}',
            Copf: '\u2102',
            coprod: '\u2210',
            Coproduct: '\u2210',
            copy: '\xA9',
            COPY: '\xA9',
            copysr: '\u2117',
            CounterClockwiseContourIntegral: '\u2233',
            crarr: '\u21B5',
            cross: '\u2717',
            Cross: '\u2A2F',
            Cscr: '\u{1D49E}',
            cscr: '\u{1D4B8}',
            csub: '\u2ACF',
            csube: '\u2AD1',
            csup: '\u2AD0',
            csupe: '\u2AD2',
            ctdot: '\u22EF',
            cudarrl: '\u2938',
            cudarrr: '\u2935',
            cuepr: '\u22DE',
            cuesc: '\u22DF',
            cularr: '\u21B6',
            cularrp: '\u293D',
            cupbrcap: '\u2A48',
            cupcap: '\u2A46',
            CupCap: '\u224D',
            cup: '\u222A',
            Cup: '\u22D3',
            cupcup: '\u2A4A',
            cupdot: '\u228D',
            cupor: '\u2A45',
            cups: '\u222A\uFE00',
            curarr: '\u21B7',
            curarrm: '\u293C',
            curlyeqprec: '\u22DE',
            curlyeqsucc: '\u22DF',
            curlyvee: '\u22CE',
            curlywedge: '\u22CF',
            curren: '\xA4',
            curvearrowleft: '\u21B6',
            curvearrowright: '\u21B7',
            cuvee: '\u22CE',
            cuwed: '\u22CF',
            cwconint: '\u2232',
            cwint: '\u2231',
            cylcty: '\u232D',
            dagger: '\u2020',
            Dagger: '\u2021',
            daleth: '\u2138',
            darr: '\u2193',
            Darr: '\u21A1',
            dArr: '\u21D3',
            dash: '\u2010',
            Dashv: '\u2AE4',
            dashv: '\u22A3',
            dbkarow: '\u290F',
            dblac: '\u02DD',
            Dcaron: '\u010E',
            dcaron: '\u010F',
            Dcy: '\u0414',
            dcy: '\u0434',
            ddagger: '\u2021',
            ddarr: '\u21CA',
            DD: '\u2145',
            dd: '\u2146',
            DDotrahd: '\u2911',
            ddotseq: '\u2A77',
            deg: '\xB0',
            Del: '\u2207',
            Delta: '\u0394',
            delta: '\u03B4',
            demptyv: '\u29B1',
            dfisht: '\u297F',
            Dfr: '\u{1D507}',
            dfr: '\u{1D521}',
            dHar: '\u2965',
            dharl: '\u21C3',
            dharr: '\u21C2',
            DiacriticalAcute: '\xB4',
            DiacriticalDot: '\u02D9',
            DiacriticalDoubleAcute: '\u02DD',
            DiacriticalGrave: '`',
            DiacriticalTilde: '\u02DC',
            diam: '\u22C4',
            diamond: '\u22C4',
            Diamond: '\u22C4',
            diamondsuit: '\u2666',
            diams: '\u2666',
            die: '\xA8',
            DifferentialD: '\u2146',
            digamma: '\u03DD',
            disin: '\u22F2',
            div: '\xF7',
            divide: '\xF7',
            divideontimes: '\u22C7',
            divonx: '\u22C7',
            DJcy: '\u0402',
            djcy: '\u0452',
            dlcorn: '\u231E',
            dlcrop: '\u230D',
            dollar: '$',
            Dopf: '\u{1D53B}',
            dopf: '\u{1D555}',
            Dot: '\xA8',
            dot: '\u02D9',
            DotDot: '\u20DC',
            doteq: '\u2250',
            doteqdot: '\u2251',
            DotEqual: '\u2250',
            dotminus: '\u2238',
            dotplus: '\u2214',
            dotsquare: '\u22A1',
            doublebarwedge: '\u2306',
            DoubleContourIntegral: '\u222F',
            DoubleDot: '\xA8',
            DoubleDownArrow: '\u21D3',
            DoubleLeftArrow: '\u21D0',
            DoubleLeftRightArrow: '\u21D4',
            DoubleLeftTee: '\u2AE4',
            DoubleLongLeftArrow: '\u27F8',
            DoubleLongLeftRightArrow: '\u27FA',
            DoubleLongRightArrow: '\u27F9',
            DoubleRightArrow: '\u21D2',
            DoubleRightTee: '\u22A8',
            DoubleUpArrow: '\u21D1',
            DoubleUpDownArrow: '\u21D5',
            DoubleVerticalBar: '\u2225',
            DownArrowBar: '\u2913',
            downarrow: '\u2193',
            DownArrow: '\u2193',
            Downarrow: '\u21D3',
            DownArrowUpArrow: '\u21F5',
            DownBreve: '\u0311',
            downdownarrows: '\u21CA',
            downharpoonleft: '\u21C3',
            downharpoonright: '\u21C2',
            DownLeftRightVector: '\u2950',
            DownLeftTeeVector: '\u295E',
            DownLeftVectorBar: '\u2956',
            DownLeftVector: '\u21BD',
            DownRightTeeVector: '\u295F',
            DownRightVectorBar: '\u2957',
            DownRightVector: '\u21C1',
            DownTeeArrow: '\u21A7',
            DownTee: '\u22A4',
            drbkarow: '\u2910',
            drcorn: '\u231F',
            drcrop: '\u230C',
            Dscr: '\u{1D49F}',
            dscr: '\u{1D4B9}',
            DScy: '\u0405',
            dscy: '\u0455',
            dsol: '\u29F6',
            Dstrok: '\u0110',
            dstrok: '\u0111',
            dtdot: '\u22F1',
            dtri: '\u25BF',
            dtrif: '\u25BE',
            duarr: '\u21F5',
            duhar: '\u296F',
            dwangle: '\u29A6',
            DZcy: '\u040F',
            dzcy: '\u045F',
            dzigrarr: '\u27FF',
            Eacute: '\xC9',
            eacute: '\xE9',
            easter: '\u2A6E',
            Ecaron: '\u011A',
            ecaron: '\u011B',
            Ecirc: '\xCA',
            ecirc: '\xEA',
            ecir: '\u2256',
            ecolon: '\u2255',
            Ecy: '\u042D',
            ecy: '\u044D',
            eDDot: '\u2A77',
            Edot: '\u0116',
            edot: '\u0117',
            eDot: '\u2251',
            ee: '\u2147',
            efDot: '\u2252',
            Efr: '\u{1D508}',
            efr: '\u{1D522}',
            eg: '\u2A9A',
            Egrave: '\xC8',
            egrave: '\xE8',
            egs: '\u2A96',
            egsdot: '\u2A98',
            el: '\u2A99',
            Element: '\u2208',
            elinters: '\u23E7',
            ell: '\u2113',
            els: '\u2A95',
            elsdot: '\u2A97',
            Emacr: '\u0112',
            emacr: '\u0113',
            empty: '\u2205',
            emptyset: '\u2205',
            EmptySmallSquare: '\u25FB',
            emptyv: '\u2205',
            EmptyVerySmallSquare: '\u25AB',
            emsp13: '\u2004',
            emsp14: '\u2005',
            emsp: '\u2003',
            ENG: '\u014A',
            eng: '\u014B',
            ensp: '\u2002',
            Eogon: '\u0118',
            eogon: '\u0119',
            Eopf: '\u{1D53C}',
            eopf: '\u{1D556}',
            epar: '\u22D5',
            eparsl: '\u29E3',
            eplus: '\u2A71',
            epsi: '\u03B5',
            Epsilon: '\u0395',
            epsilon: '\u03B5',
            epsiv: '\u03F5',
            eqcirc: '\u2256',
            eqcolon: '\u2255',
            eqsim: '\u2242',
            eqslantgtr: '\u2A96',
            eqslantless: '\u2A95',
            Equal: '\u2A75',
            equals: '=',
            EqualTilde: '\u2242',
            equest: '\u225F',
            Equilibrium: '\u21CC',
            equiv: '\u2261',
            equivDD: '\u2A78',
            eqvparsl: '\u29E5',
            erarr: '\u2971',
            erDot: '\u2253',
            escr: '\u212F',
            Escr: '\u2130',
            esdot: '\u2250',
            Esim: '\u2A73',
            esim: '\u2242',
            Eta: '\u0397',
            eta: '\u03B7',
            ETH: '\xD0',
            eth: '\xF0',
            Euml: '\xCB',
            euml: '\xEB',
            euro: '\u20AC',
            excl: '!',
            exist: '\u2203',
            Exists: '\u2203',
            expectation: '\u2130',
            exponentiale: '\u2147',
            ExponentialE: '\u2147',
            fallingdotseq: '\u2252',
            Fcy: '\u0424',
            fcy: '\u0444',
            female: '\u2640',
            ffilig: '\uFB03',
            fflig: '\uFB00',
            ffllig: '\uFB04',
            Ffr: '\u{1D509}',
            ffr: '\u{1D523}',
            filig: '\uFB01',
            FilledSmallSquare: '\u25FC',
            FilledVerySmallSquare: '\u25AA',
            fjlig: 'fj',
            flat: '\u266D',
            fllig: '\uFB02',
            fltns: '\u25B1',
            fnof: '\u0192',
            Fopf: '\u{1D53D}',
            fopf: '\u{1D557}',
            forall: '\u2200',
            ForAll: '\u2200',
            fork: '\u22D4',
            forkv: '\u2AD9',
            Fouriertrf: '\u2131',
            fpartint: '\u2A0D',
            frac12: '\xBD',
            frac13: '\u2153',
            frac14: '\xBC',
            frac15: '\u2155',
            frac16: '\u2159',
            frac18: '\u215B',
            frac23: '\u2154',
            frac25: '\u2156',
            frac34: '\xBE',
            frac35: '\u2157',
            frac38: '\u215C',
            frac45: '\u2158',
            frac56: '\u215A',
            frac58: '\u215D',
            frac78: '\u215E',
            frasl: '\u2044',
            frown: '\u2322',
            fscr: '\u{1D4BB}',
            Fscr: '\u2131',
            gacute: '\u01F5',
            Gamma: '\u0393',
            gamma: '\u03B3',
            Gammad: '\u03DC',
            gammad: '\u03DD',
            gap: '\u2A86',
            Gbreve: '\u011E',
            gbreve: '\u011F',
            Gcedil: '\u0122',
            Gcirc: '\u011C',
            gcirc: '\u011D',
            Gcy: '\u0413',
            gcy: '\u0433',
            Gdot: '\u0120',
            gdot: '\u0121',
            ge: '\u2265',
            gE: '\u2267',
            gEl: '\u2A8C',
            gel: '\u22DB',
            geq: '\u2265',
            geqq: '\u2267',
            geqslant: '\u2A7E',
            gescc: '\u2AA9',
            ges: '\u2A7E',
            gesdot: '\u2A80',
            gesdoto: '\u2A82',
            gesdotol: '\u2A84',
            gesl: '\u22DB\uFE00',
            gesles: '\u2A94',
            Gfr: '\u{1D50A}',
            gfr: '\u{1D524}',
            gg: '\u226B',
            Gg: '\u22D9',
            ggg: '\u22D9',
            gimel: '\u2137',
            GJcy: '\u0403',
            gjcy: '\u0453',
            gla: '\u2AA5',
            gl: '\u2277',
            glE: '\u2A92',
            glj: '\u2AA4',
            gnap: '\u2A8A',
            gnapprox: '\u2A8A',
            gne: '\u2A88',
            gnE: '\u2269',
            gneq: '\u2A88',
            gneqq: '\u2269',
            gnsim: '\u22E7',
            Gopf: '\u{1D53E}',
            gopf: '\u{1D558}',
            grave: '`',
            GreaterEqual: '\u2265',
            GreaterEqualLess: '\u22DB',
            GreaterFullEqual: '\u2267',
            GreaterGreater: '\u2AA2',
            GreaterLess: '\u2277',
            GreaterSlantEqual: '\u2A7E',
            GreaterTilde: '\u2273',
            Gscr: '\u{1D4A2}',
            gscr: '\u210A',
            gsim: '\u2273',
            gsime: '\u2A8E',
            gsiml: '\u2A90',
            gtcc: '\u2AA7',
            gtcir: '\u2A7A',
            gt: '>',
            GT: '>',
            Gt: '\u226B',
            gtdot: '\u22D7',
            gtlPar: '\u2995',
            gtquest: '\u2A7C',
            gtrapprox: '\u2A86',
            gtrarr: '\u2978',
            gtrdot: '\u22D7',
            gtreqless: '\u22DB',
            gtreqqless: '\u2A8C',
            gtrless: '\u2277',
            gtrsim: '\u2273',
            gvertneqq: '\u2269\uFE00',
            gvnE: '\u2269\uFE00',
            Hacek: '\u02C7',
            hairsp: '\u200A',
            half: '\xBD',
            hamilt: '\u210B',
            HARDcy: '\u042A',
            hardcy: '\u044A',
            harrcir: '\u2948',
            harr: '\u2194',
            hArr: '\u21D4',
            harrw: '\u21AD',
            Hat: '^',
            hbar: '\u210F',
            Hcirc: '\u0124',
            hcirc: '\u0125',
            hearts: '\u2665',
            heartsuit: '\u2665',
            hellip: '\u2026',
            hercon: '\u22B9',
            hfr: '\u{1D525}',
            Hfr: '\u210C',
            HilbertSpace: '\u210B',
            hksearow: '\u2925',
            hkswarow: '\u2926',
            hoarr: '\u21FF',
            homtht: '\u223B',
            hookleftarrow: '\u21A9',
            hookrightarrow: '\u21AA',
            hopf: '\u{1D559}',
            Hopf: '\u210D',
            horbar: '\u2015',
            HorizontalLine: '\u2500',
            hscr: '\u{1D4BD}',
            Hscr: '\u210B',
            hslash: '\u210F',
            Hstrok: '\u0126',
            hstrok: '\u0127',
            HumpDownHump: '\u224E',
            HumpEqual: '\u224F',
            hybull: '\u2043',
            hyphen: '\u2010',
            Iacute: '\xCD',
            iacute: '\xED',
            ic: '\u2063',
            Icirc: '\xCE',
            icirc: '\xEE',
            Icy: '\u0418',
            icy: '\u0438',
            Idot: '\u0130',
            IEcy: '\u0415',
            iecy: '\u0435',
            iexcl: '\xA1',
            iff: '\u21D4',
            ifr: '\u{1D526}',
            Ifr: '\u2111',
            Igrave: '\xCC',
            igrave: '\xEC',
            ii: '\u2148',
            iiiint: '\u2A0C',
            iiint: '\u222D',
            iinfin: '\u29DC',
            iiota: '\u2129',
            IJlig: '\u0132',
            ijlig: '\u0133',
            Imacr: '\u012A',
            imacr: '\u012B',
            image: '\u2111',
            ImaginaryI: '\u2148',
            imagline: '\u2110',
            imagpart: '\u2111',
            imath: '\u0131',
            Im: '\u2111',
            imof: '\u22B7',
            imped: '\u01B5',
            Implies: '\u21D2',
            incare: '\u2105',
            in: '\u2208',
            infin: '\u221E',
            infintie: '\u29DD',
            inodot: '\u0131',
            intcal: '\u22BA',
            int: '\u222B',
            Int: '\u222C',
            integers: '\u2124',
            Integral: '\u222B',
            intercal: '\u22BA',
            Intersection: '\u22C2',
            intlarhk: '\u2A17',
            intprod: '\u2A3C',
            InvisibleComma: '\u2063',
            InvisibleTimes: '\u2062',
            IOcy: '\u0401',
            iocy: '\u0451',
            Iogon: '\u012E',
            iogon: '\u012F',
            Iopf: '\u{1D540}',
            iopf: '\u{1D55A}',
            Iota: '\u0399',
            iota: '\u03B9',
            iprod: '\u2A3C',
            iquest: '\xBF',
            iscr: '\u{1D4BE}',
            Iscr: '\u2110',
            isin: '\u2208',
            isindot: '\u22F5',
            isinE: '\u22F9',
            isins: '\u22F4',
            isinsv: '\u22F3',
            isinv: '\u2208',
            it: '\u2062',
            Itilde: '\u0128',
            itilde: '\u0129',
            Iukcy: '\u0406',
            iukcy: '\u0456',
            Iuml: '\xCF',
            iuml: '\xEF',
            Jcirc: '\u0134',
            jcirc: '\u0135',
            Jcy: '\u0419',
            jcy: '\u0439',
            Jfr: '\u{1D50D}',
            jfr: '\u{1D527}',
            jmath: '\u0237',
            Jopf: '\u{1D541}',
            jopf: '\u{1D55B}',
            Jscr: '\u{1D4A5}',
            jscr: '\u{1D4BF}',
            Jsercy: '\u0408',
            jsercy: '\u0458',
            Jukcy: '\u0404',
            jukcy: '\u0454',
            Kappa: '\u039A',
            kappa: '\u03BA',
            kappav: '\u03F0',
            Kcedil: '\u0136',
            kcedil: '\u0137',
            Kcy: '\u041A',
            kcy: '\u043A',
            Kfr: '\u{1D50E}',
            kfr: '\u{1D528}',
            kgreen: '\u0138',
            KHcy: '\u0425',
            khcy: '\u0445',
            KJcy: '\u040C',
            kjcy: '\u045C',
            Kopf: '\u{1D542}',
            kopf: '\u{1D55C}',
            Kscr: '\u{1D4A6}',
            kscr: '\u{1D4C0}',
            lAarr: '\u21DA',
            Lacute: '\u0139',
            lacute: '\u013A',
            laemptyv: '\u29B4',
            lagran: '\u2112',
            Lambda: '\u039B',
            lambda: '\u03BB',
            lang: '\u27E8',
            Lang: '\u27EA',
            langd: '\u2991',
            langle: '\u27E8',
            lap: '\u2A85',
            Laplacetrf: '\u2112',
            laquo: '\xAB',
            larrb: '\u21E4',
            larrbfs: '\u291F',
            larr: '\u2190',
            Larr: '\u219E',
            lArr: '\u21D0',
            larrfs: '\u291D',
            larrhk: '\u21A9',
            larrlp: '\u21AB',
            larrpl: '\u2939',
            larrsim: '\u2973',
            larrtl: '\u21A2',
            latail: '\u2919',
            lAtail: '\u291B',
            lat: '\u2AAB',
            late: '\u2AAD',
            lates: '\u2AAD\uFE00',
            lbarr: '\u290C',
            lBarr: '\u290E',
            lbbrk: '\u2772',
            lbrace: '{',
            lbrack: '[',
            lbrke: '\u298B',
            lbrksld: '\u298F',
            lbrkslu: '\u298D',
            Lcaron: '\u013D',
            lcaron: '\u013E',
            Lcedil: '\u013B',
            lcedil: '\u013C',
            lceil: '\u2308',
            lcub: '{',
            Lcy: '\u041B',
            lcy: '\u043B',
            ldca: '\u2936',
            ldquo: '\u201C',
            ldquor: '\u201E',
            ldrdhar: '\u2967',
            ldrushar: '\u294B',
            ldsh: '\u21B2',
            le: '\u2264',
            lE: '\u2266',
            LeftAngleBracket: '\u27E8',
            LeftArrowBar: '\u21E4',
            leftarrow: '\u2190',
            LeftArrow: '\u2190',
            Leftarrow: '\u21D0',
            LeftArrowRightArrow: '\u21C6',
            leftarrowtail: '\u21A2',
            LeftCeiling: '\u2308',
            LeftDoubleBracket: '\u27E6',
            LeftDownTeeVector: '\u2961',
            LeftDownVectorBar: '\u2959',
            LeftDownVector: '\u21C3',
            LeftFloor: '\u230A',
            leftharpoondown: '\u21BD',
            leftharpoonup: '\u21BC',
            leftleftarrows: '\u21C7',
            leftrightarrow: '\u2194',
            LeftRightArrow: '\u2194',
            Leftrightarrow: '\u21D4',
            leftrightarrows: '\u21C6',
            leftrightharpoons: '\u21CB',
            leftrightsquigarrow: '\u21AD',
            LeftRightVector: '\u294E',
            LeftTeeArrow: '\u21A4',
            LeftTee: '\u22A3',
            LeftTeeVector: '\u295A',
            leftthreetimes: '\u22CB',
            LeftTriangleBar: '\u29CF',
            LeftTriangle: '\u22B2',
            LeftTriangleEqual: '\u22B4',
            LeftUpDownVector: '\u2951',
            LeftUpTeeVector: '\u2960',
            LeftUpVectorBar: '\u2958',
            LeftUpVector: '\u21BF',
            LeftVectorBar: '\u2952',
            LeftVector: '\u21BC',
            lEg: '\u2A8B',
            leg: '\u22DA',
            leq: '\u2264',
            leqq: '\u2266',
            leqslant: '\u2A7D',
            lescc: '\u2AA8',
            les: '\u2A7D',
            lesdot: '\u2A7F',
            lesdoto: '\u2A81',
            lesdotor: '\u2A83',
            lesg: '\u22DA\uFE00',
            lesges: '\u2A93',
            lessapprox: '\u2A85',
            lessdot: '\u22D6',
            lesseqgtr: '\u22DA',
            lesseqqgtr: '\u2A8B',
            LessEqualGreater: '\u22DA',
            LessFullEqual: '\u2266',
            LessGreater: '\u2276',
            lessgtr: '\u2276',
            LessLess: '\u2AA1',
            lesssim: '\u2272',
            LessSlantEqual: '\u2A7D',
            LessTilde: '\u2272',
            lfisht: '\u297C',
            lfloor: '\u230A',
            Lfr: '\u{1D50F}',
            lfr: '\u{1D529}',
            lg: '\u2276',
            lgE: '\u2A91',
            lHar: '\u2962',
            lhard: '\u21BD',
            lharu: '\u21BC',
            lharul: '\u296A',
            lhblk: '\u2584',
            LJcy: '\u0409',
            ljcy: '\u0459',
            llarr: '\u21C7',
            ll: '\u226A',
            Ll: '\u22D8',
            llcorner: '\u231E',
            Lleftarrow: '\u21DA',
            llhard: '\u296B',
            lltri: '\u25FA',
            Lmidot: '\u013F',
            lmidot: '\u0140',
            lmoustache: '\u23B0',
            lmoust: '\u23B0',
            lnap: '\u2A89',
            lnapprox: '\u2A89',
            lne: '\u2A87',
            lnE: '\u2268',
            lneq: '\u2A87',
            lneqq: '\u2268',
            lnsim: '\u22E6',
            loang: '\u27EC',
            loarr: '\u21FD',
            lobrk: '\u27E6',
            longleftarrow: '\u27F5',
            LongLeftArrow: '\u27F5',
            Longleftarrow: '\u27F8',
            longleftrightarrow: '\u27F7',
            LongLeftRightArrow: '\u27F7',
            Longleftrightarrow: '\u27FA',
            longmapsto: '\u27FC',
            longrightarrow: '\u27F6',
            LongRightArrow: '\u27F6',
            Longrightarrow: '\u27F9',
            looparrowleft: '\u21AB',
            looparrowright: '\u21AC',
            lopar: '\u2985',
            Lopf: '\u{1D543}',
            lopf: '\u{1D55D}',
            loplus: '\u2A2D',
            lotimes: '\u2A34',
            lowast: '\u2217',
            lowbar: '_',
            LowerLeftArrow: '\u2199',
            LowerRightArrow: '\u2198',
            loz: '\u25CA',
            lozenge: '\u25CA',
            lozf: '\u29EB',
            lpar: '(',
            lparlt: '\u2993',
            lrarr: '\u21C6',
            lrcorner: '\u231F',
            lrhar: '\u21CB',
            lrhard: '\u296D',
            lrm: '\u200E',
            lrtri: '\u22BF',
            lsaquo: '\u2039',
            lscr: '\u{1D4C1}',
            Lscr: '\u2112',
            lsh: '\u21B0',
            Lsh: '\u21B0',
            lsim: '\u2272',
            lsime: '\u2A8D',
            lsimg: '\u2A8F',
            lsqb: '[',
            lsquo: '\u2018',
            lsquor: '\u201A',
            Lstrok: '\u0141',
            lstrok: '\u0142',
            ltcc: '\u2AA6',
            ltcir: '\u2A79',
            lt: '<',
            LT: '<',
            Lt: '\u226A',
            ltdot: '\u22D6',
            lthree: '\u22CB',
            ltimes: '\u22C9',
            ltlarr: '\u2976',
            ltquest: '\u2A7B',
            ltri: '\u25C3',
            ltrie: '\u22B4',
            ltrif: '\u25C2',
            ltrPar: '\u2996',
            lurdshar: '\u294A',
            luruhar: '\u2966',
            lvertneqq: '\u2268\uFE00',
            lvnE: '\u2268\uFE00',
            macr: '\xAF',
            male: '\u2642',
            malt: '\u2720',
            maltese: '\u2720',
            Map: '\u2905',
            map: '\u21A6',
            mapsto: '\u21A6',
            mapstodown: '\u21A7',
            mapstoleft: '\u21A4',
            mapstoup: '\u21A5',
            marker: '\u25AE',
            mcomma: '\u2A29',
            Mcy: '\u041C',
            mcy: '\u043C',
            mdash: '\u2014',
            mDDot: '\u223A',
            measuredangle: '\u2221',
            MediumSpace: '\u205F',
            Mellintrf: '\u2133',
            Mfr: '\u{1D510}',
            mfr: '\u{1D52A}',
            mho: '\u2127',
            micro: '\xB5',
            midast: '*',
            midcir: '\u2AF0',
            mid: '\u2223',
            middot: '\xB7',
            minusb: '\u229F',
            minus: '\u2212',
            minusd: '\u2238',
            minusdu: '\u2A2A',
            MinusPlus: '\u2213',
            mlcp: '\u2ADB',
            mldr: '\u2026',
            mnplus: '\u2213',
            models: '\u22A7',
            Mopf: '\u{1D544}',
            mopf: '\u{1D55E}',
            mp: '\u2213',
            mscr: '\u{1D4C2}',
            Mscr: '\u2133',
            mstpos: '\u223E',
            Mu: '\u039C',
            mu: '\u03BC',
            multimap: '\u22B8',
            mumap: '\u22B8',
            nabla: '\u2207',
            Nacute: '\u0143',
            nacute: '\u0144',
            nang: '\u2220\u20D2',
            nap: '\u2249',
            napE: '\u2A70\u0338',
            napid: '\u224B\u0338',
            napos: '\u0149',
            napprox: '\u2249',
            natural: '\u266E',
            naturals: '\u2115',
            natur: '\u266E',
            nbsp: '\xA0',
            nbump: '\u224E\u0338',
            nbumpe: '\u224F\u0338',
            ncap: '\u2A43',
            Ncaron: '\u0147',
            ncaron: '\u0148',
            Ncedil: '\u0145',
            ncedil: '\u0146',
            ncong: '\u2247',
            ncongdot: '\u2A6D\u0338',
            ncup: '\u2A42',
            Ncy: '\u041D',
            ncy: '\u043D',
            ndash: '\u2013',
            nearhk: '\u2924',
            nearr: '\u2197',
            neArr: '\u21D7',
            nearrow: '\u2197',
            ne: '\u2260',
            nedot: '\u2250\u0338',
            NegativeMediumSpace: '\u200B',
            NegativeThickSpace: '\u200B',
            NegativeThinSpace: '\u200B',
            NegativeVeryThinSpace: '\u200B',
            nequiv: '\u2262',
            nesear: '\u2928',
            nesim: '\u2242\u0338',
            NestedGreaterGreater: '\u226B',
            NestedLessLess: '\u226A',
            NewLine: `
`,
            nexist: '\u2204',
            nexists: '\u2204',
            Nfr: '\u{1D511}',
            nfr: '\u{1D52B}',
            ngE: '\u2267\u0338',
            nge: '\u2271',
            ngeq: '\u2271',
            ngeqq: '\u2267\u0338',
            ngeqslant: '\u2A7E\u0338',
            nges: '\u2A7E\u0338',
            nGg: '\u22D9\u0338',
            ngsim: '\u2275',
            nGt: '\u226B\u20D2',
            ngt: '\u226F',
            ngtr: '\u226F',
            nGtv: '\u226B\u0338',
            nharr: '\u21AE',
            nhArr: '\u21CE',
            nhpar: '\u2AF2',
            ni: '\u220B',
            nis: '\u22FC',
            nisd: '\u22FA',
            niv: '\u220B',
            NJcy: '\u040A',
            njcy: '\u045A',
            nlarr: '\u219A',
            nlArr: '\u21CD',
            nldr: '\u2025',
            nlE: '\u2266\u0338',
            nle: '\u2270',
            nleftarrow: '\u219A',
            nLeftarrow: '\u21CD',
            nleftrightarrow: '\u21AE',
            nLeftrightarrow: '\u21CE',
            nleq: '\u2270',
            nleqq: '\u2266\u0338',
            nleqslant: '\u2A7D\u0338',
            nles: '\u2A7D\u0338',
            nless: '\u226E',
            nLl: '\u22D8\u0338',
            nlsim: '\u2274',
            nLt: '\u226A\u20D2',
            nlt: '\u226E',
            nltri: '\u22EA',
            nltrie: '\u22EC',
            nLtv: '\u226A\u0338',
            nmid: '\u2224',
            NoBreak: '\u2060',
            NonBreakingSpace: '\xA0',
            nopf: '\u{1D55F}',
            Nopf: '\u2115',
            Not: '\u2AEC',
            not: '\xAC',
            NotCongruent: '\u2262',
            NotCupCap: '\u226D',
            NotDoubleVerticalBar: '\u2226',
            NotElement: '\u2209',
            NotEqual: '\u2260',
            NotEqualTilde: '\u2242\u0338',
            NotExists: '\u2204',
            NotGreater: '\u226F',
            NotGreaterEqual: '\u2271',
            NotGreaterFullEqual: '\u2267\u0338',
            NotGreaterGreater: '\u226B\u0338',
            NotGreaterLess: '\u2279',
            NotGreaterSlantEqual: '\u2A7E\u0338',
            NotGreaterTilde: '\u2275',
            NotHumpDownHump: '\u224E\u0338',
            NotHumpEqual: '\u224F\u0338',
            notin: '\u2209',
            notindot: '\u22F5\u0338',
            notinE: '\u22F9\u0338',
            notinva: '\u2209',
            notinvb: '\u22F7',
            notinvc: '\u22F6',
            NotLeftTriangleBar: '\u29CF\u0338',
            NotLeftTriangle: '\u22EA',
            NotLeftTriangleEqual: '\u22EC',
            NotLess: '\u226E',
            NotLessEqual: '\u2270',
            NotLessGreater: '\u2278',
            NotLessLess: '\u226A\u0338',
            NotLessSlantEqual: '\u2A7D\u0338',
            NotLessTilde: '\u2274',
            NotNestedGreaterGreater: '\u2AA2\u0338',
            NotNestedLessLess: '\u2AA1\u0338',
            notni: '\u220C',
            notniva: '\u220C',
            notnivb: '\u22FE',
            notnivc: '\u22FD',
            NotPrecedes: '\u2280',
            NotPrecedesEqual: '\u2AAF\u0338',
            NotPrecedesSlantEqual: '\u22E0',
            NotReverseElement: '\u220C',
            NotRightTriangleBar: '\u29D0\u0338',
            NotRightTriangle: '\u22EB',
            NotRightTriangleEqual: '\u22ED',
            NotSquareSubset: '\u228F\u0338',
            NotSquareSubsetEqual: '\u22E2',
            NotSquareSuperset: '\u2290\u0338',
            NotSquareSupersetEqual: '\u22E3',
            NotSubset: '\u2282\u20D2',
            NotSubsetEqual: '\u2288',
            NotSucceeds: '\u2281',
            NotSucceedsEqual: '\u2AB0\u0338',
            NotSucceedsSlantEqual: '\u22E1',
            NotSucceedsTilde: '\u227F\u0338',
            NotSuperset: '\u2283\u20D2',
            NotSupersetEqual: '\u2289',
            NotTilde: '\u2241',
            NotTildeEqual: '\u2244',
            NotTildeFullEqual: '\u2247',
            NotTildeTilde: '\u2249',
            NotVerticalBar: '\u2224',
            nparallel: '\u2226',
            npar: '\u2226',
            nparsl: '\u2AFD\u20E5',
            npart: '\u2202\u0338',
            npolint: '\u2A14',
            npr: '\u2280',
            nprcue: '\u22E0',
            nprec: '\u2280',
            npreceq: '\u2AAF\u0338',
            npre: '\u2AAF\u0338',
            nrarrc: '\u2933\u0338',
            nrarr: '\u219B',
            nrArr: '\u21CF',
            nrarrw: '\u219D\u0338',
            nrightarrow: '\u219B',
            nRightarrow: '\u21CF',
            nrtri: '\u22EB',
            nrtrie: '\u22ED',
            nsc: '\u2281',
            nsccue: '\u22E1',
            nsce: '\u2AB0\u0338',
            Nscr: '\u{1D4A9}',
            nscr: '\u{1D4C3}',
            nshortmid: '\u2224',
            nshortparallel: '\u2226',
            nsim: '\u2241',
            nsime: '\u2244',
            nsimeq: '\u2244',
            nsmid: '\u2224',
            nspar: '\u2226',
            nsqsube: '\u22E2',
            nsqsupe: '\u22E3',
            nsub: '\u2284',
            nsubE: '\u2AC5\u0338',
            nsube: '\u2288',
            nsubset: '\u2282\u20D2',
            nsubseteq: '\u2288',
            nsubseteqq: '\u2AC5\u0338',
            nsucc: '\u2281',
            nsucceq: '\u2AB0\u0338',
            nsup: '\u2285',
            nsupE: '\u2AC6\u0338',
            nsupe: '\u2289',
            nsupset: '\u2283\u20D2',
            nsupseteq: '\u2289',
            nsupseteqq: '\u2AC6\u0338',
            ntgl: '\u2279',
            Ntilde: '\xD1',
            ntilde: '\xF1',
            ntlg: '\u2278',
            ntriangleleft: '\u22EA',
            ntrianglelefteq: '\u22EC',
            ntriangleright: '\u22EB',
            ntrianglerighteq: '\u22ED',
            Nu: '\u039D',
            nu: '\u03BD',
            num: '#',
            numero: '\u2116',
            numsp: '\u2007',
            nvap: '\u224D\u20D2',
            nvdash: '\u22AC',
            nvDash: '\u22AD',
            nVdash: '\u22AE',
            nVDash: '\u22AF',
            nvge: '\u2265\u20D2',
            nvgt: '>\u20D2',
            nvHarr: '\u2904',
            nvinfin: '\u29DE',
            nvlArr: '\u2902',
            nvle: '\u2264\u20D2',
            nvlt: '<\u20D2',
            nvltrie: '\u22B4\u20D2',
            nvrArr: '\u2903',
            nvrtrie: '\u22B5\u20D2',
            nvsim: '\u223C\u20D2',
            nwarhk: '\u2923',
            nwarr: '\u2196',
            nwArr: '\u21D6',
            nwarrow: '\u2196',
            nwnear: '\u2927',
            Oacute: '\xD3',
            oacute: '\xF3',
            oast: '\u229B',
            Ocirc: '\xD4',
            ocirc: '\xF4',
            ocir: '\u229A',
            Ocy: '\u041E',
            ocy: '\u043E',
            odash: '\u229D',
            Odblac: '\u0150',
            odblac: '\u0151',
            odiv: '\u2A38',
            odot: '\u2299',
            odsold: '\u29BC',
            OElig: '\u0152',
            oelig: '\u0153',
            ofcir: '\u29BF',
            Ofr: '\u{1D512}',
            ofr: '\u{1D52C}',
            ogon: '\u02DB',
            Ograve: '\xD2',
            ograve: '\xF2',
            ogt: '\u29C1',
            ohbar: '\u29B5',
            ohm: '\u03A9',
            oint: '\u222E',
            olarr: '\u21BA',
            olcir: '\u29BE',
            olcross: '\u29BB',
            oline: '\u203E',
            olt: '\u29C0',
            Omacr: '\u014C',
            omacr: '\u014D',
            Omega: '\u03A9',
            omega: '\u03C9',
            Omicron: '\u039F',
            omicron: '\u03BF',
            omid: '\u29B6',
            ominus: '\u2296',
            Oopf: '\u{1D546}',
            oopf: '\u{1D560}',
            opar: '\u29B7',
            OpenCurlyDoubleQuote: '\u201C',
            OpenCurlyQuote: '\u2018',
            operp: '\u29B9',
            oplus: '\u2295',
            orarr: '\u21BB',
            Or: '\u2A54',
            or: '\u2228',
            ord: '\u2A5D',
            order: '\u2134',
            orderof: '\u2134',
            ordf: '\xAA',
            ordm: '\xBA',
            origof: '\u22B6',
            oror: '\u2A56',
            orslope: '\u2A57',
            orv: '\u2A5B',
            oS: '\u24C8',
            Oscr: '\u{1D4AA}',
            oscr: '\u2134',
            Oslash: '\xD8',
            oslash: '\xF8',
            osol: '\u2298',
            Otilde: '\xD5',
            otilde: '\xF5',
            otimesas: '\u2A36',
            Otimes: '\u2A37',
            otimes: '\u2297',
            Ouml: '\xD6',
            ouml: '\xF6',
            ovbar: '\u233D',
            OverBar: '\u203E',
            OverBrace: '\u23DE',
            OverBracket: '\u23B4',
            OverParenthesis: '\u23DC',
            para: '\xB6',
            parallel: '\u2225',
            par: '\u2225',
            parsim: '\u2AF3',
            parsl: '\u2AFD',
            part: '\u2202',
            PartialD: '\u2202',
            Pcy: '\u041F',
            pcy: '\u043F',
            percnt: '%',
            period: '.',
            permil: '\u2030',
            perp: '\u22A5',
            pertenk: '\u2031',
            Pfr: '\u{1D513}',
            pfr: '\u{1D52D}',
            Phi: '\u03A6',
            phi: '\u03C6',
            phiv: '\u03D5',
            phmmat: '\u2133',
            phone: '\u260E',
            Pi: '\u03A0',
            pi: '\u03C0',
            pitchfork: '\u22D4',
            piv: '\u03D6',
            planck: '\u210F',
            planckh: '\u210E',
            plankv: '\u210F',
            plusacir: '\u2A23',
            plusb: '\u229E',
            pluscir: '\u2A22',
            plus: '+',
            plusdo: '\u2214',
            plusdu: '\u2A25',
            pluse: '\u2A72',
            PlusMinus: '\xB1',
            plusmn: '\xB1',
            plussim: '\u2A26',
            plustwo: '\u2A27',
            pm: '\xB1',
            Poincareplane: '\u210C',
            pointint: '\u2A15',
            popf: '\u{1D561}',
            Popf: '\u2119',
            pound: '\xA3',
            prap: '\u2AB7',
            Pr: '\u2ABB',
            pr: '\u227A',
            prcue: '\u227C',
            precapprox: '\u2AB7',
            prec: '\u227A',
            preccurlyeq: '\u227C',
            Precedes: '\u227A',
            PrecedesEqual: '\u2AAF',
            PrecedesSlantEqual: '\u227C',
            PrecedesTilde: '\u227E',
            preceq: '\u2AAF',
            precnapprox: '\u2AB9',
            precneqq: '\u2AB5',
            precnsim: '\u22E8',
            pre: '\u2AAF',
            prE: '\u2AB3',
            precsim: '\u227E',
            prime: '\u2032',
            Prime: '\u2033',
            primes: '\u2119',
            prnap: '\u2AB9',
            prnE: '\u2AB5',
            prnsim: '\u22E8',
            prod: '\u220F',
            Product: '\u220F',
            profalar: '\u232E',
            profline: '\u2312',
            profsurf: '\u2313',
            prop: '\u221D',
            Proportional: '\u221D',
            Proportion: '\u2237',
            propto: '\u221D',
            prsim: '\u227E',
            prurel: '\u22B0',
            Pscr: '\u{1D4AB}',
            pscr: '\u{1D4C5}',
            Psi: '\u03A8',
            psi: '\u03C8',
            puncsp: '\u2008',
            Qfr: '\u{1D514}',
            qfr: '\u{1D52E}',
            qint: '\u2A0C',
            qopf: '\u{1D562}',
            Qopf: '\u211A',
            qprime: '\u2057',
            Qscr: '\u{1D4AC}',
            qscr: '\u{1D4C6}',
            quaternions: '\u210D',
            quatint: '\u2A16',
            quest: '?',
            questeq: '\u225F',
            quot: '"',
            QUOT: '"',
            rAarr: '\u21DB',
            race: '\u223D\u0331',
            Racute: '\u0154',
            racute: '\u0155',
            radic: '\u221A',
            raemptyv: '\u29B3',
            rang: '\u27E9',
            Rang: '\u27EB',
            rangd: '\u2992',
            range: '\u29A5',
            rangle: '\u27E9',
            raquo: '\xBB',
            rarrap: '\u2975',
            rarrb: '\u21E5',
            rarrbfs: '\u2920',
            rarrc: '\u2933',
            rarr: '\u2192',
            Rarr: '\u21A0',
            rArr: '\u21D2',
            rarrfs: '\u291E',
            rarrhk: '\u21AA',
            rarrlp: '\u21AC',
            rarrpl: '\u2945',
            rarrsim: '\u2974',
            Rarrtl: '\u2916',
            rarrtl: '\u21A3',
            rarrw: '\u219D',
            ratail: '\u291A',
            rAtail: '\u291C',
            ratio: '\u2236',
            rationals: '\u211A',
            rbarr: '\u290D',
            rBarr: '\u290F',
            RBarr: '\u2910',
            rbbrk: '\u2773',
            rbrace: '}',
            rbrack: ']',
            rbrke: '\u298C',
            rbrksld: '\u298E',
            rbrkslu: '\u2990',
            Rcaron: '\u0158',
            rcaron: '\u0159',
            Rcedil: '\u0156',
            rcedil: '\u0157',
            rceil: '\u2309',
            rcub: '}',
            Rcy: '\u0420',
            rcy: '\u0440',
            rdca: '\u2937',
            rdldhar: '\u2969',
            rdquo: '\u201D',
            rdquor: '\u201D',
            rdsh: '\u21B3',
            real: '\u211C',
            realine: '\u211B',
            realpart: '\u211C',
            reals: '\u211D',
            Re: '\u211C',
            rect: '\u25AD',
            reg: '\xAE',
            REG: '\xAE',
            ReverseElement: '\u220B',
            ReverseEquilibrium: '\u21CB',
            ReverseUpEquilibrium: '\u296F',
            rfisht: '\u297D',
            rfloor: '\u230B',
            rfr: '\u{1D52F}',
            Rfr: '\u211C',
            rHar: '\u2964',
            rhard: '\u21C1',
            rharu: '\u21C0',
            rharul: '\u296C',
            Rho: '\u03A1',
            rho: '\u03C1',
            rhov: '\u03F1',
            RightAngleBracket: '\u27E9',
            RightArrowBar: '\u21E5',
            rightarrow: '\u2192',
            RightArrow: '\u2192',
            Rightarrow: '\u21D2',
            RightArrowLeftArrow: '\u21C4',
            rightarrowtail: '\u21A3',
            RightCeiling: '\u2309',
            RightDoubleBracket: '\u27E7',
            RightDownTeeVector: '\u295D',
            RightDownVectorBar: '\u2955',
            RightDownVector: '\u21C2',
            RightFloor: '\u230B',
            rightharpoondown: '\u21C1',
            rightharpoonup: '\u21C0',
            rightleftarrows: '\u21C4',
            rightleftharpoons: '\u21CC',
            rightrightarrows: '\u21C9',
            rightsquigarrow: '\u219D',
            RightTeeArrow: '\u21A6',
            RightTee: '\u22A2',
            RightTeeVector: '\u295B',
            rightthreetimes: '\u22CC',
            RightTriangleBar: '\u29D0',
            RightTriangle: '\u22B3',
            RightTriangleEqual: '\u22B5',
            RightUpDownVector: '\u294F',
            RightUpTeeVector: '\u295C',
            RightUpVectorBar: '\u2954',
            RightUpVector: '\u21BE',
            RightVectorBar: '\u2953',
            RightVector: '\u21C0',
            ring: '\u02DA',
            risingdotseq: '\u2253',
            rlarr: '\u21C4',
            rlhar: '\u21CC',
            rlm: '\u200F',
            rmoustache: '\u23B1',
            rmoust: '\u23B1',
            rnmid: '\u2AEE',
            roang: '\u27ED',
            roarr: '\u21FE',
            robrk: '\u27E7',
            ropar: '\u2986',
            ropf: '\u{1D563}',
            Ropf: '\u211D',
            roplus: '\u2A2E',
            rotimes: '\u2A35',
            RoundImplies: '\u2970',
            rpar: ')',
            rpargt: '\u2994',
            rppolint: '\u2A12',
            rrarr: '\u21C9',
            Rrightarrow: '\u21DB',
            rsaquo: '\u203A',
            rscr: '\u{1D4C7}',
            Rscr: '\u211B',
            rsh: '\u21B1',
            Rsh: '\u21B1',
            rsqb: ']',
            rsquo: '\u2019',
            rsquor: '\u2019',
            rthree: '\u22CC',
            rtimes: '\u22CA',
            rtri: '\u25B9',
            rtrie: '\u22B5',
            rtrif: '\u25B8',
            rtriltri: '\u29CE',
            RuleDelayed: '\u29F4',
            ruluhar: '\u2968',
            rx: '\u211E',
            Sacute: '\u015A',
            sacute: '\u015B',
            sbquo: '\u201A',
            scap: '\u2AB8',
            Scaron: '\u0160',
            scaron: '\u0161',
            Sc: '\u2ABC',
            sc: '\u227B',
            sccue: '\u227D',
            sce: '\u2AB0',
            scE: '\u2AB4',
            Scedil: '\u015E',
            scedil: '\u015F',
            Scirc: '\u015C',
            scirc: '\u015D',
            scnap: '\u2ABA',
            scnE: '\u2AB6',
            scnsim: '\u22E9',
            scpolint: '\u2A13',
            scsim: '\u227F',
            Scy: '\u0421',
            scy: '\u0441',
            sdotb: '\u22A1',
            sdot: '\u22C5',
            sdote: '\u2A66',
            searhk: '\u2925',
            searr: '\u2198',
            seArr: '\u21D8',
            searrow: '\u2198',
            sect: '\xA7',
            semi: ';',
            seswar: '\u2929',
            setminus: '\u2216',
            setmn: '\u2216',
            sext: '\u2736',
            Sfr: '\u{1D516}',
            sfr: '\u{1D530}',
            sfrown: '\u2322',
            sharp: '\u266F',
            SHCHcy: '\u0429',
            shchcy: '\u0449',
            SHcy: '\u0428',
            shcy: '\u0448',
            ShortDownArrow: '\u2193',
            ShortLeftArrow: '\u2190',
            shortmid: '\u2223',
            shortparallel: '\u2225',
            ShortRightArrow: '\u2192',
            ShortUpArrow: '\u2191',
            shy: '\xAD',
            Sigma: '\u03A3',
            sigma: '\u03C3',
            sigmaf: '\u03C2',
            sigmav: '\u03C2',
            sim: '\u223C',
            simdot: '\u2A6A',
            sime: '\u2243',
            simeq: '\u2243',
            simg: '\u2A9E',
            simgE: '\u2AA0',
            siml: '\u2A9D',
            simlE: '\u2A9F',
            simne: '\u2246',
            simplus: '\u2A24',
            simrarr: '\u2972',
            slarr: '\u2190',
            SmallCircle: '\u2218',
            smallsetminus: '\u2216',
            smashp: '\u2A33',
            smeparsl: '\u29E4',
            smid: '\u2223',
            smile: '\u2323',
            smt: '\u2AAA',
            smte: '\u2AAC',
            smtes: '\u2AAC\uFE00',
            SOFTcy: '\u042C',
            softcy: '\u044C',
            solbar: '\u233F',
            solb: '\u29C4',
            sol: '/',
            Sopf: '\u{1D54A}',
            sopf: '\u{1D564}',
            spades: '\u2660',
            spadesuit: '\u2660',
            spar: '\u2225',
            sqcap: '\u2293',
            sqcaps: '\u2293\uFE00',
            sqcup: '\u2294',
            sqcups: '\u2294\uFE00',
            Sqrt: '\u221A',
            sqsub: '\u228F',
            sqsube: '\u2291',
            sqsubset: '\u228F',
            sqsubseteq: '\u2291',
            sqsup: '\u2290',
            sqsupe: '\u2292',
            sqsupset: '\u2290',
            sqsupseteq: '\u2292',
            square: '\u25A1',
            Square: '\u25A1',
            SquareIntersection: '\u2293',
            SquareSubset: '\u228F',
            SquareSubsetEqual: '\u2291',
            SquareSuperset: '\u2290',
            SquareSupersetEqual: '\u2292',
            SquareUnion: '\u2294',
            squarf: '\u25AA',
            squ: '\u25A1',
            squf: '\u25AA',
            srarr: '\u2192',
            Sscr: '\u{1D4AE}',
            sscr: '\u{1D4C8}',
            ssetmn: '\u2216',
            ssmile: '\u2323',
            sstarf: '\u22C6',
            Star: '\u22C6',
            star: '\u2606',
            starf: '\u2605',
            straightepsilon: '\u03F5',
            straightphi: '\u03D5',
            strns: '\xAF',
            sub: '\u2282',
            Sub: '\u22D0',
            subdot: '\u2ABD',
            subE: '\u2AC5',
            sube: '\u2286',
            subedot: '\u2AC3',
            submult: '\u2AC1',
            subnE: '\u2ACB',
            subne: '\u228A',
            subplus: '\u2ABF',
            subrarr: '\u2979',
            subset: '\u2282',
            Subset: '\u22D0',
            subseteq: '\u2286',
            subseteqq: '\u2AC5',
            SubsetEqual: '\u2286',
            subsetneq: '\u228A',
            subsetneqq: '\u2ACB',
            subsim: '\u2AC7',
            subsub: '\u2AD5',
            subsup: '\u2AD3',
            succapprox: '\u2AB8',
            succ: '\u227B',
            succcurlyeq: '\u227D',
            Succeeds: '\u227B',
            SucceedsEqual: '\u2AB0',
            SucceedsSlantEqual: '\u227D',
            SucceedsTilde: '\u227F',
            succeq: '\u2AB0',
            succnapprox: '\u2ABA',
            succneqq: '\u2AB6',
            succnsim: '\u22E9',
            succsim: '\u227F',
            SuchThat: '\u220B',
            sum: '\u2211',
            Sum: '\u2211',
            sung: '\u266A',
            sup1: '\xB9',
            sup2: '\xB2',
            sup3: '\xB3',
            sup: '\u2283',
            Sup: '\u22D1',
            supdot: '\u2ABE',
            supdsub: '\u2AD8',
            supE: '\u2AC6',
            supe: '\u2287',
            supedot: '\u2AC4',
            Superset: '\u2283',
            SupersetEqual: '\u2287',
            suphsol: '\u27C9',
            suphsub: '\u2AD7',
            suplarr: '\u297B',
            supmult: '\u2AC2',
            supnE: '\u2ACC',
            supne: '\u228B',
            supplus: '\u2AC0',
            supset: '\u2283',
            Supset: '\u22D1',
            supseteq: '\u2287',
            supseteqq: '\u2AC6',
            supsetneq: '\u228B',
            supsetneqq: '\u2ACC',
            supsim: '\u2AC8',
            supsub: '\u2AD4',
            supsup: '\u2AD6',
            swarhk: '\u2926',
            swarr: '\u2199',
            swArr: '\u21D9',
            swarrow: '\u2199',
            swnwar: '\u292A',
            szlig: '\xDF',
            Tab: '	',
            target: '\u2316',
            Tau: '\u03A4',
            tau: '\u03C4',
            tbrk: '\u23B4',
            Tcaron: '\u0164',
            tcaron: '\u0165',
            Tcedil: '\u0162',
            tcedil: '\u0163',
            Tcy: '\u0422',
            tcy: '\u0442',
            tdot: '\u20DB',
            telrec: '\u2315',
            Tfr: '\u{1D517}',
            tfr: '\u{1D531}',
            there4: '\u2234',
            therefore: '\u2234',
            Therefore: '\u2234',
            Theta: '\u0398',
            theta: '\u03B8',
            thetasym: '\u03D1',
            thetav: '\u03D1',
            thickapprox: '\u2248',
            thicksim: '\u223C',
            ThickSpace: '\u205F\u200A',
            ThinSpace: '\u2009',
            thinsp: '\u2009',
            thkap: '\u2248',
            thksim: '\u223C',
            THORN: '\xDE',
            thorn: '\xFE',
            tilde: '\u02DC',
            Tilde: '\u223C',
            TildeEqual: '\u2243',
            TildeFullEqual: '\u2245',
            TildeTilde: '\u2248',
            timesbar: '\u2A31',
            timesb: '\u22A0',
            times: '\xD7',
            timesd: '\u2A30',
            tint: '\u222D',
            toea: '\u2928',
            topbot: '\u2336',
            topcir: '\u2AF1',
            top: '\u22A4',
            Topf: '\u{1D54B}',
            topf: '\u{1D565}',
            topfork: '\u2ADA',
            tosa: '\u2929',
            tprime: '\u2034',
            trade: '\u2122',
            TRADE: '\u2122',
            triangle: '\u25B5',
            triangledown: '\u25BF',
            triangleleft: '\u25C3',
            trianglelefteq: '\u22B4',
            triangleq: '\u225C',
            triangleright: '\u25B9',
            trianglerighteq: '\u22B5',
            tridot: '\u25EC',
            trie: '\u225C',
            triminus: '\u2A3A',
            TripleDot: '\u20DB',
            triplus: '\u2A39',
            trisb: '\u29CD',
            tritime: '\u2A3B',
            trpezium: '\u23E2',
            Tscr: '\u{1D4AF}',
            tscr: '\u{1D4C9}',
            TScy: '\u0426',
            tscy: '\u0446',
            TSHcy: '\u040B',
            tshcy: '\u045B',
            Tstrok: '\u0166',
            tstrok: '\u0167',
            twixt: '\u226C',
            twoheadleftarrow: '\u219E',
            twoheadrightarrow: '\u21A0',
            Uacute: '\xDA',
            uacute: '\xFA',
            uarr: '\u2191',
            Uarr: '\u219F',
            uArr: '\u21D1',
            Uarrocir: '\u2949',
            Ubrcy: '\u040E',
            ubrcy: '\u045E',
            Ubreve: '\u016C',
            ubreve: '\u016D',
            Ucirc: '\xDB',
            ucirc: '\xFB',
            Ucy: '\u0423',
            ucy: '\u0443',
            udarr: '\u21C5',
            Udblac: '\u0170',
            udblac: '\u0171',
            udhar: '\u296E',
            ufisht: '\u297E',
            Ufr: '\u{1D518}',
            ufr: '\u{1D532}',
            Ugrave: '\xD9',
            ugrave: '\xF9',
            uHar: '\u2963',
            uharl: '\u21BF',
            uharr: '\u21BE',
            uhblk: '\u2580',
            ulcorn: '\u231C',
            ulcorner: '\u231C',
            ulcrop: '\u230F',
            ultri: '\u25F8',
            Umacr: '\u016A',
            umacr: '\u016B',
            uml: '\xA8',
            UnderBar: '_',
            UnderBrace: '\u23DF',
            UnderBracket: '\u23B5',
            UnderParenthesis: '\u23DD',
            Union: '\u22C3',
            UnionPlus: '\u228E',
            Uogon: '\u0172',
            uogon: '\u0173',
            Uopf: '\u{1D54C}',
            uopf: '\u{1D566}',
            UpArrowBar: '\u2912',
            uparrow: '\u2191',
            UpArrow: '\u2191',
            Uparrow: '\u21D1',
            UpArrowDownArrow: '\u21C5',
            updownarrow: '\u2195',
            UpDownArrow: '\u2195',
            Updownarrow: '\u21D5',
            UpEquilibrium: '\u296E',
            upharpoonleft: '\u21BF',
            upharpoonright: '\u21BE',
            uplus: '\u228E',
            UpperLeftArrow: '\u2196',
            UpperRightArrow: '\u2197',
            upsi: '\u03C5',
            Upsi: '\u03D2',
            upsih: '\u03D2',
            Upsilon: '\u03A5',
            upsilon: '\u03C5',
            UpTeeArrow: '\u21A5',
            UpTee: '\u22A5',
            upuparrows: '\u21C8',
            urcorn: '\u231D',
            urcorner: '\u231D',
            urcrop: '\u230E',
            Uring: '\u016E',
            uring: '\u016F',
            urtri: '\u25F9',
            Uscr: '\u{1D4B0}',
            uscr: '\u{1D4CA}',
            utdot: '\u22F0',
            Utilde: '\u0168',
            utilde: '\u0169',
            utri: '\u25B5',
            utrif: '\u25B4',
            uuarr: '\u21C8',
            Uuml: '\xDC',
            uuml: '\xFC',
            uwangle: '\u29A7',
            vangrt: '\u299C',
            varepsilon: '\u03F5',
            varkappa: '\u03F0',
            varnothing: '\u2205',
            varphi: '\u03D5',
            varpi: '\u03D6',
            varpropto: '\u221D',
            varr: '\u2195',
            vArr: '\u21D5',
            varrho: '\u03F1',
            varsigma: '\u03C2',
            varsubsetneq: '\u228A\uFE00',
            varsubsetneqq: '\u2ACB\uFE00',
            varsupsetneq: '\u228B\uFE00',
            varsupsetneqq: '\u2ACC\uFE00',
            vartheta: '\u03D1',
            vartriangleleft: '\u22B2',
            vartriangleright: '\u22B3',
            vBar: '\u2AE8',
            Vbar: '\u2AEB',
            vBarv: '\u2AE9',
            Vcy: '\u0412',
            vcy: '\u0432',
            vdash: '\u22A2',
            vDash: '\u22A8',
            Vdash: '\u22A9',
            VDash: '\u22AB',
            Vdashl: '\u2AE6',
            veebar: '\u22BB',
            vee: '\u2228',
            Vee: '\u22C1',
            veeeq: '\u225A',
            vellip: '\u22EE',
            verbar: '|',
            Verbar: '\u2016',
            vert: '|',
            Vert: '\u2016',
            VerticalBar: '\u2223',
            VerticalLine: '|',
            VerticalSeparator: '\u2758',
            VerticalTilde: '\u2240',
            VeryThinSpace: '\u200A',
            Vfr: '\u{1D519}',
            vfr: '\u{1D533}',
            vltri: '\u22B2',
            vnsub: '\u2282\u20D2',
            vnsup: '\u2283\u20D2',
            Vopf: '\u{1D54D}',
            vopf: '\u{1D567}',
            vprop: '\u221D',
            vrtri: '\u22B3',
            Vscr: '\u{1D4B1}',
            vscr: '\u{1D4CB}',
            vsubnE: '\u2ACB\uFE00',
            vsubne: '\u228A\uFE00',
            vsupnE: '\u2ACC\uFE00',
            vsupne: '\u228B\uFE00',
            Vvdash: '\u22AA',
            vzigzag: '\u299A',
            Wcirc: '\u0174',
            wcirc: '\u0175',
            wedbar: '\u2A5F',
            wedge: '\u2227',
            Wedge: '\u22C0',
            wedgeq: '\u2259',
            weierp: '\u2118',
            Wfr: '\u{1D51A}',
            wfr: '\u{1D534}',
            Wopf: '\u{1D54E}',
            wopf: '\u{1D568}',
            wp: '\u2118',
            wr: '\u2240',
            wreath: '\u2240',
            Wscr: '\u{1D4B2}',
            wscr: '\u{1D4CC}',
            xcap: '\u22C2',
            xcirc: '\u25EF',
            xcup: '\u22C3',
            xdtri: '\u25BD',
            Xfr: '\u{1D51B}',
            xfr: '\u{1D535}',
            xharr: '\u27F7',
            xhArr: '\u27FA',
            Xi: '\u039E',
            xi: '\u03BE',
            xlarr: '\u27F5',
            xlArr: '\u27F8',
            xmap: '\u27FC',
            xnis: '\u22FB',
            xodot: '\u2A00',
            Xopf: '\u{1D54F}',
            xopf: '\u{1D569}',
            xoplus: '\u2A01',
            xotime: '\u2A02',
            xrarr: '\u27F6',
            xrArr: '\u27F9',
            Xscr: '\u{1D4B3}',
            xscr: '\u{1D4CD}',
            xsqcup: '\u2A06',
            xuplus: '\u2A04',
            xutri: '\u25B3',
            xvee: '\u22C1',
            xwedge: '\u22C0',
            Yacute: '\xDD',
            yacute: '\xFD',
            YAcy: '\u042F',
            yacy: '\u044F',
            Ycirc: '\u0176',
            ycirc: '\u0177',
            Ycy: '\u042B',
            ycy: '\u044B',
            yen: '\xA5',
            Yfr: '\u{1D51C}',
            yfr: '\u{1D536}',
            YIcy: '\u0407',
            yicy: '\u0457',
            Yopf: '\u{1D550}',
            yopf: '\u{1D56A}',
            Yscr: '\u{1D4B4}',
            yscr: '\u{1D4CE}',
            YUcy: '\u042E',
            yucy: '\u044E',
            yuml: '\xFF',
            Yuml: '\u0178',
            Zacute: '\u0179',
            zacute: '\u017A',
            Zcaron: '\u017D',
            zcaron: '\u017E',
            Zcy: '\u0417',
            zcy: '\u0437',
            Zdot: '\u017B',
            zdot: '\u017C',
            zeetrf: '\u2128',
            ZeroWidthSpace: '\u200B',
            Zeta: '\u0396',
            zeta: '\u03B6',
            zfr: '\u{1D537}',
            Zfr: '\u2128',
            ZHcy: '\u0416',
            zhcy: '\u0436',
            zigrarr: '\u21DD',
            zopf: '\u{1D56B}',
            Zopf: '\u2124',
            Zscr: '\u{1D4B5}',
            zscr: '\u{1D4CF}',
            zwj: '\u200D',
            zwnj: '\u200C',
          };
        },
      }),
      qh = de({
        '../../node_modules/entities/lib/maps/legacy.json'(e, t) {
          t.exports = {
            Aacute: '\xC1',
            aacute: '\xE1',
            Acirc: '\xC2',
            acirc: '\xE2',
            acute: '\xB4',
            AElig: '\xC6',
            aelig: '\xE6',
            Agrave: '\xC0',
            agrave: '\xE0',
            amp: '&',
            AMP: '&',
            Aring: '\xC5',
            aring: '\xE5',
            Atilde: '\xC3',
            atilde: '\xE3',
            Auml: '\xC4',
            auml: '\xE4',
            brvbar: '\xA6',
            Ccedil: '\xC7',
            ccedil: '\xE7',
            cedil: '\xB8',
            cent: '\xA2',
            copy: '\xA9',
            COPY: '\xA9',
            curren: '\xA4',
            deg: '\xB0',
            divide: '\xF7',
            Eacute: '\xC9',
            eacute: '\xE9',
            Ecirc: '\xCA',
            ecirc: '\xEA',
            Egrave: '\xC8',
            egrave: '\xE8',
            ETH: '\xD0',
            eth: '\xF0',
            Euml: '\xCB',
            euml: '\xEB',
            frac12: '\xBD',
            frac14: '\xBC',
            frac34: '\xBE',
            gt: '>',
            GT: '>',
            Iacute: '\xCD',
            iacute: '\xED',
            Icirc: '\xCE',
            icirc: '\xEE',
            iexcl: '\xA1',
            Igrave: '\xCC',
            igrave: '\xEC',
            iquest: '\xBF',
            Iuml: '\xCF',
            iuml: '\xEF',
            laquo: '\xAB',
            lt: '<',
            LT: '<',
            macr: '\xAF',
            micro: '\xB5',
            middot: '\xB7',
            nbsp: '\xA0',
            not: '\xAC',
            Ntilde: '\xD1',
            ntilde: '\xF1',
            Oacute: '\xD3',
            oacute: '\xF3',
            Ocirc: '\xD4',
            ocirc: '\xF4',
            Ograve: '\xD2',
            ograve: '\xF2',
            ordf: '\xAA',
            ordm: '\xBA',
            Oslash: '\xD8',
            oslash: '\xF8',
            Otilde: '\xD5',
            otilde: '\xF5',
            Ouml: '\xD6',
            ouml: '\xF6',
            para: '\xB6',
            plusmn: '\xB1',
            pound: '\xA3',
            quot: '"',
            QUOT: '"',
            raquo: '\xBB',
            reg: '\xAE',
            REG: '\xAE',
            sect: '\xA7',
            shy: '\xAD',
            sup1: '\xB9',
            sup2: '\xB2',
            sup3: '\xB3',
            szlig: '\xDF',
            THORN: '\xDE',
            thorn: '\xFE',
            times: '\xD7',
            Uacute: '\xDA',
            uacute: '\xFA',
            Ucirc: '\xDB',
            ucirc: '\xFB',
            Ugrave: '\xD9',
            ugrave: '\xF9',
            uml: '\xA8',
            Uuml: '\xDC',
            uuml: '\xFC',
            Yacute: '\xDD',
            yacute: '\xFD',
            yen: '\xA5',
            yuml: '\xFF',
          };
        },
      }),
      Js = de({
        '../../node_modules/entities/lib/maps/xml.json'(e, t) {
          t.exports = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"' };
        },
      }),
      zh = de({
        '../../node_modules/entities/lib/maps/decode.json'(e, t) {
          t.exports = {
            0: 65533,
            128: 8364,
            130: 8218,
            131: 402,
            132: 8222,
            133: 8230,
            134: 8224,
            135: 8225,
            136: 710,
            137: 8240,
            138: 352,
            139: 8249,
            140: 338,
            142: 381,
            145: 8216,
            146: 8217,
            147: 8220,
            148: 8221,
            149: 8226,
            150: 8211,
            151: 8212,
            152: 732,
            153: 8482,
            154: 353,
            155: 8250,
            156: 339,
            158: 382,
            159: 376,
          };
        },
      }),
      Gh = de({
        '../../node_modules/entities/lib/decode_codepoint.js'(e) {
          'use strict';
          var t =
            (e && e.__importDefault) ||
            function (i) {
              return i && i.__esModule ? i : { default: i };
            };
          Object.defineProperty(e, '__esModule', { value: !0 });
          var r = t(zh()),
            n =
              String.fromCodePoint ||
              function (i) {
                var a = '';
                return (
                  i > 65535 &&
                    ((i -= 65536),
                    (a += String.fromCharCode(((i >>> 10) & 1023) | 55296)),
                    (i = 56320 | (i & 1023))),
                  (a += String.fromCharCode(i)),
                  a
                );
              };
          function o(i) {
            return (i >= 55296 && i <= 57343) || i > 1114111
              ? '\uFFFD'
              : (i in r.default && (i = r.default[i]), n(i));
          }
          e.default = o;
        },
      }),
      Us = de({
        '../../node_modules/entities/lib/decode.js'(e) {
          'use strict';
          var t =
            (e && e.__importDefault) ||
            function (p) {
              return p && p.__esModule ? p : { default: p };
            };
          (Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.decodeHTML = e.decodeHTMLStrict = e.decodeXML = void 0));
          var r = t(Hs()),
            n = t(qh()),
            o = t(Js()),
            i = t(Gh()),
            a = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
          ((e.decodeXML = l(o.default)), (e.decodeHTMLStrict = l(r.default)));
          function l(p) {
            var m = d(p);
            return function (h) {
              return String(h).replace(a, m);
            };
          }
          var s = function (p, m) {
            return p < m ? 1 : -1;
          };
          e.decodeHTML = (function () {
            for (
              var p = Object.keys(n.default).sort(s),
                m = Object.keys(r.default).sort(s),
                h = 0,
                g = 0;
              h < m.length;
              h++
            )
              p[g] === m[h] ? ((m[h] += ';?'), g++) : (m[h] += ';');
            var E = new RegExp('&(?:' + m.join('|') + '|#[xX][\\da-fA-F]+;?|#\\d+;?)', 'g'),
              b = d(r.default);
            function _(y) {
              return (y.substr(-1) !== ';' && (y += ';'), b(y));
            }
            return function (y) {
              return String(y).replace(E, _);
            };
          })();
          function d(p) {
            return function (m) {
              if (m.charAt(1) === '#') {
                var h = m.charAt(2);
                return h === 'X' || h === 'x'
                  ? i.default(parseInt(m.substr(3), 16))
                  : i.default(parseInt(m.substr(2), 10));
              }
              return p[m.slice(1, -1)] || m;
            };
          }
        },
      }),
      Vs = de({
        '../../node_modules/entities/lib/encode.js'(e) {
          'use strict';
          var t =
            (e && e.__importDefault) ||
            function (S) {
              return S && S.__esModule ? S : { default: S };
            };
          (Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.escapeUTF8 = e.escape = e.encodeNonAsciiHTML = e.encodeHTML = e.encodeXML = void 0));
          var r = t(Js()),
            n = s(r.default),
            o = d(n);
          e.encodeXML = y(n);
          var i = t(Hs()),
            a = s(i.default),
            l = d(a);
          ((e.encodeHTML = g(a, l)), (e.encodeNonAsciiHTML = y(a)));
          function s(S) {
            return Object.keys(S)
              .sort()
              .reduce(function (A, T) {
                return ((A[S[T]] = '&' + T + ';'), A);
              }, {});
          }
          function d(S) {
            for (var A = [], T = [], C = 0, x = Object.keys(S); C < x.length; C++) {
              var v = x[C];
              v.length === 1 ? A.push('\\' + v) : T.push(v);
            }
            A.sort();
            for (var I = 0; I < A.length - 1; I++) {
              for (
                var N = I;
                N < A.length - 1 && A[N].charCodeAt(1) + 1 === A[N + 1].charCodeAt(1);
              )
                N += 1;
              var B = 1 + N - I;
              B < 3 || A.splice(I, B, A[I] + '-' + A[N]);
            }
            return (T.unshift('[' + A.join('') + ']'), new RegExp(T.join('|'), 'g'));
          }
          var p =
              /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,
            m =
              String.prototype.codePointAt != null
                ? function (S) {
                    return S.codePointAt(0);
                  }
                : function (S) {
                    return (S.charCodeAt(0) - 55296) * 1024 + S.charCodeAt(1) - 56320 + 65536;
                  };
          function h(S) {
            return '&#x' + (S.length > 1 ? m(S) : S.charCodeAt(0)).toString(16).toUpperCase() + ';';
          }
          function g(S, A) {
            return function (T) {
              return T.replace(A, function (C) {
                return S[C];
              }).replace(p, h);
            };
          }
          var E = new RegExp(o.source + '|' + p.source, 'g');
          function b(S) {
            return S.replace(E, h);
          }
          e.escape = b;
          function _(S) {
            return S.replace(o, h);
          }
          e.escapeUTF8 = _;
          function y(S) {
            return function (A) {
              return A.replace(E, function (T) {
                return S[T] || h(T);
              });
            };
          }
        },
      }),
      Wh = de({
        '../../node_modules/entities/lib/index.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.decodeXMLStrict =
              e.decodeHTML5Strict =
              e.decodeHTML4Strict =
              e.decodeHTML5 =
              e.decodeHTML4 =
              e.decodeHTMLStrict =
              e.decodeHTML =
              e.decodeXML =
              e.encodeHTML5 =
              e.encodeHTML4 =
              e.escapeUTF8 =
              e.escape =
              e.encodeNonAsciiHTML =
              e.encodeHTML =
              e.encodeXML =
              e.encode =
              e.decodeStrict =
              e.decode =
                void 0));
          var t = Us(),
            r = Vs();
          function n(s, d) {
            return (!d || d <= 0 ? t.decodeXML : t.decodeHTML)(s);
          }
          e.decode = n;
          function o(s, d) {
            return (!d || d <= 0 ? t.decodeXML : t.decodeHTMLStrict)(s);
          }
          e.decodeStrict = o;
          function i(s, d) {
            return (!d || d <= 0 ? r.encodeXML : r.encodeHTML)(s);
          }
          e.encode = i;
          var a = Vs();
          (Object.defineProperty(e, 'encodeXML', {
            enumerable: !0,
            get: function () {
              return a.encodeXML;
            },
          }),
            Object.defineProperty(e, 'encodeHTML', {
              enumerable: !0,
              get: function () {
                return a.encodeHTML;
              },
            }),
            Object.defineProperty(e, 'encodeNonAsciiHTML', {
              enumerable: !0,
              get: function () {
                return a.encodeNonAsciiHTML;
              },
            }),
            Object.defineProperty(e, 'escape', {
              enumerable: !0,
              get: function () {
                return a.escape;
              },
            }),
            Object.defineProperty(e, 'escapeUTF8', {
              enumerable: !0,
              get: function () {
                return a.escapeUTF8;
              },
            }),
            Object.defineProperty(e, 'encodeHTML4', {
              enumerable: !0,
              get: function () {
                return a.encodeHTML;
              },
            }),
            Object.defineProperty(e, 'encodeHTML5', {
              enumerable: !0,
              get: function () {
                return a.encodeHTML;
              },
            }));
          var l = Us();
          (Object.defineProperty(e, 'decodeXML', {
            enumerable: !0,
            get: function () {
              return l.decodeXML;
            },
          }),
            Object.defineProperty(e, 'decodeHTML', {
              enumerable: !0,
              get: function () {
                return l.decodeHTML;
              },
            }),
            Object.defineProperty(e, 'decodeHTMLStrict', {
              enumerable: !0,
              get: function () {
                return l.decodeHTMLStrict;
              },
            }),
            Object.defineProperty(e, 'decodeHTML4', {
              enumerable: !0,
              get: function () {
                return l.decodeHTML;
              },
            }),
            Object.defineProperty(e, 'decodeHTML5', {
              enumerable: !0,
              get: function () {
                return l.decodeHTML;
              },
            }),
            Object.defineProperty(e, 'decodeHTML4Strict', {
              enumerable: !0,
              get: function () {
                return l.decodeHTMLStrict;
              },
            }),
            Object.defineProperty(e, 'decodeHTML5Strict', {
              enumerable: !0,
              get: function () {
                return l.decodeHTMLStrict;
              },
            }),
            Object.defineProperty(e, 'decodeXMLStrict', {
              enumerable: !0,
              get: function () {
                return l.decodeXML;
              },
            }));
        },
      }),
      On = de({
        '../../node_modules/ansi-to-html/lib/ansi_to_html.js'(e, t) {
          'use strict';
          function r(R, O) {
            if (!(R instanceof O)) throw new TypeError('Cannot call a class as a function');
          }
          function n(R, O) {
            for (var L = 0; L < O.length; L++) {
              var $ = O[L];
              (($.enumerable = $.enumerable || !1),
                ($.configurable = !0),
                'value' in $ && ($.writable = !0),
                Object.defineProperty(R, $.key, $));
            }
          }
          function o(R, O, L) {
            return (O && n(R.prototype, O), L && n(R, L), R);
          }
          function i(R, O) {
            var L = (typeof Symbol < 'u' && R[Symbol.iterator]) || R['@@iterator'];
            if (!L) {
              if (Array.isArray(R) || (L = a(R)) || (O && R && typeof R.length == 'number')) {
                L && (R = L);
                var $ = 0,
                  M = function () {};
                return {
                  s: M,
                  n: function () {
                    return $ >= R.length ? { done: !0 } : { done: !1, value: R[$++] };
                  },
                  e: function (Z) {
                    throw Z;
                  },
                  f: M,
                };
              }
              throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
            }
            var J = !0,
              j = !1,
              W;
            return {
              s: function () {
                L = L.call(R);
              },
              n: function () {
                var Z = L.next();
                return ((J = Z.done), Z);
              },
              e: function (Z) {
                ((j = !0), (W = Z));
              },
              f: function () {
                try {
                  !J && L.return != null && L.return();
                } finally {
                  if (j) throw W;
                }
              },
            };
          }
          function a(R, O) {
            if (R) {
              if (typeof R == 'string') return l(R, O);
              var L = Object.prototype.toString.call(R).slice(8, -1);
              if (
                (L === 'Object' && R.constructor && (L = R.constructor.name),
                L === 'Map' || L === 'Set')
              )
                return Array.from(R);
              if (L === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(L))
                return l(R, O);
            }
          }
          function l(R, O) {
            (O == null || O > R.length) && (O = R.length);
            for (var L = 0, $ = new Array(O); L < O; L++) $[L] = R[L];
            return $;
          }
          var s = Wh(),
            d = { fg: '#FFF', bg: '#000', newline: !1, escapeXML: !1, stream: !1, colors: p() };
          function p() {
            var R = {
              0: '#000',
              1: '#A00',
              2: '#0A0',
              3: '#A50',
              4: '#00A',
              5: '#A0A',
              6: '#0AA',
              7: '#AAA',
              8: '#555',
              9: '#F55',
              10: '#5F5',
              11: '#FF5',
              12: '#55F',
              13: '#F5F',
              14: '#5FF',
              15: '#FFF',
            };
            return (
              S(0, 5).forEach(function (O) {
                S(0, 5).forEach(function (L) {
                  S(0, 5).forEach(function ($) {
                    return m(O, L, $, R);
                  });
                });
              }),
              S(0, 23).forEach(function (O) {
                var L = O + 232,
                  $ = h(O * 10 + 8);
                R[L] = '#' + $ + $ + $;
              }),
              R
            );
          }
          function m(R, O, L, $) {
            var M = 16 + R * 36 + O * 6 + L,
              J = R > 0 ? R * 40 + 55 : 0,
              j = O > 0 ? O * 40 + 55 : 0,
              W = L > 0 ? L * 40 + 55 : 0;
            $[M] = g([J, j, W]);
          }
          function h(R) {
            for (var O = R.toString(16); O.length < 2;) O = '0' + O;
            return O;
          }
          function g(R) {
            var O = [],
              L = i(R),
              $;
            try {
              for (L.s(); !($ = L.n()).done;) {
                var M = $.value;
                O.push(h(M));
              }
            } catch (J) {
              L.e(J);
            } finally {
              L.f();
            }
            return '#' + O.join('');
          }
          function E(R, O, L, $) {
            var M;
            return (
              O === 'text'
                ? (M = C(L, $))
                : O === 'display'
                  ? (M = _(R, L, $))
                  : O === 'xterm256Foreground'
                    ? (M = I(R, $.colors[L]))
                    : O === 'xterm256Background'
                      ? (M = N(R, $.colors[L]))
                      : O === 'rgb' && (M = b(R, L)),
              M
            );
          }
          function b(R, O) {
            O = O.substring(2).slice(0, -1);
            var L = +O.substr(0, 2),
              $ = O.substring(5).split(';'),
              M = $.map(function (J) {
                return ('0' + Number(J).toString(16)).substr(-2);
              }).join('');
            return v(R, (L === 38 ? 'color:#' : 'background-color:#') + M);
          }
          function _(R, O, L) {
            O = parseInt(O, 10);
            var $ = {
                '-1': function () {
                  return '<br/>';
                },
                0: function () {
                  return R.length && y(R);
                },
                1: function () {
                  return x(R, 'b');
                },
                3: function () {
                  return x(R, 'i');
                },
                4: function () {
                  return x(R, 'u');
                },
                8: function () {
                  return v(R, 'display:none');
                },
                9: function () {
                  return x(R, 'strike');
                },
                22: function () {
                  return v(R, 'font-weight:normal;text-decoration:none;font-style:normal');
                },
                23: function () {
                  return B(R, 'i');
                },
                24: function () {
                  return B(R, 'u');
                },
                39: function () {
                  return I(R, L.fg);
                },
                49: function () {
                  return N(R, L.bg);
                },
                53: function () {
                  return v(R, 'text-decoration:overline');
                },
              },
              M;
            return (
              $[O]
                ? (M = $[O]())
                : 4 < O && O < 7
                  ? (M = x(R, 'blink'))
                  : 29 < O && O < 38
                    ? (M = I(R, L.colors[O - 30]))
                    : 39 < O && O < 48
                      ? (M = N(R, L.colors[O - 40]))
                      : 89 < O && O < 98
                        ? (M = I(R, L.colors[8 + (O - 90)]))
                        : 99 < O && O < 108 && (M = N(R, L.colors[8 + (O - 100)])),
              M
            );
          }
          function y(R) {
            var O = R.slice(0);
            return (
              (R.length = 0),
              O.reverse()
                .map(function (L) {
                  return '</' + L + '>';
                })
                .join('')
            );
          }
          function S(R, O) {
            for (var L = [], $ = R; $ <= O; $++) L.push($);
            return L;
          }
          function A(R) {
            return function (O) {
              return (R === null || O.category !== R) && R !== 'all';
            };
          }
          function T(R) {
            R = parseInt(R, 10);
            var O = null;
            return (
              R === 0
                ? (O = 'all')
                : R === 1
                  ? (O = 'bold')
                  : 2 < R && R < 5
                    ? (O = 'underline')
                    : 4 < R && R < 7
                      ? (O = 'blink')
                      : R === 8
                        ? (O = 'hide')
                        : R === 9
                          ? (O = 'strike')
                          : (29 < R && R < 38) || R === 39 || (89 < R && R < 98)
                            ? (O = 'foreground-color')
                            : ((39 < R && R < 48) || R === 49 || (99 < R && R < 108)) &&
                              (O = 'background-color'),
              O
            );
          }
          function C(R, O) {
            return O.escapeXML ? s.encodeXML(R) : R;
          }
          function x(R, O, L) {
            return (
              L || (L = ''),
              R.push(O),
              '<'.concat(O).concat(L ? ' style="'.concat(L, '"') : '', '>')
            );
          }
          function v(R, O) {
            return x(R, 'span', O);
          }
          function I(R, O) {
            return x(R, 'span', 'color:' + O);
          }
          function N(R, O) {
            return x(R, 'span', 'background-color:' + O);
          }
          function B(R, O) {
            var L;
            if ((R.slice(-1)[0] === O && (L = R.pop()), L)) return '</' + O + '>';
          }
          function F(R, O, L) {
            var $ = !1,
              M = 3;
            function J() {
              return '';
            }
            function j(Ne, De) {
              return (L('xterm256Foreground', De), '');
            }
            function W(Ne, De) {
              return (L('xterm256Background', De), '');
            }
            function Z(Ne) {
              return (O.newline ? L('display', -1) : L('text', Ne), '');
            }
            function ue(Ne, De) {
              (($ = !0), De.trim().length === 0 && (De = '0'), (De = De.trimRight(';').split(';')));
              var Et = i(De),
                Jr;
              try {
                for (Et.s(); !(Jr = Et.n()).done;) {
                  var qr = Jr.value;
                  L('display', qr);
                }
              } catch (zr) {
                Et.e(zr);
              } finally {
                Et.f();
              }
              return '';
            }
            function me(Ne) {
              return (L('text', Ne), '');
            }
            function ie(Ne) {
              return (L('rgb', Ne), '');
            }
            var fe = [
              { pattern: /^\x08+/, sub: J },
              { pattern: /^\x1b\[[012]?K/, sub: J },
              { pattern: /^\x1b\[\(B/, sub: J },
              { pattern: /^\x1b\[[34]8;2;\d+;\d+;\d+m/, sub: ie },
              { pattern: /^\x1b\[38;5;(\d+)m/, sub: j },
              { pattern: /^\x1b\[48;5;(\d+)m/, sub: W },
              { pattern: /^\n/, sub: Z },
              { pattern: /^\r+\n/, sub: Z },
              { pattern: /^\r/, sub: Z },
              { pattern: /^\x1b\[((?:\d{1,3};?)+|)m/, sub: ue },
              { pattern: /^\x1b\[\d?J/, sub: J },
              { pattern: /^\x1b\[\d{0,3};\d{0,3}f/, sub: J },
              { pattern: /^\x1b\[?[\d;]{0,3}/, sub: J },
              { pattern: /^(([^\x1b\x08\r\n])+)/, sub: me },
            ];
            function xe(Ne, De) {
              (De > M && $) || (($ = !1), (R = R.replace(Ne.pattern, Ne.sub)));
            }
            var Ie = [],
              rt = R,
              Ge = rt.length;
            e: for (; Ge > 0;) {
              for (var ct = 0, dt = 0, Qt = fe.length; dt < Qt; ct = ++dt) {
                var Q = fe[ct];
                if ((xe(Q, ct), R.length !== Ge)) {
                  Ge = R.length;
                  continue e;
                }
              }
              if (R.length === Ge) break;
              (Ie.push(0), (Ge = R.length));
            }
            return Ie;
          }
          function z(R, O, L) {
            return (
              O !== 'text' &&
                ((R = R.filter(A(T(L)))), R.push({ token: O, data: L, category: T(L) })),
              R
            );
          }
          var k = (function () {
            function R(O) {
              (r(this, R),
                (O = O || {}),
                O.colors && (O.colors = Object.assign({}, d.colors, O.colors)),
                (this.options = Object.assign({}, d, O)),
                (this.stack = []),
                (this.stickyStack = []));
            }
            return (
              o(R, [
                {
                  key: 'toHtml',
                  value: function (O) {
                    var L = this;
                    O = typeof O == 'string' ? [O] : O;
                    var $ = this.stack,
                      M = this.options,
                      J = [];
                    return (
                      this.stickyStack.forEach(function (j) {
                        var W = E($, j.token, j.data, M);
                        W && J.push(W);
                      }),
                      F(O.join(''), M, function (j, W) {
                        var Z = E($, j, W, M);
                        (Z && J.push(Z), M.stream && (L.stickyStack = z(L.stickyStack, j, W)));
                      }),
                      $.length && J.push(y($)),
                      J.join('')
                    );
                  },
                },
              ]),
              R
            );
          })();
          t.exports = k;
        },
      });
    U();
    V();
    H();
    U();
    V();
    H();
    function ar(e) {
      if (!e || typeof e != 'object') return !1;
      let t = Object.getPrototypeOf(e);
      return t === null || t === Object.prototype || Object.getPrototypeOf(t) === null
        ? Object.prototype.toString.call(e) === '[object Object]'
        : !1;
    }
    function qs(e) {
      return e == null || (typeof e != 'object' && typeof e != 'function');
    }
    function zs(e) {
      return ArrayBuffer.isView(e) && !(e instanceof DataView);
    }
    function Zo(e) {
      return Object.getOwnPropertySymbols(e).filter((t) =>
        Object.prototype.propertyIsEnumerable.call(e, t),
      );
    }
    function Qo(e) {
      return e == null
        ? e === void 0
          ? '[object Undefined]'
          : '[object Null]'
        : Object.prototype.toString.call(e);
    }
    var ea = '[object RegExp]',
      ta = '[object String]',
      ra = '[object Number]',
      na = '[object Boolean]',
      oa = '[object Arguments]',
      aa = '[object Symbol]',
      ia = '[object Date]',
      sa = '[object Map]',
      la = '[object Set]',
      ua = '[object Array]';
    var ca = '[object ArrayBuffer]',
      da = '[object Object]';
    var pa = '[object DataView]',
      ma = '[object Uint8Array]',
      ha = '[object Uint8ClampedArray]',
      fa = '[object Uint16Array]',
      ga = '[object Uint32Array]';
    var ya = '[object Int8Array]',
      ba = '[object Int16Array]',
      Ea = '[object Int32Array]';
    var Sa = '[object Float32Array]',
      Aa = '[object Float64Array]';
    function xr(e, t) {
      let r = {},
        n = Object.keys(e);
      for (let o = 0; o < n.length; o++) {
        let i = n[o],
          a = e[i];
        r[i] = t(a, i, e);
      }
      return r;
    }
    function Rn(e, t) {
      let r = {},
        n = Object.keys(e);
      for (let o = 0; o < n.length; o++) {
        let i = n[o],
          a = e[i];
        t(a, i) && (r[i] = a);
      }
      return r;
    }
    function vr(e, t, r, n = new Map(), o = void 0) {
      let i = o?.(e, t, r, n);
      if (i !== void 0) return i;
      if (qs(e)) return e;
      if (n.has(e)) return n.get(e);
      if (Array.isArray(e)) {
        let a = new Array(e.length);
        n.set(e, a);
        for (let l = 0; l < e.length; l++) a[l] = vr(e[l], l, r, n, o);
        return (
          Object.hasOwn(e, 'index') && (a.index = e.index),
          Object.hasOwn(e, 'input') && (a.input = e.input),
          a
        );
      }
      if (e instanceof Date) return new Date(e.getTime());
      if (e instanceof RegExp) {
        let a = new RegExp(e.source, e.flags);
        return ((a.lastIndex = e.lastIndex), a);
      }
      if (e instanceof Map) {
        let a = new Map();
        n.set(e, a);
        for (let [l, s] of e) a.set(l, vr(s, l, r, n, o));
        return a;
      }
      if (e instanceof Set) {
        let a = new Set();
        n.set(e, a);
        for (let l of e) a.add(vr(l, void 0, r, n, o));
        return a;
      }
      if (typeof Buffer < 'u' && Buffer.isBuffer(e)) return e.subarray();
      if (zs(e)) {
        let a = new (Object.getPrototypeOf(e).constructor)(e.length);
        n.set(e, a);
        for (let l = 0; l < e.length; l++) a[l] = vr(e[l], l, r, n, o);
        return a;
      }
      if (
        e instanceof ArrayBuffer ||
        (typeof SharedArrayBuffer < 'u' && e instanceof SharedArrayBuffer)
      )
        return e.slice(0);
      if (e instanceof DataView) {
        let a = new DataView(e.buffer.slice(0), e.byteOffset, e.byteLength);
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      if (typeof File < 'u' && e instanceof File) {
        let a = new File([e], e.name, { type: e.type });
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      if (typeof Blob < 'u' && e instanceof Blob) {
        let a = new Blob([e], { type: e.type });
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      if (e instanceof Error) {
        let a = new e.constructor();
        return (
          n.set(e, a),
          (a.message = e.message),
          (a.name = e.name),
          (a.stack = e.stack),
          (a.cause = e.cause),
          Vt(a, e, r, n, o),
          a
        );
      }
      if (e instanceof Boolean) {
        let a = new Boolean(e.valueOf());
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      if (e instanceof Number) {
        let a = new Number(e.valueOf());
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      if (e instanceof String) {
        let a = new String(e.valueOf());
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      if (typeof e == 'object' && Yh(e)) {
        let a = Object.create(Object.getPrototypeOf(e));
        return (n.set(e, a), Vt(a, e, r, n, o), a);
      }
      return e;
    }
    function Vt(e, t, r = e, n, o) {
      let i = [...Object.keys(t), ...Zo(t)];
      for (let a = 0; a < i.length; a++) {
        let l = i[a],
          s = Object.getOwnPropertyDescriptor(e, l);
        (s == null || s.writable) && (e[l] = vr(t[l], l, r, n, o));
      }
    }
    function Yh(e) {
      switch (Qo(e)) {
        case oa:
        case ua:
        case ca:
        case pa:
        case na:
        case ia:
        case Sa:
        case Aa:
        case ya:
        case ba:
        case Ea:
        case sa:
        case ra:
        case da:
        case ea:
        case la:
        case ta:
        case aa:
        case ma:
        case ha:
        case fa:
        case ga:
          return !0;
        default:
          return !1;
      }
    }
    function Gs(e) {
      return vr(e, void 0, e, new Map(), void 0);
    }
    var Uv = new RegExp(
      '\\p{Lu}?\\p{Ll}+|[0-9]+|\\p{Lu}+(?!\\p{Ll})|\\p{Emoji_Presentation}|\\p{Extended_Pictographic}|\\p{L}+',
      'gu',
    );
    U();
    V();
    H();
    var Ta = 'actions',
      Cr = 'storybook/actions',
      wa = `${Cr}/panel`,
      Or = `${Cr}/action-event`,
      _a = `${Cr}/action-clear`;
    U();
    V();
    H();
    var Ws = {
      mobile1: {
        name: 'Small mobile',
        styles: { height: '568px', width: '320px' },
        type: 'mobile',
      },
      mobile2: {
        name: 'Large mobile',
        styles: { height: '896px', width: '414px' },
        type: 'mobile',
      },
      tablet: { name: 'Tablet', styles: { height: '1112px', width: '834px' }, type: 'tablet' },
      desktop: { name: 'Desktop', styles: { height: '1024px', width: '1280px' }, type: 'desktop' },
    };
    U();
    V();
    H();
    var ir = 'storybook/viewport',
      ht = 'viewport',
      ex = `${ir}/panel`,
      Ys = `${ir}/tool`;
    it();
    G();
    ce();
    U();
    V();
    H();
    var VC = __STORYBOOK_CORE_EVENTS__,
      {
        AI_PROMPT_NUDGE: HC,
        AI_SETUP_ANALYTICS_REQUEST: JC,
        AI_SETUP_ANALYTICS_RESPONSE: qC,
        ARGTYPES_INFO_REQUEST: Kh,
        ARGTYPES_INFO_RESPONSE: Xh,
        CHANNEL_CREATED: zC,
        CHANNEL_WS_DISCONNECT: GC,
        CONFIG_ERROR: Zh,
        CREATE_NEW_STORYFILE_REQUEST: WC,
        CREATE_NEW_STORYFILE_RESPONSE: YC,
        CURRENT_STORY_WAS_SET: Qh,
        DOCS_PREPARED: ef,
        DOCS_RENDERED: dl,
        FILE_COMPONENT_SEARCH_REQUEST: KC,
        FILE_COMPONENT_SEARCH_RESPONSE: XC,
        FORCE_REMOUNT: Ir,
        FORCE_RE_RENDER: pl,
        GHOST_STORIES_REQUEST: ZC,
        GHOST_STORIES_RESPONSE: QC,
        GLOBALS_UPDATED: ml,
        MANAGER_INERT_ATTRIBUTE_CHANGED: eO,
        NAVIGATE_URL: tO,
        OPEN_IN_EDITOR_REQUEST: rO,
        OPEN_IN_EDITOR_RESPONSE: nO,
        PLAY_FUNCTION_THREW_EXCEPTION: va,
        PRELOAD_ENTRIES: tf,
        PREVIEW_BUILDER_PROGRESS: oO,
        PREVIEW_INITIALIZED: rf,
        PREVIEW_KEYDOWN: nf,
        REGISTER_SUBSCRIPTION: aO,
        REQUEST_WHATS_NEW_DATA: iO,
        RESET_STORY_ARGS: hl,
        RESULT_WHATS_NEW_DATA: sO,
        SAVE_STORY_REQUEST: xa,
        SAVE_STORY_RESPONSE: Mn,
        SELECT_STORY: lO,
        SET_CONFIG: uO,
        SET_CURRENT_STORY: Ca,
        SET_FILTER: cO,
        SET_GLOBALS: of,
        SET_INDEX: dO,
        SET_STORIES: pO,
        SET_WHATS_NEW_CACHE: mO,
        SHARED_STATE_CHANGED: hO,
        SHARED_STATE_SET: fO,
        SHARE_ISOLATE_MODE: gO,
        SIDEBAR_FILTER_CHANGED: yO,
        STORIES_COLLAPSE_ALL: bO,
        STORIES_EXPAND_ALL: EO,
        STORY_ARGS_UPDATED: af,
        STORY_CHANGED: Dr,
        STORY_ERRORED: sf,
        STORY_FINISHED: lf,
        STORY_HOT_UPDATED: uf,
        STORY_INDEX_INVALIDATED: cf,
        STORY_MISSING: df,
        STORY_PREPARED: pf,
        STORY_RENDERED: fl,
        STORY_RENDER_PHASE_CHANGED: qt,
        STORY_SPECIFIED: mf,
        STORY_THREW_EXCEPTION: Oa,
        STORY_UNCHANGED: hf,
        TELEMETRY_ERROR: SO,
        TOGGLE_WHATS_NEW_NOTIFICATIONS: AO,
        UNHANDLED_ERRORS_WHILE_PLAYING: Ra,
        UPDATE_GLOBALS: gl,
        UPDATE_QUERY_PARAMS: ff,
        UPDATE_STORY_ARGS: yl,
      } = __STORYBOOK_CORE_EVENTS__;
    ke();
    U();
    V();
    H();
    var $D = __STORYBOOK_API__,
      {
        ActiveTabs: jD,
        Consumer: Vl,
        ManagerContext: UD,
        Provider: VD,
        RequestResponseError: HD,
        Tag: JD,
        addons: Oe,
        combineParameters: qD,
        controlOrMetaKey: zD,
        controlOrMetaSymbol: GD,
        eventMatchesShortcut: WD,
        eventToShortcut: YD,
        experimental_MockUniversalStore: KD,
        experimental_UniversalStore: XD,
        experimental_getStatusStore: ZD,
        experimental_getTestProviderStore: QD,
        experimental_requestResponse: Da,
        experimental_useStatusStore: Hl,
        experimental_useTestProviderStore: eP,
        experimental_useUniversalStore: tP,
        internal_checklistStore: rP,
        internal_fullStatusStore: nP,
        internal_fullTestProviderStore: oP,
        internal_universalChecklistStore: aP,
        internal_universalStatusStore: iP,
        internal_universalTestProviderStore: sP,
        isMacLike: lP,
        isShortcutTaken: uP,
        keyToSymbol: cP,
        merge: dP,
        mockChannel: pP,
        optionOrAltSymbol: mP,
        shortcutMatchesShortcut: hP,
        shortcutToAriaKeyshortcuts: fP,
        shortcutToHumanString: gP,
        types: Qe,
        useAddonState: Pr,
        useArgTypes: qn,
        useArgs: Jl,
        useChannel: zn,
        useGlobalTypes: yP,
        useGlobals: At,
        useParameter: Tt,
        useSharedState: bP,
        useStoryPrepared: EP,
        useStorybookApi: Pe,
        useStorybookState: Gn,
      } = __STORYBOOK_API__;
    le();
    G();
    U();
    V();
    H();
    var K = (() => {
      let e;
      return (
        typeof window < 'u'
          ? (e = window)
          : typeof globalThis < 'u'
            ? (e = globalThis)
            : typeof window < 'u'
              ? (e = window)
              : typeof self < 'u'
                ? (e = self)
                : (e = {}),
        e
      );
    })();
    le();
    G();
    U();
    V();
    H();
    var QP = __STORYBOOK_CLIENT_LOGGER__,
      { deprecate: zl, logger: _e, once: ur, pretty: eN } = __STORYBOOK_CLIENT_LOGGER__;
    ce();
    U();
    V();
    H();
    U();
    V();
    H();
    U();
    V();
    H();
    U();
    V();
    H();
    U();
    V();
    H();
    it();
    var Gl = de({
        '../../node_modules/picoquery/lib/string-util.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }), (e.encodeString = n));
          var t = Array.from(
              { length: 256 },
              (o, i) => '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase(),
            ),
            r = new Int8Array([
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
              0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
              1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
              1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0,
            ]);
          function n(o) {
            let i = o.length;
            if (i === 0) return '';
            let a = '',
              l = 0,
              s = 0;
            e: for (; s < i; s++) {
              let d = o.charCodeAt(s);
              for (; d < 128;) {
                if (
                  (r[d] !== 1 && (l < s && (a += o.slice(l, s)), (l = s + 1), (a += t[d])),
                  ++s === i)
                )
                  break e;
                d = o.charCodeAt(s);
              }
              if ((l < s && (a += o.slice(l, s)), d < 2048)) {
                ((l = s + 1), (a += t[192 | (d >> 6)] + t[128 | (d & 63)]));
                continue;
              }
              if (d < 55296 || d >= 57344) {
                ((l = s + 1),
                  (a += t[224 | (d >> 12)] + t[128 | ((d >> 6) & 63)] + t[128 | (d & 63)]));
                continue;
              }
              if ((++s, s >= i)) throw new Error('URI malformed');
              let p = o.charCodeAt(s) & 1023;
              ((l = s + 1),
                (d = 65536 + (((d & 1023) << 10) | p)),
                (a +=
                  t[240 | (d >> 18)] +
                  t[128 | ((d >> 12) & 63)] +
                  t[128 | ((d >> 6) & 63)] +
                  t[128 | (d & 63)]));
            }
            return l === 0 ? o : l < i ? a + o.slice(l) : a;
          }
        },
      }),
      Na = de({
        '../../node_modules/picoquery/lib/shared.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.defaultOptions =
              e.defaultShouldSerializeObject =
              e.defaultValueSerializer =
                void 0));
          var t = Gl(),
            r = (i) => {
              switch (typeof i) {
                case 'string':
                  return (0, t.encodeString)(i);
                case 'bigint':
                case 'boolean':
                  return '' + i;
                case 'number':
                  if (Number.isFinite(i)) return i < 1e21 ? '' + i : (0, t.encodeString)('' + i);
                  break;
              }
              return i instanceof Date ? (0, t.encodeString)(i.toISOString()) : '';
            };
          e.defaultValueSerializer = r;
          var n = (i) => i instanceof Date;
          e.defaultShouldSerializeObject = n;
          var o = (i) => i;
          e.defaultOptions = {
            nesting: !0,
            nestingSyntax: 'dot',
            arrayRepeat: !1,
            arrayRepeatSyntax: 'repeat',
            delimiter: 38,
            valueDeserializer: o,
            valueSerializer: e.defaultValueSerializer,
            keyDeserializer: o,
            shouldSerializeObject: e.defaultShouldSerializeObject,
          };
        },
      }),
      Wl = de({
        '../../node_modules/picoquery/lib/object-util.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.getDeepObject = o),
            (e.stringifyObject = p));
          var t = Na(),
            r = Gl();
          function n(m) {
            return m === '__proto__' || m === 'constructor' || m === 'prototype';
          }
          function o(m, h, g, E, b) {
            if (n(h)) return m;
            let _ = m[h];
            return typeof _ == 'object' && _ !== null
              ? _
              : !E &&
                  (b ||
                    typeof g == 'number' ||
                    (typeof g == 'string' && g * 0 === 0 && g.indexOf('.') === -1))
                ? (m[h] = [])
                : (m[h] = {});
          }
          var i = 20,
            a = '[]',
            l = '[',
            s = ']',
            d = '.';
          function p(m, h, g = 0, E, b) {
            let {
                nestingSyntax: _ = t.defaultOptions.nestingSyntax,
                arrayRepeat: y = t.defaultOptions.arrayRepeat,
                arrayRepeatSyntax: S = t.defaultOptions.arrayRepeatSyntax,
                nesting: A = t.defaultOptions.nesting,
                delimiter: T = t.defaultOptions.delimiter,
                valueSerializer: C = t.defaultOptions.valueSerializer,
                shouldSerializeObject: x = t.defaultOptions.shouldSerializeObject,
              } = h,
              v = typeof T == 'number' ? String.fromCharCode(T) : T,
              I = b === !0 && y,
              N = _ === 'dot' || (_ === 'js' && !b);
            if (g > i) return '';
            let B = '',
              F = !0,
              z = !1;
            for (let k in m) {
              let R = m[k];
              if (R === void 0) continue;
              let O;
              (E
                ? ((O = E),
                  I
                    ? S === 'bracket' && (O += a)
                    : N
                      ? ((O += d), (O += k))
                      : ((O += l), (O += k), (O += s)))
                : (O = k),
                F || (B += v),
                typeof R == 'object' && R !== null && !x(R)
                  ? ((z = R.pop !== void 0), (A || (y && z)) && (B += p(R, h, g + 1, O, z)))
                  : ((B += (0, r.encodeString)(O)), (B += '='), (B += C(R, k))),
                F && (F = !1));
            }
            return B;
          }
        },
      }),
      gf = de({
        '../../node_modules/picoquery/lib/decode-uri-component.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }), (e.decodeURIComponent = o));
          var t = 12,
            r = 0,
            n = [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
              2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
              3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5,
              5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 7, 7, 7, 7, 7, 7, 7,
              7, 7, 7, 7, 7, 8, 7, 7, 10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96, 0, 12, 12, 12, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 24, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 127, 63,
              63, 63, 0, 31, 15, 15, 15, 7, 7, 7,
            ];
          function o(l) {
            let s = l.indexOf('%');
            if (s === -1) return l;
            let d = l.length,
              p = '',
              m = 0,
              h = 0,
              g = s,
              E = t;
            for (; s > -1 && s < d;) {
              let b = a(l[s + 1], 4),
                _ = a(l[s + 2], 0),
                y = b | _,
                S = n[y];
              if (((E = n[256 + E + S]), (h = (h << 6) | (y & n[364 + S])), E === t))
                ((p += l.slice(m, g)),
                  (p +=
                    h <= 65535
                      ? String.fromCharCode(h)
                      : String.fromCharCode(55232 + (h >> 10), 56320 + (h & 1023))),
                  (h = 0),
                  (m = s + 3),
                  (s = g = l.indexOf('%', m)));
              else {
                if (E === r) return null;
                if (((s += 3), s < d && l.charCodeAt(s) === 37)) continue;
                return null;
              }
            }
            return p + l.slice(m);
          }
          var i = {
            0: 0,
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: 6,
            7: 7,
            8: 8,
            9: 9,
            a: 10,
            A: 10,
            b: 11,
            B: 11,
            c: 12,
            C: 12,
            d: 13,
            D: 13,
            e: 14,
            E: 14,
            f: 15,
            F: 15,
          };
          function a(l, s) {
            let d = i[l];
            return d === void 0 ? 255 : d << s;
          }
        },
      }),
      yf = de({
        '../../node_modules/picoquery/lib/parse.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.numberValueDeserializer = e.numberKeyDeserializer = void 0),
            (e.parse = d));
          var t = Wl(),
            r = Na(),
            n = gf(),
            o = (p) => {
              let m = Number(p);
              return Number.isNaN(m) ? p : m;
            };
          e.numberKeyDeserializer = o;
          var i = (p) => {
            let m = Number(p);
            return Number.isNaN(m) ? p : m;
          };
          e.numberValueDeserializer = i;
          var a = /\+/g,
            l = function () {};
          l.prototype = Object.create(null);
          function s(p, m, h, g, E) {
            let b = p.substring(m, h);
            return (g && (b = b.replace(a, ' ')), E && (b = (0, n.decodeURIComponent)(b) || b), b);
          }
          function d(p, m) {
            let {
                valueDeserializer: h = r.defaultOptions.valueDeserializer,
                keyDeserializer: g = r.defaultOptions.keyDeserializer,
                arrayRepeatSyntax: E = r.defaultOptions.arrayRepeatSyntax,
                nesting: b = r.defaultOptions.nesting,
                arrayRepeat: _ = r.defaultOptions.arrayRepeat,
                nestingSyntax: y = r.defaultOptions.nestingSyntax,
                delimiter: S = r.defaultOptions.delimiter,
              } = m ?? {},
              A = typeof S == 'string' ? S.charCodeAt(0) : S,
              T = y === 'js',
              C = new l();
            if (typeof p != 'string') return C;
            let x = p.length,
              v = '',
              I = -1,
              N = -1,
              B = -1,
              F = C,
              z,
              k = '',
              R = '',
              O = !1,
              L = !1,
              $ = !1,
              M = !1,
              J = !1,
              j = !1,
              W = 0,
              Z = -1,
              ue = -1,
              me = -1;
            for (let ie = 0; ie < x + 1; ie++) {
              if (((W = ie !== x ? p.charCodeAt(ie) : A), W === A)) {
                if (
                  ((j = N > I),
                  j || (N = ie),
                  B !== N - 1 &&
                    ((R = s(p, B + 1, Z > -1 ? Z : N, $, O)),
                    (k = g(R)),
                    z !== void 0 && (F = (0, t.getDeepObject)(F, z, k, T && J, void 0))),
                  j || k !== '')
                ) {
                  j &&
                    ((v = p.slice(N + 1, ie)),
                    M && (v = v.replace(a, ' ')),
                    L && (v = (0, n.decodeURIComponent)(v) || v));
                  let fe = h(v, k);
                  if (_) {
                    let xe = F[k];
                    xe === void 0
                      ? Z > -1
                        ? (F[k] = [fe])
                        : (F[k] = fe)
                      : xe.pop
                        ? xe.push(fe)
                        : (F[k] = [xe, fe]);
                  } else F[k] = fe;
                }
                ((v = ''),
                  (I = ie),
                  (N = ie),
                  (O = !1),
                  (L = !1),
                  ($ = !1),
                  (M = !1),
                  (J = !1),
                  (Z = -1),
                  (B = ie),
                  (F = C),
                  (z = void 0),
                  (k = ''));
              } else
                W === 93
                  ? (_ && E === 'bracket' && me === 91 && (Z = ue),
                    b &&
                      (y === 'index' || T) &&
                      N <= I &&
                      (B !== ue &&
                        ((R = s(p, B + 1, ie, $, O)),
                        (k = g(R)),
                        z !== void 0 && (F = (0, t.getDeepObject)(F, z, k, void 0, void 0)),
                        (z = k),
                        ($ = !1),
                        (O = !1)),
                      (B = ie),
                      (J = !1)))
                  : W === 46
                    ? b &&
                      (y === 'dot' || T) &&
                      N <= I &&
                      (B !== ue &&
                        ((R = s(p, B + 1, ie, $, O)),
                        (k = g(R)),
                        z !== void 0 && (F = (0, t.getDeepObject)(F, z, k, T)),
                        (z = k),
                        ($ = !1),
                        (O = !1)),
                      (J = !0),
                      (B = ie))
                    : W === 91
                      ? b &&
                        (y === 'index' || T) &&
                        N <= I &&
                        (B !== ue &&
                          ((R = s(p, B + 1, ie, $, O)),
                          (k = g(R)),
                          T && z !== void 0 && (F = (0, t.getDeepObject)(F, z, k, T)),
                          (z = k),
                          ($ = !1),
                          (O = !1),
                          (J = !1)),
                        (B = ie))
                      : W === 61
                        ? N <= I
                          ? (N = ie)
                          : (L = !0)
                        : W === 43
                          ? N > I
                            ? (M = !0)
                            : ($ = !0)
                          : W === 37 && (N > I ? (L = !0) : (O = !0));
              ((ue = ie), (me = W));
            }
            return C;
          }
        },
      }),
      bf = de({
        '../../node_modules/picoquery/lib/stringify.js'(e) {
          'use strict';
          (Object.defineProperty(e, '__esModule', { value: !0 }), (e.stringify = r));
          var t = Wl();
          function r(n, o) {
            if (n === null || typeof n != 'object') return '';
            let i = o ?? {};
            return (0, t.stringifyObject)(n, i);
          }
        },
      }),
      Kn = de({
        '../../node_modules/picoquery/lib/main.js'(e) {
          'use strict';
          var t =
              (e && e.__createBinding) ||
              (Object.create
                ? function (i, a, l, s) {
                    s === void 0 && (s = l);
                    var d = Object.getOwnPropertyDescriptor(a, l);
                    ((!d || ('get' in d ? !a.__esModule : d.writable || d.configurable)) &&
                      (d = {
                        enumerable: !0,
                        get: function () {
                          return a[l];
                        },
                      }),
                      Object.defineProperty(i, s, d));
                  }
                : function (i, a, l, s) {
                    (s === void 0 && (s = l), (i[s] = a[l]));
                  }),
            r =
              (e && e.__exportStar) ||
              function (i, a) {
                for (var l in i)
                  l !== 'default' && !Object.prototype.hasOwnProperty.call(a, l) && t(a, i, l);
              };
          (Object.defineProperty(e, '__esModule', { value: !0 }), (e.stringify = e.parse = void 0));
          var n = yf();
          Object.defineProperty(e, 'parse', {
            enumerable: !0,
            get: function () {
              return n.parse;
            },
          });
          var o = bf();
          (Object.defineProperty(e, 'stringify', {
            enumerable: !0,
            get: function () {
              return o.stringify;
            },
          }),
            r(Na(), e));
        },
      });
    U();
    V();
    H();
    it();
    U();
    V();
    H();
    U();
    V();
    H();
    U();
    V();
    H();
    function Yl({ code: e, category: t }) {
      let r = String(e).padStart(4, '0');
      return `SB_${t}_${r}`;
    }
    function Kl(e) {
      if (/^(?!.*storybook\.js\.org)|[?&]ref=error\b/.test(e)) return e;
      try {
        let t = new URL(e);
        return (t.searchParams.set('ref', 'error'), t.toString());
      } catch {
        return e;
      }
    }
    var Xl = class Zl extends Error {
      constructor(t) {
        (super(Zl.getFullMessage(t), t.cause === void 0 ? void 0 : { cause: t.cause }),
          (this.data = {}),
          (this.fromStorybook = !0),
          (this.isHandledError = !1),
          (this.subErrors = []),
          (this.category = t.category),
          (this.documentation = t.documentation ?? !1),
          (this.code = t.code),
          (this.isHandledError = t.isHandledError ?? !1),
          (this.name = t.name),
          (this.subErrors = t.subErrors ?? []));
      }
      get fullErrorCode() {
        return Yl({ code: this.code, category: this.category });
      }
      get name() {
        let t = this._name || this.constructor.name;
        return `${this.fullErrorCode} (${t})`;
      }
      set name(t) {
        this._name = t;
      }
      static getFullMessage({ documentation: t, code: r, category: n, message: o }) {
        let i;
        return (
          t === !0
            ? (i = `https://storybook.js.org/error/${Yl({ code: r, category: n })}?ref=error`)
            : typeof t == 'string'
              ? (i = Kl(t))
              : Array.isArray(t) &&
                (i = `
${t.map((a) => `	- ${Kl(a)}`).join(`
`)}`),
          `${o}${
            i != null
              ? `

More info: ${i}
`
              : ''
          }`
        );
      }
    };
    U();
    V();
    H();
    function cr(e) {
      for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
      var n = Array.from(typeof e == 'string' ? [e] : e);
      n[n.length - 1] = n[n.length - 1].replace(/\r?\n([\t ]*)$/, '');
      var o = n.reduce(function (l, s) {
        var d = s.match(/\n([\t ]+|(?!\s).)/g);
        return d
          ? l.concat(
              d.map(function (p) {
                var m, h;
                return (h =
                  (m = p.match(/[\t ]/g)) === null || m === void 0 ? void 0 : m.length) !== null &&
                  h !== void 0
                  ? h
                  : 0;
              }),
            )
          : l;
      }, []);
      if (o.length) {
        var i = new RegExp(
          `
[	 ]{` +
            Math.min.apply(Math, o) +
            '}',
          'g',
        );
        n = n.map(function (l) {
          return l.replace(
            i,
            `
`,
          );
        });
      }
      n[0] = n[0].replace(/^\r?\n/, '');
      var a = n[0];
      return (
        t.forEach(function (l, s) {
          var d = a.match(/(?:^|\n)( *)$/),
            p = d ? d[1] : '',
            m = l;
          (typeof l == 'string' &&
            l.includes(`
`) &&
            (m = String(l)
              .split(
                `
`,
              )
              .map(function (h, g) {
                return g === 0 ? h : '' + p + h;
              }).join(`
`)),
            (a += m + n[s + 1]));
        }),
        a
      );
    }
    var Ql = ((e) => (
      (e.BLOCKS = 'BLOCKS'),
      (e.DOCS_TOOLS = 'DOCS-TOOLS'),
      (e.PREVIEW_CLIENT_LOGGER = 'PREVIEW_CLIENT-LOGGER'),
      (e.PREVIEW_CHANNELS = 'PREVIEW_CHANNELS'),
      (e.PREVIEW_CORE_EVENTS = 'PREVIEW_CORE-EVENTS'),
      (e.PREVIEW_INSTRUMENTER = 'PREVIEW_INSTRUMENTER'),
      (e.PREVIEW_API = 'PREVIEW_API'),
      (e.PREVIEW_REACT_DOM_SHIM = 'PREVIEW_REACT-DOM-SHIM'),
      (e.PREVIEW_ROUTER = 'PREVIEW_ROUTER'),
      (e.PREVIEW_THEMING = 'PREVIEW_THEMING'),
      (e.RENDERER_HTML = 'RENDERER_HTML'),
      (e.RENDERER_PREACT = 'RENDERER_PREACT'),
      (e.RENDERER_REACT = 'RENDERER_REACT'),
      (e.RENDERER_SERVER = 'RENDERER_SERVER'),
      (e.RENDERER_SVELTE = 'RENDERER_SVELTE'),
      (e.RENDERER_VUE = 'RENDERER_VUE'),
      (e.RENDERER_VUE3 = 'RENDERER_VUE3'),
      (e.RENDERER_WEB_COMPONENTS = 'RENDERER_WEB-COMPONENTS'),
      (e.FRAMEWORK_NEXTJS = 'FRAMEWORK_NEXTJS'),
      (e.ADDON_VITEST = 'ADDON_VITEST'),
      (e.ADDON_A11Y = 'ADDON_A11Y'),
      e
    ))(Ql || {});
    var ka = class extends Xl {
      constructor(e) {
        (super({
          name: 'ImplicitActionsDuringRendering',
          category: 'PREVIEW_API',
          code: 2,
          documentation:
            'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#using-implicit-actions-during-rendering-is-deprecated-for-example-in-the-play-function',
          message: cr`
        We detected that you use an implicit action arg while ${e.phase} of your story.  
        ${
          e.deprecated
            ? `
This is deprecated and won't work in Storybook 8 anymore.
`
            : ''
        }
        Please provide an explicit spy to your args like this:
          import { fn } from 'storybook/test';
          ... 
          args: {
           ${e.name}: fn()
          }`,
        }),
          (this.data = e));
      }
    };
    it();
    var If = de({
      '../../node_modules/jsdoc-type-pratt-parser/dist/index.js'(e, t) {
        (function (r, n) {
          typeof e == 'object' && typeof t < 'u'
            ? n(e)
            : typeof define == 'function' && define.amd
              ? define(['exports'], n)
              : ((r = typeof globalThis < 'u' ? globalThis : r || self), n((r.jtpp = {})));
        })(e, function (r) {
          'use strict';
          function n(c) {
            return c.text !== void 0 && c.text !== ''
              ? `'${c.type}' with value '${c.text}'`
              : `'${c.type}'`;
          }
          class o extends Error {
            constructor(f) {
              (super(`No parslet found for token: ${n(f)}`),
                (this.token = f),
                Object.setPrototypeOf(this, o.prototype));
            }
            getToken() {
              return this.token;
            }
          }
          class i extends Error {
            constructor(f) {
              (super(`The parsing ended early. The next token was: ${n(f)}`),
                (this.token = f),
                Object.setPrototypeOf(this, i.prototype));
            }
            getToken() {
              return this.token;
            }
          }
          class a extends Error {
            constructor(f, w) {
              let D = `Unexpected type: '${f.type}'.`;
              (w !== void 0 && (D += ` Message: ${w}`),
                super(D),
                Object.setPrototypeOf(this, a.prototype));
            }
          }
          function l(c) {
            return (f) => (f.startsWith(c) ? { type: c, text: c } : null);
          }
          function s(c) {
            let f = 0,
              w,
              D = c[0],
              q = !1;
            if (D !== "'" && D !== '"') return null;
            for (; f < c.length;) {
              if ((f++, (w = c[f]), !q && w === D)) {
                f++;
                break;
              }
              q = !q && w === '\\';
            }
            if (w !== D) throw new Error('Unterminated String');
            return c.slice(0, f);
          }
          let d = new RegExp(
              '[$_\\p{ID_Start}]|\\\\u\\p{Hex_Digit}{4}|\\\\u\\{0*(?:\\p{Hex_Digit}{1,5}|10\\p{Hex_Digit}{4})\\}',
              'u',
            ),
            p = new RegExp(
              '[$\\-\\p{ID_Continue}\\u200C\\u200D]|\\\\u\\p{Hex_Digit}{4}|\\\\u\\{0*(?:\\p{Hex_Digit}{1,5}|10\\p{Hex_Digit}{4})\\}',
              'u',
            );
          function m(c) {
            let f = c[0];
            if (!d.test(f)) return null;
            let w = 1;
            do {
              if (((f = c[w]), !p.test(f))) break;
              w++;
            } while (w < c.length);
            return c.slice(0, w);
          }
          let h = /^(NaN|-?((\d*\.\d+|\d+)([Ee][+-]?\d+)?|Infinity))/;
          function g(c) {
            var f, w;
            return (w = (f = h.exec(c)) === null || f === void 0 ? void 0 : f[0]) !== null &&
              w !== void 0
              ? w
              : null;
          }
          let E = (c) => {
            let f = m(c);
            return f == null ? null : { type: 'Identifier', text: f };
          };
          function b(c) {
            return (f) => {
              if (!f.startsWith(c)) return null;
              let w = f[c.length];
              return w !== void 0 && p.test(w) ? null : { type: c, text: c };
            };
          }
          let _ = (c) => {
              let f = s(c);
              return f == null ? null : { type: 'StringValue', text: f };
            },
            y = (c) => (c.length > 0 ? null : { type: 'EOF', text: '' }),
            S = (c) => {
              let f = g(c);
              return f === null ? null : { type: 'Number', text: f };
            },
            A = [
              y,
              l('=>'),
              l('('),
              l(')'),
              l('{'),
              l('}'),
              l('['),
              l(']'),
              l('|'),
              l('&'),
              l('<'),
              l('>'),
              l(','),
              l(';'),
              l('*'),
              l('?'),
              l('!'),
              l('='),
              l(':'),
              l('...'),
              l('.'),
              l('#'),
              l('~'),
              l('/'),
              l('@'),
              b('undefined'),
              b('null'),
              b('function'),
              b('this'),
              b('new'),
              b('module'),
              b('event'),
              b('extends'),
              b('external'),
              b('infer'),
              b('typeof'),
              b('keyof'),
              b('readonly'),
              b('import'),
              b('is'),
              b('in'),
              b('asserts'),
              S,
              E,
              _,
            ],
            T = /^\s*\n\s*/;
          class C {
            static create(f) {
              let w = this.read(f);
              f = w.text;
              let D = this.read(f);
              return ((f = D.text), new C(f, void 0, w.token, D.token));
            }
            constructor(f, w, D, q) {
              ((this.text = ''),
                (this.text = f),
                (this.previous = w),
                (this.current = D),
                (this.next = q));
            }
            static read(f, w = !1) {
              ((w = w || T.test(f)), (f = f.trim()));
              for (let D of A) {
                let q = D(f);
                if (q !== null) {
                  let Y = Object.assign(Object.assign({}, q), { startOfLine: w });
                  return ((f = f.slice(Y.text.length)), { text: f, token: Y });
                }
              }
              throw new Error('Unexpected Token ' + f);
            }
            advance() {
              let f = C.read(this.text);
              return new C(f.text, this.current, this.next, f.token);
            }
          }
          function x(c) {
            if (c === void 0) throw new Error('Unexpected undefined');
            if (
              c.type === 'JsdocTypeKeyValue' ||
              c.type === 'JsdocTypeParameterList' ||
              c.type === 'JsdocTypeProperty' ||
              c.type === 'JsdocTypeReadonlyProperty' ||
              c.type === 'JsdocTypeObjectField' ||
              c.type === 'JsdocTypeJsdocObjectField' ||
              c.type === 'JsdocTypeIndexSignature' ||
              c.type === 'JsdocTypeMappedType' ||
              c.type === 'JsdocTypeTypeParameter'
            )
              throw new a(c);
            return c;
          }
          function v(c) {
            return c.type === 'JsdocTypeKeyValue' ? N(c) : x(c);
          }
          function I(c) {
            return c.type === 'JsdocTypeName' ? c : N(c);
          }
          function N(c) {
            if (c.type !== 'JsdocTypeKeyValue') throw new a(c);
            return c;
          }
          function B(c) {
            var f;
            if (c.type === 'JsdocTypeVariadic') {
              if (((f = c.element) === null || f === void 0 ? void 0 : f.type) === 'JsdocTypeName')
                return c;
              throw new a(c);
            }
            if (c.type !== 'JsdocTypeNumber' && c.type !== 'JsdocTypeName') throw new a(c);
            return c;
          }
          function F(c) {
            if (
              c.type === 'JsdocTypeTuple' ||
              (c.type === 'JsdocTypeGeneric' && c.meta.brackets === 'square')
            )
              return c;
            throw new a(c);
          }
          function z(c) {
            return c.type === 'JsdocTypeIndexSignature' || c.type === 'JsdocTypeMappedType';
          }
          var k;
          (function (c) {
            ((c[(c.ALL = 0)] = 'ALL'),
              (c[(c.PARAMETER_LIST = 1)] = 'PARAMETER_LIST'),
              (c[(c.OBJECT = 2)] = 'OBJECT'),
              (c[(c.KEY_VALUE = 3)] = 'KEY_VALUE'),
              (c[(c.INDEX_BRACKETS = 4)] = 'INDEX_BRACKETS'),
              (c[(c.UNION = 5)] = 'UNION'),
              (c[(c.INTERSECTION = 6)] = 'INTERSECTION'),
              (c[(c.PREFIX = 7)] = 'PREFIX'),
              (c[(c.INFIX = 8)] = 'INFIX'),
              (c[(c.TUPLE = 9)] = 'TUPLE'),
              (c[(c.SYMBOL = 10)] = 'SYMBOL'),
              (c[(c.OPTIONAL = 11)] = 'OPTIONAL'),
              (c[(c.NULLABLE = 12)] = 'NULLABLE'),
              (c[(c.KEY_OF_TYPE_OF = 13)] = 'KEY_OF_TYPE_OF'),
              (c[(c.FUNCTION = 14)] = 'FUNCTION'),
              (c[(c.ARROW = 15)] = 'ARROW'),
              (c[(c.ARRAY_BRACKETS = 16)] = 'ARRAY_BRACKETS'),
              (c[(c.GENERIC = 17)] = 'GENERIC'),
              (c[(c.NAME_PATH = 18)] = 'NAME_PATH'),
              (c[(c.PARENTHESIS = 19)] = 'PARENTHESIS'),
              (c[(c.SPECIAL_TYPES = 20)] = 'SPECIAL_TYPES'));
          })(k || (k = {}));
          class R {
            constructor(f, w, D) {
              ((this.grammar = f),
                typeof w == 'string' ? (this._lexer = C.create(w)) : (this._lexer = w),
                (this.baseParser = D));
            }
            get lexer() {
              return this._lexer;
            }
            parse() {
              let f = this.parseType(k.ALL);
              if (this.lexer.current.type !== 'EOF') throw new i(this.lexer.current);
              return f;
            }
            parseType(f) {
              return x(this.parseIntermediateType(f));
            }
            parseIntermediateType(f) {
              let w = this.tryParslets(null, f);
              if (w === null) throw new o(this.lexer.current);
              return this.parseInfixIntermediateType(w, f);
            }
            parseInfixIntermediateType(f, w) {
              let D = this.tryParslets(f, w);
              for (; D !== null;) ((f = D), (D = this.tryParslets(f, w)));
              return f;
            }
            tryParslets(f, w) {
              for (let D of this.grammar) {
                let q = D(this, w, f);
                if (q !== null) return q;
              }
              return null;
            }
            consume(f) {
              return (
                Array.isArray(f) || (f = [f]),
                f.includes(this.lexer.current.type)
                  ? ((this._lexer = this.lexer.advance()), !0)
                  : !1
              );
            }
            acceptLexerState(f) {
              this._lexer = f.lexer;
            }
          }
          function O(c) {
            return c === '}' || c === 'EOF' || c === '|' || c === ',' || c === ')' || c === '>';
          }
          let L = (c, f, w) => {
            let D = c.lexer.current.type,
              q = c.lexer.next.type;
            return (w == null && D === '?' && !O(q)) || (w != null && D === '?')
              ? (c.consume('?'),
                w == null
                  ? {
                      type: 'JsdocTypeNullable',
                      element: c.parseType(k.NULLABLE),
                      meta: { position: 'prefix' },
                    }
                  : { type: 'JsdocTypeNullable', element: x(w), meta: { position: 'suffix' } })
              : null;
          };
          function $(c) {
            let f = (w, D, q) => {
              let Y = w.lexer.current.type,
                ae = w.lexer.next.type;
              if (q === null) {
                if ('parsePrefix' in c && c.accept(Y, ae)) return c.parsePrefix(w);
              } else if ('parseInfix' in c && c.precedence > D && c.accept(Y, ae))
                return c.parseInfix(w, q);
              return null;
            };
            return (Object.defineProperty(f, 'name', { value: c.name }), f);
          }
          let M = $({
              name: 'optionalParslet',
              accept: (c) => c === '=',
              precedence: k.OPTIONAL,
              parsePrefix: (c) => (
                c.consume('='),
                {
                  type: 'JsdocTypeOptional',
                  element: c.parseType(k.OPTIONAL),
                  meta: { position: 'prefix' },
                }
              ),
              parseInfix: (c, f) => (
                c.consume('='),
                { type: 'JsdocTypeOptional', element: x(f), meta: { position: 'suffix' } }
              ),
            }),
            J = $({
              name: 'numberParslet',
              accept: (c) => c === 'Number',
              parsePrefix: (c) => {
                let f = parseFloat(c.lexer.current.text);
                return (c.consume('Number'), { type: 'JsdocTypeNumber', value: f });
              },
            }),
            j = $({
              name: 'parenthesisParslet',
              accept: (c) => c === '(',
              parsePrefix: (c) => {
                if ((c.consume('('), c.consume(')')))
                  return { type: 'JsdocTypeParameterList', elements: [] };
                let f = c.parseIntermediateType(k.ALL);
                if (!c.consume(')')) throw new Error('Unterminated parenthesis');
                return f.type === 'JsdocTypeParameterList'
                  ? f
                  : f.type === 'JsdocTypeKeyValue'
                    ? { type: 'JsdocTypeParameterList', elements: [f] }
                    : { type: 'JsdocTypeParenthesis', element: x(f) };
              },
            }),
            W = $({
              name: 'specialTypesParslet',
              accept: (c, f) =>
                (c === '?' && O(f)) || c === 'null' || c === 'undefined' || c === '*',
              parsePrefix: (c) => {
                if (c.consume('null')) return { type: 'JsdocTypeNull' };
                if (c.consume('undefined')) return { type: 'JsdocTypeUndefined' };
                if (c.consume('*')) return { type: 'JsdocTypeAny' };
                if (c.consume('?')) return { type: 'JsdocTypeUnknown' };
                throw new Error('Unacceptable token: ' + c.lexer.current.text);
              },
            }),
            Z = $({
              name: 'notNullableParslet',
              accept: (c) => c === '!',
              precedence: k.NULLABLE,
              parsePrefix: (c) => (
                c.consume('!'),
                {
                  type: 'JsdocTypeNotNullable',
                  element: c.parseType(k.NULLABLE),
                  meta: { position: 'prefix' },
                }
              ),
              parseInfix: (c, f) => (
                c.consume('!'),
                { type: 'JsdocTypeNotNullable', element: x(f), meta: { position: 'suffix' } }
              ),
            });
          function ue({ allowTrailingComma: c }) {
            return $({
              name: 'parameterListParslet',
              accept: (f) => f === ',',
              precedence: k.PARAMETER_LIST,
              parseInfix: (f, w) => {
                let D = [v(w)];
                f.consume(',');
                do
                  try {
                    let q = f.parseIntermediateType(k.PARAMETER_LIST);
                    D.push(v(q));
                  } catch (q) {
                    if (q instanceof o) break;
                    throw q;
                  }
                while (f.consume(','));
                if (D.length > 0 && D.slice(0, -1).some((q) => q.type === 'JsdocTypeVariadic'))
                  throw new Error('Only the last parameter may be a rest parameter');
                return { type: 'JsdocTypeParameterList', elements: D };
              },
            });
          }
          let me = $({
              name: 'genericParslet',
              accept: (c, f) => c === '<' || (c === '.' && f === '<'),
              precedence: k.GENERIC,
              parseInfix: (c, f) => {
                let w = c.consume('.');
                c.consume('<');
                let D = [],
                  q = !1;
                if (c.consume('infer')) {
                  q = !0;
                  let Y = c.parseIntermediateType(k.SYMBOL);
                  if (Y.type !== 'JsdocTypeName')
                    throw new a(
                      Y,
                      'A typescript asserts always has to have a name on the left side.',
                    );
                  D.push(Y);
                } else
                  do D.push(c.parseType(k.PARAMETER_LIST));
                  while (c.consume(','));
                if (!c.consume('>')) throw new Error('Unterminated generic parameter list');
                return Object.assign(
                  Object.assign(
                    { type: 'JsdocTypeGeneric', left: x(f), elements: D },
                    q ? { infer: !0 } : {},
                  ),
                  { meta: { brackets: 'angle', dot: w } },
                );
              },
            }),
            ie = $({
              name: 'unionParslet',
              accept: (c) => c === '|',
              precedence: k.UNION,
              parseInfix: (c, f) => {
                c.consume('|');
                let w = [];
                do w.push(c.parseType(k.UNION));
                while (c.consume('|'));
                return { type: 'JsdocTypeUnion', elements: [x(f), ...w] };
              },
            }),
            fe = [L, M, J, j, W, Z, ue({ allowTrailingComma: !0 }), me, ie, M];
          function xe({ allowSquareBracketsOnAnyType: c, allowJsdocNamePaths: f, pathGrammar: w }) {
            return function (D, q, Y) {
              if (Y == null || q >= k.NAME_PATH) return null;
              let ae = D.lexer.current.type,
                Te = D.lexer.next.type;
              if (!(
                (ae === '.' && Te !== '<') ||
                (ae === '[' && (c || Y.type === 'JsdocTypeName')) ||
                (f && (ae === '~' || ae === '#'))
              ))
                return null;
              let Ce,
                He = !1;
              D.consume('.')
                ? (Ce = 'property')
                : D.consume('[')
                  ? ((Ce = 'property-brackets'), (He = !0))
                  : D.consume('~')
                    ? (Ce = 'inner')
                    : (D.consume('#'), (Ce = 'instance'));
              let Ct = w !== null ? new R(w, D.lexer, D) : D,
                pt = Ct.parseIntermediateType(k.NAME_PATH);
              D.acceptLexerState(Ct);
              let Wr;
              switch (pt.type) {
                case 'JsdocTypeName':
                  Wr = { type: 'JsdocTypeProperty', value: pt.value, meta: { quote: void 0 } };
                  break;
                case 'JsdocTypeNumber':
                  Wr = {
                    type: 'JsdocTypeProperty',
                    value: pt.value.toString(10),
                    meta: { quote: void 0 },
                  };
                  break;
                case 'JsdocTypeStringValue':
                  Wr = {
                    type: 'JsdocTypeProperty',
                    value: pt.value,
                    meta: { quote: pt.meta.quote },
                  };
                  break;
                case 'JsdocTypeSpecialNamePath':
                  if (pt.specialType === 'event') Wr = pt;
                  else
                    throw new a(
                      pt,
                      "Type 'JsdocTypeSpecialNamePath' is only allowed with specialType 'event'",
                    );
                  break;
                default:
                  throw new a(
                    pt,
                    "Expecting 'JsdocTypeName', 'JsdocTypeNumber', 'JsdocStringValue' or 'JsdocTypeSpecialNamePath'",
                  );
              }
              if (He && !D.consume(']')) {
                let _s = D.lexer.current;
                throw new Error(
                  `Unterminated square brackets. Next token is '${_s.type}' with text '${_s.text}'`,
                );
              }
              return { type: 'JsdocTypeNamePath', left: x(Y), right: Wr, pathType: Ce };
            };
          }
          function Ie({ allowedAdditionalTokens: c }) {
            return $({
              name: 'nameParslet',
              accept: (f) => f === 'Identifier' || f === 'this' || f === 'new' || c.includes(f),
              parsePrefix: (f) => {
                let { type: w, text: D } = f.lexer.current;
                return (f.consume(w), { type: 'JsdocTypeName', value: D });
              },
            });
          }
          let rt = $({
            name: 'stringValueParslet',
            accept: (c) => c === 'StringValue',
            parsePrefix: (c) => {
              let f = c.lexer.current.text;
              return (
                c.consume('StringValue'),
                {
                  type: 'JsdocTypeStringValue',
                  value: f.slice(1, -1),
                  meta: { quote: f[0] === "'" ? 'single' : 'double' },
                }
              );
            },
          });
          function Ge({ pathGrammar: c, allowedTypes: f }) {
            return $({
              name: 'specialNamePathParslet',
              accept: (w) => f.includes(w),
              parsePrefix: (w) => {
                let D = w.lexer.current.type;
                if ((w.consume(D), !w.consume(':'))) return { type: 'JsdocTypeName', value: D };
                let q,
                  Y = w.lexer.current;
                if (w.consume('StringValue'))
                  q = {
                    type: 'JsdocTypeSpecialNamePath',
                    value: Y.text.slice(1, -1),
                    specialType: D,
                    meta: { quote: Y.text[0] === "'" ? 'single' : 'double' },
                  };
                else {
                  let Ce = '',
                    He = ['Identifier', '@', '/'];
                  for (; He.some((Ct) => w.consume(Ct));) ((Ce += Y.text), (Y = w.lexer.current));
                  q = {
                    type: 'JsdocTypeSpecialNamePath',
                    value: Ce,
                    specialType: D,
                    meta: { quote: void 0 },
                  };
                }
                let ae = new R(c, w.lexer, w),
                  Te = ae.parseInfixIntermediateType(q, k.ALL);
                return (w.acceptLexerState(ae), x(Te));
              },
            });
          }
          let ct = [
              Ie({ allowedAdditionalTokens: ['external', 'module'] }),
              rt,
              J,
              xe({ allowSquareBracketsOnAnyType: !1, allowJsdocNamePaths: !0, pathGrammar: null }),
            ],
            dt = [...ct, Ge({ allowedTypes: ['event'], pathGrammar: ct })];
          function Qt(c) {
            let f;
            if (c.type === 'JsdocTypeParameterList') f = c.elements;
            else if (c.type === 'JsdocTypeParenthesis') f = [c.element];
            else throw new a(c);
            return f.map((w) => v(w));
          }
          function Q(c) {
            let f = Qt(c);
            if (f.some((w) => w.type === 'JsdocTypeKeyValue'))
              throw new Error('No parameter should be named');
            return f;
          }
          function Ne({
            allowNamedParameters: c,
            allowNoReturnType: f,
            allowWithoutParenthesis: w,
            allowNewAsFunctionKeyword: D,
          }) {
            return $({
              name: 'functionParslet',
              accept: (q, Y) => q === 'function' || (D && q === 'new' && Y === '('),
              parsePrefix: (q) => {
                let Y = q.consume('new');
                q.consume('function');
                let ae = q.lexer.current.type === '(';
                if (!ae) {
                  if (!w) throw new Error('function is missing parameter list');
                  return { type: 'JsdocTypeName', value: 'function' };
                }
                let Te = {
                    type: 'JsdocTypeFunction',
                    parameters: [],
                    arrow: !1,
                    constructor: Y,
                    parenthesis: ae,
                  },
                  Ce = q.parseIntermediateType(k.FUNCTION);
                if (c === void 0) Te.parameters = Q(Ce);
                else {
                  if (Y && Ce.type === 'JsdocTypeFunction' && Ce.arrow)
                    return ((Te = Ce), (Te.constructor = !0), Te);
                  Te.parameters = Qt(Ce);
                  for (let He of Te.parameters)
                    if (He.type === 'JsdocTypeKeyValue' && !c.includes(He.key))
                      throw new Error(
                        `only allowed named parameters are ${c.join(', ')} but got ${He.type}`,
                      );
                }
                if (q.consume(':')) Te.returnType = q.parseType(k.PREFIX);
                else if (!f) throw new Error('function is missing return type');
                return Te;
              },
            });
          }
          function De({ allowPostfix: c, allowEnclosingBrackets: f }) {
            return $({
              name: 'variadicParslet',
              accept: (w) => w === '...',
              precedence: k.PREFIX,
              parsePrefix: (w) => {
                w.consume('...');
                let D = f && w.consume('[');
                try {
                  let q = w.parseType(k.PREFIX);
                  if (D && !w.consume(']'))
                    throw new Error("Unterminated variadic type. Missing ']'");
                  return {
                    type: 'JsdocTypeVariadic',
                    element: x(q),
                    meta: { position: 'prefix', squareBrackets: D },
                  };
                } catch (q) {
                  if (q instanceof o) {
                    if (D) throw new Error('Empty square brackets for variadic are not allowed.');
                    return {
                      type: 'JsdocTypeVariadic',
                      meta: { position: void 0, squareBrackets: !1 },
                    };
                  } else throw q;
                }
              },
              parseInfix: c
                ? (w, D) => (
                    w.consume('...'),
                    {
                      type: 'JsdocTypeVariadic',
                      element: x(D),
                      meta: { position: 'suffix', squareBrackets: !1 },
                    }
                  )
                : void 0,
            });
          }
          let Et = $({
              name: 'symbolParslet',
              accept: (c) => c === '(',
              precedence: k.SYMBOL,
              parseInfix: (c, f) => {
                if (f.type !== 'JsdocTypeName')
                  throw new Error("Symbol expects a name on the left side. (Reacting on '(')");
                c.consume('(');
                let w = { type: 'JsdocTypeSymbol', value: f.value };
                if (!c.consume(')')) {
                  let D = c.parseIntermediateType(k.SYMBOL);
                  if (((w.element = B(D)), !c.consume(')')))
                    throw new Error('Symbol does not end after value');
                }
                return w;
              },
            }),
            Jr = $({
              name: 'arrayBracketsParslet',
              precedence: k.ARRAY_BRACKETS,
              accept: (c, f) => c === '[' && f === ']',
              parseInfix: (c, f) => (
                c.consume('['),
                c.consume(']'),
                {
                  type: 'JsdocTypeGeneric',
                  left: { type: 'JsdocTypeName', value: 'Array' },
                  elements: [x(f)],
                  meta: { brackets: 'square', dot: !1 },
                }
              ),
            });
          function qr({ objectFieldGrammar: c, allowKeyTypes: f }) {
            return $({
              name: 'objectParslet',
              accept: (w) => w === '{',
              parsePrefix: (w) => {
                w.consume('{');
                let D = { type: 'JsdocTypeObject', meta: { separator: 'comma' }, elements: [] };
                if (!w.consume('}')) {
                  let q,
                    Y = new R(c, w.lexer, w);
                  for (;;) {
                    Y.acceptLexerState(w);
                    let ae = Y.parseIntermediateType(k.OBJECT);
                    (w.acceptLexerState(Y),
                      ae === void 0 && f && (ae = w.parseIntermediateType(k.OBJECT)));
                    let Te = !1;
                    if (
                      (ae.type === 'JsdocTypeNullable' && ((Te = !0), (ae = ae.element)),
                      ae.type === 'JsdocTypeNumber' ||
                        ae.type === 'JsdocTypeName' ||
                        ae.type === 'JsdocTypeStringValue')
                    ) {
                      let Ce;
                      (ae.type === 'JsdocTypeStringValue' && (Ce = ae.meta.quote),
                        D.elements.push({
                          type: 'JsdocTypeObjectField',
                          key: ae.value.toString(),
                          right: void 0,
                          optional: Te,
                          readonly: !1,
                          meta: { quote: Ce },
                        }));
                    } else if (
                      ae.type === 'JsdocTypeObjectField' ||
                      ae.type === 'JsdocTypeJsdocObjectField'
                    )
                      D.elements.push(ae);
                    else throw new a(ae);
                    if (w.lexer.current.startOfLine)
                      ((q = 'linebreak'), w.consume(',') || w.consume(';'));
                    else if (w.consume(',')) q = 'comma';
                    else if (w.consume(';')) q = 'semicolon';
                    else break;
                    if (w.lexer.current.type === '}') break;
                  }
                  if (
                    ((D.meta.separator = q ?? 'comma'),
                    q === 'linebreak' && (D.meta.propertyIndent = '  '),
                    !w.consume('}'))
                  )
                    throw new Error("Unterminated record type. Missing '}'");
                }
                return D;
              },
            });
          }
          function zr({
            allowSquaredProperties: c,
            allowKeyTypes: f,
            allowReadonly: w,
            allowOptional: D,
          }) {
            return $({
              name: 'objectFieldParslet',
              precedence: k.KEY_VALUE,
              accept: (q) => q === ':',
              parseInfix: (q, Y) => {
                var ae;
                let Te = !1,
                  Ce = !1;
                (D && Y.type === 'JsdocTypeNullable' && ((Te = !0), (Y = Y.element)),
                  w && Y.type === 'JsdocTypeReadonlyProperty' && ((Ce = !0), (Y = Y.element)));
                let He = (ae = q.baseParser) !== null && ae !== void 0 ? ae : q;
                if (
                  (He.acceptLexerState(q),
                  Y.type === 'JsdocTypeNumber' ||
                    Y.type === 'JsdocTypeName' ||
                    Y.type === 'JsdocTypeStringValue' ||
                    z(Y))
                ) {
                  if (z(Y) && !c) throw new a(Y);
                  He.consume(':');
                  let Ct;
                  Y.type === 'JsdocTypeStringValue' && (Ct = Y.meta.quote);
                  let pt = He.parseType(k.KEY_VALUE);
                  return (
                    q.acceptLexerState(He),
                    {
                      type: 'JsdocTypeObjectField',
                      key: z(Y) ? Y : Y.value.toString(),
                      right: pt,
                      optional: Te,
                      readonly: Ce,
                      meta: { quote: Ct },
                    }
                  );
                } else {
                  if (!f) throw new a(Y);
                  He.consume(':');
                  let Ct = He.parseType(k.KEY_VALUE);
                  return (
                    q.acceptLexerState(He),
                    { type: 'JsdocTypeJsdocObjectField', left: x(Y), right: Ct }
                  );
                }
              },
            });
          }
          function Mo({ allowOptional: c, allowVariadic: f }) {
            return $({
              name: 'keyValueParslet',
              precedence: k.KEY_VALUE,
              accept: (w) => w === ':',
              parseInfix: (w, D) => {
                let q = !1,
                  Y = !1;
                if (
                  (c && D.type === 'JsdocTypeNullable' && ((q = !0), (D = D.element)),
                  f &&
                    D.type === 'JsdocTypeVariadic' &&
                    D.element !== void 0 &&
                    ((Y = !0), (D = D.element)),
                  D.type !== 'JsdocTypeName')
                )
                  throw new a(D);
                w.consume(':');
                let ae = w.parseType(k.KEY_VALUE);
                return {
                  type: 'JsdocTypeKeyValue',
                  key: D.value,
                  right: ae,
                  optional: q,
                  variadic: Y,
                };
              },
            });
          }
          let bs = [
              ...fe,
              Ne({
                allowWithoutParenthesis: !0,
                allowNamedParameters: ['this', 'new'],
                allowNoReturnType: !0,
                allowNewAsFunctionKeyword: !1,
              }),
              rt,
              Ge({ allowedTypes: ['module', 'external', 'event'], pathGrammar: dt }),
              De({ allowEnclosingBrackets: !0, allowPostfix: !0 }),
              Ie({ allowedAdditionalTokens: ['keyof'] }),
              Et,
              Jr,
              xe({ allowSquareBracketsOnAnyType: !1, allowJsdocNamePaths: !0, pathGrammar: dt }),
            ],
            ym = [
              ...bs,
              qr({
                objectFieldGrammar: [
                  Ie({ allowedAdditionalTokens: ['typeof', 'module', 'in'] }),
                  zr({
                    allowSquaredProperties: !1,
                    allowKeyTypes: !0,
                    allowOptional: !1,
                    allowReadonly: !1,
                  }),
                  ...bs,
                ],
                allowKeyTypes: !0,
              }),
              Mo({ allowOptional: !0, allowVariadic: !0 }),
            ],
            Es = $({
              name: 'typeOfParslet',
              accept: (c) => c === 'typeof',
              parsePrefix: (c) => (
                c.consume('typeof'),
                { type: 'JsdocTypeTypeof', element: c.parseType(k.KEY_OF_TYPE_OF) }
              ),
            }),
            bm = [
              Ie({
                allowedAdditionalTokens: ['typeof', 'module', 'keyof', 'event', 'external', 'in'],
              }),
              L,
              M,
              rt,
              J,
              zr({
                allowSquaredProperties: !1,
                allowKeyTypes: !1,
                allowOptional: !1,
                allowReadonly: !1,
              }),
            ],
            Em = [
              ...fe,
              qr({ allowKeyTypes: !1, objectFieldGrammar: bm }),
              Ie({ allowedAdditionalTokens: ['event', 'external', 'in'] }),
              Es,
              Ne({
                allowWithoutParenthesis: !1,
                allowNamedParameters: ['this', 'new'],
                allowNoReturnType: !0,
                allowNewAsFunctionKeyword: !1,
              }),
              De({ allowEnclosingBrackets: !1, allowPostfix: !1 }),
              Ie({ allowedAdditionalTokens: ['keyof'] }),
              Ge({ allowedTypes: ['module'], pathGrammar: dt }),
              xe({ allowSquareBracketsOnAnyType: !1, allowJsdocNamePaths: !0, pathGrammar: dt }),
              Mo({ allowOptional: !1, allowVariadic: !1 }),
              Et,
            ],
            Sm = $({
              name: 'assertsParslet',
              accept: (c) => c === 'asserts',
              parsePrefix: (c) => {
                c.consume('asserts');
                let f = c.parseIntermediateType(k.SYMBOL);
                if (f.type !== 'JsdocTypeName')
                  throw new a(
                    f,
                    'A typescript asserts always has to have a name on the left side.',
                  );
                return c.consume('is')
                  ? {
                      type: 'JsdocTypeAsserts',
                      left: f,
                      right: x(c.parseIntermediateType(k.INFIX)),
                    }
                  : { type: 'JsdocTypeAssertsPlain', element: f };
              },
            });
          function Am({ allowQuestionMark: c }) {
            return $({
              name: 'tupleParslet',
              accept: (f) => f === '[',
              parsePrefix: (f) => {
                f.consume('[');
                let w = { type: 'JsdocTypeTuple', elements: [] };
                if (f.consume(']')) return w;
                let D = f.parseIntermediateType(k.ALL);
                if (
                  (D.type === 'JsdocTypeParameterList'
                    ? D.elements[0].type === 'JsdocTypeKeyValue'
                      ? (w.elements = D.elements.map(N))
                      : (w.elements = D.elements.map(x))
                    : D.type === 'JsdocTypeKeyValue'
                      ? (w.elements = [N(D)])
                      : (w.elements = [x(D)]),
                  !f.consume(']'))
                )
                  throw new Error("Unterminated '['");
                if (w.elements.some((q) => q.type === 'JsdocTypeUnknown'))
                  throw new Error('Question mark in tuple not allowed');
                return w;
              },
            });
          }
          let Tm = $({
              name: 'keyOfParslet',
              accept: (c) => c === 'keyof',
              parsePrefix: (c) => (
                c.consume('keyof'),
                { type: 'JsdocTypeKeyof', element: x(c.parseType(k.KEY_OF_TYPE_OF)) }
              ),
            }),
            wm = $({
              name: 'importParslet',
              accept: (c) => c === 'import',
              parsePrefix: (c) => {
                if ((c.consume('import'), !c.consume('(')))
                  throw new Error('Missing parenthesis after import keyword');
                let f = c.parseType(k.PREFIX);
                if (f.type !== 'JsdocTypeStringValue')
                  throw new Error('Only string values are allowed as paths for imports');
                if (!c.consume(')'))
                  throw new Error('Missing closing parenthesis after import keyword');
                return { type: 'JsdocTypeImport', element: f };
              },
            }),
            _m = $({
              name: 'readonlyPropertyParslet',
              accept: (c) => c === 'readonly',
              parsePrefix: (c) => (
                c.consume('readonly'),
                { type: 'JsdocTypeReadonlyProperty', element: c.parseIntermediateType(k.KEY_VALUE) }
              ),
            }),
            vm = $({
              name: 'arrowFunctionParslet',
              precedence: k.ARROW,
              accept: (c) => c === '=>',
              parseInfix: (c, f) => (
                c.consume('=>'),
                {
                  type: 'JsdocTypeFunction',
                  parameters: Qt(f).map(I),
                  arrow: !0,
                  constructor: !1,
                  parenthesis: !0,
                  returnType: c.parseType(k.OBJECT),
                }
              ),
            }),
            xm = $({
              name: 'genericArrowFunctionParslet',
              accept: (c) => c === '<',
              parsePrefix: (c) => {
                let f = [];
                c.consume('<');
                do {
                  let D,
                    q = c.parseIntermediateType(k.SYMBOL);
                  if (
                    (q.type === 'JsdocTypeOptional' &&
                      ((q = q.element), (D = c.parseType(k.SYMBOL))),
                    q.type !== 'JsdocTypeName')
                  )
                    throw new a(q);
                  let Y;
                  c.consume('extends') &&
                    ((Y = c.parseType(k.SYMBOL)),
                    Y.type === 'JsdocTypeOptional' &&
                      ((Y = Y.element), (D = c.parseType(k.SYMBOL))));
                  let ae = { type: 'JsdocTypeTypeParameter', name: q };
                  if (
                    (Y !== void 0 && (ae.constraint = Y),
                    D !== void 0 && (ae.defaultValue = D),
                    f.push(ae),
                    c.consume('>'))
                  )
                    break;
                } while (c.consume(','));
                let w = c.parseIntermediateType(k.SYMBOL);
                return ((w.typeParameters = f), w);
              },
            }),
            Cm = $({
              name: 'intersectionParslet',
              accept: (c) => c === '&',
              precedence: k.INTERSECTION,
              parseInfix: (c, f) => {
                c.consume('&');
                let w = [];
                do w.push(c.parseType(k.INTERSECTION));
                while (c.consume('&'));
                return { type: 'JsdocTypeIntersection', elements: [x(f), ...w] };
              },
            }),
            Om = $({
              name: 'predicateParslet',
              precedence: k.INFIX,
              accept: (c) => c === 'is',
              parseInfix: (c, f) => {
                if (f.type !== 'JsdocTypeName')
                  throw new a(
                    f,
                    'A typescript predicate always has to have a name on the left side.',
                  );
                return (
                  c.consume('is'),
                  {
                    type: 'JsdocTypePredicate',
                    left: f,
                    right: x(c.parseIntermediateType(k.INFIX)),
                  }
                );
              },
            }),
            Rm = $({
              name: 'objectSquareBracketPropertyParslet',
              accept: (c) => c === '[',
              parsePrefix: (c) => {
                if (c.baseParser === void 0) throw new Error('Only allowed inside object grammar');
                c.consume('[');
                let f = c.lexer.current.text;
                c.consume('Identifier');
                let w;
                if (c.consume(':')) {
                  let D = c.baseParser;
                  (D.acceptLexerState(c),
                    (w = {
                      type: 'JsdocTypeIndexSignature',
                      key: f,
                      right: D.parseType(k.INDEX_BRACKETS),
                    }),
                    c.acceptLexerState(D));
                } else if (c.consume('in')) {
                  let D = c.baseParser;
                  (D.acceptLexerState(c),
                    (w = {
                      type: 'JsdocTypeMappedType',
                      key: f,
                      right: D.parseType(k.ARRAY_BRACKETS),
                    }),
                    c.acceptLexerState(D));
                } else throw new Error("Missing ':' or 'in' inside square bracketed property.");
                if (!c.consume(']')) throw new Error('Unterminated square brackets');
                return w;
              },
            }),
            Im = $({
              name: 'readonlyArrayParslet',
              accept: (c) => c === 'readonly',
              parsePrefix: (c) => (
                c.consume('readonly'),
                { type: 'JsdocTypeReadonlyArray', element: F(c.parseIntermediateType(k.ALL)) }
              ),
            }),
            Dm = $({
              name: 'conditionalParslet',
              precedence: k.INFIX,
              accept: (c) => c === 'extends',
              parseInfix: (c, f) => {
                c.consume('extends');
                let w = c.parseType(k.KEY_OF_TYPE_OF).element,
                  D = c.parseType(k.INFIX);
                return (
                  c.consume(':'),
                  {
                    type: 'JsdocTypeConditional',
                    checksType: x(f),
                    extendsType: w,
                    trueType: D,
                    falseType: c.parseType(k.INFIX),
                  }
                );
              },
            }),
            Pm = [
              _m,
              Ie({
                allowedAdditionalTokens: ['typeof', 'module', 'keyof', 'event', 'external', 'in'],
              }),
              L,
              M,
              rt,
              J,
              zr({
                allowSquaredProperties: !0,
                allowKeyTypes: !1,
                allowOptional: !0,
                allowReadonly: !0,
              }),
              Rm,
            ],
            Nm = [
              ...fe,
              qr({ allowKeyTypes: !1, objectFieldGrammar: Pm }),
              Im,
              Es,
              Tm,
              wm,
              rt,
              Ne({
                allowWithoutParenthesis: !0,
                allowNoReturnType: !1,
                allowNamedParameters: ['this', 'new', 'args'],
                allowNewAsFunctionKeyword: !0,
              }),
              Am({ allowQuestionMark: !1 }),
              De({ allowEnclosingBrackets: !1, allowPostfix: !1 }),
              Sm,
              Dm,
              Ie({ allowedAdditionalTokens: ['event', 'external', 'in'] }),
              Ge({ allowedTypes: ['module'], pathGrammar: dt }),
              Jr,
              vm,
              xm,
              xe({ allowSquareBracketsOnAnyType: !0, allowJsdocNamePaths: !1, pathGrammar: dt }),
              Cm,
              Om,
              Mo({ allowVariadic: !0, allowOptional: !0 }),
            ];
          function Ss(c, f) {
            switch (f) {
              case 'closure':
                return new R(Em, c).parse();
              case 'jsdoc':
                return new R(ym, c).parse();
              case 'typescript':
                return new R(Nm, c).parse();
            }
          }
          function km(c, f = ['typescript', 'closure', 'jsdoc']) {
            let w;
            for (let D of f)
              try {
                return Ss(c, D);
              } catch (q) {
                w = q;
              }
            throw w;
          }
          function Gr(c, f) {
            let w = c[f.type];
            if (w === void 0)
              throw new Error(`In this set of transform rules exists no rule for type ${f.type}.`);
            return w(f, (D) => Gr(c, D));
          }
          function Ae(c) {
            throw new Error(
              'This transform is not available. Are you trying the correct parsing mode?',
            );
          }
          function As(c) {
            let f = { params: [] };
            for (let w of c.parameters)
              w.type === 'JsdocTypeKeyValue'
                ? w.key === 'this'
                  ? (f.this = w.right)
                  : w.key === 'new'
                    ? (f.new = w.right)
                    : f.params.push(w)
                : f.params.push(w);
            return f;
          }
          function An(c, f, w) {
            return c === 'prefix' ? w + f : f + w;
          }
          function Bt(c, f) {
            switch (f) {
              case 'double':
                return `"${c}"`;
              case 'single':
                return `'${c}'`;
              case void 0:
                return c;
            }
          }
          function Ts() {
            return {
              JsdocTypeParenthesis: (c, f) => `(${c.element !== void 0 ? f(c.element) : ''})`,
              JsdocTypeKeyof: (c, f) => `keyof ${f(c.element)}`,
              JsdocTypeFunction: (c, f) => {
                var w;
                if (c.arrow) {
                  if (c.returnType === void 0)
                    throw new Error('Arrow function needs a return type.');
                  let D = `${c.typeParameters !== void 0 ? `<${(w = c.typeParameters.map(f).join(', ')) !== null && w !== void 0 ? w : ''}>` : ''}(${c.parameters.map(f).join(', ')}) => ${f(c.returnType)}`;
                  return (c.constructor && (D = 'new ' + D), D);
                } else {
                  let D = c.constructor ? 'new' : 'function';
                  return (
                    c.parenthesis &&
                      ((D += `(${c.parameters.map(f).join(', ')})`),
                      c.returnType !== void 0 && (D += `: ${f(c.returnType)}`)),
                    D
                  );
                }
              },
              JsdocTypeName: (c) => c.value,
              JsdocTypeTuple: (c, f) => `[${c.elements.map(f).join(', ')}]`,
              JsdocTypeVariadic: (c, f) =>
                c.meta.position === void 0 ? '...' : An(c.meta.position, f(c.element), '...'),
              JsdocTypeNamePath: (c, f) => {
                let w = f(c.left),
                  D = f(c.right);
                switch (c.pathType) {
                  case 'inner':
                    return `${w}~${D}`;
                  case 'instance':
                    return `${w}#${D}`;
                  case 'property':
                    return `${w}.${D}`;
                  case 'property-brackets':
                    return `${w}[${D}]`;
                }
              },
              JsdocTypeStringValue: (c) => Bt(c.value, c.meta.quote),
              JsdocTypeAny: () => '*',
              JsdocTypeGeneric: (c, f) => {
                if (c.meta.brackets === 'square') {
                  let w = c.elements[0],
                    D = f(w);
                  return w.type === 'JsdocTypeUnion' || w.type === 'JsdocTypeIntersection'
                    ? `(${D})[]`
                    : `${D}[]`;
                } else
                  return `${f(c.left)}${c.meta.dot ? '.' : ''}<${c.infer === !0 ? 'infer ' : ''}${c.elements.map(f).join(', ')}>`;
              },
              JsdocTypeImport: (c, f) => `import(${f(c.element)})`,
              JsdocTypeObjectField: (c, f) => {
                let w = '';
                return (
                  c.readonly && (w += 'readonly '),
                  typeof c.key == 'string' ? (w += Bt(c.key, c.meta.quote)) : (w += f(c.key)),
                  c.optional && (w += '?'),
                  c.right === void 0 ? w : w + `: ${f(c.right)}`
                );
              },
              JsdocTypeJsdocObjectField: (c, f) => `${f(c.left)}: ${f(c.right)}`,
              JsdocTypeKeyValue: (c, f) => {
                let w = c.key;
                return (
                  c.optional && (w += '?'),
                  c.variadic && (w = '...' + w),
                  c.right === void 0 ? w : w + `: ${f(c.right)}`
                );
              },
              JsdocTypeSpecialNamePath: (c) => `${c.specialType}:${Bt(c.value, c.meta.quote)}`,
              JsdocTypeNotNullable: (c, f) => An(c.meta.position, f(c.element), '!'),
              JsdocTypeNull: () => 'null',
              JsdocTypeNullable: (c, f) => An(c.meta.position, f(c.element), '?'),
              JsdocTypeNumber: (c) => c.value.toString(),
              JsdocTypeObject: (c, f) => {
                var w, D;
                return `{${
                  (c.meta.separator === 'linebreak' && c.elements.length > 1
                    ? `
` + ((w = c.meta.propertyIndent) !== null && w !== void 0 ? w : '')
                    : '') +
                  c.elements.map(f).join(
                    c.meta.separator === 'comma'
                      ? ', '
                      : c.meta.separator === 'linebreak'
                        ? `
` + ((D = c.meta.propertyIndent) !== null && D !== void 0 ? D : '')
                        : '; ',
                  ) +
                  (c.meta.separator === 'linebreak' && c.elements.length > 1
                    ? `
`
                    : '')
                }}`;
              },
              JsdocTypeOptional: (c, f) => An(c.meta.position, f(c.element), '='),
              JsdocTypeSymbol: (c, f) => `${c.value}(${c.element !== void 0 ? f(c.element) : ''})`,
              JsdocTypeTypeof: (c, f) => `typeof ${f(c.element)}`,
              JsdocTypeUndefined: () => 'undefined',
              JsdocTypeUnion: (c, f) => c.elements.map(f).join(' | '),
              JsdocTypeUnknown: () => '?',
              JsdocTypeIntersection: (c, f) => c.elements.map(f).join(' & '),
              JsdocTypeProperty: (c) => Bt(c.value, c.meta.quote),
              JsdocTypePredicate: (c, f) => `${f(c.left)} is ${f(c.right)}`,
              JsdocTypeIndexSignature: (c, f) => `[${c.key}: ${f(c.right)}]`,
              JsdocTypeMappedType: (c, f) => `[${c.key} in ${f(c.right)}]`,
              JsdocTypeAsserts: (c, f) => `asserts ${f(c.left)} is ${f(c.right)}`,
              JsdocTypeReadonlyArray: (c, f) => `readonly ${f(c.element)}`,
              JsdocTypeAssertsPlain: (c, f) => `asserts ${f(c.element)}`,
              JsdocTypeConditional: (c, f) =>
                `${f(c.checksType)} extends ${f(c.extendsType)} ? ${f(c.trueType)} : ${f(c.falseType)}`,
              JsdocTypeTypeParameter: (c, f) =>
                `${f(c.name)}${c.constraint !== void 0 ? ` extends ${f(c.constraint)}` : ''}${c.defaultValue !== void 0 ? ` = ${f(c.defaultValue)}` : ''}`,
            };
          }
          let Fm = Ts();
          function Lm(c) {
            return Gr(Fm, c);
          }
          let Bm = [
            'null',
            'true',
            'false',
            'break',
            'case',
            'catch',
            'class',
            'const',
            'continue',
            'debugger',
            'default',
            'delete',
            'do',
            'else',
            'export',
            'extends',
            'finally',
            'for',
            'function',
            'if',
            'import',
            'in',
            'instanceof',
            'new',
            'return',
            'super',
            'switch',
            'this',
            'throw',
            'try',
            'typeof',
            'var',
            'void',
            'while',
            'with',
            'yield',
          ];
          function Mt(c) {
            let f = { type: 'NameExpression', name: c };
            return (Bm.includes(c) && (f.reservedWord = !0), f);
          }
          let Mm = {
            JsdocTypeOptional: (c, f) => {
              let w = f(c.element);
              return ((w.optional = !0), w);
            },
            JsdocTypeNullable: (c, f) => {
              let w = f(c.element);
              return ((w.nullable = !0), w);
            },
            JsdocTypeNotNullable: (c, f) => {
              let w = f(c.element);
              return ((w.nullable = !1), w);
            },
            JsdocTypeVariadic: (c, f) => {
              if (c.element === void 0)
                throw new Error('dots without value are not allowed in catharsis mode');
              let w = f(c.element);
              return ((w.repeatable = !0), w);
            },
            JsdocTypeAny: () => ({ type: 'AllLiteral' }),
            JsdocTypeNull: () => ({ type: 'NullLiteral' }),
            JsdocTypeStringValue: (c) => Mt(Bt(c.value, c.meta.quote)),
            JsdocTypeUndefined: () => ({ type: 'UndefinedLiteral' }),
            JsdocTypeUnknown: () => ({ type: 'UnknownLiteral' }),
            JsdocTypeFunction: (c, f) => {
              let w = As(c),
                D = { type: 'FunctionType', params: w.params.map(f) };
              return (
                w.this !== void 0 && (D.this = f(w.this)),
                w.new !== void 0 && (D.new = f(w.new)),
                c.returnType !== void 0 && (D.result = f(c.returnType)),
                D
              );
            },
            JsdocTypeGeneric: (c, f) => ({
              type: 'TypeApplication',
              applications: c.elements.map((w) => f(w)),
              expression: f(c.left),
            }),
            JsdocTypeSpecialNamePath: (c) => Mt(c.specialType + ':' + Bt(c.value, c.meta.quote)),
            JsdocTypeName: (c) =>
              c.value !== 'function' ? Mt(c.value) : { type: 'FunctionType', params: [] },
            JsdocTypeNumber: (c) => Mt(c.value.toString()),
            JsdocTypeObject: (c, f) => {
              let w = { type: 'RecordType', fields: [] };
              for (let D of c.elements)
                D.type !== 'JsdocTypeObjectField' && D.type !== 'JsdocTypeJsdocObjectField'
                  ? w.fields.push({ type: 'FieldType', key: f(D), value: void 0 })
                  : w.fields.push(f(D));
              return w;
            },
            JsdocTypeObjectField: (c, f) => {
              if (typeof c.key != 'string')
                throw new Error('Index signatures and mapped types are not supported');
              return {
                type: 'FieldType',
                key: Mt(Bt(c.key, c.meta.quote)),
                value: c.right === void 0 ? void 0 : f(c.right),
              };
            },
            JsdocTypeJsdocObjectField: (c, f) => ({
              type: 'FieldType',
              key: f(c.left),
              value: f(c.right),
            }),
            JsdocTypeUnion: (c, f) => ({
              type: 'TypeUnion',
              elements: c.elements.map((w) => f(w)),
            }),
            JsdocTypeKeyValue: (c, f) => ({
              type: 'FieldType',
              key: Mt(c.key),
              value: c.right === void 0 ? void 0 : f(c.right),
            }),
            JsdocTypeNamePath: (c, f) => {
              let w = f(c.left),
                D;
              c.right.type === 'JsdocTypeSpecialNamePath'
                ? (D = f(c.right).name)
                : (D = Bt(c.right.value, c.right.meta.quote));
              let q = c.pathType === 'inner' ? '~' : c.pathType === 'instance' ? '#' : '.';
              return Mt(`${w.name}${q}${D}`);
            },
            JsdocTypeSymbol: (c) => {
              let f = '',
                w = c.element,
                D = !1;
              return (
                w?.type === 'JsdocTypeVariadic' &&
                  (w.meta.position === 'prefix' ? (f = '...') : (D = !0), (w = w.element)),
                w?.type === 'JsdocTypeName'
                  ? (f += w.value)
                  : w?.type === 'JsdocTypeNumber' && (f += w.value.toString()),
                D && (f += '...'),
                Mt(`${c.value}(${f})`)
              );
            },
            JsdocTypeParenthesis: (c, f) => f(x(c.element)),
            JsdocTypeMappedType: Ae,
            JsdocTypeIndexSignature: Ae,
            JsdocTypeImport: Ae,
            JsdocTypeKeyof: Ae,
            JsdocTypeTuple: Ae,
            JsdocTypeTypeof: Ae,
            JsdocTypeIntersection: Ae,
            JsdocTypeProperty: Ae,
            JsdocTypePredicate: Ae,
            JsdocTypeAsserts: Ae,
            JsdocTypeReadonlyArray: Ae,
            JsdocTypeAssertsPlain: Ae,
            JsdocTypeConditional: Ae,
            JsdocTypeTypeParameter: Ae,
          };
          function $m(c) {
            return Gr(Mm, c);
          }
          function er(c) {
            switch (c) {
              case void 0:
                return 'none';
              case 'single':
                return 'single';
              case 'double':
                return 'double';
            }
          }
          function jm(c) {
            switch (c) {
              case 'inner':
                return 'INNER_MEMBER';
              case 'instance':
                return 'INSTANCE_MEMBER';
              case 'property':
                return 'MEMBER';
              case 'property-brackets':
                return 'MEMBER';
            }
          }
          function $o(c, f) {
            return f.length === 2
              ? { type: c, left: f[0], right: f[1] }
              : { type: c, left: f[0], right: $o(c, f.slice(1)) };
          }
          let Um = {
            JsdocTypeOptional: (c, f) => ({
              type: 'OPTIONAL',
              value: f(c.element),
              meta: {
                syntax: c.meta.position === 'prefix' ? 'PREFIX_EQUAL_SIGN' : 'SUFFIX_EQUALS_SIGN',
              },
            }),
            JsdocTypeNullable: (c, f) => ({
              type: 'NULLABLE',
              value: f(c.element),
              meta: {
                syntax:
                  c.meta.position === 'prefix' ? 'PREFIX_QUESTION_MARK' : 'SUFFIX_QUESTION_MARK',
              },
            }),
            JsdocTypeNotNullable: (c, f) => ({
              type: 'NOT_NULLABLE',
              value: f(c.element),
              meta: { syntax: c.meta.position === 'prefix' ? 'PREFIX_BANG' : 'SUFFIX_BANG' },
            }),
            JsdocTypeVariadic: (c, f) => {
              let w = {
                type: 'VARIADIC',
                meta: {
                  syntax:
                    c.meta.position === 'prefix'
                      ? 'PREFIX_DOTS'
                      : c.meta.position === 'suffix'
                        ? 'SUFFIX_DOTS'
                        : 'ONLY_DOTS',
                },
              };
              return (c.element !== void 0 && (w.value = f(c.element)), w);
            },
            JsdocTypeName: (c) => ({ type: 'NAME', name: c.value }),
            JsdocTypeTypeof: (c, f) => ({ type: 'TYPE_QUERY', name: f(c.element) }),
            JsdocTypeTuple: (c, f) => ({ type: 'TUPLE', entries: c.elements.map(f) }),
            JsdocTypeKeyof: (c, f) => ({ type: 'KEY_QUERY', value: f(c.element) }),
            JsdocTypeImport: (c) => ({
              type: 'IMPORT',
              path: {
                type: 'STRING_VALUE',
                quoteStyle: er(c.element.meta.quote),
                string: c.element.value,
              },
            }),
            JsdocTypeUndefined: () => ({ type: 'NAME', name: 'undefined' }),
            JsdocTypeAny: () => ({ type: 'ANY' }),
            JsdocTypeFunction: (c, f) => {
              let w = As(c),
                D = {
                  type: c.arrow ? 'ARROW' : 'FUNCTION',
                  params: w.params.map((q) => {
                    if (q.type === 'JsdocTypeKeyValue') {
                      if (q.right === void 0)
                        throw new Error(
                          "Function parameter without ':' is not expected to be 'KEY_VALUE'",
                        );
                      return { type: 'NAMED_PARAMETER', name: q.key, typeName: f(q.right) };
                    } else return f(q);
                  }),
                  new: null,
                  returns: null,
                };
              return (
                w.this !== void 0 ? (D.this = f(w.this)) : c.arrow || (D.this = null),
                w.new !== void 0 && (D.new = f(w.new)),
                c.returnType !== void 0 && (D.returns = f(c.returnType)),
                D
              );
            },
            JsdocTypeGeneric: (c, f) => {
              let w = {
                type: 'GENERIC',
                subject: f(c.left),
                objects: c.elements.map(f),
                meta: {
                  syntax:
                    c.meta.brackets === 'square'
                      ? 'SQUARE_BRACKET'
                      : c.meta.dot
                        ? 'ANGLE_BRACKET_WITH_DOT'
                        : 'ANGLE_BRACKET',
                },
              };
              return (
                c.meta.brackets === 'square' &&
                  c.elements[0].type === 'JsdocTypeFunction' &&
                  !c.elements[0].parenthesis &&
                  (w.objects[0] = { type: 'NAME', name: 'function' }),
                w
              );
            },
            JsdocTypeObjectField: (c, f) => {
              if (typeof c.key != 'string')
                throw new Error('Index signatures and mapped types are not supported');
              if (c.right === void 0)
                return {
                  type: 'RECORD_ENTRY',
                  key: c.key,
                  quoteStyle: er(c.meta.quote),
                  value: null,
                  readonly: !1,
                };
              let w = f(c.right);
              return (
                c.optional &&
                  (w = {
                    type: 'OPTIONAL',
                    value: w,
                    meta: { syntax: 'SUFFIX_KEY_QUESTION_MARK' },
                  }),
                {
                  type: 'RECORD_ENTRY',
                  key: c.key.toString(),
                  quoteStyle: er(c.meta.quote),
                  value: w,
                  readonly: !1,
                }
              );
            },
            JsdocTypeJsdocObjectField: () => {
              throw new Error('Keys may not be typed in jsdoctypeparser.');
            },
            JsdocTypeKeyValue: (c, f) => {
              if (c.right === void 0)
                return {
                  type: 'RECORD_ENTRY',
                  key: c.key,
                  quoteStyle: 'none',
                  value: null,
                  readonly: !1,
                };
              let w = f(c.right);
              return (
                c.optional &&
                  (w = {
                    type: 'OPTIONAL',
                    value: w,
                    meta: { syntax: 'SUFFIX_KEY_QUESTION_MARK' },
                  }),
                { type: 'RECORD_ENTRY', key: c.key, quoteStyle: 'none', value: w, readonly: !1 }
              );
            },
            JsdocTypeObject: (c, f) => {
              let w = [];
              for (let D of c.elements)
                (D.type === 'JsdocTypeObjectField' || D.type === 'JsdocTypeJsdocObjectField') &&
                  w.push(f(D));
              return { type: 'RECORD', entries: w };
            },
            JsdocTypeSpecialNamePath: (c) => {
              if (c.specialType !== 'module')
                throw new Error(
                  `jsdoctypeparser does not support type ${c.specialType} at this point.`,
                );
              return {
                type: 'MODULE',
                value: { type: 'FILE_PATH', quoteStyle: er(c.meta.quote), path: c.value },
              };
            },
            JsdocTypeNamePath: (c, f) => {
              let w = !1,
                D,
                q;
              c.right.type === 'JsdocTypeSpecialNamePath' && c.right.specialType === 'event'
                ? ((w = !0), (D = c.right.value), (q = er(c.right.meta.quote)))
                : ((D = c.right.value), (q = er(c.right.meta.quote)));
              let Y = {
                type: jm(c.pathType),
                owner: f(c.left),
                name: D,
                quoteStyle: q,
                hasEventPrefix: w,
              };
              if (Y.owner.type === 'MODULE') {
                let ae = Y.owner;
                return ((Y.owner = Y.owner.value), (ae.value = Y), ae);
              } else return Y;
            },
            JsdocTypeUnion: (c, f) => $o('UNION', c.elements.map(f)),
            JsdocTypeParenthesis: (c, f) => ({ type: 'PARENTHESIS', value: f(x(c.element)) }),
            JsdocTypeNull: () => ({ type: 'NAME', name: 'null' }),
            JsdocTypeUnknown: () => ({ type: 'UNKNOWN' }),
            JsdocTypeStringValue: (c) => ({
              type: 'STRING_VALUE',
              quoteStyle: er(c.meta.quote),
              string: c.value,
            }),
            JsdocTypeIntersection: (c, f) => $o('INTERSECTION', c.elements.map(f)),
            JsdocTypeNumber: (c) => ({ type: 'NUMBER_VALUE', number: c.value.toString() }),
            JsdocTypeSymbol: Ae,
            JsdocTypeProperty: Ae,
            JsdocTypePredicate: Ae,
            JsdocTypeMappedType: Ae,
            JsdocTypeIndexSignature: Ae,
            JsdocTypeAsserts: Ae,
            JsdocTypeReadonlyArray: Ae,
            JsdocTypeAssertsPlain: Ae,
            JsdocTypeConditional: Ae,
            JsdocTypeTypeParameter: Ae,
          };
          function Vm(c) {
            return Gr(Um, c);
          }
          function Hm() {
            return {
              JsdocTypeIntersection: (c, f) => ({
                type: 'JsdocTypeIntersection',
                elements: c.elements.map(f),
              }),
              JsdocTypeGeneric: (c, f) => ({
                type: 'JsdocTypeGeneric',
                left: f(c.left),
                elements: c.elements.map(f),
                meta: { dot: c.meta.dot, brackets: c.meta.brackets },
              }),
              JsdocTypeNullable: (c) => c,
              JsdocTypeUnion: (c, f) => ({ type: 'JsdocTypeUnion', elements: c.elements.map(f) }),
              JsdocTypeUnknown: (c) => c,
              JsdocTypeUndefined: (c) => c,
              JsdocTypeTypeof: (c, f) => ({ type: 'JsdocTypeTypeof', element: f(c.element) }),
              JsdocTypeSymbol: (c, f) => {
                let w = { type: 'JsdocTypeSymbol', value: c.value };
                return (c.element !== void 0 && (w.element = f(c.element)), w);
              },
              JsdocTypeOptional: (c, f) => ({
                type: 'JsdocTypeOptional',
                element: f(c.element),
                meta: { position: c.meta.position },
              }),
              JsdocTypeObject: (c, f) => ({
                type: 'JsdocTypeObject',
                meta: { separator: 'comma' },
                elements: c.elements.map(f),
              }),
              JsdocTypeNumber: (c) => c,
              JsdocTypeNull: (c) => c,
              JsdocTypeNotNullable: (c, f) => ({
                type: 'JsdocTypeNotNullable',
                element: f(c.element),
                meta: { position: c.meta.position },
              }),
              JsdocTypeSpecialNamePath: (c) => c,
              JsdocTypeObjectField: (c, f) => ({
                type: 'JsdocTypeObjectField',
                key: c.key,
                right: c.right === void 0 ? void 0 : f(c.right),
                optional: c.optional,
                readonly: c.readonly,
                meta: c.meta,
              }),
              JsdocTypeJsdocObjectField: (c, f) => ({
                type: 'JsdocTypeJsdocObjectField',
                left: f(c.left),
                right: f(c.right),
              }),
              JsdocTypeKeyValue: (c, f) => ({
                type: 'JsdocTypeKeyValue',
                key: c.key,
                right: c.right === void 0 ? void 0 : f(c.right),
                optional: c.optional,
                variadic: c.variadic,
              }),
              JsdocTypeImport: (c, f) => ({ type: 'JsdocTypeImport', element: f(c.element) }),
              JsdocTypeAny: (c) => c,
              JsdocTypeStringValue: (c) => c,
              JsdocTypeNamePath: (c) => c,
              JsdocTypeVariadic: (c, f) => {
                let w = {
                  type: 'JsdocTypeVariadic',
                  meta: { position: c.meta.position, squareBrackets: c.meta.squareBrackets },
                };
                return (c.element !== void 0 && (w.element = f(c.element)), w);
              },
              JsdocTypeTuple: (c, f) => ({ type: 'JsdocTypeTuple', elements: c.elements.map(f) }),
              JsdocTypeName: (c) => c,
              JsdocTypeFunction: (c, f) => {
                let w = {
                  type: 'JsdocTypeFunction',
                  arrow: c.arrow,
                  parameters: c.parameters.map(f),
                  constructor: c.constructor,
                  parenthesis: c.parenthesis,
                };
                return (c.returnType !== void 0 && (w.returnType = f(c.returnType)), w);
              },
              JsdocTypeKeyof: (c, f) => ({ type: 'JsdocTypeKeyof', element: f(c.element) }),
              JsdocTypeParenthesis: (c, f) => ({
                type: 'JsdocTypeParenthesis',
                element: f(c.element),
              }),
              JsdocTypeProperty: (c) => c,
              JsdocTypePredicate: (c, f) => ({
                type: 'JsdocTypePredicate',
                left: f(c.left),
                right: f(c.right),
              }),
              JsdocTypeIndexSignature: (c, f) => ({
                type: 'JsdocTypeIndexSignature',
                key: c.key,
                right: f(c.right),
              }),
              JsdocTypeMappedType: (c, f) => ({
                type: 'JsdocTypeMappedType',
                key: c.key,
                right: f(c.right),
              }),
              JsdocTypeAsserts: (c, f) => ({
                type: 'JsdocTypeAsserts',
                left: f(c.left),
                right: f(c.right),
              }),
              JsdocTypeReadonlyArray: (c, f) => ({
                type: 'JsdocTypeReadonlyArray',
                element: f(c.element),
              }),
              JsdocTypeAssertsPlain: (c, f) => ({
                type: 'JsdocTypeAssertsPlain',
                element: f(c.element),
              }),
              JsdocTypeConditional: (c, f) => ({
                type: 'JsdocTypeConditional',
                checksType: f(c.checksType),
                extendsType: f(c.extendsType),
                trueType: f(c.trueType),
                falseType: f(c.falseType),
              }),
              JsdocTypeTypeParameter: (c, f) => ({
                type: 'JsdocTypeTypeParameter',
                name: f(c.name),
                constraint: c.constraint !== void 0 ? f(c.constraint) : void 0,
                defaultValue: c.defaultValue !== void 0 ? f(c.defaultValue) : void 0,
              }),
            };
          }
          let ws = {
            JsdocTypeAny: [],
            JsdocTypeFunction: ['parameters', 'returnType'],
            JsdocTypeGeneric: ['left', 'elements'],
            JsdocTypeImport: [],
            JsdocTypeIndexSignature: ['right'],
            JsdocTypeIntersection: ['elements'],
            JsdocTypeKeyof: ['element'],
            JsdocTypeKeyValue: ['right'],
            JsdocTypeMappedType: ['right'],
            JsdocTypeName: [],
            JsdocTypeNamePath: ['left', 'right'],
            JsdocTypeNotNullable: ['element'],
            JsdocTypeNull: [],
            JsdocTypeNullable: ['element'],
            JsdocTypeNumber: [],
            JsdocTypeObject: ['elements'],
            JsdocTypeObjectField: ['right'],
            JsdocTypeJsdocObjectField: ['left', 'right'],
            JsdocTypeOptional: ['element'],
            JsdocTypeParenthesis: ['element'],
            JsdocTypeSpecialNamePath: [],
            JsdocTypeStringValue: [],
            JsdocTypeSymbol: ['element'],
            JsdocTypeTuple: ['elements'],
            JsdocTypeTypeof: ['element'],
            JsdocTypeUndefined: [],
            JsdocTypeUnion: ['elements'],
            JsdocTypeUnknown: [],
            JsdocTypeVariadic: ['element'],
            JsdocTypeProperty: [],
            JsdocTypePredicate: ['left', 'right'],
            JsdocTypeAsserts: ['left', 'right'],
            JsdocTypeReadonlyArray: ['element'],
            JsdocTypeAssertsPlain: ['element'],
            JsdocTypeConditional: ['checksType', 'extendsType', 'trueType', 'falseType'],
            JsdocTypeTypeParameter: ['name', 'constraint', 'defaultValue'],
          };
          function jo(c, f, w, D, q) {
            D?.(c, f, w);
            let Y = ws[c.type];
            for (let ae of Y) {
              let Te = c[ae];
              if (Te !== void 0)
                if (Array.isArray(Te)) for (let Ce of Te) jo(Ce, c, ae, D, q);
                else jo(Te, c, ae, D, q);
            }
            q?.(c, f, w);
          }
          function Jm(c, f, w) {
            jo(c, void 0, void 0, f, w);
          }
          ((r.catharsisTransform = $m),
            (r.identityTransformRules = Hm),
            (r.jtpTransform = Vm),
            (r.parse = Ss),
            (r.stringify = Lm),
            (r.stringifyRules = Ts),
            (r.transform = Gr),
            (r.traverse = Jm),
            (r.tryParse = km),
            (r.visitorKeys = ws));
        });
      },
    });
    var Df = ((e) => (
      (e.JAVASCRIPT = 'JavaScript'),
      (e.FLOW = 'Flow'),
      (e.TYPESCRIPT = 'TypeScript'),
      (e.UNKNOWN = 'Unknown'),
      e
    ))(Df || {});
    var Fa;
    (function (e) {
      ((e.start = '/**'), (e.nostart = '/***'), (e.delim = '*'), (e.end = '*/'));
    })((Fa = Fa || (Fa = {})));
    function Pf(e) {
      return (
        e.start +
        e.delimiter +
        e.postDelimiter +
        e.tag +
        e.postTag +
        e.type +
        e.postType +
        e.name +
        e.postName +
        e.description +
        e.end +
        e.lineEnd
      );
    }
    function Nf() {
      return (e) =>
        e.source.map(({ tokens: t }) => Pf(t)).join(`
`);
    }
    var kf = {
        line: 0,
        start: 0,
        delimiter: 0,
        postDelimiter: 0,
        tag: 0,
        postTag: 0,
        name: 0,
        postName: 0,
        type: 0,
        postType: 0,
        description: 0,
        end: 0,
        lineEnd: 0,
      },
      ZN = Object.keys(kf);
    var QN = Nf(),
      Ff = We(If(), 1);
    var dr = (0, Ff.stringifyRules)(),
      Lf = dr.JsdocTypeObject;
    dr.JsdocTypeAny = () => 'any';
    dr.JsdocTypeObject = (e, t) => `(${Lf(e, t)})`;
    dr.JsdocTypeOptional = (e, t) => t(e.element);
    dr.JsdocTypeNullable = (e, t) => t(e.element);
    dr.JsdocTypeNotNullable = (e, t) => t(e.element);
    dr.JsdocTypeUnion = (e, t) => e.elements.map(t).join('|');
    var Nr = (...e) => {
      let t = {},
        r = e.filter(Boolean),
        n = r.reduce(
          (o, i) => (
            Object.entries(i).forEach(([a, l]) => {
              let s = o[a];
              Array.isArray(l) || typeof s > 'u'
                ? (o[a] = l)
                : ar(l) && ar(s)
                  ? (t[a] = !0)
                  : typeof l < 'u' && (o[a] = l);
            }),
            o
          ),
          {},
        );
      return (
        Object.keys(t).forEach((o) => {
          let i = r
            .filter(Boolean)
            .map((a) => a[o])
            .filter((a) => typeof a < 'u');
          i.every((a) => ar(a)) ? (n[o] = Nr(...i)) : (n[o] = i[i.length - 1]);
        }),
        n
      );
    };
    var nu = 'storybook/docs',
      ek = `${nu}/panel`;
    var Bf = `${nu}/snippet-rendered`,
      Mf = ((e) => ((e.AUTO = 'auto'), (e.CODE = 'code'), (e.DYNAMIC = 'dynamic'), e))(Mf || {});
    U();
    V();
    H();
    tn();
    U();
    V();
    H();
    var $f = !1,
      La = 'Invariant failed';
    function rn(e, t) {
      if (!e) {
        if ($f) throw new Error(La);
        var r = typeof t == 'function' ? t() : t,
          n = r ? ''.concat(La, ': ').concat(r) : La;
        throw new Error(n);
      }
    }
    U();
    V();
    H();
    it();
    var Ba = de({
      '../../node_modules/memoizerific/memoizerific.js'(e, t) {
        (function (r) {
          if (typeof e == 'object' && typeof t < 'u') t.exports = r();
          else if (typeof define == 'function' && define.amd) define([], r);
          else {
            var n;
            (typeof window < 'u' || typeof window < 'u'
              ? (n = window)
              : typeof self < 'u'
                ? (n = self)
                : (n = this),
              (n.memoizerific = r()));
          }
        })(function () {
          var r, n, o;
          return (function i(a, l, s) {
            function d(h, g) {
              if (!l[h]) {
                if (!a[h]) {
                  var E = typeof en == 'function' && en;
                  if (!g && E) return E(h, !0);
                  if (p) return p(h, !0);
                  var b = new Error("Cannot find module '" + h + "'");
                  throw ((b.code = 'MODULE_NOT_FOUND'), b);
                }
                var _ = (l[h] = { exports: {} });
                a[h][0].call(
                  _.exports,
                  function (y) {
                    var S = a[h][1][y];
                    return d(S || y);
                  },
                  _,
                  _.exports,
                  i,
                  a,
                  l,
                  s,
                );
              }
              return l[h].exports;
            }
            for (var p = typeof en == 'function' && en, m = 0; m < s.length; m++) d(s[m]);
            return d;
          })(
            {
              1: [
                function (i, a, l) {
                  a.exports = function (s) {
                    if (typeof Map != 'function' || s) {
                      var d = i('./similar');
                      return new d();
                    } else return new Map();
                  };
                },
                { './similar': 2 },
              ],
              2: [
                function (i, a, l) {
                  function s() {
                    return ((this.list = []), (this.lastItem = void 0), (this.size = 0), this);
                  }
                  ((s.prototype.get = function (d) {
                    var p;
                    if (this.lastItem && this.isEqual(this.lastItem.key, d))
                      return this.lastItem.val;
                    if (((p = this.indexOf(d)), p >= 0))
                      return ((this.lastItem = this.list[p]), this.list[p].val);
                  }),
                    (s.prototype.set = function (d, p) {
                      var m;
                      return this.lastItem && this.isEqual(this.lastItem.key, d)
                        ? ((this.lastItem.val = p), this)
                        : ((m = this.indexOf(d)),
                          m >= 0
                            ? ((this.lastItem = this.list[m]), (this.list[m].val = p), this)
                            : ((this.lastItem = { key: d, val: p }),
                              this.list.push(this.lastItem),
                              this.size++,
                              this));
                    }),
                    (s.prototype.delete = function (d) {
                      var p;
                      if (
                        (this.lastItem &&
                          this.isEqual(this.lastItem.key, d) &&
                          (this.lastItem = void 0),
                        (p = this.indexOf(d)),
                        p >= 0)
                      )
                        return (this.size--, this.list.splice(p, 1)[0]);
                    }),
                    (s.prototype.has = function (d) {
                      var p;
                      return this.lastItem && this.isEqual(this.lastItem.key, d)
                        ? !0
                        : ((p = this.indexOf(d)),
                          p >= 0 ? ((this.lastItem = this.list[p]), !0) : !1);
                    }),
                    (s.prototype.forEach = function (d, p) {
                      var m;
                      for (m = 0; m < this.size; m++)
                        d.call(p || this, this.list[m].val, this.list[m].key, this);
                    }),
                    (s.prototype.indexOf = function (d) {
                      var p;
                      for (p = 0; p < this.size; p++)
                        if (this.isEqual(this.list[p].key, d)) return p;
                      return -1;
                    }),
                    (s.prototype.isEqual = function (d, p) {
                      return d === p || (d !== d && p !== p);
                    }),
                    (a.exports = s));
                },
                {},
              ],
              3: [
                function (i, a, l) {
                  var s = i('map-or-similar');
                  a.exports = function (h) {
                    var g = new s(!1),
                      E = [];
                    return function (b) {
                      var _ = function () {
                        var y = g,
                          S,
                          A,
                          T = arguments.length - 1,
                          C = Array(T + 1),
                          x = !0,
                          v;
                        if ((_.numArgs || _.numArgs === 0) && _.numArgs !== T + 1)
                          throw new Error(
                            'Memoizerific functions should always be called with the same number of arguments',
                          );
                        for (v = 0; v < T; v++) {
                          if (((C[v] = { cacheItem: y, arg: arguments[v] }), y.has(arguments[v]))) {
                            y = y.get(arguments[v]);
                            continue;
                          }
                          ((x = !1), (S = new s(!1)), y.set(arguments[v], S), (y = S));
                        }
                        return (
                          x && (y.has(arguments[T]) ? (A = y.get(arguments[T])) : (x = !1)),
                          x || ((A = b.apply(null, arguments)), y.set(arguments[T], A)),
                          h > 0 &&
                            ((C[T] = { cacheItem: y, arg: arguments[T] }),
                            x ? d(E, C) : E.push(C),
                            E.length > h && p(E.shift())),
                          (_.wasMemoized = x),
                          (_.numArgs = T + 1),
                          A
                        );
                      };
                      return ((_.limit = h), (_.wasMemoized = !1), (_.cache = g), (_.lru = E), _);
                    };
                  };
                  function d(h, g) {
                    var E = h.length,
                      b = g.length,
                      _,
                      y,
                      S;
                    for (y = 0; y < E; y++) {
                      for (_ = !0, S = 0; S < b; S++)
                        if (!m(h[y][S].arg, g[S].arg)) {
                          _ = !1;
                          break;
                        }
                      if (_) break;
                    }
                    h.push(h.splice(y, 1)[0]);
                  }
                  function p(h) {
                    var g = h.length,
                      E = h[g - 1],
                      b,
                      _;
                    for (
                      E.cacheItem.delete(E.arg), _ = g - 2;
                      _ >= 0 && ((E = h[_]), (b = E.cacheItem.get(E.arg)), !b || !b.size);
                      _--
                    )
                      E.cacheItem.delete(E.arg);
                  }
                  function m(h, g) {
                    return h === g || (h !== h && g !== g);
                  }
                },
                { 'map-or-similar': 1 },
              ],
            },
            {},
            [3],
          )(3);
        });
      },
    });
    it();
    U();
    V();
    H();
    var Rk = __STORYBOOK_CHANNELS__,
      {
        Channel: ou,
        HEARTBEAT_INTERVAL: Ik,
        HEARTBEAT_MAX_LATENCY: Dk,
        PostMessageTransport: Pk,
        WebsocketTransport: Nk,
        createBrowserChannel: kk,
      } = __STORYBOOK_CHANNELS__;
    function su() {
      let e = { setHandler: () => {}, send: () => {} };
      return new ou({ transport: e });
    }
    var Vf = class {
        constructor() {
          ((this.getChannel = () => {
            if (!this.channel) {
              let e = su();
              return (this.setChannel(e), e);
            }
            return this.channel;
          }),
            (this.ready = () => this.promise),
            (this.hasChannel = () => !!this.channel),
            (this.setChannel = (e) => {
              ((this.channel = e), this.resolve());
            }),
            (this.promise = new Promise((e) => {
              this.resolve = () => e(this.getChannel());
            })));
        }
      },
      Ma = '__STORYBOOK_ADDONS_PREVIEW';
    function Hf() {
      return (K[Ma] || (K[Ma] = new Vf()), K[Ma]);
    }
    var kr = Hf();
    var Jf = (e, t) => e.length === t.length && e.every((r, n) => r === t[n]),
      lu = () =>
        new Error(`Storybook preview hooks can only be called inside decorators and story functions.

When combining Storybook hooks (e.g. useArgs) with framework hooks (e.g. React's useState, useEffect, useRef) in the same render function, use Storybook's equivalents from 'storybook/preview-api' instead: useState, useEffect, useRef, useMemo, useCallback, useReducer.`);
    function qf() {
      return K.STORYBOOK_HOOKS_CONTEXT || null;
    }
    function uu() {
      let e = qf();
      if (e == null) throw lu();
      return e;
    }
    function zf(e, t, r) {
      let n = uu();
      if (n.currentPhase === 'MOUNT') {
        r != null &&
          !Array.isArray(r) &&
          _e.warn(
            `${e} received a final argument that is not an array (instead, received ${r}). When specified, the final argument must be an array.`,
          );
        let o = { name: e, deps: r };
        return (n.currentHooks.push(o), t(o), o);
      }
      if (n.currentPhase === 'UPDATE') {
        let o = n.getNextHook();
        if (o == null) throw new Error('Rendered more hooks than during the previous render.');
        return (
          o.name !== e &&
            _e.warn(
              `Storybook has detected a change in the order of Hooks${n.currentDecoratorName ? ` called by ${n.currentDecoratorName}` : ''}. This will lead to bugs and errors if not fixed.`,
            ),
          r != null &&
            o.deps == null &&
            _e.warn(
              `${e} received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.`,
            ),
          r != null &&
            o.deps != null &&
            r.length !== o.deps.length &&
            _e.warn(`The final argument passed to ${e} changed size between renders. The order and size of this array must remain constant.
Previous: ${o.deps}
Incoming: ${r}`),
          (r == null || o.deps == null || !Jf(r, o.deps)) && (t(o), (o.deps = r)),
          o
        );
      }
      throw lu();
    }
    function cu(e, t, r) {
      let { memoizedState: n } = zf(
        e,
        (o) => {
          o.memoizedState = t();
        },
        r,
      );
      return n;
    }
    function ja(e, t) {
      return cu('useMemo', e, t);
    }
    function It(e, t) {
      let r = uu(),
        n = cu('useEffect', () => ({ create: e }), t);
      r.currentEffects.includes(n) || r.currentEffects.push(n);
    }
    var sF = We(Ba(), 1);
    var Gf = We(Ba(), 1),
      dF = (0, Gf.default)(1)((e) =>
        Object.values(e).reduce((t, r) => ((t[r.importPath] = t[r.importPath] || r), t), {}),
      );
    var hF = cr`
CSF .story annotations deprecated; annotate story functions directly:
- StoryFn.story.name => StoryFn.storyName
- StoryFn.story.(parameters|decorators) => StoryFn.(parameters|decorators)
See https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations for details and codemod.
`;
    var $a = (e, t, r, n) => {
        let o = typeof e;
        switch (o) {
          case 'boolean':
          case 'string':
          case 'number':
          case 'function':
          case 'symbol':
            return { name: o };
          default:
            break;
        }
        if (e) {
          if (n.has(e)) return n.get(e);
          if (r.has(e))
            return (
              _e.warn(cr`
        We've detected a cycle in arg '${t}'. Args should be JSON-serializable.

        Consider using the mapping feature or fully custom args:
        - Mapping: https://storybook.js.org/docs/writing-stories/args#mapping-to-complex-arg-values
        - Custom args: https://storybook.js.org/docs/essentials/controls#fully-custom-args
      `),
              { name: 'other', value: 'cyclic object' }
            );
          r.add(e);
          let i;
          return (
            Array.isArray(e)
              ? (i = {
                  name: 'array',
                  value: e.length > 0 ? $a(e[0], t, r, n) : { name: 'other', value: 'unknown' },
                })
              : (i = { name: 'object', value: xr(e, (a) => $a(a, t, r, n)) }),
            r.delete(e),
            n.set(e, i),
            i
          );
        }
        return { name: 'object', value: {} };
      },
      Wf = (e) => {
        let { id: t, argTypes: r = {}, initialArgs: n = {} } = e,
          o = new Map(),
          i = xr(n, (l, s) => ({ name: s, type: $a(l, `${t}.${s}`, new Set(), o) })),
          a = xr(r, (l, s) => ({ name: s }));
        return Nr(i, a, r);
      };
    Wf.secondPass = !0;
    var au = (e, t) => (Array.isArray(t) ? t.includes(e) : e.match(t)),
      du = (e, t, r) =>
        !t && !r
          ? e
          : e &&
            Rn(e, (n, o) => {
              let i = n.name || o.toString();
              return !!(!t || au(i, t)) && (!r || !au(i, r));
            }),
      Yf = (e, t, r) => {
        let { type: n, options: o } = e;
        if (n) {
          if (r.color && r.color.test(t)) {
            let i = n.name;
            if (i === 'string') return { control: { type: 'color' } };
            i !== 'enum' &&
              _e.warn(
                `Addon controls: Control of type color only supports string, received "${i}" instead`,
              );
          }
          if (r.date && r.date.test(t)) return { control: { type: 'date' } };
          switch (n.name) {
            case 'array':
              return { control: { type: 'object' } };
            case 'boolean':
              return { control: { type: 'boolean' } };
            case 'string':
              return { control: { type: 'text' } };
            case 'number':
              return { control: { type: 'number' } };
            case 'enum': {
              let { value: i } = n;
              return { control: { type: i?.length <= 5 ? 'radio' : 'select' }, options: i };
            }
            case 'function':
            case 'symbol':
              return null;
            default:
              return { control: { type: o ? 'select' : 'object' } };
          }
        }
      },
      pu = (e) => {
        let {
          argTypes: t,
          parameters: {
            __isArgsStory: r,
            controls: { include: n = null, exclude: o = null, matchers: i = {} } = {},
          },
        } = e;
        if (!r) return t;
        let a = du(t, n, o),
          l = xr(a, (s, d) => s?.type && Yf(s, d.toString(), i));
        return Nr(l, a);
      };
    pu.secondPass = !0;
    var LF = new Error('prepareAborted'),
      { AbortController: BF } = globalThis;
    var { fetch: MF } = K;
    var zF = We(Kn(), 1),
      YF = We(Kn(), 1);
    var { history: KF, document: XF } = K;
    var Kf = We(On(), 1),
      ZF = We(Kn(), 1),
      { document: tL } = K;
    var Xf = ((e) => (
      (e.MAIN = 'MAIN'),
      (e.NOPREVIEW = 'NOPREVIEW'),
      (e.PREPARING_STORY = 'PREPARING_STORY'),
      (e.PREPARING_DOCS = 'PREPARING_DOCS'),
      (e.ERROR = 'ERROR'),
      e
    ))(Xf || {});
    var rL = new Kf.default({ escapeXML: !0 });
    var { document: oL } = K;
    tn();
    U();
    V();
    H();
    var Xn = 'storybook/highlight',
      hu = `${Xn}/add`,
      fu = `${Xn}/remove`,
      gu = `${Xn}/reset`,
      yu = `${Xn}/scroll-into-view`,
      Va = 2147483647,
      Dt = 28;
    U();
    V();
    H();
    U();
    V();
    H();
    U();
    V();
    H();
    tn();
    it();
    var ig = { depth: 10, clearOnStoryChange: !0, limit: 50 };
    var bu = (e, t) => {
        let r = Object.getPrototypeOf(e);
        return !r || t(r) ? r : bu(r, t);
      },
      sg = (e) =>
        !!(
          typeof e == 'object' &&
          e &&
          bu(e, (t) => /^Synthetic(?:Base)?Event$/.test(t.constructor.name)) &&
          typeof e.persist == 'function'
        ),
      lg = (e) => {
        if (sg(e)) {
          let t = Object.create(e.constructor.prototype, Object.getOwnPropertyDescriptors(e));
          t.persist();
          let r = Object.getOwnPropertyDescriptor(t, 'view'),
            n = r?.value;
          return (
            typeof n == 'object' &&
              n?.constructor.name === 'Window' &&
              Object.defineProperty(t, 'view', {
                ...r,
                value: Object.create(n.constructor.prototype),
              }),
            t
          );
        }
        return e;
      };
    function Zn(e, t = {}) {
      let r = { ...ig, ...t },
        n = function (...o) {
          if (t.implicit) {
            let m = (
              '__STORYBOOK_PREVIEW__' in K ? K.__STORYBOOK_PREVIEW__ : void 0
            )?.storyRenders.find((h) => h.phase === 'playing' || h.phase === 'rendering');
            if (m) {
              let h = !globalThis?.FEATURES?.disallowImplicitActionsInRenderV8,
                g = new ka({ phase: m.phase, name: e, deprecated: h });
              if (h) console.warn(g);
              else throw g;
            }
          }
          let i = kr.getChannel(),
            a = Date.now().toString(36) + Math.random().toString(36).substring(2),
            l = 5,
            s = o.map(lg),
            d = o.length > 1 ? s : s[0],
            p = {
              id: a,
              count: 0,
              data: { name: e, args: d },
              options: { ...r, maxDepth: l + (r.depth || 3) },
            };
          i.emit(Or, p);
        };
      return ((n.isAction = !0), (n.implicit = t.implicit), n);
    }
    it();
    U();
    V();
    H();
    var k3 = __STORYBOOK_TEST__,
      {
        buildQueries: F3,
        clearAllMocks: ug,
        configure: L3,
        createEvent: B3,
        expect: M3,
        findAllByAltText: $3,
        findAllByDisplayValue: j3,
        findAllByLabelText: U3,
        findAllByPlaceholderText: V3,
        findAllByRole: H3,
        findAllByTestId: J3,
        findAllByText: q3,
        findAllByTitle: z3,
        findByAltText: G3,
        findByDisplayValue: W3,
        findByLabelText: Y3,
        findByPlaceholderText: K3,
        findByRole: X3,
        findByTestId: Z3,
        findByText: Q3,
        findByTitle: eB,
        fireEvent: tB,
        fn: cg,
        getAllByAltText: rB,
        getAllByDisplayValue: nB,
        getAllByLabelText: oB,
        getAllByPlaceholderText: aB,
        getAllByRole: iB,
        getAllByTestId: sB,
        getAllByText: lB,
        getAllByTitle: uB,
        getByAltText: cB,
        getByDisplayValue: dB,
        getByLabelText: pB,
        getByPlaceholderText: mB,
        getByRole: hB,
        getByTestId: fB,
        getByText: gB,
        getByTitle: yB,
        getConfig: bB,
        getDefaultNormalizer: EB,
        getElementError: SB,
        getNodeText: AB,
        getQueriesForElement: TB,
        getRoles: wB,
        getSuggestedQuery: _B,
        isInaccessible: vB,
        isMockFunction: dg,
        logDOM: xB,
        logRoles: CB,
        mocked: OB,
        mocks: RB,
        onMockCall: Eu,
        prettyDOM: IB,
        prettyFormat: DB,
        queries: PB,
        queryAllByAltText: NB,
        queryAllByAttribute: kB,
        queryAllByDisplayValue: FB,
        queryAllByLabelText: LB,
        queryAllByPlaceholderText: BB,
        queryAllByRole: MB,
        queryAllByTestId: $B,
        queryAllByText: jB,
        queryAllByTitle: UB,
        queryByAltText: VB,
        queryByAttribute: HB,
        queryByDisplayValue: JB,
        queryByLabelText: qB,
        queryByPlaceholderText: zB,
        queryByRole: GB,
        queryByTestId: WB,
        queryByText: YB,
        queryByTitle: KB,
        queryHelpers: XB,
        resetAllMocks: pg,
        restoreAllMocks: mg,
        sb: ZB,
        screen: QB,
        spyOn: eM,
        uninstrumentedUserEvent: hg,
        userEvent: tM,
        waitFor: rM,
        waitForElementToBeRemoved: nM,
        within: fg,
      } = __STORYBOOK_TEST__;
    U();
    V();
    H();
    U();
    V();
    H();
    var gg = {
        reset: [0, 0],
        bold: [1, 22, '\x1B[22m\x1B[1m'],
        dim: [2, 22, '\x1B[22m\x1B[2m'],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29],
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        gray: [90, 39],
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        blackBright: [90, 39],
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39],
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49],
      },
      uc = Object.entries(gg);
    function ao(e) {
      return String(e);
    }
    ao.open = '';
    ao.close = '';
    var lM = uc.reduce((e, [t]) => ((e[t] = ao), e), { isColorSupported: !1 });
    function yg(e = !1) {
      let t = typeof process < 'u' ? process : void 0,
        r = t?.env || {},
        n = t?.argv || [];
      return (
        (!('NO_COLOR' in r || n.includes('--no-color')) &&
          ('FORCE_COLOR' in r ||
            n.includes('--color') ||
            t?.platform === 'win32' ||
            (e && r.TERM !== 'dumb') ||
            'CI' in r)) ||
        (typeof window < 'u' && !!window.chrome)
      );
    }
    function bg(e = !1) {
      let t = yg(e),
        r = (a, l, s, d) => {
          let p = '',
            m = 0;
          do ((p += a.substring(m, d) + s), (m = d + l.length), (d = a.indexOf(l, m)));
          while (~d);
          return p + a.substring(m);
        },
        n = (a, l, s = a) => {
          let d = (p) => {
            let m = String(p),
              h = m.indexOf(l, a.length);
            return ~h ? a + r(m, l, s, h) + l : a + m + l;
          };
          return ((d.open = a), (d.close = l), d);
        },
        o = { isColorSupported: t },
        i = (a) => `\x1B[${a}m`;
      for (let [a, l] of uc) o[a] = t ? n(i(l[0]), i(l[1]), l[2]) : ao;
      return o;
    }
    var Nt = bg();
    function cc(e, t) {
      return (
        t.forEach(function (r) {
          r &&
            typeof r != 'string' &&
            !Array.isArray(r) &&
            Object.keys(r).forEach(function (n) {
              if (n !== 'default' && !(n in e)) {
                var o = Object.getOwnPropertyDescriptor(r, n);
                Object.defineProperty(
                  e,
                  n,
                  o.get
                    ? o
                    : {
                        enumerable: !0,
                        get: function () {
                          return r[n];
                        },
                      },
                );
              }
            });
        }),
        Object.freeze(e)
      );
    }
    function Eg(e, t) {
      let r = Object.keys(e),
        n = t === null ? r : r.sort(t);
      if (Object.getOwnPropertySymbols)
        for (let o of Object.getOwnPropertySymbols(e))
          Object.getOwnPropertyDescriptor(e, o).enumerable && n.push(o);
      return n;
    }
    function ln(e, t, r, n, o, i, a = ': ') {
      let l = '',
        s = 0,
        d = e.next();
      if (!d.done) {
        l += t.spacingOuter;
        let p = r + t.indent;
        for (; !d.done;) {
          if (((l += p), s++ === t.maxWidth)) {
            l += '\u2026';
            break;
          }
          let m = i(d.value[0], t, p, n, o),
            h = i(d.value[1], t, p, n, o);
          ((l += m + a + h),
            (d = e.next()),
            d.done ? t.min || (l += ',') : (l += `,${t.spacingInner}`));
        }
        l += t.spacingOuter + r;
      }
      return l;
    }
    function oi(e, t, r, n, o, i) {
      let a = '',
        l = 0,
        s = e.next();
      if (!s.done) {
        a += t.spacingOuter;
        let d = r + t.indent;
        for (; !s.done;) {
          if (((a += d), l++ === t.maxWidth)) {
            a += '\u2026';
            break;
          }
          ((a += i(s.value, t, d, n, o)),
            (s = e.next()),
            s.done ? t.min || (a += ',') : (a += `,${t.spacingInner}`));
        }
        a += t.spacingOuter + r;
      }
      return a;
    }
    function oo(e, t, r, n, o, i) {
      let a = '';
      e = e instanceof ArrayBuffer ? new DataView(e) : e;
      let l = (d) => d instanceof DataView,
        s = l(e) ? e.byteLength : e.length;
      if (s > 0) {
        a += t.spacingOuter;
        let d = r + t.indent;
        for (let p = 0; p < s; p++) {
          if (((a += d), p === t.maxWidth)) {
            a += '\u2026';
            break;
          }
          ((l(e) || p in e) && (a += i(l(e) ? e.getInt8(p) : e[p], t, d, n, o)),
            p < s - 1 ? (a += `,${t.spacingInner}`) : t.min || (a += ','));
        }
        a += t.spacingOuter + r;
      }
      return a;
    }
    function ai(e, t, r, n, o, i) {
      let a = '',
        l = Eg(e, t.compareKeys);
      if (l.length > 0) {
        a += t.spacingOuter;
        let s = r + t.indent;
        for (let d = 0; d < l.length; d++) {
          let p = l[d],
            m = i(p, t, s, n, o),
            h = i(e[p], t, s, n, o);
          ((a += `${s + m}: ${h}`),
            d < l.length - 1 ? (a += `,${t.spacingInner}`) : t.min || (a += ','));
        }
        a += t.spacingOuter + r;
      }
      return a;
    }
    var Sg =
        typeof Symbol == 'function' && Symbol.for ? Symbol.for('jest.asymmetricMatcher') : 1267621,
      Ha = ' ',
      Ag = (e, t, r, n, o, i) => {
        let a = e.toString();
        if (a === 'ArrayContaining' || a === 'ArrayNotContaining')
          return ++n > t.maxDepth ? `[${a}]` : `${a + Ha}[${oo(e.sample, t, r, n, o, i)}]`;
        if (a === 'ObjectContaining' || a === 'ObjectNotContaining')
          return ++n > t.maxDepth ? `[${a}]` : `${a + Ha}{${ai(e.sample, t, r, n, o, i)}}`;
        if (
          a === 'StringMatching' ||
          a === 'StringNotMatching' ||
          a === 'StringContaining' ||
          a === 'StringNotContaining'
        )
          return a + Ha + i(e.sample, t, r, n, o);
        if (typeof e.toAsymmetricMatcher != 'function')
          throw new TypeError(
            `Asymmetric matcher ${e.constructor.name} does not implement toAsymmetricMatcher()`,
          );
        return e.toAsymmetricMatcher();
      },
      Tg = (e) => e && e.$$typeof === Sg,
      wg = { serialize: Ag, test: Tg },
      _g = ' ',
      dc = new Set(['DOMStringMap', 'NamedNodeMap']),
      vg = /^(?:HTML\w*Collection|NodeList)$/;
    function xg(e) {
      return dc.has(e) || vg.test(e);
    }
    var Cg = (e) => e && e.constructor && !!e.constructor.name && xg(e.constructor.name);
    function Og(e) {
      return e.constructor.name === 'NamedNodeMap';
    }
    var Rg = (e, t, r, n, o, i) => {
        let a = e.constructor.name;
        return ++n > t.maxDepth
          ? `[${a}]`
          : (t.min ? '' : a + _g) +
              (dc.has(a)
                ? `{${ai(Og(e) ? [...e].reduce((l, s) => ((l[s.name] = s.value), l), {}) : { ...e }, t, r, n, o, i)}}`
                : `[${oo([...e], t, r, n, o, i)}]`);
      },
      Ig = { serialize: Rg, test: Cg };
    function pc(e) {
      return e.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }
    function ii(e, t, r, n, o, i, a) {
      let l = n + r.indent,
        s = r.colors;
      return e
        .map((d) => {
          let p = t[d],
            m = a(p, r, l, o, i);
          return (
            typeof p != 'string' &&
              (m.includes(`
`) && (m = r.spacingOuter + l + m + r.spacingOuter + n),
              (m = `{${m}}`)),
            `${r.spacingInner + n + s.prop.open + d + s.prop.close}=${s.value.open}${m}${s.value.close}`
          );
        })
        .join('');
    }
    function si(e, t, r, n, o, i) {
      return e
        .map((a) => t.spacingOuter + r + (typeof a == 'string' ? mc(a, t) : i(a, t, r, n, o)))
        .join('');
    }
    function mc(e, t) {
      let r = t.colors.content;
      return r.open + pc(e) + r.close;
    }
    function Dg(e, t) {
      let r = t.colors.comment;
      return `${r.open}<!--${pc(e)}-->${r.close}`;
    }
    function li(e, t, r, n, o) {
      let i = n.colors.tag;
      return `${i.open}<${e}${t && i.close + t + n.spacingOuter + o + i.open}${r ? `>${i.close}${r}${n.spacingOuter}${o}${i.open}</${e}` : `${t && !n.min ? '' : ' '}/`}>${i.close}`;
    }
    function ui(e, t) {
      let r = t.colors.tag;
      return `${r.open}<${e}${r.close} \u2026${r.open} />${r.close}`;
    }
    var Pg = 1,
      hc = 3,
      fc = 8,
      gc = 11,
      Ng = /^(?:(?:HTML|SVG)\w*)?Element$/;
    function kg(e) {
      try {
        return typeof e.hasAttribute == 'function' && e.hasAttribute('is');
      } catch {
        return !1;
      }
    }
    function Fg(e) {
      let t = e.constructor.name,
        { nodeType: r, tagName: n } = e,
        o = (typeof n == 'string' && n.includes('-')) || kg(e);
      return (
        (r === Pg && (Ng.test(t) || o)) ||
        (r === hc && t === 'Text') ||
        (r === fc && t === 'Comment') ||
        (r === gc && t === 'DocumentFragment')
      );
    }
    var Lg = (e) => {
      var t;
      return (e == null || (t = e.constructor) === null || t === void 0 ? void 0 : t.name) && Fg(e);
    };
    function Bg(e) {
      return e.nodeType === hc;
    }
    function Mg(e) {
      return e.nodeType === fc;
    }
    function Ja(e) {
      return e.nodeType === gc;
    }
    var $g = (e, t, r, n, o, i) => {
        if (Bg(e)) return mc(e.data, t);
        if (Mg(e)) return Dg(e.data, t);
        let a = Ja(e) ? 'DocumentFragment' : e.tagName.toLowerCase();
        return ++n > t.maxDepth
          ? ui(a, t)
          : li(
              a,
              ii(
                Ja(e) ? [] : Array.from(e.attributes, (l) => l.name).sort(),
                Ja(e) ? {} : [...e.attributes].reduce((l, s) => ((l[s.name] = s.value), l), {}),
                t,
                r + t.indent,
                n,
                o,
                i,
              ),
              si(Array.prototype.slice.call(e.childNodes || e.children), t, r + t.indent, n, o, i),
              t,
              r,
            );
      },
      jg = { serialize: $g, test: Lg },
      Ug = '@@__IMMUTABLE_ITERABLE__@@',
      Vg = '@@__IMMUTABLE_LIST__@@',
      Hg = '@@__IMMUTABLE_KEYED__@@',
      Jg = '@@__IMMUTABLE_MAP__@@',
      Su = '@@__IMMUTABLE_ORDERED__@@',
      qg = '@@__IMMUTABLE_RECORD__@@',
      zg = '@@__IMMUTABLE_SEQ__@@',
      Gg = '@@__IMMUTABLE_SET__@@',
      Wg = '@@__IMMUTABLE_STACK__@@',
      Lr = (e) => `Immutable.${e}`,
      io = (e) => `[${e}]`,
      on = ' ',
      Au = '\u2026';
    function Yg(e, t, r, n, o, i, a) {
      return ++n > t.maxDepth ? io(Lr(a)) : `${Lr(a) + on}{${ln(e.entries(), t, r, n, o, i)}}`;
    }
    function Kg(e) {
      let t = 0;
      return {
        next() {
          if (t < e._keys.length) {
            let r = e._keys[t++];
            return { done: !1, value: [r, e.get(r)] };
          }
          return { done: !0, value: void 0 };
        },
      };
    }
    function Xg(e, t, r, n, o, i) {
      let a = Lr(e._name || 'Record');
      return ++n > t.maxDepth ? io(a) : `${a + on}{${ln(Kg(e), t, r, n, o, i)}}`;
    }
    function Zg(e, t, r, n, o, i) {
      let a = Lr('Seq');
      return ++n > t.maxDepth
        ? io(a)
        : e[Hg]
          ? `${a + on}{${e._iter || e._object ? ln(e.entries(), t, r, n, o, i) : Au}}`
          : `${a + on}[${e._iter || e._array || e._collection || e._iterable ? oi(e.values(), t, r, n, o, i) : Au}]`;
    }
    function qa(e, t, r, n, o, i, a) {
      return ++n > t.maxDepth ? io(Lr(a)) : `${Lr(a) + on}[${oi(e.values(), t, r, n, o, i)}]`;
    }
    var Qg = (e, t, r, n, o, i) =>
        e[Jg]
          ? Yg(e, t, r, n, o, i, e[Su] ? 'OrderedMap' : 'Map')
          : e[Vg]
            ? qa(e, t, r, n, o, i, 'List')
            : e[Gg]
              ? qa(e, t, r, n, o, i, e[Su] ? 'OrderedSet' : 'Set')
              : e[Wg]
                ? qa(e, t, r, n, o, i, 'Stack')
                : e[zg]
                  ? Zg(e, t, r, n, o, i)
                  : Xg(e, t, r, n, o, i),
      ey = (e) => e && (e[Ug] === !0 || e[qg] === !0),
      ty = { serialize: Qg, test: ey };
    function yc(e) {
      return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default')
        ? e.default
        : e;
    }
    var Tu = { exports: {} };
    var ye = {},
      wu;
    function ry() {
      return (
        wu ||
          ((wu = 1),
          (function () {
            function e(b) {
              if (typeof b == 'object' && b !== null) {
                var _ = b.$$typeof;
                switch (_) {
                  case t:
                    switch (((b = b.type), b)) {
                      case n:
                      case i:
                      case o:
                      case d:
                      case p:
                      case g:
                        return b;
                      default:
                        switch (((b = b && b.$$typeof), b)) {
                          case l:
                          case s:
                          case h:
                          case m:
                            return b;
                          case a:
                            return b;
                          default:
                            return _;
                        }
                    }
                  case r:
                    return _;
                }
              }
            }
            var t = Symbol.for('react.transitional.element'),
              r = Symbol.for('react.portal'),
              n = Symbol.for('react.fragment'),
              o = Symbol.for('react.strict_mode'),
              i = Symbol.for('react.profiler'),
              a = Symbol.for('react.consumer'),
              l = Symbol.for('react.context'),
              s = Symbol.for('react.forward_ref'),
              d = Symbol.for('react.suspense'),
              p = Symbol.for('react.suspense_list'),
              m = Symbol.for('react.memo'),
              h = Symbol.for('react.lazy'),
              g = Symbol.for('react.view_transition'),
              E = Symbol.for('react.client.reference');
            ((ye.ContextConsumer = a),
              (ye.ContextProvider = l),
              (ye.Element = t),
              (ye.ForwardRef = s),
              (ye.Fragment = n),
              (ye.Lazy = h),
              (ye.Memo = m),
              (ye.Portal = r),
              (ye.Profiler = i),
              (ye.StrictMode = o),
              (ye.Suspense = d),
              (ye.SuspenseList = p),
              (ye.isContextConsumer = function (b) {
                return e(b) === a;
              }),
              (ye.isContextProvider = function (b) {
                return e(b) === l;
              }),
              (ye.isElement = function (b) {
                return typeof b == 'object' && b !== null && b.$$typeof === t;
              }),
              (ye.isForwardRef = function (b) {
                return e(b) === s;
              }),
              (ye.isFragment = function (b) {
                return e(b) === n;
              }),
              (ye.isLazy = function (b) {
                return e(b) === h;
              }),
              (ye.isMemo = function (b) {
                return e(b) === m;
              }),
              (ye.isPortal = function (b) {
                return e(b) === r;
              }),
              (ye.isProfiler = function (b) {
                return e(b) === i;
              }),
              (ye.isStrictMode = function (b) {
                return e(b) === o;
              }),
              (ye.isSuspense = function (b) {
                return e(b) === d;
              }),
              (ye.isSuspenseList = function (b) {
                return e(b) === p;
              }),
              (ye.isValidElementType = function (b) {
                return (
                  typeof b == 'string' ||
                  typeof b == 'function' ||
                  b === n ||
                  b === i ||
                  b === o ||
                  b === d ||
                  b === p ||
                  (typeof b == 'object' &&
                    b !== null &&
                    (b.$$typeof === h ||
                      b.$$typeof === m ||
                      b.$$typeof === l ||
                      b.$$typeof === a ||
                      b.$$typeof === s ||
                      b.$$typeof === E ||
                      b.getModuleId !== void 0))
                );
              }),
              (ye.typeOf = e));
          })()),
        ye
      );
    }
    var _u;
    function ny() {
      return (_u || ((_u = 1), (Tu.exports = ry())), Tu.exports);
    }
    var bc = ny(),
      oy = yc(bc),
      ay = cc({ __proto__: null, default: oy }, [bc]),
      vu = { exports: {} };
    var pe = {},
      xu;
    function iy() {
      return (
        xu ||
          ((xu = 1),
          (function () {
            var e = Symbol.for('react.element'),
              t = Symbol.for('react.portal'),
              r = Symbol.for('react.fragment'),
              n = Symbol.for('react.strict_mode'),
              o = Symbol.for('react.profiler'),
              i = Symbol.for('react.provider'),
              a = Symbol.for('react.context'),
              l = Symbol.for('react.server_context'),
              s = Symbol.for('react.forward_ref'),
              d = Symbol.for('react.suspense'),
              p = Symbol.for('react.suspense_list'),
              m = Symbol.for('react.memo'),
              h = Symbol.for('react.lazy'),
              g = Symbol.for('react.offscreen'),
              E = !1,
              b = !1,
              _ = !1,
              y = !1,
              S = !1,
              A;
            A = Symbol.for('react.module.reference');
            function T(Q) {
              return !!(
                typeof Q == 'string' ||
                typeof Q == 'function' ||
                Q === r ||
                Q === o ||
                S ||
                Q === n ||
                Q === d ||
                Q === p ||
                y ||
                Q === g ||
                E ||
                b ||
                _ ||
                (typeof Q == 'object' &&
                  Q !== null &&
                  (Q.$$typeof === h ||
                    Q.$$typeof === m ||
                    Q.$$typeof === i ||
                    Q.$$typeof === a ||
                    Q.$$typeof === s ||
                    Q.$$typeof === A ||
                    Q.getModuleId !== void 0))
              );
            }
            function C(Q) {
              if (typeof Q == 'object' && Q !== null) {
                var Ne = Q.$$typeof;
                switch (Ne) {
                  case e:
                    var De = Q.type;
                    switch (De) {
                      case r:
                      case o:
                      case n:
                      case d:
                      case p:
                        return De;
                      default:
                        var Et = De && De.$$typeof;
                        switch (Et) {
                          case l:
                          case a:
                          case s:
                          case h:
                          case m:
                          case i:
                            return Et;
                          default:
                            return Ne;
                        }
                    }
                  case t:
                    return Ne;
                }
              }
            }
            var x = a,
              v = i,
              I = e,
              N = s,
              B = r,
              F = h,
              z = m,
              k = t,
              R = o,
              O = n,
              L = d,
              $ = p,
              M = !1,
              J = !1;
            function j(Q) {
              return (
                M ||
                  ((M = !0),
                  console.warn(
                    'The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.',
                  )),
                !1
              );
            }
            function W(Q) {
              return (
                J ||
                  ((J = !0),
                  console.warn(
                    'The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.',
                  )),
                !1
              );
            }
            function Z(Q) {
              return C(Q) === a;
            }
            function ue(Q) {
              return C(Q) === i;
            }
            function me(Q) {
              return typeof Q == 'object' && Q !== null && Q.$$typeof === e;
            }
            function ie(Q) {
              return C(Q) === s;
            }
            function fe(Q) {
              return C(Q) === r;
            }
            function xe(Q) {
              return C(Q) === h;
            }
            function Ie(Q) {
              return C(Q) === m;
            }
            function rt(Q) {
              return C(Q) === t;
            }
            function Ge(Q) {
              return C(Q) === o;
            }
            function ct(Q) {
              return C(Q) === n;
            }
            function dt(Q) {
              return C(Q) === d;
            }
            function Qt(Q) {
              return C(Q) === p;
            }
            ((pe.ContextConsumer = x),
              (pe.ContextProvider = v),
              (pe.Element = I),
              (pe.ForwardRef = N),
              (pe.Fragment = B),
              (pe.Lazy = F),
              (pe.Memo = z),
              (pe.Portal = k),
              (pe.Profiler = R),
              (pe.StrictMode = O),
              (pe.Suspense = L),
              (pe.SuspenseList = $),
              (pe.isAsyncMode = j),
              (pe.isConcurrentMode = W),
              (pe.isContextConsumer = Z),
              (pe.isContextProvider = ue),
              (pe.isElement = me),
              (pe.isForwardRef = ie),
              (pe.isFragment = fe),
              (pe.isLazy = xe),
              (pe.isMemo = Ie),
              (pe.isPortal = rt),
              (pe.isProfiler = Ge),
              (pe.isStrictMode = ct),
              (pe.isSuspense = dt),
              (pe.isSuspenseList = Qt),
              (pe.isValidElementType = T),
              (pe.typeOf = C));
          })()),
        pe
      );
    }
    var Cu;
    function sy() {
      return (Cu || ((Cu = 1), (vu.exports = iy())), vu.exports);
    }
    var Ec = sy(),
      ly = yc(Ec),
      uy = cc({ __proto__: null, default: ly }, [Ec]),
      cy = [
        'isAsyncMode',
        'isConcurrentMode',
        'isContextConsumer',
        'isContextProvider',
        'isElement',
        'isForwardRef',
        'isFragment',
        'isLazy',
        'isMemo',
        'isPortal',
        'isProfiler',
        'isStrictMode',
        'isSuspense',
        'isSuspenseList',
        'isValidElementType',
      ],
      pr = Object.fromEntries(cy.map((e) => [e, (t) => uy[e](t) || ay[e](t)]));
    function Sc(e, t = []) {
      if (Array.isArray(e)) for (let r of e) Sc(r, t);
      else e != null && e !== !1 && e !== '' && t.push(e);
      return t;
    }
    function Ou(e) {
      let t = e.type;
      if (typeof t == 'string') return t;
      if (typeof t == 'function') return t.displayName || t.name || 'Unknown';
      if (pr.isFragment(e)) return 'React.Fragment';
      if (pr.isSuspense(e)) return 'React.Suspense';
      if (typeof t == 'object' && t !== null) {
        if (pr.isContextProvider(e)) return 'Context.Provider';
        if (pr.isContextConsumer(e)) return 'Context.Consumer';
        if (pr.isForwardRef(e)) {
          if (t.displayName) return t.displayName;
          let r = t.render.displayName || t.render.name || '';
          return r === '' ? 'ForwardRef' : `ForwardRef(${r})`;
        }
        if (pr.isMemo(e)) {
          let r = t.displayName || t.type.displayName || t.type.name || '';
          return r === '' ? 'Memo' : `Memo(${r})`;
        }
      }
      return 'UNDEFINED';
    }
    function dy(e) {
      let { props: t } = e;
      return Object.keys(t)
        .filter((r) => r !== 'children' && t[r] !== void 0)
        .sort();
    }
    var py = (e, t, r, n, o, i) =>
        ++n > t.maxDepth
          ? ui(Ou(e), t)
          : li(
              Ou(e),
              ii(dy(e), e.props, t, r + t.indent, n, o, i),
              si(Sc(e.props.children), t, r + t.indent, n, o, i),
              t,
              r,
            ),
      my = (e) => e != null && pr.isElement(e),
      hy = { serialize: py, test: my },
      fy = typeof Symbol == 'function' && Symbol.for ? Symbol.for('react.test.json') : 245830487;
    function gy(e) {
      let { props: t } = e;
      return t
        ? Object.keys(t)
            .filter((r) => t[r] !== void 0)
            .sort()
        : [];
    }
    var yy = (e, t, r, n, o, i) =>
        ++n > t.maxDepth
          ? ui(e.type, t)
          : li(
              e.type,
              e.props ? ii(gy(e), e.props, t, r + t.indent, n, o, i) : '',
              e.children ? si(e.children, t, r + t.indent, n, o, i) : '',
              t,
              r,
            ),
      by = (e) => e && e.$$typeof === fy,
      Ey = { serialize: yy, test: by },
      Ac = Object.prototype.toString,
      Sy = Date.prototype.toISOString,
      Ay = Error.prototype.toString,
      Ru = RegExp.prototype.toString;
    function ro(e) {
      return (typeof e.constructor == 'function' && e.constructor.name) || 'Object';
    }
    function Ty(e) {
      return typeof window < 'u' && e === window;
    }
    var wy = /^Symbol\((.*)\)(.*)$/,
      _y = /\n/g,
      Tc = class extends Error {
        constructor(e, t) {
          (super(e), (this.stack = t), (this.name = this.constructor.name));
        }
      };
    function vy(e) {
      return (
        e === '[object Array]' ||
        e === '[object ArrayBuffer]' ||
        e === '[object DataView]' ||
        e === '[object Float32Array]' ||
        e === '[object Float64Array]' ||
        e === '[object Int8Array]' ||
        e === '[object Int16Array]' ||
        e === '[object Int32Array]' ||
        e === '[object Uint8Array]' ||
        e === '[object Uint8ClampedArray]' ||
        e === '[object Uint16Array]' ||
        e === '[object Uint32Array]'
      );
    }
    function xy(e) {
      return Object.is(e, -0) ? '-0' : String(e);
    }
    function Cy(e) {
      return `${e}n`;
    }
    function Iu(e, t) {
      return t ? `[Function ${e.name || 'anonymous'}]` : '[Function]';
    }
    function Du(e) {
      return String(e).replace(wy, 'Symbol($1)');
    }
    function Pu(e) {
      return `[${Ay.call(e)}]`;
    }
    function wc(e, t, r, n) {
      if (e === !0 || e === !1) return `${e}`;
      if (e === void 0) return 'undefined';
      if (e === null) return 'null';
      let o = typeof e;
      if (o === 'number') return xy(e);
      if (o === 'bigint') return Cy(e);
      if (o === 'string') return n ? `"${e.replaceAll(/"|\\/g, '\\$&')}"` : `"${e}"`;
      if (o === 'function') return Iu(e, t);
      if (o === 'symbol') return Du(e);
      let i = Ac.call(e);
      return i === '[object WeakMap]'
        ? 'WeakMap {}'
        : i === '[object WeakSet]'
          ? 'WeakSet {}'
          : i === '[object Function]' || i === '[object GeneratorFunction]'
            ? Iu(e, t)
            : i === '[object Symbol]'
              ? Du(e)
              : i === '[object Date]'
                ? Number.isNaN(+e)
                  ? 'Date { NaN }'
                  : Sy.call(e)
                : i === '[object Error]'
                  ? Pu(e)
                  : i === '[object RegExp]'
                    ? r
                      ? Ru.call(e).replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&')
                      : Ru.call(e)
                    : e instanceof Error
                      ? Pu(e)
                      : null;
    }
    function _c(e, t, r, n, o, i) {
      if (o.includes(e)) return '[Circular]';
      ((o = [...o]), o.push(e));
      let a = ++n > t.maxDepth,
        l = t.min;
      if (t.callToJSON && !a && e.toJSON && typeof e.toJSON == 'function' && !i)
        return zt(e.toJSON(), t, r, n, o, !0);
      let s = Ac.call(e);
      return s === '[object Arguments]'
        ? a
          ? '[Arguments]'
          : `${l ? '' : 'Arguments '}[${oo(e, t, r, n, o, zt)}]`
        : vy(s)
          ? a
            ? `[${e.constructor.name}]`
            : `${l || (!t.printBasicPrototype && e.constructor.name === 'Array') ? '' : `${e.constructor.name} `}[${oo(e, t, r, n, o, zt)}]`
          : s === '[object Map]'
            ? a
              ? '[Map]'
              : `Map {${ln(e.entries(), t, r, n, o, zt, ' => ')}}`
            : s === '[object Set]'
              ? a
                ? '[Set]'
                : `Set {${oi(e.values(), t, r, n, o, zt)}}`
              : a || Ty(e)
                ? `[${ro(e)}]`
                : `${l || (!t.printBasicPrototype && ro(e) === 'Object') ? '' : `${ro(e)} `}{${ai(e, t, r, n, o, zt)}}`;
    }
    var Oy = {
      test: (e) => e && e instanceof Error,
      serialize(e, t, r, n, o, i) {
        if (o.includes(e)) return '[Circular]';
        o = [...o, e];
        let a = ++n > t.maxDepth,
          { message: l, cause: s, ...d } = e,
          p = {
            message: l,
            ...(typeof s < 'u' ? { cause: s } : {}),
            ...(e instanceof AggregateError ? { errors: e.errors } : {}),
            ...d,
          },
          m = e.name !== 'Error' ? e.name : ro(e);
        return a ? `[${m}]` : `${m} {${ln(Object.entries(p).values(), t, r, n, o, i)}}`;
      },
    };
    function Ry(e) {
      return e.serialize != null;
    }
    function vc(e, t, r, n, o, i) {
      let a;
      try {
        a = Ry(e)
          ? e.serialize(t, r, n, o, i, zt)
          : e.print(
              t,
              (l) => zt(l, r, n, o, i),
              (l) => {
                let s = n + r.indent;
                return (
                  s +
                  l.replaceAll(
                    _y,
                    `
${s}`,
                  )
                );
              },
              { edgeSpacing: r.spacingOuter, min: r.min, spacing: r.spacingInner },
              r.colors,
            );
      } catch (l) {
        throw new Tc(l.message, l.stack);
      }
      if (typeof a != 'string')
        throw new TypeError(
          `pretty-format: Plugin must return type "string" but instead returned "${typeof a}".`,
        );
      return a;
    }
    function xc(e, t) {
      for (let r of e)
        try {
          if (r.test(t)) return r;
        } catch (n) {
          throw new Tc(n.message, n.stack);
        }
      return null;
    }
    function zt(e, t, r, n, o, i) {
      let a = xc(t.plugins, e);
      if (a !== null) return vc(a, e, t, r, n, o);
      let l = wc(e, t.printFunctionName, t.escapeRegex, t.escapeString);
      return l !== null ? l : _c(e, t, r, n, o, i);
    }
    var ci = { comment: 'gray', content: 'reset', prop: 'yellow', tag: 'cyan', value: 'green' },
      Cc = Object.keys(ci),
      gt = {
        callToJSON: !0,
        compareKeys: void 0,
        escapeRegex: !1,
        escapeString: !0,
        highlight: !1,
        indent: 2,
        maxDepth: Number.POSITIVE_INFINITY,
        maxWidth: Number.POSITIVE_INFINITY,
        min: !1,
        plugins: [],
        printBasicPrototype: !0,
        printFunctionName: !0,
        theme: ci,
      };
    function Iy(e) {
      for (let t of Object.keys(e))
        if (!Object.prototype.hasOwnProperty.call(gt, t))
          throw new Error(`pretty-format: Unknown option "${t}".`);
      if (e.min && e.indent !== void 0 && e.indent !== 0)
        throw new Error('pretty-format: Options "min" and "indent" cannot be used together.');
    }
    function Dy() {
      return Cc.reduce((e, t) => {
        let r = ci[t],
          n = r && Nt[r];
        if (n && typeof n.close == 'string' && typeof n.open == 'string') e[t] = n;
        else
          throw new Error(
            `pretty-format: Option "theme" has a key "${t}" whose value "${r}" is undefined in ansi-styles.`,
          );
        return e;
      }, Object.create(null));
    }
    function Py() {
      return Cc.reduce((e, t) => ((e[t] = { close: '', open: '' }), e), Object.create(null));
    }
    function Oc(e) {
      return e?.printFunctionName ?? gt.printFunctionName;
    }
    function Rc(e) {
      return e?.escapeRegex ?? gt.escapeRegex;
    }
    function Ic(e) {
      return e?.escapeString ?? gt.escapeString;
    }
    function Nu(e) {
      return {
        callToJSON: e?.callToJSON ?? gt.callToJSON,
        colors: e?.highlight ? Dy() : Py(),
        compareKeys:
          typeof e?.compareKeys == 'function' || e?.compareKeys === null
            ? e.compareKeys
            : gt.compareKeys,
        escapeRegex: Rc(e),
        escapeString: Ic(e),
        indent: e?.min ? '' : Ny(e?.indent ?? gt.indent),
        maxDepth: e?.maxDepth ?? gt.maxDepth,
        maxWidth: e?.maxWidth ?? gt.maxWidth,
        min: e?.min ?? gt.min,
        plugins: e?.plugins ?? gt.plugins,
        printBasicPrototype: e?.printBasicPrototype ?? !0,
        printFunctionName: Oc(e),
        spacingInner: e?.min
          ? ' '
          : `
`,
        spacingOuter: e?.min
          ? ''
          : `
`,
      };
    }
    function Ny(e) {
      return Array.from({ length: e + 1 }).join(' ');
    }
    function wt(e, t) {
      if (t && (Iy(t), t.plugins)) {
        let n = xc(t.plugins, e);
        if (n !== null) return vc(n, e, Nu(t), '', 0, []);
      }
      let r = wc(e, Oc(t), Rc(t), Ic(t));
      return r !== null ? r : _c(e, Nu(t), '', 0, []);
    }
    var di = {
        AsymmetricMatcher: wg,
        DOMCollection: Ig,
        DOMElement: jg,
        Immutable: ty,
        ReactElement: hy,
        ReactTestComponent: Ey,
        Error: Oy,
      },
      ku = {
        bold: ['1', '22'],
        dim: ['2', '22'],
        italic: ['3', '23'],
        underline: ['4', '24'],
        inverse: ['7', '27'],
        hidden: ['8', '28'],
        strike: ['9', '29'],
        black: ['30', '39'],
        red: ['31', '39'],
        green: ['32', '39'],
        yellow: ['33', '39'],
        blue: ['34', '39'],
        magenta: ['35', '39'],
        cyan: ['36', '39'],
        white: ['37', '39'],
        brightblack: ['30;1', '39'],
        brightred: ['31;1', '39'],
        brightgreen: ['32;1', '39'],
        brightyellow: ['33;1', '39'],
        brightblue: ['34;1', '39'],
        brightmagenta: ['35;1', '39'],
        brightcyan: ['36;1', '39'],
        brightwhite: ['37;1', '39'],
        grey: ['90', '39'],
      },
      ky = {
        special: 'cyan',
        number: 'yellow',
        bigint: 'yellow',
        boolean: 'yellow',
        undefined: 'grey',
        null: 'bold',
        string: 'green',
        symbol: 'green',
        date: 'magenta',
        regexp: 'red',
      },
      Br = '\u2026';
    function Fy(e, t) {
      let r = ku[ky[t]] || ku[t] || '';
      return r ? `\x1B[${r[0]}m${String(e)}\x1B[${r[1]}m` : String(e);
    }
    function Ly(
      {
        showHidden: e = !1,
        depth: t = 2,
        colors: r = !1,
        customInspect: n = !0,
        showProxy: o = !1,
        maxArrayLength: i = 1 / 0,
        breakLength: a = 1 / 0,
        seen: l = [],
        truncate: s = 1 / 0,
        stylize: d = String,
      } = {},
      p,
    ) {
      let m = {
        showHidden: !!e,
        depth: Number(t),
        colors: !!r,
        customInspect: !!n,
        showProxy: !!o,
        maxArrayLength: Number(i),
        breakLength: Number(a),
        truncate: Number(s),
        seen: l,
        inspect: p,
        stylize: d,
      };
      return (m.colors && (m.stylize = Fy), m);
    }
    function By(e) {
      return e >= '\uD800' && e <= '\uDBFF';
    }
    function Wt(e, t, r = Br) {
      e = String(e);
      let n = r.length,
        o = e.length;
      if (n > t && o > n) return r;
      if (o > t && o > n) {
        let i = t - n;
        return (i > 0 && By(e[i - 1]) && (i = i - 1), `${e.slice(0, i)}${r}`);
      }
      return e;
    }
    function yt(e, t, r, n = ', ') {
      r = r || t.inspect;
      let o = e.length;
      if (o === 0) return '';
      let i = t.truncate,
        a = '',
        l = '',
        s = '';
      for (let d = 0; d < o; d += 1) {
        let p = d + 1 === e.length,
          m = d + 2 === e.length;
        s = `${Br}(${e.length - d})`;
        let h = e[d];
        t.truncate = i - a.length - (p ? 0 : n.length);
        let g = l || r(h, t) + (p ? '' : n),
          E = a.length + g.length,
          b = E + s.length;
        if (
          (p && E > i && a.length + s.length <= i) ||
          (!p && !m && b > i) ||
          ((l = p ? '' : r(e[d + 1], t) + (m ? '' : n)), !p && m && b > i && E + l.length > i)
        )
          break;
        if (((a += g), !p && !m && E + l.length >= i)) {
          s = `${Br}(${e.length - d - 1})`;
          break;
        }
        s = '';
      }
      return `${a}${s}`;
    }
    function My(e) {
      return e.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)
        ? e
        : JSON.stringify(e)
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"')
            .replace(/(^"|"$)/g, "'");
    }
    function an([e, t], r) {
      return (
        (r.truncate -= 2),
        typeof e == 'string' ? (e = My(e)) : typeof e != 'number' && (e = `[${r.inspect(e, r)}]`),
        (r.truncate -= e.length),
        (t = r.inspect(t, r)),
        `${e}: ${t}`
      );
    }
    function $y(e, t) {
      let r = Object.keys(e).slice(e.length);
      if (!e.length && !r.length) return '[]';
      t.truncate -= 4;
      let n = yt(e, t);
      t.truncate -= n.length;
      let o = '';
      return (
        r.length &&
          (o = yt(
            r.map((i) => [i, e[i]]),
            t,
            an,
          )),
        `[ ${n}${o ? `, ${o}` : ''} ]`
      );
    }
    var jy = (e) =>
      typeof Buffer == 'function' && e instanceof Buffer
        ? 'Buffer'
        : e[Symbol.toStringTag]
          ? e[Symbol.toStringTag]
          : e.constructor.name;
    function Pt(e, t) {
      let r = jy(e);
      t.truncate -= r.length + 4;
      let n = Object.keys(e).slice(e.length);
      if (!e.length && !n.length) return `${r}[]`;
      let o = '';
      for (let a = 0; a < e.length; a++) {
        let l = `${t.stylize(Wt(e[a], t.truncate), 'number')}${a === e.length - 1 ? '' : ', '}`;
        if (((t.truncate -= l.length), e[a] !== e.length && t.truncate <= 3)) {
          o += `${Br}(${e.length - e[a] + 1})`;
          break;
        }
        o += l;
      }
      let i = '';
      return (
        n.length &&
          (i = yt(
            n.map((a) => [a, e[a]]),
            t,
            an,
          )),
        `${r}[ ${o}${i ? `, ${i}` : ''} ]`
      );
    }
    function Uy(e, t) {
      let r = e.toJSON();
      if (r === null) return 'Invalid Date';
      let n = r.split('T'),
        o = n[0];
      return t.stylize(`${o}T${Wt(n[1], t.truncate - o.length - 1)}`, 'date');
    }
    function Fu(e, t) {
      let r = e[Symbol.toStringTag] || 'Function',
        n = e.name;
      return n
        ? t.stylize(`[${r} ${Wt(n, t.truncate - 11)}]`, 'special')
        : t.stylize(`[${r}]`, 'special');
    }
    function Vy([e, t], r) {
      return (
        (r.truncate -= 4),
        (e = r.inspect(e, r)),
        (r.truncate -= e.length),
        (t = r.inspect(t, r)),
        `${e} => ${t}`
      );
    }
    function Hy(e) {
      let t = [];
      return (
        e.forEach((r, n) => {
          t.push([n, r]);
        }),
        t
      );
    }
    function Jy(e, t) {
      return e.size === 0 ? 'Map{}' : ((t.truncate -= 7), `Map{ ${yt(Hy(e), t, Vy)} }`);
    }
    var qy = Number.isNaN || ((e) => e !== e);
    function Lu(e, t) {
      return qy(e)
        ? t.stylize('NaN', 'number')
        : e === 1 / 0
          ? t.stylize('Infinity', 'number')
          : e === -1 / 0
            ? t.stylize('-Infinity', 'number')
            : e === 0
              ? t.stylize(1 / e === 1 / 0 ? '+0' : '-0', 'number')
              : t.stylize(Wt(String(e), t.truncate), 'number');
    }
    function Bu(e, t) {
      let r = Wt(e.toString(), t.truncate - 1);
      return (r !== Br && (r += 'n'), t.stylize(r, 'bigint'));
    }
    function zy(e, t) {
      let r = e.toString().split('/')[2],
        n = t.truncate - (2 + r.length),
        o = e.source;
      return t.stylize(`/${Wt(o, n)}/${r}`, 'regexp');
    }
    function Gy(e) {
      let t = [];
      return (
        e.forEach((r) => {
          t.push(r);
        }),
        t
      );
    }
    function Wy(e, t) {
      return e.size === 0 ? 'Set{}' : ((t.truncate -= 7), `Set{ ${yt(Gy(e), t)} }`);
    }
    var Mu = new RegExp(
        "['\\u0000-\\u001f\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]",
        'g',
      ),
      Yy = {
        '\b': '\\b',
        '	': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        "'": "\\'",
        '\\': '\\\\',
      },
      Ky = 16,
      Xy = 4;
    function Zy(e) {
      return Yy[e] || `\\u${`0000${e.charCodeAt(0).toString(Ky)}`.slice(-Xy)}`;
    }
    function $u(e, t) {
      return (
        Mu.test(e) && (e = e.replace(Mu, Zy)),
        t.stylize(`'${Wt(e, t.truncate - 2)}'`, 'string')
      );
    }
    function ju(e) {
      return 'description' in Symbol.prototype
        ? e.description
          ? `Symbol(${e.description})`
          : 'Symbol()'
        : e.toString();
    }
    var Dc = () => 'Promise{\u2026}';
    try {
      let { getPromiseDetails: e, kPending: t, kRejected: r } = process.binding('util');
      Array.isArray(e(Promise.resolve())) &&
        (Dc = (n, o) => {
          let [i, a] = e(n);
          return i === t
            ? 'Promise{<pending>}'
            : `Promise${i === r ? '!' : ''}{${o.inspect(a, o)}}`;
        });
    } catch {}
    var Qy = Dc;
    function no(e, t) {
      let r = Object.getOwnPropertyNames(e),
        n = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(e) : [];
      if (r.length === 0 && n.length === 0) return '{}';
      if (((t.truncate -= 4), (t.seen = t.seen || []), t.seen.includes(e))) return '[Circular]';
      t.seen.push(e);
      let o = yt(
          r.map((l) => [l, e[l]]),
          t,
          an,
        ),
        i = yt(
          n.map((l) => [l, e[l]]),
          t,
          an,
        );
      t.seen.pop();
      let a = '';
      return (o && i && (a = ', '), `{ ${o}${a}${i} }`);
    }
    var za = typeof Symbol < 'u' && Symbol.toStringTag ? Symbol.toStringTag : !1;
    function e0(e, t) {
      let r = '';
      return (
        za && za in e && (r = e[za]),
        (r = r || e.constructor.name),
        (!r || r === '_class') && (r = '<Anonymous Class>'),
        (t.truncate -= r.length),
        `${r}${no(e, t)}`
      );
    }
    function t0(e, t) {
      return e.length === 0 ? 'Arguments[]' : ((t.truncate -= 13), `Arguments[ ${yt(e, t)} ]`);
    }
    var r0 = [
      'stack',
      'line',
      'column',
      'name',
      'message',
      'fileName',
      'lineNumber',
      'columnNumber',
      'number',
      'description',
      'cause',
    ];
    function n0(e, t) {
      let r = Object.getOwnPropertyNames(e).filter((a) => r0.indexOf(a) === -1),
        n = e.name;
      t.truncate -= n.length;
      let o = '';
      if (
        (typeof e.message == 'string' ? (o = Wt(e.message, t.truncate)) : r.unshift('message'),
        (o = o ? `: ${o}` : ''),
        (t.truncate -= o.length + 5),
        (t.seen = t.seen || []),
        t.seen.includes(e))
      )
        return '[Circular]';
      t.seen.push(e);
      let i = yt(
        r.map((a) => [a, e[a]]),
        t,
        an,
      );
      return `${n}${o}${i ? ` { ${i} }` : ''}`;
    }
    function o0([e, t], r) {
      return (
        (r.truncate -= 3),
        t
          ? `${r.stylize(String(e), 'yellow')}=${r.stylize(`"${t}"`, 'string')}`
          : `${r.stylize(String(e), 'yellow')}`
      );
    }
    function Xa(e, t) {
      return yt(
        e,
        t,
        a0,
        `
`,
      );
    }
    function a0(e, t) {
      switch (e.nodeType) {
        case 1:
          return Pc(e, t);
        case 3:
          return t.inspect(e.data, t);
        default:
          return t.inspect(e, t);
      }
    }
    function Pc(e, t) {
      let r = e.getAttributeNames(),
        n = e.tagName.toLowerCase(),
        o = t.stylize(`<${n}`, 'special'),
        i = t.stylize('>', 'special'),
        a = t.stylize(`</${n}>`, 'special');
      t.truncate -= n.length * 2 + 5;
      let l = '';
      (r.length > 0 &&
        ((l += ' '),
        (l += yt(
          r.map((p) => [p, e.getAttribute(p)]),
          t,
          o0,
          ' ',
        ))),
        (t.truncate -= l.length));
      let s = t.truncate,
        d = Xa(e.children, t);
      return (d && d.length > s && (d = `${Br}(${e.children.length})`), `${o}${l}${i}${d}${a}`);
    }
    var i0 = typeof Symbol == 'function' && typeof Symbol.for == 'function',
      Ga = i0 ? Symbol.for('chai/inspect') : '@@chai/inspect',
      Wa = Symbol.for('nodejs.util.inspect.custom'),
      Uu = new WeakMap(),
      Vu = {},
      Hu = {
        undefined: (e, t) => t.stylize('undefined', 'undefined'),
        null: (e, t) => t.stylize('null', 'null'),
        boolean: (e, t) => t.stylize(String(e), 'boolean'),
        Boolean: (e, t) => t.stylize(String(e), 'boolean'),
        number: Lu,
        Number: Lu,
        bigint: Bu,
        BigInt: Bu,
        string: $u,
        String: $u,
        function: Fu,
        Function: Fu,
        symbol: ju,
        Symbol: ju,
        Array: $y,
        Date: Uy,
        Map: Jy,
        Set: Wy,
        RegExp: zy,
        Promise: Qy,
        WeakSet: (e, t) => t.stylize('WeakSet{\u2026}', 'special'),
        WeakMap: (e, t) => t.stylize('WeakMap{\u2026}', 'special'),
        Arguments: t0,
        Int8Array: Pt,
        Uint8Array: Pt,
        Uint8ClampedArray: Pt,
        Int16Array: Pt,
        Uint16Array: Pt,
        Int32Array: Pt,
        Uint32Array: Pt,
        Float32Array: Pt,
        Float64Array: Pt,
        Generator: () => '',
        DataView: () => '',
        ArrayBuffer: () => '',
        Error: n0,
        HTMLCollection: Xa,
        NodeList: Xa,
      },
      s0 = (e, t, r) =>
        Ga in e && typeof e[Ga] == 'function'
          ? e[Ga](t)
          : Wa in e && typeof e[Wa] == 'function'
            ? e[Wa](t.depth, t)
            : 'inspect' in e && typeof e.inspect == 'function'
              ? e.inspect(t.depth, t)
              : 'constructor' in e && Uu.has(e.constructor)
                ? Uu.get(e.constructor)(e, t)
                : Vu[r]
                  ? Vu[r](e, t)
                  : '',
      l0 = Object.prototype.toString;
    function Za(e, t = {}) {
      let r = Ly(t, Za),
        { customInspect: n } = r,
        o = e === null ? 'null' : typeof e;
      if ((o === 'object' && (o = l0.call(e).slice(8, -1)), o in Hu)) return Hu[o](e, r);
      if (n && e) {
        let a = s0(e, r, o);
        if (a) return typeof a == 'string' ? a : Za(a, r);
      }
      let i = e ? Object.getPrototypeOf(e) : !1;
      return i === Object.prototype || i === null
        ? no(e, r)
        : e && typeof HTMLElement == 'function' && e instanceof HTMLElement
          ? Pc(e, r)
          : 'constructor' in e
            ? e.constructor !== Object
              ? e0(e, r)
              : no(e, r)
            : e === Object(e)
              ? no(e, r)
              : r.stylize(String(e), o);
    }
    var {
        AsymmetricMatcher: u0,
        DOMCollection: c0,
        DOMElement: d0,
        Immutable: p0,
        ReactElement: m0,
        ReactTestComponent: h0,
      } = di,
      Ju = [h0, m0, d0, c0, p0, u0];
    function sn(e, t = 10, { maxLength: r, ...n } = {}) {
      let o = r ?? 1e4,
        i;
      try {
        i = wt(e, { maxDepth: t, escapeString: !1, plugins: Ju, ...n });
      } catch {
        i = wt(e, { callToJSON: !1, maxDepth: t, escapeString: !1, plugins: Ju, ...n });
      }
      return i.length >= o && t > 1
        ? sn(e, Math.floor(Math.min(t, Number.MAX_SAFE_INTEGER) / 2), { maxLength: r, ...n })
        : i;
    }
    var f0 = /%[sdjifoOc%]/g;
    function g0(...e) {
      if (typeof e[0] != 'string') {
        let i = [];
        for (let a = 0; a < e.length; a++) i.push(nn(e[a], { depth: 0, colors: !1 }));
        return i.join(' ');
      }
      let t = e.length,
        r = 1,
        n = e[0],
        o = String(n).replace(f0, (i) => {
          if (i === '%%') return '%';
          if (r >= t) return i;
          switch (i) {
            case '%s': {
              let a = e[r++];
              return typeof a == 'bigint'
                ? `${a.toString()}n`
                : typeof a == 'number' && a === 0 && 1 / a < 0
                  ? '-0'
                  : typeof a == 'object' && a !== null
                    ? typeof a.toString == 'function' && a.toString !== Object.prototype.toString
                      ? a.toString()
                      : nn(a, { depth: 0, colors: !1 })
                    : String(a);
            }
            case '%d': {
              let a = e[r++];
              return typeof a == 'bigint' ? `${a.toString()}n` : Number(a).toString();
            }
            case '%i': {
              let a = e[r++];
              return typeof a == 'bigint'
                ? `${a.toString()}n`
                : Number.parseInt(String(a)).toString();
            }
            case '%f':
              return Number.parseFloat(String(e[r++])).toString();
            case '%o':
              return nn(e[r++], { showHidden: !0, showProxy: !0 });
            case '%O':
              return nn(e[r++]);
            case '%c':
              return (r++, '');
            case '%j':
              try {
                return JSON.stringify(e[r++]);
              } catch (a) {
                let l = a.message;
                if (
                  l.includes('circular structure') ||
                  l.includes('cyclic structures') ||
                  l.includes('cyclic object')
                )
                  return '[Circular]';
                throw a;
              }
            default:
              return i;
          }
        });
      for (let i = e[r]; r < t; i = e[++r])
        i === null || typeof i != 'object' ? (o += ` ${i}`) : (o += ` ${nn(i)}`);
      return o;
    }
    function nn(e, t = {}) {
      return (t.truncate === 0 && (t.truncate = Number.POSITIVE_INFINITY), Za(e, t));
    }
    function y0(e) {
      return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default')
        ? e.default
        : e;
    }
    function b0(e) {
      return e === Object.prototype || e === Function.prototype || e === RegExp.prototype;
    }
    function Qa(e) {
      return Object.prototype.toString.apply(e).slice(8, -1);
    }
    function E0(e, t) {
      let r = typeof t == 'function' ? t : (n) => t.add(n);
      (Object.getOwnPropertyNames(e).forEach(r), Object.getOwnPropertySymbols(e).forEach(r));
    }
    function Nc(e) {
      let t = new Set();
      return b0(e) ? [] : (E0(e, t), Array.from(t));
    }
    var kc = { forceWritable: !1 };
    function qu(e, t = kc) {
      return ei(e, new WeakMap(), t);
    }
    function ei(e, t, r = kc) {
      let n, o;
      if (t.has(e)) return t.get(e);
      if (Array.isArray(e)) {
        for (o = Array.from({ length: (n = e.length) }), t.set(e, o); n--;) o[n] = ei(e[n], t, r);
        return o;
      }
      if (Object.prototype.toString.call(e) === '[object Object]') {
        ((o = Object.create(Object.getPrototypeOf(e))), t.set(e, o));
        let i = Nc(e);
        for (let a of i) {
          let l = Object.getOwnPropertyDescriptor(e, a);
          if (!l) continue;
          let s = ei(e[a], t, r);
          r.forceWritable
            ? Object.defineProperty(o, a, {
                enumerable: l.enumerable,
                configurable: !0,
                writable: !0,
                value: s,
              })
            : 'get' in l
              ? Object.defineProperty(o, a, {
                  ...l,
                  get() {
                    return s;
                  },
                })
              : Object.defineProperty(o, a, { ...l, value: s });
        }
        return o;
      }
      return e;
    }
    var qe = -1,
      Ue = 1,
      Re = 0,
      ve = class {
        0;
        1;
        constructor(e, t) {
          ((this[0] = e), (this[1] = t));
        }
      };
    function S0(e, t) {
      if (!e || !t || e.charAt(0) !== t.charAt(0)) return 0;
      let r = 0,
        n = Math.min(e.length, t.length),
        o = n,
        i = 0;
      for (; r < o;)
        (e.substring(i, o) === t.substring(i, o) ? ((r = o), (i = r)) : (n = o),
          (o = Math.floor((n - r) / 2 + r)));
      return o;
    }
    function Fc(e, t) {
      if (!e || !t || e.charAt(e.length - 1) !== t.charAt(t.length - 1)) return 0;
      let r = 0,
        n = Math.min(e.length, t.length),
        o = n,
        i = 0;
      for (; r < o;)
        (e.substring(e.length - o, e.length - i) === t.substring(t.length - o, t.length - i)
          ? ((r = o), (i = r))
          : (n = o),
          (o = Math.floor((n - r) / 2 + r)));
      return o;
    }
    function zu(e, t) {
      let r = e.length,
        n = t.length;
      if (r === 0 || n === 0) return 0;
      r > n ? (e = e.substring(r - n)) : r < n && (t = t.substring(0, r));
      let o = Math.min(r, n);
      if (e === t) return o;
      let i = 0,
        a = 1;
      for (;;) {
        let l = e.substring(o - a),
          s = t.indexOf(l);
        if (s === -1) return i;
        ((a += s), (s === 0 || e.substring(o - a) === t.substring(0, a)) && ((i = a), a++));
      }
    }
    function A0(e) {
      let t = !1,
        r = [],
        n = 0,
        o = null,
        i = 0,
        a = 0,
        l = 0,
        s = 0,
        d = 0;
      for (; i < e.length;)
        (e[i][0] === Re
          ? ((r[n++] = i), (a = s), (l = d), (s = 0), (d = 0), (o = e[i][1]))
          : (e[i][0] === Ue ? (s += e[i][1].length) : (d += e[i][1].length),
            o &&
              o.length <= Math.max(a, l) &&
              o.length <= Math.max(s, d) &&
              (e.splice(r[n - 1], 0, new ve(qe, o)),
              (e[r[n - 1] + 1][0] = Ue),
              n--,
              n--,
              (i = n > 0 ? r[n - 1] : -1),
              (a = 0),
              (l = 0),
              (s = 0),
              (d = 0),
              (o = null),
              (t = !0))),
          i++);
      for (t && Lc(e), _0(e), i = 1; i < e.length;) {
        if (e[i - 1][0] === qe && e[i][0] === Ue) {
          let p = e[i - 1][1],
            m = e[i][1],
            h = zu(p, m),
            g = zu(m, p);
          (h >= g
            ? (h >= p.length / 2 || h >= m.length / 2) &&
              (e.splice(i, 0, new ve(Re, m.substring(0, h))),
              (e[i - 1][1] = p.substring(0, p.length - h)),
              (e[i + 1][1] = m.substring(h)),
              i++)
            : (g >= p.length / 2 || g >= m.length / 2) &&
              (e.splice(i, 0, new ve(Re, p.substring(0, g))),
              (e[i - 1][0] = Ue),
              (e[i - 1][1] = m.substring(0, m.length - g)),
              (e[i + 1][0] = qe),
              (e[i + 1][1] = p.substring(g)),
              i++),
            i++);
        }
        i++;
      }
    }
    var Gu = /[^a-z0-9]/i,
      Wu = /\s/,
      Yu = /[\r\n]/,
      T0 = /\n\r?\n$/,
      w0 = /^\r?\n\r?\n/;
    function _0(e) {
      let t = 1;
      for (; t < e.length - 1;) {
        if (e[t - 1][0] === Re && e[t + 1][0] === Re) {
          let r = e[t - 1][1],
            n = e[t][1],
            o = e[t + 1][1],
            i = Fc(r, n);
          if (i) {
            let p = n.substring(n.length - i);
            ((r = r.substring(0, r.length - i)),
              (n = p + n.substring(0, n.length - i)),
              (o = p + o));
          }
          let a = r,
            l = n,
            s = o,
            d = Qn(r, n) + Qn(n, o);
          for (; n.charAt(0) === o.charAt(0);) {
            ((r += n.charAt(0)), (n = n.substring(1) + o.charAt(0)), (o = o.substring(1)));
            let p = Qn(r, n) + Qn(n, o);
            p >= d && ((d = p), (a = r), (l = n), (s = o));
          }
          e[t - 1][1] !== a &&
            (a ? (e[t - 1][1] = a) : (e.splice(t - 1, 1), t--),
            (e[t][1] = l),
            s ? (e[t + 1][1] = s) : (e.splice(t + 1, 1), t--));
        }
        t++;
      }
    }
    function Lc(e) {
      e.push(new ve(Re, ''));
      let t = 0,
        r = 0,
        n = 0,
        o = '',
        i = '',
        a;
      for (; t < e.length;)
        switch (e[t][0]) {
          case Ue:
            (n++, (i += e[t][1]), t++);
            break;
          case qe:
            (r++, (o += e[t][1]), t++);
            break;
          case Re:
            (r + n > 1
              ? (r !== 0 &&
                  n !== 0 &&
                  ((a = S0(i, o)),
                  a !== 0 &&
                    (t - r - n > 0 && e[t - r - n - 1][0] === Re
                      ? (e[t - r - n - 1][1] += i.substring(0, a))
                      : (e.splice(0, 0, new ve(Re, i.substring(0, a))), t++),
                    (i = i.substring(a)),
                    (o = o.substring(a))),
                  (a = Fc(i, o)),
                  a !== 0 &&
                    ((e[t][1] = i.substring(i.length - a) + e[t][1]),
                    (i = i.substring(0, i.length - a)),
                    (o = o.substring(0, o.length - a)))),
                (t -= r + n),
                e.splice(t, r + n),
                o.length && (e.splice(t, 0, new ve(qe, o)), t++),
                i.length && (e.splice(t, 0, new ve(Ue, i)), t++),
                t++)
              : t !== 0 && e[t - 1][0] === Re
                ? ((e[t - 1][1] += e[t][1]), e.splice(t, 1))
                : t++,
              (n = 0),
              (r = 0),
              (o = ''),
              (i = ''));
            break;
        }
      e[e.length - 1][1] === '' && e.pop();
      let l = !1;
      for (t = 1; t < e.length - 1;)
        (e[t - 1][0] === Re &&
          e[t + 1][0] === Re &&
          (e[t][1].substring(e[t][1].length - e[t - 1][1].length) === e[t - 1][1]
            ? ((e[t][1] = e[t - 1][1] + e[t][1].substring(0, e[t][1].length - e[t - 1][1].length)),
              (e[t + 1][1] = e[t - 1][1] + e[t + 1][1]),
              e.splice(t - 1, 1),
              (l = !0))
            : e[t][1].substring(0, e[t + 1][1].length) === e[t + 1][1] &&
              ((e[t - 1][1] += e[t + 1][1]),
              (e[t][1] = e[t][1].substring(e[t + 1][1].length) + e[t + 1][1]),
              e.splice(t + 1, 1),
              (l = !0))),
          t++);
      l && Lc(e);
    }
    function Qn(e, t) {
      if (!e || !t) return 6;
      let r = e.charAt(e.length - 1),
        n = t.charAt(0),
        o = r.match(Gu),
        i = n.match(Gu),
        a = o && r.match(Wu),
        l = i && n.match(Wu),
        s = a && r.match(Yu),
        d = l && n.match(Yu),
        p = s && e.match(T0),
        m = d && t.match(w0);
      return p || m ? 5 : s || d ? 4 : o && !a && l ? 3 : a || l ? 2 : o || i ? 1 : 0;
    }
    var Bc = 'Compared values have no visual difference.',
      v0 =
        'Compared values serialize to the same structure.\nPrinting internal object structure without calling `toJSON` instead.',
      eo = {},
      Ku;
    function x0() {
      if (Ku) return eo;
      ((Ku = 1), Object.defineProperty(eo, '__esModule', { value: !0 }), (eo.default = h));
      let e = 'diff-sequences',
        t = 0,
        r = (g, E, b, _, y) => {
          let S = 0;
          for (; g < E && b < _ && y(g, b);) ((g += 1), (b += 1), (S += 1));
          return S;
        },
        n = (g, E, b, _, y) => {
          let S = 0;
          for (; g <= E && b <= _ && y(E, _);) ((E -= 1), (_ -= 1), (S += 1));
          return S;
        },
        o = (g, E, b, _, y, S, A) => {
          let T = 0,
            C = -g,
            x = S[T],
            v = x;
          S[T] += r(x + 1, E, _ + x - C + 1, b, y);
          let I = g < A ? g : A;
          for (T += 1, C += 2; T <= I; T += 1, C += 2) {
            if (T !== g && v < S[T]) x = S[T];
            else if (((x = v + 1), E <= x)) return T - 1;
            ((v = S[T]), (S[T] = x + r(x + 1, E, _ + x - C + 1, b, y)));
          }
          return A;
        },
        i = (g, E, b, _, y, S, A) => {
          let T = 0,
            C = g,
            x = S[T],
            v = x;
          S[T] -= n(E, x - 1, b, _ + x - C - 1, y);
          let I = g < A ? g : A;
          for (T += 1, C -= 2; T <= I; T += 1, C -= 2) {
            if (T !== g && S[T] < v) x = S[T];
            else if (((x = v - 1), x < E)) return T - 1;
            ((v = S[T]), (S[T] = x - n(E, x - 1, b, _ + x - C - 1, y)));
          }
          return A;
        },
        a = (g, E, b, _, y, S, A, T, C, x, v) => {
          let I = _ - E,
            N = b - E,
            B = y - _ - N,
            F = -B - (g - 1),
            z = -B + (g - 1),
            k = t,
            R = g < T ? g : T;
          for (let O = 0, L = -g; O <= R; O += 1, L += 2) {
            let $ = O === 0 || (O !== g && k < A[O]),
              M = $ ? A[O] : k,
              J = $ ? M : M + 1,
              j = I + J - L,
              W = r(J + 1, b, j + 1, y, S),
              Z = J + W;
            if (((k = A[O]), (A[O] = Z), F <= L && L <= z)) {
              let ue = (g - 1 - (L + B)) / 2;
              if (ue <= x && C[ue] - 1 <= Z) {
                let me = I + M - ($ ? L + 1 : L - 1),
                  ie = n(E, M, _, me, S),
                  fe = M - ie,
                  xe = me - ie,
                  Ie = fe + 1,
                  rt = xe + 1;
                ((v.nChangePreceding = g - 1),
                  g - 1 === Ie + rt - E - _
                    ? ((v.aEndPreceding = E), (v.bEndPreceding = _))
                    : ((v.aEndPreceding = Ie), (v.bEndPreceding = rt)),
                  (v.nCommonPreceding = ie),
                  ie !== 0 && ((v.aCommonPreceding = Ie), (v.bCommonPreceding = rt)),
                  (v.nCommonFollowing = W),
                  W !== 0 && ((v.aCommonFollowing = J + 1), (v.bCommonFollowing = j + 1)));
                let Ge = Z + 1,
                  ct = j + W + 1;
                return (
                  (v.nChangeFollowing = g - 1),
                  g - 1 === b + y - Ge - ct
                    ? ((v.aStartFollowing = b), (v.bStartFollowing = y))
                    : ((v.aStartFollowing = Ge), (v.bStartFollowing = ct)),
                  !0
                );
              }
            }
          }
          return !1;
        },
        l = (g, E, b, _, y, S, A, T, C, x, v) => {
          let I = y - b,
            N = b - E,
            B = y - _ - N,
            F = B - g,
            z = B + g,
            k = t,
            R = g < x ? g : x;
          for (let O = 0, L = g; O <= R; O += 1, L -= 2) {
            let $ = O === 0 || (O !== g && C[O] < k),
              M = $ ? C[O] : k,
              J = $ ? M : M - 1,
              j = I + J - L,
              W = n(E, J - 1, _, j - 1, S),
              Z = J - W;
            if (((k = C[O]), (C[O] = Z), F <= L && L <= z)) {
              let ue = (g + (L - B)) / 2;
              if (ue <= T && Z - 1 <= A[ue]) {
                let me = j - W;
                if (
                  ((v.nChangePreceding = g),
                  g === Z + me - E - _
                    ? ((v.aEndPreceding = E), (v.bEndPreceding = _))
                    : ((v.aEndPreceding = Z), (v.bEndPreceding = me)),
                  (v.nCommonPreceding = W),
                  W !== 0 && ((v.aCommonPreceding = Z), (v.bCommonPreceding = me)),
                  (v.nChangeFollowing = g - 1),
                  g === 1)
                )
                  ((v.nCommonFollowing = 0), (v.aStartFollowing = b), (v.bStartFollowing = y));
                else {
                  let ie = I + M - ($ ? L - 1 : L + 1),
                    fe = r(M, b, ie, y, S);
                  ((v.nCommonFollowing = fe),
                    fe !== 0 && ((v.aCommonFollowing = M), (v.bCommonFollowing = ie)));
                  let xe = M + fe,
                    Ie = ie + fe;
                  g - 1 === b + y - xe - Ie
                    ? ((v.aStartFollowing = b), (v.bStartFollowing = y))
                    : ((v.aStartFollowing = xe), (v.bStartFollowing = Ie));
                }
                return !0;
              }
            }
          }
          return !1;
        },
        s = (g, E, b, _, y, S, A, T, C) => {
          let x = _ - E,
            v = y - b,
            I = b - E,
            N = y - _,
            B = N - I,
            F = I,
            z = I;
          if (((A[0] = E - 1), (T[0] = b), B % 2 === 0)) {
            let k = (g || B) / 2,
              R = (I + N) / 2;
            for (let O = 1; O <= R; O += 1)
              if (((F = o(O, b, y, x, S, A, F)), O < k)) z = i(O, E, _, v, S, T, z);
              else if (l(O, E, b, _, y, S, A, F, T, z, C)) return;
          } else {
            let k = ((g || B) + 1) / 2,
              R = (I + N + 1) / 2,
              O = 1;
            for (F = o(O, b, y, x, S, A, F), O += 1; O <= R; O += 1)
              if (((z = i(O - 1, E, _, v, S, T, z)), O < k)) F = o(O, b, y, x, S, A, F);
              else if (a(O, E, b, _, y, S, A, F, T, z, C)) return;
          }
          throw new Error(`${e}: no overlap aStart=${E} aEnd=${b} bStart=${_} bEnd=${y}`);
        },
        d = (g, E, b, _, y, S, A, T, C, x) => {
          if (y - _ < b - E) {
            if (((S = !S), S && A.length === 1)) {
              let { foundSubsequence: ue, isCommon: me } = A[0];
              A[1] = {
                foundSubsequence: (ie, fe, xe) => {
                  ue(ie, xe, fe);
                },
                isCommon: (ie, fe) => me(fe, ie),
              };
            }
            let W = E,
              Z = b;
            ((E = _), (b = y), (_ = W), (y = Z));
          }
          let { foundSubsequence: v, isCommon: I } = A[S ? 1 : 0];
          s(g, E, b, _, y, I, T, C, x);
          let {
            nChangePreceding: N,
            aEndPreceding: B,
            bEndPreceding: F,
            nCommonPreceding: z,
            aCommonPreceding: k,
            bCommonPreceding: R,
            nCommonFollowing: O,
            aCommonFollowing: L,
            bCommonFollowing: $,
            nChangeFollowing: M,
            aStartFollowing: J,
            bStartFollowing: j,
          } = x;
          (E < B && _ < F && d(N, E, B, _, F, S, A, T, C, x),
            z !== 0 && v(z, k, R),
            O !== 0 && v(O, L, $),
            J < b && j < y && d(M, J, b, j, y, S, A, T, C, x));
        },
        p = (g, E) => {
          if (typeof E != 'number')
            throw new TypeError(`${e}: ${g} typeof ${typeof E} is not a number`);
          if (!Number.isSafeInteger(E))
            throw new RangeError(`${e}: ${g} value ${E} is not a safe integer`);
          if (E < 0) throw new RangeError(`${e}: ${g} value ${E} is a negative integer`);
        },
        m = (g, E) => {
          let b = typeof E;
          if (b !== 'function') throw new TypeError(`${e}: ${g} typeof ${b} is not a function`);
        };
      function h(g, E, b, _) {
        (p('aLength', g), p('bLength', E), m('isCommon', b), m('foundSubsequence', _));
        let y = r(0, g, 0, E, b);
        if ((y !== 0 && _(y, 0, 0), g !== y || E !== y)) {
          let S = y,
            A = y,
            T = n(S, g - 1, A, E - 1, b),
            C = g - T,
            x = E - T,
            v = y + T;
          (g !== v &&
            E !== v &&
            d(0, S, C, A, x, !1, [{ foundSubsequence: _, isCommon: b }], [t], [t], {
              aCommonFollowing: t,
              aCommonPreceding: t,
              aEndPreceding: t,
              aStartFollowing: t,
              bCommonFollowing: t,
              bCommonPreceding: t,
              bEndPreceding: t,
              bStartFollowing: t,
              nChangeFollowing: t,
              nChangePreceding: t,
              nCommonFollowing: t,
              nCommonPreceding: t,
            }),
            T !== 0 && _(T, C, x));
        }
      }
      return eo;
    }
    var C0 = x0(),
      Mc = y0(C0);
    function O0(e, t) {
      return e.replace(/\s+$/, (r) => t(r));
    }
    function pi(e, t, r, n, o, i) {
      return e.length !== 0
        ? r(`${n} ${O0(e, o)}`)
        : n !== ' '
          ? r(n)
          : t && i.length !== 0
            ? r(`${n} ${i}`)
            : '';
    }
    function $c(
      e,
      t,
      {
        aColor: r,
        aIndicator: n,
        changeLineTrailingSpaceColor: o,
        emptyFirstOrLastLinePlaceholder: i,
      },
    ) {
      return pi(e, t, r, n, o, i);
    }
    function jc(
      e,
      t,
      {
        bColor: r,
        bIndicator: n,
        changeLineTrailingSpaceColor: o,
        emptyFirstOrLastLinePlaceholder: i,
      },
    ) {
      return pi(e, t, r, n, o, i);
    }
    function Uc(
      e,
      t,
      {
        commonColor: r,
        commonIndicator: n,
        commonLineTrailingSpaceColor: o,
        emptyFirstOrLastLinePlaceholder: i,
      },
    ) {
      return pi(e, t, r, n, o, i);
    }
    function Xu(e, t, r, n, { patchColor: o }) {
      return o(`@@ -${e + 1},${t - e} +${r + 1},${n - r} @@`);
    }
    function R0(e, t) {
      let r = e.length,
        n = t.contextLines,
        o = n + n,
        i = r,
        a = !1,
        l = 0,
        s = 0;
      for (; s !== r;) {
        let T = s;
        for (; s !== r && e[s][0] === Re;) s += 1;
        if (T !== s)
          if (T === 0) s > n && ((i -= s - n), (a = !0));
          else if (s === r) {
            let C = s - T;
            C > n && ((i -= C - n), (a = !0));
          } else {
            let C = s - T;
            C > o && ((i -= C - o), (l += 1));
          }
        for (; s !== r && e[s][0] !== Re;) s += 1;
      }
      let d = l !== 0 || a;
      l !== 0 ? (i += l + 1) : a && (i += 1);
      let p = i - 1,
        m = [],
        h = 0;
      d && m.push('');
      let g = 0,
        E = 0,
        b = 0,
        _ = 0,
        y = (T) => {
          let C = m.length;
          (m.push(Uc(T, C === 0 || C === p, t)), (b += 1), (_ += 1));
        },
        S = (T) => {
          let C = m.length;
          (m.push($c(T, C === 0 || C === p, t)), (b += 1));
        },
        A = (T) => {
          let C = m.length;
          (m.push(jc(T, C === 0 || C === p, t)), (_ += 1));
        };
      for (s = 0; s !== r;) {
        let T = s;
        for (; s !== r && e[s][0] === Re;) s += 1;
        if (T !== s)
          if (T === 0) {
            s > n && ((T = s - n), (g = T), (E = T), (b = g), (_ = E));
            for (let C = T; C !== s; C += 1) y(e[C][1]);
          } else if (s === r) {
            let C = s - T > n ? T + n : s;
            for (let x = T; x !== C; x += 1) y(e[x][1]);
          } else {
            let C = s - T;
            if (C > o) {
              let x = T + n;
              for (let I = T; I !== x; I += 1) y(e[I][1]);
              ((m[h] = Xu(g, b, E, _, t)), (h = m.length), m.push(''));
              let v = C - o;
              ((g = b + v), (E = _ + v), (b = g), (_ = E));
              for (let I = s - n; I !== s; I += 1) y(e[I][1]);
            } else for (let x = T; x !== s; x += 1) y(e[x][1]);
          }
        for (; s !== r && e[s][0] === qe;) (S(e[s][1]), (s += 1));
        for (; s !== r && e[s][0] === Ue;) (A(e[s][1]), (s += 1));
      }
      return (
        d && (m[h] = Xu(g, b, E, _, t)),
        m.join(`
`)
      );
    }
    function I0(e, t) {
      return e.map((r, n, o) => {
        let i = r[1],
          a = n === 0 || n === o.length - 1;
        switch (r[0]) {
          case qe:
            return $c(i, a, t);
          case Ue:
            return jc(i, a, t);
          default:
            return Uc(i, a, t);
        }
      }).join(`
`);
    }
    var Ya = (e) => e,
      Vc = 5,
      D0 = 0;
    function P0() {
      return {
        aAnnotation: 'Expected',
        aColor: Nt.green,
        aIndicator: '-',
        bAnnotation: 'Received',
        bColor: Nt.red,
        bIndicator: '+',
        changeColor: Nt.inverse,
        changeLineTrailingSpaceColor: Ya,
        commonColor: Nt.dim,
        commonIndicator: ' ',
        commonLineTrailingSpaceColor: Ya,
        compareKeys: void 0,
        contextLines: Vc,
        emptyFirstOrLastLinePlaceholder: '',
        expand: !1,
        includeChangeCounts: !1,
        omitAnnotationLines: !1,
        patchColor: Nt.yellow,
        printBasicPrototype: !1,
        truncateThreshold: D0,
        truncateAnnotation: '... Diff result is truncated',
        truncateAnnotationColor: Ya,
      };
    }
    function N0(e) {
      return e && typeof e == 'function' ? e : void 0;
    }
    function k0(e) {
      return typeof e == 'number' && Number.isSafeInteger(e) && e >= 0 ? e : Vc;
    }
    function mr(e = {}) {
      return { ...P0(), ...e, compareKeys: N0(e.compareKeys), contextLines: k0(e.contextLines) };
    }
    function Fr(e) {
      return e.length === 1 && e[0].length === 0;
    }
    function F0(e) {
      let t = 0,
        r = 0;
      return (
        e.forEach((n) => {
          switch (n[0]) {
            case qe:
              t += 1;
              break;
            case Ue:
              r += 1;
              break;
          }
        }),
        { a: t, b: r }
      );
    }
    function L0(
      {
        aAnnotation: e,
        aColor: t,
        aIndicator: r,
        bAnnotation: n,
        bColor: o,
        bIndicator: i,
        includeChangeCounts: a,
        omitAnnotationLines: l,
      },
      s,
    ) {
      if (l) return '';
      let d = '',
        p = '';
      if (a) {
        let g = String(s.a),
          E = String(s.b),
          b = n.length - e.length,
          _ = ' '.repeat(Math.max(0, b)),
          y = ' '.repeat(Math.max(0, -b)),
          S = E.length - g.length,
          A = ' '.repeat(Math.max(0, S)),
          T = ' '.repeat(Math.max(0, -S));
        ((d = `${_}  ${r} ${A}${g}`), (p = `${y}  ${i} ${T}${E}`));
      }
      let m = `${r} ${e}${d}`,
        h = `${i} ${n}${p}`;
      return `${t(m)}
${o(h)}

`;
    }
    function mi(e, t, r) {
      return (
        L0(r, F0(e)) +
        (r.expand ? I0(e, r) : R0(e, r)) +
        (t
          ? r.truncateAnnotationColor(`
${r.truncateAnnotation}`)
          : '')
      );
    }
    function so(e, t, r) {
      let n = mr(r),
        [o, i] = Hc(Fr(e) ? [] : e, Fr(t) ? [] : t, n);
      return mi(o, i, n);
    }
    function B0(e, t, r, n, o) {
      if (
        (Fr(e) && Fr(r) && ((e = []), (r = [])),
        Fr(t) && Fr(n) && ((t = []), (n = [])),
        e.length !== r.length || t.length !== n.length)
      )
        return so(e, t, o);
      let [i, a] = Hc(r, n, o),
        l = 0,
        s = 0;
      return (
        i.forEach((d) => {
          switch (d[0]) {
            case qe:
              ((d[1] = e[l]), (l += 1));
              break;
            case Ue:
              ((d[1] = t[s]), (s += 1));
              break;
            default:
              ((d[1] = t[s]), (l += 1), (s += 1));
          }
        }),
        mi(i, a, mr(o))
      );
    }
    function Hc(e, t, r) {
      let n = r?.truncateThreshold ?? !1,
        o = Math.max(Math.floor(r?.truncateThreshold ?? 0), 0),
        i = n ? Math.min(e.length, o) : e.length,
        a = n ? Math.min(t.length, o) : t.length,
        l = i !== e.length || a !== t.length,
        s = (h, g) => e[h] === t[g],
        d = [],
        p = 0,
        m = 0;
      for (
        Mc(i, a, s, (h, g, E) => {
          for (; p !== g; p += 1) d.push(new ve(qe, e[p]));
          for (; m !== E; m += 1) d.push(new ve(Ue, t[m]));
          for (; h !== 0; h -= 1, p += 1, m += 1) d.push(new ve(Re, t[m]));
        });
        p !== i;
        p += 1
      )
        d.push(new ve(qe, e[p]));
      for (; m !== a; m += 1) d.push(new ve(Ue, t[m]));
      return [d, l];
    }
    function Zu(e) {
      if (e === void 0) return 'undefined';
      if (e === null) return 'null';
      if (Array.isArray(e)) return 'array';
      if (typeof e == 'boolean') return 'boolean';
      if (typeof e == 'function') return 'function';
      if (typeof e == 'number') return 'number';
      if (typeof e == 'string') return 'string';
      if (typeof e == 'bigint') return 'bigint';
      if (typeof e == 'object') {
        if (e != null) {
          if (e.constructor === RegExp) return 'regexp';
          if (e.constructor === Map) return 'map';
          if (e.constructor === Set) return 'set';
          if (e.constructor === Date) return 'date';
        }
        return 'object';
      } else if (typeof e == 'symbol') return 'symbol';
      throw new Error(`value of unknown type: ${e}`);
    }
    function Qu(e) {
      return e.includes(`\r
`)
        ? `\r
`
        : `
`;
    }
    function M0(e, t, r) {
      let n = r?.truncateThreshold ?? !1,
        o = Math.max(Math.floor(r?.truncateThreshold ?? 0), 0),
        i = e.length,
        a = t.length;
      if (n) {
        let h = e.includes(`
`),
          g = t.includes(`
`),
          E = Qu(e),
          b = Qu(t),
          _ = h
            ? `${e.split(E, o).join(E)}
`
            : e,
          y = g
            ? `${t.split(b, o).join(b)}
`
            : t;
        ((i = _.length), (a = y.length));
      }
      let l = i !== e.length || a !== t.length,
        s = (h, g) => e[h] === t[g],
        d = 0,
        p = 0,
        m = [];
      return (
        Mc(i, a, s, (h, g, E) => {
          (d !== g && m.push(new ve(qe, e.slice(d, g))),
            p !== E && m.push(new ve(Ue, t.slice(p, E))),
            (d = g + h),
            (p = E + h),
            m.push(new ve(Re, t.slice(E, p))));
        }),
        d !== i && m.push(new ve(qe, e.slice(d))),
        p !== a && m.push(new ve(Ue, t.slice(p))),
        [m, l]
      );
    }
    function $0(e, t, r) {
      return t.reduce(
        (n, o) => n + (o[0] === Re ? o[1] : o[0] === e && o[1].length !== 0 ? r(o[1]) : ''),
        '',
      );
    }
    var ec = class {
        op;
        line;
        lines;
        changeColor;
        constructor(e, t) {
          ((this.op = e), (this.line = []), (this.lines = []), (this.changeColor = t));
        }
        pushSubstring(e) {
          this.pushDiff(new ve(this.op, e));
        }
        pushLine() {
          (this.lines.push(
            this.line.length !== 1
              ? new ve(this.op, $0(this.op, this.line, this.changeColor))
              : this.line[0][0] === this.op
                ? this.line[0]
                : new ve(this.op, this.line[0][1]),
          ),
            (this.line.length = 0));
        }
        isLineEmpty() {
          return this.line.length === 0;
        }
        pushDiff(e) {
          this.line.push(e);
        }
        align(e) {
          let t = e[1];
          if (
            t.includes(`
`)
          ) {
            let r = t.split(`
`),
              n = r.length - 1;
            r.forEach((o, i) => {
              i < n
                ? (this.pushSubstring(o), this.pushLine())
                : o.length !== 0 && this.pushSubstring(o);
            });
          } else this.pushDiff(e);
        }
        moveLinesTo(e) {
          (this.isLineEmpty() || this.pushLine(), e.push(...this.lines), (this.lines.length = 0));
        }
      },
      j0 = class {
        deleteBuffer;
        insertBuffer;
        lines;
        constructor(e, t) {
          ((this.deleteBuffer = e), (this.insertBuffer = t), (this.lines = []));
        }
        pushDiffCommonLine(e) {
          this.lines.push(e);
        }
        pushDiffChangeLines(e) {
          let t = e[1].length === 0;
          ((!t || this.deleteBuffer.isLineEmpty()) && this.deleteBuffer.pushDiff(e),
            (!t || this.insertBuffer.isLineEmpty()) && this.insertBuffer.pushDiff(e));
        }
        flushChangeLines() {
          (this.deleteBuffer.moveLinesTo(this.lines), this.insertBuffer.moveLinesTo(this.lines));
        }
        align(e) {
          let t = e[0],
            r = e[1];
          if (
            r.includes(`
`)
          ) {
            let n = r.split(`
`),
              o = n.length - 1;
            n.forEach((i, a) => {
              if (a === 0) {
                let l = new ve(t, i);
                this.deleteBuffer.isLineEmpty() && this.insertBuffer.isLineEmpty()
                  ? (this.flushChangeLines(), this.pushDiffCommonLine(l))
                  : (this.pushDiffChangeLines(l), this.flushChangeLines());
              } else
                a < o
                  ? this.pushDiffCommonLine(new ve(t, i))
                  : i.length !== 0 && this.pushDiffChangeLines(new ve(t, i));
            });
          } else this.pushDiffChangeLines(e);
        }
        getLines() {
          return (this.flushChangeLines(), this.lines);
        }
      };
    function U0(e, t) {
      let r = new ec(qe, t),
        n = new ec(Ue, t),
        o = new j0(r, n);
      return (
        e.forEach((i) => {
          switch (i[0]) {
            case qe:
              r.align(i);
              break;
            case Ue:
              n.align(i);
              break;
            default:
              o.align(i);
          }
        }),
        o.getLines()
      );
    }
    function V0(e, t) {
      if (t) {
        let r = e.length - 1;
        return e.some(
          (n, o) =>
            n[0] === Re &&
            (o !== r ||
              n[1] !==
                `
`),
        );
      }
      return e.some((r) => r[0] === Re);
    }
    function H0(e, t, r) {
      if (e !== t && e.length !== 0 && t.length !== 0) {
        let n =
            e.includes(`
`) ||
            t.includes(`
`),
          [o, i] = Jc(
            n
              ? `${e}
`
              : e,
            n
              ? `${t}
`
              : t,
            !0,
            r,
          );
        if (V0(o, n)) {
          let a = mr(r),
            l = U0(o, a.changeColor);
          return mi(l, i, a);
        }
      }
      return so(
        e.split(`
`),
        t.split(`
`),
        r,
      );
    }
    function Jc(e, t, r, n) {
      let [o, i] = M0(e, t, n);
      return (r && A0(o), [o, i]);
    }
    function ti(e, t) {
      let { commonColor: r } = mr(t);
      return r(e);
    }
    var {
        AsymmetricMatcher: J0,
        DOMCollection: q0,
        DOMElement: z0,
        Immutable: G0,
        ReactElement: W0,
        ReactTestComponent: Y0,
      } = di,
      qc = [Y0, W0, z0, q0, G0, J0, di.Error],
      ri = { maxDepth: 20, plugins: qc },
      zc = { callToJSON: !1, maxDepth: 8, plugins: qc };
    function K0(e, t, r) {
      if (Object.is(e, t)) return '';
      let n = Zu(e),
        o = n,
        i = !1;
      if (n === 'object' && typeof e.asymmetricMatch == 'function') {
        if (
          e.$$typeof !== Symbol.for('jest.asymmetricMatcher') ||
          typeof e.getExpectedType != 'function'
        )
          return;
        ((o = e.getExpectedType()), (i = o === 'string'));
      }
      if (o !== Zu(t)) {
        let a = function (A) {
            return A.length <= _ ? A : `${A.slice(0, _)}...`;
          },
          {
            aAnnotation: l,
            aColor: s,
            aIndicator: d,
            bAnnotation: p,
            bColor: m,
            bIndicator: h,
          } = mr(r),
          g = ni(zc, r),
          E = wt(e, g),
          b = wt(t, g),
          _ = 1e5;
        ((E = a(E)), (b = a(b)));
        let y = `${s(`${d} ${l}:`)} 
${E}`,
          S = `${m(`${h} ${p}:`)} 
${b}`;
        return `${y}

${S}`;
      }
      if (!i)
        switch (n) {
          case 'string':
            return so(
              e.split(`
`),
              t.split(`
`),
              r,
            );
          case 'boolean':
          case 'number':
            return X0(e, t, r);
          case 'map':
            return Ka(tc(e), tc(t), r);
          case 'set':
            return Ka(rc(e), rc(t), r);
          default:
            return Ka(e, t, r);
        }
    }
    function X0(e, t, r) {
      let n = wt(e, ri),
        o = wt(t, ri);
      return n === o
        ? ''
        : so(
            n.split(`
`),
            o.split(`
`),
            r,
          );
    }
    function tc(e) {
      return new Map(Array.from(e.entries()).sort());
    }
    function rc(e) {
      return new Set(Array.from(e.values()).sort());
    }
    function Ka(e, t, r) {
      let n,
        o = !1;
      try {
        let a = ni(ri, r);
        n = nc(e, t, a, r);
      } catch {
        o = !0;
      }
      let i = ti(Bc, r);
      if (n === void 0 || n === i) {
        let a = ni(zc, r);
        ((n = nc(e, t, a, r)),
          n !== i &&
            !o &&
            (n = `${ti(v0, r)}

${n}`));
      }
      return n;
    }
    function ni(e, t) {
      let { compareKeys: r, printBasicPrototype: n, maxDepth: o } = mr(t);
      return { ...e, compareKeys: r, printBasicPrototype: n, maxDepth: o ?? e.maxDepth };
    }
    function nc(e, t, r, n) {
      let o = { ...r, indent: 0 },
        i = wt(e, o),
        a = wt(t, o);
      if (i === a) return ti(Bc, n);
      {
        let l = wt(e, r),
          s = wt(t, r);
        return B0(
          l.split(`
`),
          s.split(`
`),
          i.split(`
`),
          a.split(`
`),
          n,
        );
      }
    }
    var oc = 2e4;
    function ac(e) {
      return Qa(e) === 'Object' && typeof e.asymmetricMatch == 'function';
    }
    function ic(e, t) {
      let r = Qa(e),
        n = Qa(t);
      return r === n && (r === 'Object' || r === 'Array');
    }
    function Z0(e, t, r) {
      let { aAnnotation: n, bAnnotation: o } = mr(r);
      if (
        typeof t == 'string' &&
        typeof e == 'string' &&
        t.length > 0 &&
        e.length > 0 &&
        t.length <= oc &&
        e.length <= oc &&
        t !== e
      ) {
        if (
          t.includes(`
`) ||
          e.includes(`
`)
        )
          return H0(t, e, r);
        let [d] = Jc(t, e, !0),
          p = d.some((E) => E[0] === Re),
          m = Q0(n, o),
          h = m(n) + rb(sc(d, qe, p)),
          g = m(o) + tb(sc(d, Ue, p));
        return `${h}
${g}`;
      }
      let i = qu(t, { forceWritable: !0 }),
        a = qu(e, { forceWritable: !0 }),
        { replacedExpected: l, replacedActual: s } = Gc(a, i);
      return K0(l, s, r);
    }
    function Gc(e, t, r = new WeakSet(), n = new WeakSet()) {
      return e instanceof Error &&
        t instanceof Error &&
        typeof e.cause < 'u' &&
        typeof t.cause > 'u'
        ? (delete e.cause, { replacedActual: e, replacedExpected: t })
        : ic(e, t)
          ? r.has(e) || n.has(t)
            ? { replacedActual: e, replacedExpected: t }
            : (r.add(e),
              n.add(t),
              Nc(t).forEach((o) => {
                let i = t[o],
                  a = e[o];
                if (ac(i)) i.asymmetricMatch(a) && (e[o] = i);
                else if (ac(a)) a.asymmetricMatch(i) && (t[o] = a);
                else if (ic(a, i)) {
                  let l = Gc(a, i, r, n);
                  ((e[o] = l.replacedActual), (t[o] = l.replacedExpected));
                }
              }),
              { replacedActual: e, replacedExpected: t })
          : { replacedActual: e, replacedExpected: t };
    }
    function Q0(...e) {
      let t = e.reduce((r, n) => (n.length > r ? n.length : r), 0);
      return (r) => `${r}: ${' '.repeat(t - r.length)}`;
    }
    var eb = '\xB7';
    function Wc(e) {
      return e.replace(/\s+$/gm, (t) => eb.repeat(t.length));
    }
    function tb(e) {
      return Nt.red(Wc(sn(e)));
    }
    function rb(e) {
      return Nt.green(Wc(sn(e)));
    }
    function sc(e, t, r) {
      return e.reduce(
        (n, o) => n + (o[0] === Re ? o[1] : o[0] === t ? (r ? Nt.inverse(o[1]) : o[1]) : ''),
        '',
      );
    }
    var nb = '@@__IMMUTABLE_RECORD__@@',
      ob = '@@__IMMUTABLE_ITERABLE__@@';
    function ab(e) {
      return e && (e[ob] || e[nb]);
    }
    var ib = Object.getPrototypeOf({});
    function lc(e) {
      return e instanceof Error
        ? `<unserializable>: ${e.message}`
        : typeof e == 'string'
          ? `<unserializable>: ${e}`
          : '<unserializable>';
    }
    function Gt(e, t = new WeakMap()) {
      if (!e || typeof e == 'string') return e;
      if (e instanceof Error && 'toJSON' in e && typeof e.toJSON == 'function') {
        let r = e.toJSON();
        return (
          r &&
            r !== e &&
            typeof r == 'object' &&
            (typeof e.message == 'string' && to(() => r.message ?? (r.message = e.message)),
            typeof e.stack == 'string' && to(() => r.stack ?? (r.stack = e.stack)),
            typeof e.name == 'string' && to(() => r.name ?? (r.name = e.name)),
            e.cause != null && to(() => r.cause ?? (r.cause = Gt(e.cause, t)))),
          Gt(r, t)
        );
      }
      if (typeof e == 'function') return `Function<${e.name || 'anonymous'}>`;
      if (typeof e == 'symbol') return e.toString();
      if (typeof e != 'object') return e;
      if (typeof Buffer < 'u' && e instanceof Buffer) return `<Buffer(${e.length}) ...>`;
      if (typeof Uint8Array < 'u' && e instanceof Uint8Array)
        return `<Uint8Array(${e.length}) ...>`;
      if (ab(e)) return Gt(e.toJSON(), t);
      if (e instanceof Promise || (e.constructor && e.constructor.prototype === 'AsyncFunction'))
        return 'Promise';
      if (typeof Element < 'u' && e instanceof Element) return e.tagName;
      if (typeof e.asymmetricMatch == 'function') return `${e.toString()} ${g0(e.sample)}`;
      if (typeof e.toJSON == 'function') return Gt(e.toJSON(), t);
      if (t.has(e)) return t.get(e);
      if (Array.isArray(e)) {
        let r = new Array(e.length);
        return (
          t.set(e, r),
          e.forEach((n, o) => {
            try {
              r[o] = Gt(n, t);
            } catch (i) {
              r[o] = lc(i);
            }
          }),
          r
        );
      } else {
        let r = Object.create(null);
        t.set(e, r);
        let n = e;
        for (; n && n !== ib;)
          (Object.getOwnPropertyNames(n).forEach((o) => {
            if (!(o in r))
              try {
                r[o] = Gt(e[o], t);
              } catch (i) {
                (delete r[o], (r[o] = lc(i)));
              }
          }),
            (n = Object.getPrototypeOf(n)));
        return r;
      }
    }
    function to(e) {
      try {
        return e();
      } catch {}
    }
    function sb(e) {
      return e.replace(/__(vite_ssr_import|vi_import)_\d+__\./g, '');
    }
    function hi(e, t, r = new WeakSet()) {
      if (!e || typeof e != 'object') return { message: String(e) };
      let n = e;
      ((n.showDiff || (n.showDiff === void 0 && n.expected !== void 0 && n.actual !== void 0)) &&
        (n.diff = Z0(n.actual, n.expected, { ...t, ...n.diffOptions })),
        'expected' in n && typeof n.expected != 'string' && (n.expected = sn(n.expected, 10)),
        'actual' in n && typeof n.actual != 'string' && (n.actual = sn(n.actual, 10)));
      try {
        typeof n.message == 'string' && (n.message = sb(n.message));
      } catch {}
      try {
        !r.has(n) && typeof n.cause == 'object' && (r.add(n), (n.cause = hi(n.cause, t, r)));
      } catch {}
      try {
        return Gt(n);
      } catch (o) {
        return Gt(
          new Error(`Failed to fully serialize error: ${o?.message}
Inner error message: ${n?.message}`),
        );
      }
    }
    it();
    var fi = globalThis.__STORYBOOK_ADDONS_PREVIEW,
      lb = new Error(
        'This function ran after the play function completed. Did you forget to `await` it?',
      ),
      Yc = (e) => Object.prototype.toString.call(e) === '[object Object]',
      ub = (e) => Object.prototype.toString.call(e) === '[object Module]',
      cb = (e) => {
        if (!Yc(e) && !ub(e)) return !1;
        if (e.constructor === void 0) return !0;
        let t = e.constructor.prototype;
        return !!Yc(t);
      },
      db = (e) => {
        try {
          return new e.constructor();
        } catch {
          return {};
        }
      },
      gi = () => ({
        renderPhase: 'preparing',
        isDebugging: !1,
        isPlaying: !1,
        isLocked: !1,
        cursor: 0,
        calls: [],
        shadowCalls: [],
        callRefsByResult: new Map(),
        chainedCallIds: new Set(),
        ancestors: [],
        playUntil: void 0,
        resolvers: {},
        syncTimeout: void 0,
      }),
      Kc = (e, t = !1) => {
        let r = (t ? e.shadowCalls : e.calls).filter((o) => o.retain);
        if (!r.length) return;
        let n = new Map(Array.from(e.callRefsByResult.entries()).filter(([, o]) => o.retain));
        return { cursor: r.length, calls: r, callRefsByResult: n };
      },
      pb = class {
        constructor() {
          ((this.detached = !1),
            (this.initialized = !1),
            (this.state = {}),
            (this.loadParentWindowState = () => {
              try {
                this.state =
                  K.window?.parent?.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER_STATE__ || {};
              } catch {
                this.detached = !0;
              }
            }),
            (this.updateParentWindowState = () => {
              try {
                K.window.parent.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER_STATE__ = this.state;
              } catch {
                this.detached = !0;
              }
            }),
            this.loadParentWindowState());
          let e = ({ storyId: l, renderPhase: s, isPlaying: d = !0, isDebugging: p = !1 }) => {
              let m = this.getState(l);
              (this.setState(l, {
                ...gi(),
                ...Kc(m, p),
                renderPhase: s || m.renderPhase,
                shadowCalls: p ? m.shadowCalls : [],
                chainedCallIds: p ? m.chainedCallIds : new Set(),
                playUntil: p ? m.playUntil : void 0,
                isPlaying: d,
                isDebugging: p,
              }),
                this.sync(l));
            },
            t =
              (l) =>
              ({ storyId: s, playUntil: d }) => {
                this.getState(s).isDebugging ||
                  this.setState(s, ({ calls: m }) => ({
                    calls: [],
                    shadowCalls: m.map((h) => ({ ...h, status: 'waiting' })),
                    isDebugging: !0,
                  }));
                let p = this.getLog(s);
                (this.setState(s, ({ shadowCalls: m }) => {
                  if (d || !p.length) return { playUntil: d };
                  let h = m.findIndex((g) => g.id === p[0].callId);
                  return {
                    playUntil: m
                      .slice(0, h)
                      .filter((g) => g.interceptable && !g.ancestors?.length)
                      .slice(-1)[0]?.id,
                  };
                }),
                  l.emit(Ir, { storyId: s, isDebugging: !0 }));
              },
            r =
              (l) =>
              ({ storyId: s }) => {
                let d = this.getLog(s).filter((m) => !m.ancestors?.length),
                  p = d.reduceRight((m, h, g) => (m >= 0 || h.status === 'waiting' ? m : g), -1);
                t(l)({ storyId: s, playUntil: d[p - 1]?.callId });
              },
            n =
              (l) =>
              ({ storyId: s, callId: d }) => {
                let { calls: p, shadowCalls: m, resolvers: h } = this.getState(s),
                  g = p.find(({ id: b }) => b === d),
                  E = m.find(({ id: b }) => b === d);
                if (!g && E && Object.values(h).length > 0) {
                  let b = this.getLog(s).find((_) => _.status === 'waiting')?.callId;
                  (E.id !== b && this.setState(s, { playUntil: E.id }),
                    Object.values(h).forEach((_) => _()));
                } else t(l)({ storyId: s, playUntil: d });
              },
            o =
              (l) =>
              ({ storyId: s }) => {
                let { resolvers: d } = this.getState(s);
                if (Object.values(d).length > 0) Object.values(d).forEach((p) => p());
                else {
                  let p = this.getLog(s).find((m) => m.status === 'waiting')?.callId;
                  p ? t(l)({ storyId: s, playUntil: p }) : i({ storyId: s });
                }
              },
            i = ({ storyId: l }) => {
              (this.setState(l, { playUntil: void 0, isDebugging: !1 }),
                Object.values(this.getState(l).resolvers).forEach((s) => s()));
            },
            a = ({ storyId: l, newPhase: s }) => {
              let { isDebugging: d } = this.getState(l);
              if (s === 'preparing' && d) return e({ storyId: l, renderPhase: s, isDebugging: d });
              if (s === 'playing') return e({ storyId: l, renderPhase: s, isDebugging: d });
              (s === 'played'
                ? this.setState(l, { renderPhase: s, isLocked: !1, isPlaying: !1, isDebugging: !1 })
                : s === 'errored'
                  ? this.setState(l, { renderPhase: s, isLocked: !1, isPlaying: !1 })
                  : s === 'aborted'
                    ? this.setState(l, { renderPhase: s, isLocked: !0, isPlaying: !1 })
                    : this.setState(l, { renderPhase: s }),
                this.sync(l));
            };
          fi &&
            fi.ready().then(() => {
              ((this.channel = fi.getChannel()),
                this.channel.on(Ir, e),
                this.channel.on(qt, a),
                this.channel.on(Ca, () => {
                  this.initialized ? this.cleanup() : (this.initialized = !0);
                }),
                this.channel.on(Me.START, t(this.channel)),
                this.channel.on(Me.BACK, r(this.channel)),
                this.channel.on(Me.GOTO, n(this.channel)),
                this.channel.on(Me.NEXT, o(this.channel)),
                this.channel.on(Me.END, i));
            });
        }
        getState(e) {
          return this.state[e] || gi();
        }
        setState(e, t) {
          if (e) {
            let r = this.getState(e),
              n = typeof t == 'function' ? t(r) : t;
            ((this.state = { ...this.state, [e]: { ...r, ...n } }), this.updateParentWindowState());
          }
        }
        cleanup() {
          this.state = Object.entries(this.state).reduce((t, [r, n]) => {
            let o = Kc(n);
            return (o && (t[r] = Object.assign(gi(), o)), t);
          }, {});
          let e = {
            controlStates: {
              detached: this.detached,
              start: !1,
              back: !1,
              goto: !1,
              next: !1,
              end: !1,
            },
            logItems: [],
          };
          (this.channel?.emit(Me.SYNC, e), this.updateParentWindowState());
        }
        getLog(e) {
          let { calls: t, shadowCalls: r } = this.getState(e),
            n = [...r];
          t.forEach((i, a) => {
            n[a] = i;
          });
          let o = new Set();
          return n.reduceRight(
            (i, a) => (
              a.args.forEach((l) => {
                l?.__callId__ && o.add(l.__callId__);
              }),
              a.path.forEach((l) => {
                l.__callId__ && o.add(l.__callId__);
              }),
              (a.interceptable || a.exception) &&
                !o.has(a.id) &&
                (i.unshift({ callId: a.id, status: a.status, ancestors: a.ancestors }),
                o.add(a.id)),
              i
            ),
            [],
          );
        }
        instrument(e, t, r = 0) {
          if (!cb(e)) return e;
          let { mutate: n = !1, path: o = [] } = t,
            i = t.getKeys ? t.getKeys(e, r) : Object.keys(e);
          return (
            (r += 1),
            i.reduce(
              (a, l) => {
                let s = mb(e, l);
                if (typeof s?.get == 'function') {
                  if (s.configurable) {
                    let p = () => s?.get?.bind(e)?.();
                    Object.defineProperty(a, l, {
                      get: () => this.instrument(p(), { ...t, path: o.concat(l) }, r),
                    });
                  }
                  return a;
                }
                let d = e[l];
                return typeof d != 'function'
                  ? ((a[l] = this.instrument(d, { ...t, path: o.concat(l) }, r)), a)
                  : '__originalFn__' in d && typeof d.__originalFn__ == 'function'
                    ? ((a[l] = d), a)
                    : ((a[l] = (...p) => this.track(l, d, e, p, t)),
                      (a[l].__originalFn__ = d),
                      Object.defineProperty(a[l], 'name', { value: l, writable: !1 }),
                      Object.keys(d).length > 0 &&
                        Object.assign(
                          a[l],
                          this.instrument({ ...d }, { ...t, path: o.concat(l) }, r),
                        ),
                      a);
              },
              n ? e : db(e),
            )
          );
        }
        track(e, t, r, n, o) {
          let i =
              n?.[0]?.__storyId__ || K.__STORYBOOK_PREVIEW__?.selectionStore?.selection?.storyId,
            { cursor: a, ancestors: l } = this.getState(i);
          this.setState(i, { cursor: a + 1 });
          let s = `${l.slice(-1)[0] || i} [${a}] ${e}`,
            { path: d = [], intercept: p = !1, retain: m = !1 } = o,
            h = typeof p == 'function' ? p(e, d) : p,
            g = {
              id: s,
              cursor: a,
              storyId: i,
              ancestors: l,
              path: d,
              method: e,
              args: n,
              interceptable: h,
              retain: m,
            },
            E = (h && !l.length ? this.intercept : this.invoke).call(this, t, r, g, o);
          return this.instrument(E, { ...o, mutate: !0, path: [{ __callId__: g.id }] });
        }
        intercept(e, t, r, n) {
          let { chainedCallIds: o, isDebugging: i, playUntil: a } = this.getState(r.storyId),
            l = o.has(r.id);
          return !i || l || a
            ? (a === r.id && this.setState(r.storyId, { playUntil: void 0 }),
              this.invoke(e, t, r, n))
            : new Promise((s) => {
                this.setState(r.storyId, ({ resolvers: d }) => ({
                  isLocked: !1,
                  resolvers: { ...d, [r.id]: s },
                }));
              }).then(
                () => (
                  this.setState(r.storyId, (s) => {
                    let { [r.id]: d, ...p } = s.resolvers;
                    return { isLocked: !0, resolvers: p };
                  }),
                  this.invoke(e, t, r, n)
                ),
              );
        }
        invoke(e, t, r, n) {
          let { callRefsByResult: o, renderPhase: i } = this.getState(r.storyId),
            a = 25,
            l = (p, m, h) => {
              if (h.includes(p)) return '[Circular]';
              if (((h = [...h, p]), m > a)) return '...';
              if (o.has(p)) return o.get(p);
              if (p instanceof Array) return p.map((g) => l(g, ++m, h));
              if (p instanceof Date) return { __date__: { value: p.toISOString() } };
              if (p instanceof Error) {
                let { name: g, message: E, stack: b } = p;
                return { __error__: { name: g, message: E, stack: b } };
              }
              if (p instanceof RegExp) {
                let { flags: g, source: E } = p;
                return { __regexp__: { flags: g, source: E } };
              }
              if (p instanceof K.window?.HTMLElement) {
                let { prefix: g, localName: E, id: b, classList: _, innerText: y } = p,
                  S = Array.from(_);
                return {
                  __element__: { prefix: g, localName: E, id: b, classNames: S, innerText: y },
                };
              }
              return typeof p == 'function'
                ? { __function__: { name: 'getMockName' in p ? p.getMockName() : p.name } }
                : typeof p == 'symbol'
                  ? { __symbol__: { description: p.description } }
                  : typeof p == 'object' &&
                      p?.constructor?.name &&
                      p?.constructor?.name !== 'Object'
                    ? { __class__: { name: p.constructor.name } }
                    : Object.prototype.toString.call(p) === '[object Object]'
                      ? Object.fromEntries(Object.entries(p).map(([g, E]) => [g, l(E, ++m, h)]))
                      : p;
            },
            s = { ...r, args: r.args.map((p) => l(p, 0, [])) };
          r.path.forEach((p) => {
            p?.__callId__ &&
              this.setState(r.storyId, ({ chainedCallIds: m }) => ({
                chainedCallIds: new Set(Array.from(m).concat(p.__callId__)),
              }));
          });
          let d = (p) => {
            if (p instanceof Error) {
              let { name: m, message: h, stack: g, callId: E = r.id } = p,
                {
                  showDiff: b = void 0,
                  diff: _ = void 0,
                  actual: y = void 0,
                  expected: S = void 0,
                } = p.name === 'AssertionError' ? hi(p) : p,
                A = {
                  name: m,
                  message: h,
                  stack: g,
                  callId: E,
                  showDiff: b,
                  diff: _,
                  actual: y,
                  expected: S,
                };
              if (
                (this.update({ ...s, status: 'error', exception: A }),
                this.setState(r.storyId, (T) => ({
                  callRefsByResult: new Map([
                    ...Array.from(T.callRefsByResult.entries()),
                    [p, { __callId__: r.id, retain: r.retain }],
                  ]),
                })),
                r.ancestors?.length)
              )
                throw (
                  Object.prototype.hasOwnProperty.call(p, 'callId') ||
                    Object.defineProperty(p, 'callId', { value: r.id }),
                  p
                );
            }
            throw p;
          };
          try {
            if (i === 'played' && !r.retain) throw lb;
            let p = (n.getArgs ? n.getArgs(r, this.getState(r.storyId)) : r.args).map((h) =>
                typeof h != 'function' || hb(h) || Object.keys(h).length
                  ? h
                  : (...g) => {
                      let { cursor: E, ancestors: b } = this.getState(r.storyId);
                      this.setState(r.storyId, { cursor: 0, ancestors: [...b, r.id] });
                      let _ = () => this.setState(r.storyId, { cursor: E, ancestors: b }),
                        y = !1;
                      try {
                        let S = h(...g);
                        return S instanceof Promise ? ((y = !0), S.finally(_)) : S;
                      } finally {
                        y || _();
                      }
                    },
              ),
              m = e.apply(t, p);
            return (
              m &&
                ['object', 'function', 'symbol'].includes(typeof m) &&
                this.setState(r.storyId, (h) => ({
                  callRefsByResult: new Map([
                    ...Array.from(h.callRefsByResult.entries()),
                    [m, { __callId__: r.id, retain: r.retain }],
                  ]),
                })),
              this.update({ ...s, status: m instanceof Promise ? 'active' : 'done' }),
              m instanceof Promise
                ? m.then((h) => (this.update({ ...s, status: 'done' }), h), d)
                : m
            );
          } catch (p) {
            return d(p);
          }
        }
        update(e) {
          (this.channel?.emit(Me.CALL, e),
            this.setState(e.storyId, ({ calls: t }) => {
              let r = t.concat(e).reduce((n, o) => Object.assign(n, { [o.id]: o }), {});
              return {
                calls: Object.values(r).sort((n, o) =>
                  n.id.localeCompare(o.id, void 0, { numeric: !0 }),
                ),
              };
            }),
            this.sync(e.storyId));
        }
        sync(e) {
          let t = () => {
            let { isLocked: r, isPlaying: n } = this.getState(e),
              o = this.getLog(e),
              i = o
                .filter(({ ancestors: d }) => !d.length)
                .find((d) => d.status === 'waiting')?.callId,
              a = o.some((d) => d.status === 'active');
            if (this.detached || r || a || o.length === 0) {
              let d = {
                controlStates: {
                  detached: this.detached,
                  start: !1,
                  back: !1,
                  goto: !1,
                  next: !1,
                  end: !1,
                },
                logItems: o,
              };
              this.channel?.emit(Me.SYNC, d);
              return;
            }
            let l = o.some((d) => d.status === 'done' || d.status === 'error'),
              s = {
                controlStates: {
                  detached: this.detached,
                  start: l,
                  back: l,
                  goto: !0,
                  next: n,
                  end: n,
                },
                logItems: o,
                pausedAt: i,
              };
            this.channel?.emit(Me.SYNC, s);
          };
          this.setState(
            e,
            ({ syncTimeout: r }) => (clearTimeout(r), { syncTimeout: setTimeout(t, 0) }),
          );
        }
      };
    function yi(e, t = {}) {
      try {
        let r = !1,
          n = !1;
        return (
          K.window?.location?.search?.includes('instrument=true')
            ? (r = !0)
            : K.window?.location?.search?.includes('instrument=false') && (n = !0),
          (K.window?.parent === K.window && !r) || n
            ? e
            : (K.window &&
                !K.window.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER__ &&
                (K.window.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER__ = new pb()),
              (K.window?.__STORYBOOK_ADDON_INTERACTIONS_INSTRUMENTER__).instrument(e, t))
        );
      } catch (r) {
        return (ur.warn(r), e);
      }
    }
    function mb(e, t) {
      let r = e;
      for (; r != null;) {
        let n = Object.getOwnPropertyDescriptor(r, t);
        if (n) return n;
        r = Object.getPrototypeOf(r);
      }
    }
    function hb(e) {
      if (typeof e != 'function') return !1;
      let t = Object.getOwnPropertyDescriptor(e, 'prototype');
      return t ? !t.writable : !1;
    }
    var fb = de({
      '../../node_modules/@ngard/tiny-isequal/index.js'(e) {
        (Object.defineProperty(e, '__esModule', { value: !0 }),
          (e.isEqual = (function () {
            var t = Object.prototype.toString,
              r = Object.getPrototypeOf,
              n = Object.getOwnPropertySymbols
                ? function (o) {
                    return Object.keys(o).concat(Object.getOwnPropertySymbols(o));
                  }
                : Object.keys;
            return function (o, i) {
              return (function a(l, s, d) {
                var p,
                  m,
                  h,
                  g = t.call(l),
                  E = t.call(s);
                if (l === s) return !0;
                if (l == null || s == null) return !1;
                if (d.indexOf(l) > -1 && d.indexOf(s) > -1) return !0;
                if (
                  (d.push(l, s),
                  g != E ||
                    ((p = n(l)),
                    (m = n(s)),
                    p.length != m.length ||
                      p.some(function (b) {
                        return !a(l[b], s[b], d);
                      })))
                )
                  return !1;
                switch (g.slice(8, -1)) {
                  case 'Symbol':
                    return l.valueOf() == s.valueOf();
                  case 'Date':
                  case 'Number':
                    return +l == +s || (+l != +l && +s != +s);
                  case 'RegExp':
                  case 'Function':
                  case 'String':
                  case 'Boolean':
                    return '' + l == '' + s;
                  case 'Set':
                  case 'Map':
                    ((p = l.entries()), (m = s.entries()));
                    do if (!a((h = p.next()).value, m.next().value, d)) return !1;
                    while (!h.done);
                    return !0;
                  case 'ArrayBuffer':
                    ((l = new Uint8Array(l)), (s = new Uint8Array(s)));
                  case 'DataView':
                    ((l = new Uint8Array(l.buffer)), (s = new Uint8Array(s.buffer)));
                  case 'Float32Array':
                  case 'Float64Array':
                  case 'Int8Array':
                  case 'Int16Array':
                  case 'Int32Array':
                  case 'Uint8Array':
                  case 'Uint16Array':
                  case 'Uint32Array':
                  case 'Uint8ClampedArray':
                  case 'Arguments':
                  case 'Array':
                    if (l.length != s.length) return !1;
                    for (h = 0; h < l.length; h++)
                      if ((h in l || h in s) && (h in l != h in s || !a(l[h], s[h], d))) return !1;
                    return !0;
                  case 'Object':
                    return a(r(l), r(s), d);
                  default:
                    return !1;
                }
              })(o, i, []);
            };
          })()));
      },
    });
    var Xc = We(fb(), 1),
      md = (e) => e.map((t) => typeof t < 'u').filter(Boolean).length,
      gb = (e, t) => {
        let { exists: r, eq: n, neq: o, truthy: i } = e;
        if (md([r, n, o, i]) > 1)
          throw new Error(
            `Invalid conditional test ${JSON.stringify({ exists: r, eq: n, neq: o })}`,
          );
        if (typeof n < 'u') return (0, Xc.isEqual)(t, n);
        if (typeof o < 'u') return !(0, Xc.isEqual)(t, o);
        if (typeof r < 'u') {
          let a = typeof t < 'u';
          return r ? a : !a;
        }
        return typeof i > 'u' || i ? !!t : !t;
      },
      Ua = (e, t, r) => {
        if (!e.if) return !0;
        let { arg: n, global: o } = e.if;
        if (md([n, o]) !== 1)
          throw new Error(`Invalid conditional value ${JSON.stringify({ arg: n, global: o })}`);
        let i = n ? t[n] : r[o];
        return gb(e.if, i);
      },
      yb = {};
    Xo(yb, { argsEnhancers: () => Sb });
    var hd = (e, t) => typeof t[e] > 'u' && !(e in t),
      bb = (e) => {
        let {
          initialArgs: t,
          argTypes: r,
          id: n,
          parameters: { actions: o },
        } = e;
        if (!o || o.disable || !o.argTypesRegex || !r) return {};
        let i = new RegExp(o.argTypesRegex);
        return Object.entries(r)
          .filter(([a]) => !!i.test(a))
          .reduce((a, [l, s]) => (hd(l, t) && (a[l] = Zn(l, { implicit: !0, id: n })), a), {});
      },
      Eb = (e) => {
        let {
          initialArgs: t,
          argTypes: r,
          parameters: { actions: n },
        } = e;
        return n?.disable || !r
          ? {}
          : Object.entries(r)
              .filter(([o, i]) => !!i.action)
              .reduce(
                (o, [i, a]) => (
                  hd(i, t) && (o[i] = Zn(typeof a.action == 'string' ? a.action : i)),
                  o
                ),
                {},
              );
      },
      Sb = [Eb, bb],
      Ab = {};
    Xo(Ab, { loaders: () => wb });
    var Zc = !1,
      Tb = (e) => {
        let { parameters: t } = e;
        t?.actions?.disable ||
          Zc ||
          (Eu((r, n) => {
            let o = r.getMockName();
            o !== 'spy' &&
              o !== 'vi.fn()' &&
              (!/^next\/.*::/.test(o) ||
                [
                  'next/router::useRouter()',
                  'next/navigation::useRouter()',
                  'next/navigation::redirect',
                  'next/cache::',
                  'next/headers::cookies().set',
                  'next/headers::cookies().delete',
                  'next/headers::headers().set',
                  'next/headers::headers().delete',
                ].some((i) => o.startsWith(i))) &&
              Zn(o)(n);
          }),
          (Zc = !0));
      },
      wb = [Tb];
    var { document: bt } = globalThis,
      _b = () =>
        globalThis?.matchMedia
          ? !!globalThis.matchMedia('(prefers-reduced-motion: reduce)')?.matches
          : !1,
      Qc = (e) => {
        (Array.isArray(e) ? e : [e]).forEach(vb);
      },
      vb = (e) => {
        if (!bt) return;
        let t = bt.getElementById(e);
        t && t.parentElement && t.parentElement.removeChild(t);
      },
      xb = (e, t) => {
        if (!bt) return;
        let r = bt.getElementById(e);
        if (r) r.innerHTML !== t && (r.innerHTML = t);
        else {
          let n = bt.createElement('style');
          (n.setAttribute('id', e), (n.innerHTML = t), bt.head.appendChild(n));
        }
      },
      Cb = (e, t, r) => {
        if (!bt) return;
        let n = bt.getElementById(e);
        if (n) n.innerHTML !== t && (n.innerHTML = t);
        else {
          let o = bt.createElement('style');
          (o.setAttribute('id', e), (o.innerHTML = t));
          let i = `addon-backgrounds-grid${r ? `-docs-${r}` : ''}`,
            a = bt.getElementById(i);
          a ? a.parentElement?.insertBefore(o, a) : bt.head.appendChild(o);
        }
      },
      Ob = { cellSize: 100, cellAmount: 10, opacity: 0.8 },
      ed = 'addon-backgrounds',
      td = 'addon-backgrounds-grid',
      Rb = _b() ? '' : 'transition: background-color 0.3s;',
      Ib = (e, t) => {
        let { globals: r = {}, parameters: n = {}, viewMode: o, id: i } = t,
          { options: a = _n, disable: l, grid: s = Ob } = n[St] || {},
          d = r[St] || {},
          p = typeof d == 'string' ? d : d?.value,
          m = p ? a[p] : void 0,
          h = typeof m == 'string' ? m : m?.value || 'transparent',
          g = typeof d == 'string' ? !1 : d.grid || !1,
          E = !!m && !l,
          b =
            o === 'docs'
              ? `#anchor--${i} .docs-story, #anchor--primary--${i} .docs-story`
              : '.sb-show-main',
          _ =
            o === 'docs'
              ? `#anchor--${i} .docs-story, #anchor--primary--${i} .docs-story`
              : '.sb-show-main',
          y = n.layout === void 0 || n.layout === 'padded',
          S = o === 'docs' ? 20 : y ? 16 : 0,
          { cellAmount: A, cellSize: T, opacity: C, offsetX: x = S, offsetY: v = S } = s,
          I = o === 'docs' ? `${ed}-docs-${i}` : `${ed}-color`,
          N = o === 'docs' ? i : null;
        It(() => {
          let F = `
    ${b} {
      background: ${h} !important;
      ${Rb}
      }`;
          if (!E) {
            Qc(I);
            return;
          }
          Cb(I, F, N);
        }, [b, I, N, E, h]);
        let B = o === 'docs' ? `${td}-docs-${i}` : `${td}`;
        return (
          It(() => {
            if (!g) {
              Qc(B);
              return;
            }
            let F = [
                `${T * A}px ${T * A}px`,
                `${T * A}px ${T * A}px`,
                `${T}px ${T}px`,
                `${T}px ${T}px`,
              ].join(', '),
              z = `
        ${_} {
          background-size: ${F} !important;
          background-position: ${x}px ${v}px, ${x}px ${v}px, ${x}px ${v}px, ${x}px ${v}px !important;
          background-blend-mode: difference !important;
          background-image: linear-gradient(rgba(130, 130, 130, ${C}) 1px, transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${C}) 1px, transparent 1px),
           linear-gradient(rgba(130, 130, 130, ${C / 2}) 1px, transparent 1px),
           linear-gradient(90deg, rgba(130, 130, 130, ${C / 2}) 1px, transparent 1px) !important;
        }
      `;
            xb(B, z);
          }, [A, T, _, B, g, x, v, C]),
          e()
        );
      },
      e4 = globalThis.FEATURES?.backgrounds ? [Ib] : [],
      t4 = { [St]: { grid: { cellSize: 20, opacity: 0.5, cellAmount: 5 }, disable: !1 } },
      r4 = { [St]: { value: void 0, grid: !1 } };
    var { step: a4 } = yi({ step: async (e, t, r) => t(r) }, { intercept: !0 });
    var rd = {
        chevronLeft: [
          'M9.10355 10.1464C9.29882 10.3417 9.29882 10.6583 9.10355 10.8536C8.90829 11.0488 8.59171 11.0488 8.39645 10.8536L4.89645 7.35355C4.70118 7.15829 4.70118 6.84171 4.89645 6.64645L8.39645 3.14645C8.59171 2.95118 8.90829 2.95118 9.10355 3.14645C9.29882 3.34171 9.29882 3.65829 9.10355 3.85355L5.95711 7L9.10355 10.1464Z',
        ],
        chevronRight: [
          'M4.89645 10.1464C4.70118 10.3417 4.70118 10.6583 4.89645 10.8536C5.09171 11.0488 5.40829 11.0488 5.60355 10.8536L9.10355 7.35355C9.29882 7.15829 9.29882 6.84171 9.10355 6.64645L5.60355 3.14645C5.40829 2.95118 5.09171 2.95118 4.89645 3.14645C4.70118 3.34171 4.70118 3.65829 4.89645 3.85355L8.04289 7L4.89645 10.1464Z',
        ],
        info: [
          'M7 5.5a.5.5 0 01.5.5v4a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zM7 4.5A.75.75 0 107 3a.75.75 0 000 1.5z',
          'M7 14A7 7 0 107 0a7 7 0 000 14zm0-1A6 6 0 107 1a6 6 0 000 12z',
        ],
        shareAlt: [
          'M2 1.004a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-4.5a.5.5 0 00-1 0v4.5H2v-10h4.5a.5.5 0 000-1H2z',
          'M7.354 7.357L12 2.711v1.793a.5.5 0 001 0v-3a.5.5 0 00-.5-.5h-3a.5.5 0 100 1h1.793L6.646 6.65a.5.5 0 10.708.707z',
        ],
      },
      Db = 'svg,path,rect,circle,line,polyline,polygon,ellipse,text'.split(','),
      Fe = (e, t = {}, r) => {
        let n = Db.includes(e)
          ? document.createElementNS('http://www.w3.org/2000/svg', e)
          : document.createElement(e);
        return (
          Object.entries(t).forEach(([o, i]) => {
            /[A-Z]/.test(o)
              ? (o === 'onClick' &&
                  (n.addEventListener('click', i),
                  n.addEventListener('keydown', (a) => {
                    (a.key === 'Enter' || a.key === ' ') && (a.preventDefault(), i());
                  })),
                o === 'onMouseEnter' && n.addEventListener('mouseenter', i),
                o === 'onMouseLeave' && n.addEventListener('mouseleave', i))
              : n.setAttribute(o, i);
          }),
          r?.forEach((o) => {
            if (!(o == null || o === !1))
              try {
                n.appendChild(o);
              } catch {
                n.appendChild(document.createTextNode(String(o)));
              }
          }),
          n
        );
      },
      lo = (e) =>
        rd[e] &&
        Fe(
          'svg',
          { width: '14', height: '14', viewBox: '0 0 14 14', xmlns: 'http://www.w3.org/2000/svg' },
          rd[e].map((t) =>
            Fe('path', {
              fill: 'currentColor',
              'fill-rule': 'evenodd',
              'clip-rule': 'evenodd',
              d: t,
            }),
          ),
        ),
      Pb = (e) => {
        if ('elements' in e) {
          let { elements: n, color: o, style: i } = e;
          return {
            id: void 0,
            priority: 0,
            selectors: n,
            styles: {
              outline: `2px ${i} ${o}`,
              outlineOffset: '2px',
              boxShadow: '0 0 0 6px rgba(255,255,255,0.6)',
            },
            menu: void 0,
          };
        }
        let { menu: t, ...r } = e;
        return {
          id: void 0,
          priority: 0,
          styles: { outline: '2px dashed #029cfd' },
          ...r,
          menu: Array.isArray(t) ? (t.every(Array.isArray) ? t : [t]) : void 0,
        };
      },
      Nb = (e) => e instanceof Function,
      un = new Map(),
      hr = new Map(),
      uo = new Map(),
      kt = (e) => {
        let t = Symbol();
        return (
          hr.set(t, []),
          un.set(t, e),
          {
            get: () => un.get(t),
            set: (r) => {
              let n = un.get(t),
                o = Nb(r) ? r(n) : r;
              o !== n &&
                (un.set(t, o),
                hr.get(t)?.forEach((i) => {
                  (uo.get(i)?.(), uo.set(i, i(o)));
                }));
            },
            subscribe: (r) => (
              hr.get(t)?.push(r),
              () => {
                let n = hr.get(t);
                n &&
                  hr.set(
                    t,
                    n.filter((o) => o !== r),
                  );
              }
            ),
            teardown: () => {
              (hr.get(t)?.forEach((r) => {
                (uo.get(r)?.(), uo.delete(r));
              }),
                hr.delete(t),
                un.delete(t));
            },
          }
        );
      },
      nd = (e) => {
        let t = document.getElementById('storybook-root'),
          r = new Map();
        for (let n of e) {
          let { priority: o = 0 } = n;
          for (let i of n.selectors) {
            let a = [
              ...document.querySelectorAll(
                `:is(${i}):not([id^="storybook-"], [id^="storybook-"] *, [class^="sb-"], [class^="sb-"] *)`,
              ),
              ...(t?.querySelectorAll(i) || []),
            ];
            for (let l of a) {
              let s = r.get(l);
              (!s || s.priority <= o) &&
                r.set(l, {
                  ...n,
                  priority: o,
                  selectors: Array.from(new Set((s?.selectors || []).concat(i))),
                });
            }
          }
        }
        return r;
      },
      kb = (e) =>
        Array.from(e.entries())
          .map(([t, { selectors: r, styles: n, hoverStyles: o, focusStyles: i, menu: a }]) => {
            let { top: l, left: s, width: d, height: p } = t.getBoundingClientRect(),
              { position: m } = getComputedStyle(t);
            return {
              element: t,
              selectors: r,
              styles: n,
              hoverStyles: o,
              focusStyles: i,
              menu: a,
              top: m === 'fixed' ? l : l + window.scrollY,
              left: m === 'fixed' ? s : s + window.scrollX,
              width: d,
              height: p,
            };
          })
          .sort((t, r) => r.width * r.height - t.width * t.height),
      od = (e, t) => {
        let r = e.getBoundingClientRect(),
          { x: n, y: o } = t;
        return (
          r?.top &&
          r?.left &&
          n >= r.left &&
          n <= r.left + r.width &&
          o >= r.top &&
          o <= r.top + r.height
        );
      },
      ad = (e, t, r) => {
        if (!t || !r) return !1;
        let { left: n, top: o, width: i, height: a } = e;
        (a < Dt && ((o = o - Math.round((Dt - a) / 2)), (a = Dt)),
          i < Dt && ((n = n - Math.round((Dt - i) / 2)), (i = Dt)),
          t.style.position === 'fixed' && ((n += window.scrollX), (o += window.scrollY)));
        let { x: l, y: s } = r;
        return l >= n && l <= n + i && s >= o && s <= o + a;
      },
      Fb = (e, t, r = {}) => {
        let { x: n, y: o } = t,
          { margin: i = 5, topOffset: a = 0, centered: l = !1 } = r,
          { scrollX: s, scrollY: d, innerHeight: p, innerWidth: m } = window,
          h = Math.min(e.style.position === 'fixed' ? o - d : o, p - e.clientHeight - i - a + d),
          g = l ? e.clientWidth / 2 : 0,
          E =
            e.style.position === 'fixed'
              ? Math.max(Math.min(n - s, m - g - i), g + i)
              : Math.max(Math.min(n, m - g - i + s), g + i + s);
        Object.assign(e.style, {
          ...(E !== n && { left: `${E}px` }),
          ...(h !== o && { top: `${h}px` }),
        });
      },
      id = (e) => {
        window.HTMLElement.prototype.hasOwnProperty('showPopover') && e.showPopover();
      },
      Lb = (e) => {
        window.HTMLElement.prototype.hasOwnProperty('showPopover') && e.hidePopover();
      },
      Bb = (e) => ({
        top: e.top,
        left: e.left,
        width: e.width,
        height: e.height,
        selectors: e.selectors,
        element: {
          attributes: Object.fromEntries(
            Array.from(e.element.attributes).map((t) => [t.name, t.value]),
          ),
          localName: e.element.localName,
          tagName: e.element.tagName,
          outerHTML: e.element.outerHTML,
        },
      }),
      Se = 'storybook-highlights-menu',
      sd = 'storybook-highlights-root',
      Mb = 'storybook-root',
      $b = (e) => {
        if (globalThis.__STORYBOOK_HIGHLIGHT_INITIALIZED) return;
        globalThis.__STORYBOOK_HIGHLIGHT_INITIALIZED = !0;
        let { document: t } = globalThis,
          r = kt([]),
          n = kt(new Map()),
          o = kt([]),
          i = kt(),
          a = kt(),
          l = kt([]),
          s = kt([]),
          d = kt(),
          p = kt(),
          m = t.getElementById(sd);
        (r.subscribe(() => {
          m || ((m = Fe('div', { id: sd })), t.body.appendChild(m));
        }),
          r.subscribe((v) => {
            let I = t.getElementById(Mb);
            if (!I) return;
            n.set(nd(v));
            let N = new MutationObserver(() => n.set(nd(v)));
            return (
              N.observe(I, { subtree: !0, childList: !0 }),
              () => {
                N.disconnect();
              }
            );
          }),
          n.subscribe((v) => {
            let I = () => requestAnimationFrame(() => o.set(kb(v))),
              N = new ResizeObserver(I);
            (N.observe(t.body), Array.from(v.keys()).forEach((F) => N.observe(F)));
            let B = Array.from(t.body.querySelectorAll('*')).filter((F) => {
              let { overflow: z, overflowX: k, overflowY: R } = window.getComputedStyle(F);
              return ['auto', 'scroll'].some((O) => [z, k, R].includes(O));
            });
            return (
              B.forEach((F) => F.addEventListener('scroll', I)),
              () => {
                (N.disconnect(), B.forEach((F) => F.removeEventListener('scroll', I)));
              }
            );
          }),
          n.subscribe((v) => {
            let I = Array.from(v.keys()).filter(({ style: B }) => B.position === 'sticky'),
              N = () =>
                requestAnimationFrame(() => {
                  o.set((B) =>
                    B.map((F) => {
                      if (I.includes(F.element)) {
                        let { top: z, left: k } = F.element.getBoundingClientRect();
                        return { ...F, top: z + window.scrollY, left: k + window.scrollX };
                      }
                      return F;
                    }),
                  );
                });
            return (t.addEventListener('scroll', N), () => t.removeEventListener('scroll', N));
          }),
          n.subscribe((v) => {
            l.set((I) => I.filter(({ element: N }) => v.has(N)));
          }),
          l.subscribe((v) => {
            v.length
              ? (p.set((I) => (v.some((N) => N.element === I?.element) ? I : void 0)),
                d.set((I) => (v.some((N) => N.element === I?.element) ? I : void 0)))
              : (p.set(void 0), d.set(void 0), i.set(void 0));
          }));
        let h = new Map(new Map());
        r.subscribe((v) => {
          (v.forEach(({ keyframes: I }) => {
            if (I) {
              let N = h.get(I);
              (N ||
                ((N = t.createElement('style')),
                N.setAttribute('data-highlight', 'keyframes'),
                h.set(I, N),
                t.head.appendChild(N)),
                (N.innerHTML = I));
            }
          }),
            h.forEach((I, N) => {
              v.some((B) => B.keyframes === N) || (I.remove(), h.delete(N));
            }));
        });
        let g = new Map(new Map());
        (o.subscribe((v) => {
          (v.forEach((I) => {
            let N = g.get(I.element);
            if (m && !N) {
              let B = {
                popover: 'manual',
                'data-highlight-dimensions': `w${I.width.toFixed(0)}h${I.height.toFixed(0)}`,
                'data-highlight-coordinates': `x${I.left.toFixed(0)}y${I.top.toFixed(0)}`,
              };
              ((N = m.appendChild(Fe('div', B, [Fe('div')]))), g.set(I.element, N));
            }
          }),
            g.forEach((I, N) => {
              v.some(({ element: B }) => B === N) || (I.remove(), g.delete(N));
            }));
        }),
          o.subscribe((v) => {
            let I = v.filter((B) => B.menu);
            if (!I.length) return;
            let N = (B) => {
              requestAnimationFrame(() => {
                let F = t.getElementById(Se),
                  z = { x: B.pageX, y: B.pageY };
                if (F && !od(F, z)) {
                  let k = I.filter((R) => {
                    let O = g.get(R.element);
                    return ad(R, O, z);
                  });
                  (i.set(k.length ? z : void 0), l.set(k));
                }
              });
            };
            return (t.addEventListener('click', N), () => t.removeEventListener('click', N));
          }));
        let E = () => {
          let v = t.getElementById(Se),
            I = a.get();
          !I ||
            (v && od(v, I)) ||
            s.set((N) => {
              let B = o.get().filter((R) => {
                  let O = g.get(R.element);
                  return ad(R, O, I);
                }),
                F = N.filter((R) => B.includes(R)),
                z = B.filter((R) => !N.includes(R)),
                k = N.length - F.length;
              return z.length || k ? [...F, ...z] : N;
            });
        };
        (a.subscribe(E), o.subscribe(E));
        let b = () => {
          let v = p.get(),
            I = v ? [v] : l.get(),
            N = I.length === 1 ? I[0] : d.get(),
            B = i.get() !== void 0;
          o.get().forEach((F) => {
            let z = g.get(F.element);
            if (z) {
              let k = N === F,
                R = B ? (N ? k : I.includes(F)) : s.get()?.includes(F);
              (Object.assign(z.style, {
                animation: 'none',
                background: 'transparent',
                border: 'none',
                boxSizing: 'border-box',
                outline: 'none',
                outlineOffset: '0px',
                ...F.styles,
                ...(R ? F.hoverStyles : {}),
                ...(k ? F.focusStyles : {}),
                position: getComputedStyle(F.element).position === 'fixed' ? 'fixed' : 'absolute',
                zIndex: Va - 10,
                top: `${F.top}px`,
                left: `${F.left}px`,
                width: `${F.width}px`,
                height: `${F.height}px`,
                margin: 0,
                padding: 0,
                cursor: F.menu && R ? 'pointer' : 'default',
                pointerEvents: F.menu ? 'auto' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
              }),
                Object.assign(z.children[0].style, {
                  width: '100%',
                  height: '100%',
                  minHeight: `${Dt}px`,
                  minWidth: `${Dt}px`,
                  boxSizing: 'content-box',
                  padding: z.style.outlineWidth || '0px',
                }),
                id(z));
            }
          });
        };
        (o.subscribe(b), l.subscribe(b), s.subscribe(b), d.subscribe(b), p.subscribe(b));
        let _ = () => {
          if (!m) return;
          let v = t.getElementById(Se);
          if (v) v.innerHTML = '';
          else {
            let F = { id: Se, popover: 'manual' };
            ((v = m.appendChild(Fe('div', F))),
              m.appendChild(
                Fe('style', {}, [
                  `
            #${Se} {
              position: absolute;
              z-index: ${Va};
              width: 300px;
              padding: 0px;
              margin: 15px 0 0 0;
              transform: translateX(-50%);
              font-family: "Nunito Sans", -apple-system, ".SFNSText-Regular", "San Francisco", BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
              font-size: 12px;
              background: white;
              border: none;
              border-radius: 6px;
              box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.05), 0 5px 15px 0 rgba(0, 0, 0, 0.1);
              color: #2E3438;
            }
            #${Se} ul {
              list-style: none;
              margin: 0;
              padding: 0;
            }
            #${Se} > ul {
              max-height: 300px;
              overflow-y: auto;
              padding: 4px 0;
            }
            #${Se} li {
              padding: 0 4px;
              margin: 0;
            }
            #${Se} li > :not(ul) {
              display: flex;
              padding: 8px;
              margin: 0;
              align-items: center;
              gap: 8px;
              border-radius: 4px;
            }
            #${Se} button {
              width: 100%;
              border: 0;
              background: transparent;
              color: inherit;
              text-align: left;
              font-family: inherit;
              font-size: inherit;
            }
            #${Se} button:focus-visible {
              outline-color: #029CFD;
            }
            #${Se} button:hover {
              background: rgba(2, 156, 253, 0.07);
              color: #029CFD;
              cursor: pointer;
            }
            #${Se} li code {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 16px;
              font-size: 11px;
            }
            #${Se} li svg {
              flex-shrink: 0;
              margin: 1px;
              color: #73828C;
            }
            #${Se} li > button:hover svg, #${Se} li > button:focus-visible svg {
              color: #029CFD;
            }
            #${Se} .element-list li svg {
              display: none;
            }
            #${Se} li.selectable svg, #${Se} li.selected svg {
              display: block;
            }
            #${Se} .menu-list {
              border-top: 1px solid rgba(38, 85, 115, 0.15);
            }
            #${Se} .menu-list > li:not(:last-child) {
              padding-bottom: 4px;
              margin-bottom: 4px;
              border-bottom: 1px solid rgba(38, 85, 115, 0.15);
            }
            #${Se} .menu-items, #${Se} .menu-items li {
              padding: 0;
            }
            #${Se} .menu-item {
              display: flex;
            }
            #${Se} .menu-item-content {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
            }
          `,
                ]),
              ));
          }
          let I = p.get(),
            N = I ? [I] : l.get();
          if (
            (N.length &&
              ((v.style.position =
                getComputedStyle(N[0].element).position === 'fixed' ? 'fixed' : 'absolute'),
              v.appendChild(
                Fe(
                  'ul',
                  { class: 'element-list' },
                  N.map((F) => {
                    let z =
                        N.length > 1 &&
                        !!F.menu?.some((O) =>
                          O.some(
                            (L) => !L.selectors || L.selectors.some(($) => F.selectors.includes($)),
                          ),
                        ),
                      k = z
                        ? {
                            class: 'selectable',
                            onClick: () => p.set(F),
                            onMouseEnter: () => d.set(F),
                            onMouseLeave: () => d.set(void 0),
                          }
                        : I
                          ? { class: 'selected', onClick: () => p.set(void 0) }
                          : {},
                      R = z || I;
                    return Fe('li', k, [
                      Fe(R ? 'button' : 'div', R ? { type: 'button' } : {}, [
                        I ? lo('chevronLeft') : null,
                        Fe('code', {}, [F.element.outerHTML]),
                        z ? lo('chevronRight') : null,
                      ]),
                    ]);
                  }),
                ),
              )),
            p.get() || l.get().length === 1)
          ) {
            let F = p.get() || l.get()[0],
              z = F.menu?.filter((k) =>
                k.some((R) => !R.selectors || R.selectors.some((O) => F.selectors.includes(O))),
              );
            z?.length &&
              v.appendChild(
                Fe(
                  'ul',
                  { class: 'menu-list' },
                  z.map((k) =>
                    Fe('li', {}, [
                      Fe(
                        'ul',
                        { class: 'menu-items' },
                        k.map(
                          ({
                            id: R,
                            title: O,
                            description: L,
                            iconLeft: $,
                            iconRight: M,
                            clickEvent: J,
                          }) => {
                            let j = J && (() => e.emit(J, R, Bb(F)));
                            return Fe('li', {}, [
                              Fe(
                                j ? 'button' : 'div',
                                j
                                  ? { class: 'menu-item', type: 'button', onClick: j }
                                  : { class: 'menu-item' },
                                [
                                  $ ? lo($) : null,
                                  Fe('div', { class: 'menu-item-content' }, [
                                    Fe(L ? 'strong' : 'span', {}, [O]),
                                    L && Fe('span', {}, [L]),
                                  ]),
                                  M ? lo(M) : null,
                                ],
                              ),
                            ]);
                          },
                        ),
                      ),
                    ]),
                  ),
                ),
              );
          }
          let B = i.get();
          B
            ? (Object.assign(v.style, {
                display: 'block',
                left: `${v.style.position === 'fixed' ? B.x - window.scrollX : B.x}px`,
                top: `${v.style.position === 'fixed' ? B.y - window.scrollY : B.y}px`,
              }),
              id(v),
              requestAnimationFrame(() => Fb(v, B, { topOffset: 15, centered: !0 })))
            : (Lb(v), Object.assign(v.style, { display: 'none' }));
        };
        (l.subscribe(_), p.subscribe(_));
        let y = (v) => {
            let I = Pb(v);
            r.set((N) => {
              let B = I.id ? N.filter((F) => F.id !== I.id) : N;
              return I.selectors?.length ? [...B, I] : B;
            });
          },
          S = (v) => {
            v && r.set((I) => I.filter((N) => N.id !== v));
          },
          A = () => {
            (r.set([]),
              n.set(new Map()),
              o.set([]),
              i.set(void 0),
              a.set(void 0),
              l.set([]),
              s.set([]),
              d.set(void 0),
              p.set(void 0));
          },
          T,
          C = (v, I) => {
            let N = 'scrollIntoView-highlight';
            (clearTimeout(T), S(N));
            let B = t.querySelector(v);
            if (!B) {
              console.warn(`Cannot scroll into view: ${v} not found`);
              return;
            }
            B.scrollIntoView({ behavior: 'smooth', block: 'center', ...I });
            let F = `kf-${Math.random().toString(36).substring(2, 15)}`;
            (r.set((z) => [
              ...z,
              {
                id: N,
                priority: 1e3,
                selectors: [v],
                styles: {
                  outline: '2px solid #1EA7FD',
                  outlineOffset: '-1px',
                  animation: `${F} 3s linear forwards`,
                },
                keyframes: `@keyframes ${F} {
          0% { outline: 2px solid #1EA7FD; }
          20% { outline: 2px solid #1EA7FD00; }
          40% { outline: 2px solid #1EA7FD; }
          60% { outline: 2px solid #1EA7FD00; }
          80% { outline: 2px solid #1EA7FD; }
          100% { outline: 2px solid #1EA7FD00; }
        }`,
              },
            ]),
              (T = setTimeout(() => S(N), 3500)));
          },
          x = (v) => {
            requestAnimationFrame(() => a.set({ x: v.pageX, y: v.pageY }));
          };
        (t.body.addEventListener('mousemove', x),
          e.on(hu, y),
          e.on(fu, S),
          e.on(gu, A),
          e.on(yu, C),
          e.on(qt, ({ newPhase: v }) => {
            v === 'loading' && A();
          }));
      };
    globalThis?.FEATURES?.highlight && kr?.ready && kr.ready().then($b);
    function fd() {
      let e = K.document.documentElement,
        t = Math.max(e.scrollHeight, e.offsetHeight);
      return { width: Math.max(e.scrollWidth, e.offsetWidth), height: t };
    }
    function jb() {
      let e = K.document.createElement('canvas');
      e.id = 'storybook-addon-measure';
      let t = e.getContext('2d');
      rn(t != null);
      let { width: r, height: n } = fd();
      return (
        bi(e, t, { width: r, height: n }),
        (e.style.position = 'absolute'),
        (e.style.left = '0'),
        (e.style.top = '0'),
        (e.style.zIndex = '2147483647'),
        (e.style.pointerEvents = 'none'),
        K.document.body.appendChild(e),
        { canvas: e, context: t, width: r, height: n }
      );
    }
    function bi(e, t, { width: r, height: n }) {
      ((e.style.width = `${r}px`), (e.style.height = `${n}px`));
      let o = K.window.devicePixelRatio;
      ((e.width = Math.floor(r * o)), (e.height = Math.floor(n * o)), t.scale(o, o));
    }
    var Le = {};
    function Ub() {
      Le.canvas || (Le = jb());
    }
    function gd() {
      Le.context && Le.context.clearRect(0, 0, Le.width ?? 0, Le.height ?? 0);
    }
    function Vb(e) {
      (gd(), e(Le.context));
    }
    function Hb() {
      (rn(Le.canvas, 'Canvas should exist in the state.'),
        rn(Le.context, 'Context should exist in the state.'),
        bi(Le.canvas, Le.context, { width: 0, height: 0 }));
      let { width: e, height: t } = fd();
      (bi(Le.canvas, Le.context, { width: e, height: t }), (Le.width = e), (Le.height = t));
    }
    function Jb() {
      Le.canvas && (gd(), Le.canvas.parentNode?.removeChild(Le.canvas), (Le = {}));
    }
    var Mr = {
        margin: '#f6b26b',
        border: '#ffe599',
        padding: '#93c47d',
        content: '#6fa8dc',
        text: '#232020',
      },
      Ft = 6;
    function ld(e, { x: t, y: r, w: n, h: o, r: i }) {
      ((t = t - n / 2),
        (r = r - o / 2),
        n < 2 * i && (i = n / 2),
        o < 2 * i && (i = o / 2),
        e.beginPath(),
        e.moveTo(t + i, r),
        e.arcTo(t + n, r, t + n, r + o, i),
        e.arcTo(t + n, r + o, t, r + o, i),
        e.arcTo(t, r + o, t, r, i),
        e.arcTo(t, r, t + n, r, i),
        e.closePath());
    }
    function qb(e, { padding: t, border: r, width: n, height: o, top: i, left: a }) {
      let l = n - r.left - r.right - t.left - t.right,
        s = o - t.top - t.bottom - r.top - r.bottom,
        d = a + r.left + t.left,
        p = i + r.top + t.top;
      return (
        e === 'top'
          ? (d += l / 2)
          : e === 'right'
            ? ((d += l), (p += s / 2))
            : e === 'bottom'
              ? ((d += l / 2), (p += s))
              : e === 'left'
                ? (p += s / 2)
                : e === 'center' && ((d += l / 2), (p += s / 2)),
        { x: d, y: p }
      );
    }
    function zb(e, t, { margin: r, border: n, padding: o }, i, a) {
      let l = (h) => 0,
        s = 0,
        d = 0,
        p = a ? 1 : 0.5,
        m = a ? i * 2 : 0;
      return (
        e === 'padding'
          ? (l = (h) => o[h] * p + m)
          : e === 'border'
            ? (l = (h) => o[h] + n[h] * p + m)
            : e === 'margin' && (l = (h) => o[h] + n[h] + r[h] * p + m),
        t === 'top'
          ? (d = -l('top'))
          : t === 'right'
            ? (s = l('right'))
            : t === 'bottom'
              ? (d = l('bottom'))
              : t === 'left' && (s = -l('left')),
        { offsetX: s, offsetY: d }
      );
    }
    function Gb(e, t) {
      return (
        Math.abs(e.x - t.x) < Math.abs(e.w + t.w) / 2 &&
        Math.abs(e.y - t.y) < Math.abs(e.h + t.h) / 2
      );
    }
    function Wb(e, t, r) {
      return (
        e === 'top'
          ? (t.y = r.y - r.h - Ft)
          : e === 'right'
            ? (t.x = r.x + r.w / 2 + Ft + t.w / 2)
            : e === 'bottom'
              ? (t.y = r.y + r.h + Ft)
              : e === 'left' && (t.x = r.x - r.w / 2 - Ft - t.w / 2),
        { x: t.x, y: t.y }
      );
    }
    function yd(e, t, { x: r, y: n, w: o, h: i }, a) {
      return (
        ld(e, { x: r, y: n, w: o, h: i, r: 3 }),
        (e.fillStyle = `${Mr[t]}dd`),
        e.fill(),
        (e.strokeStyle = Mr[t]),
        e.stroke(),
        (e.fillStyle = Mr.text),
        e.fillText(a, r, n),
        ld(e, { x: r, y: n, w: o, h: i, r: 3 }),
        (e.fillStyle = `${Mr[t]}dd`),
        e.fill(),
        (e.strokeStyle = Mr[t]),
        e.stroke(),
        (e.fillStyle = Mr.text),
        e.fillText(a, r, n),
        { x: r, y: n, w: o, h: i }
      );
    }
    function bd(e, t) {
      ((e.font = '600 12px monospace'), (e.textBaseline = 'middle'), (e.textAlign = 'center'));
      let r = e.measureText(t),
        n = r.actualBoundingBoxAscent + r.actualBoundingBoxDescent,
        o = r.width + Ft * 2,
        i = n + Ft * 2;
      return { w: o, h: i };
    }
    function Yb(e, t, { type: r, position: n = 'center', text: o }, i, a = !1) {
      let { x: l, y: s } = qb(n, t),
        { offsetX: d, offsetY: p } = zb(r, n, t, Ft + 1, a);
      ((l += d), (s += p));
      let { w: m, h } = bd(e, o);
      if (i && Gb({ x: l, y: s, w: m, h }, i)) {
        let g = Wb(n, { x: l, y: s, w: m, h }, i);
        ((l = g.x), (s = g.y));
      }
      return yd(e, r, { x: l, y: s, w: m, h }, o);
    }
    function Kb(e, { w: t, h: r }) {
      let n = t * 0.5 + Ft,
        o = r * 0.5 + Ft;
      return { offsetX: (e.x === 'left' ? -1 : 1) * n, offsetY: (e.y === 'top' ? -1 : 1) * o };
    }
    function Xb(e, t, { type: r, text: n }) {
      let { floatingAlignment: o, extremities: i } = t,
        a = i[o.x],
        l = i[o.y],
        { w: s, h: d } = bd(e, n),
        { offsetX: p, offsetY: m } = Kb(o, { w: s, h: d });
      return ((a += p), (l += m), yd(e, r, { x: a, y: l, w: s, h: d }, n));
    }
    function cn(e, t, r, n) {
      let o = [];
      r.forEach((i, a) => {
        let l = n && i.position === 'center' ? Xb(e, t, i) : Yb(e, t, i, o[a - 1], n);
        o[a] = l;
      });
    }
    function Zb(e, t, r, n) {
      let o = r.reduce(
        (i, a) => (
          Object.prototype.hasOwnProperty.call(i, a.position) || (i[a.position] = []),
          i[a.position]?.push(a),
          i
        ),
        {},
      );
      (o.top && cn(e, t, o.top, n),
        o.right && cn(e, t, o.right, n),
        o.bottom && cn(e, t, o.bottom, n),
        o.left && cn(e, t, o.left, n),
        o.center && cn(e, t, o.center, n));
    }
    var po = {
        margin: '#f6b26ba8',
        border: '#ffe599a8',
        padding: '#93c47d8c',
        content: '#6fa8dca8',
      },
      ud = 30;
    function lt(e) {
      return parseInt(e.replace('px', ''), 10);
    }
    function $r(e) {
      return Number.isInteger(e) ? e : e.toFixed(2);
    }
    function Ei(e) {
      return e.filter((t) => t.text !== 0 && t.text !== '0');
    }
    function Qb(e) {
      let t = {
          top: K.window.scrollY,
          bottom: K.window.scrollY + K.window.innerHeight,
          left: K.window.scrollX,
          right: K.window.scrollX + K.window.innerWidth,
        },
        r = {
          top: Math.abs(t.top - e.top),
          bottom: Math.abs(t.bottom - e.bottom),
          left: Math.abs(t.left - e.left),
          right: Math.abs(t.right - e.right),
        };
      return { x: r.left > r.right ? 'left' : 'right', y: r.top > r.bottom ? 'top' : 'bottom' };
    }
    function e1(e) {
      let t = K.getComputedStyle(e),
        { top: r, left: n, right: o, bottom: i, width: a, height: l } = e.getBoundingClientRect(),
        {
          marginTop: s,
          marginBottom: d,
          marginLeft: p,
          marginRight: m,
          paddingTop: h,
          paddingBottom: g,
          paddingLeft: E,
          paddingRight: b,
          borderBottomWidth: _,
          borderTopWidth: y,
          borderLeftWidth: S,
          borderRightWidth: A,
        } = t;
      ((r = r + K.window.scrollY),
        (n = n + K.window.scrollX),
        (i = i + K.window.scrollY),
        (o = o + K.window.scrollX));
      let T = { top: lt(s), bottom: lt(d), left: lt(p), right: lt(m) },
        C = { top: lt(h), bottom: lt(g), left: lt(E), right: lt(b) },
        x = { top: lt(y), bottom: lt(_), left: lt(S), right: lt(A) },
        v = { top: r - T.top, bottom: i + T.bottom, left: n - T.left, right: o + T.right };
      return {
        margin: T,
        padding: C,
        border: x,
        top: r,
        left: n,
        bottom: i,
        right: o,
        width: a,
        height: l,
        extremities: v,
        floatingAlignment: Qb(v),
      };
    }
    function t1(e, { margin: t, width: r, height: n, top: o, left: i, bottom: a, right: l }) {
      let s = n + t.bottom + t.top;
      ((e.fillStyle = po.margin),
        e.fillRect(i, o - t.top, r, t.top),
        e.fillRect(l, o - t.top, t.right, s),
        e.fillRect(i, a, r, t.bottom),
        e.fillRect(i - t.left, o - t.top, t.left, s));
      let d = [
        { type: 'margin', text: $r(t.top), position: 'top' },
        { type: 'margin', text: $r(t.right), position: 'right' },
        { type: 'margin', text: $r(t.bottom), position: 'bottom' },
        { type: 'margin', text: $r(t.left), position: 'left' },
      ];
      return Ei(d);
    }
    function r1(
      e,
      { padding: t, border: r, width: n, height: o, top: i, left: a, bottom: l, right: s },
    ) {
      let d = n - r.left - r.right,
        p = o - t.top - t.bottom - r.top - r.bottom;
      ((e.fillStyle = po.padding),
        e.fillRect(a + r.left, i + r.top, d, t.top),
        e.fillRect(s - t.right - r.right, i + t.top + r.top, t.right, p),
        e.fillRect(a + r.left, l - t.bottom - r.bottom, d, t.bottom),
        e.fillRect(a + r.left, i + t.top + r.top, t.left, p));
      let m = [
        { type: 'padding', text: t.top, position: 'top' },
        { type: 'padding', text: t.right, position: 'right' },
        { type: 'padding', text: t.bottom, position: 'bottom' },
        { type: 'padding', text: t.left, position: 'left' },
      ];
      return Ei(m);
    }
    function n1(e, { border: t, width: r, height: n, top: o, left: i, bottom: a, right: l }) {
      let s = n - t.top - t.bottom;
      ((e.fillStyle = po.border),
        e.fillRect(i, o, r, t.top),
        e.fillRect(i, a - t.bottom, r, t.bottom),
        e.fillRect(i, o + t.top, t.left, s),
        e.fillRect(l - t.right, o + t.top, t.right, s));
      let d = [
        { type: 'border', text: t.top, position: 'top' },
        { type: 'border', text: t.right, position: 'right' },
        { type: 'border', text: t.bottom, position: 'bottom' },
        { type: 'border', text: t.left, position: 'left' },
      ];
      return Ei(d);
    }
    function o1(e, { padding: t, border: r, width: n, height: o, top: i, left: a }) {
      let l = n - r.left - r.right - t.left - t.right,
        s = o - t.top - t.bottom - r.top - r.bottom;
      return (
        (e.fillStyle = po.content),
        e.fillRect(a + r.left + t.left, i + r.top + t.top, l, s),
        [{ type: 'content', position: 'center', text: `${$r(l)} x ${$r(s)}` }]
      );
    }
    function a1(e) {
      return (t) => {
        if (e && t) {
          let r = e1(e),
            n = t1(t, r),
            o = r1(t, r),
            i = n1(t, r),
            a = o1(t, r),
            l = r.width <= ud * 3 || r.height <= ud;
          Zb(t, r, [...a, ...o, ...i, ...n], l);
        }
      };
    }
    function i1(e) {
      Vb(a1(e));
    }
    var s1 = (e, t) => {
        let r = K.document.elementFromPoint(e, t),
          n = (o) => {
            if (o && o.shadowRoot) {
              let i = o.shadowRoot.elementFromPoint(e, t);
              return o.isEqualNode(i) ? o : i.shadowRoot ? n(i) : i;
            }
            return o;
          };
        return n(r) || r;
      },
      cd,
      co = { x: 0, y: 0 };
    function dd(e, t) {
      ((cd = s1(e, t)), i1(cd));
    }
    var l1 = (e, t) => {
        let { measureEnabled: r } = t.globals || {};
        return (
          It(() => {
            if (typeof globalThis.document > 'u') return;
            let n = (o) => {
              window.requestAnimationFrame(() => {
                (o.stopPropagation(), (co.x = o.clientX), (co.y = o.clientY));
              });
            };
            return (
              globalThis.document.addEventListener('pointermove', n),
              () => {
                globalThis.document.removeEventListener('pointermove', n);
              }
            );
          }, []),
          It(() => {
            let n = (i) => {
                window.requestAnimationFrame(() => {
                  (i.stopPropagation(), dd(i.clientX, i.clientY));
                });
              },
              o = () => {
                window.requestAnimationFrame(() => {
                  Hb();
                });
              };
            return (
              t.viewMode === 'story' &&
                r &&
                (globalThis.document.addEventListener('pointerover', n),
                Ub(),
                globalThis.window.addEventListener('resize', o),
                dd(co.x, co.y)),
              () => {
                (globalThis.window.removeEventListener('resize', o), Jb());
              }
            );
          }, [r, t.viewMode]),
          e()
        );
      },
      f4 = globalThis.FEATURES?.measure ? [l1] : [],
      g4 = { [Ds]: !1 };
    var pd = (e) => {
        (Array.isArray(e) ? e : [e]).forEach(u1);
      },
      u1 = (e) => {
        let t = typeof e == 'string' ? e : e.join(''),
          r = K.document.getElementById(t);
        r && r.parentElement && r.parentElement.removeChild(r);
      },
      c1 = (e, t) => {
        let r = K.document.getElementById(e);
        if (r) r.innerHTML !== t && (r.innerHTML = t);
        else {
          let n = K.document.createElement('style');
          (n.setAttribute('id', e), (n.innerHTML = t), K.document.head.appendChild(n));
        }
      };
    function d1(e) {
      return cr`
    ${e} body {
      outline: 1px solid #2980b9 !important;
    }

    ${e} article {
      outline: 1px solid #3498db !important;
    }

    ${e} nav {
      outline: 1px solid #0088c3 !important;
    }

    ${e} aside {
      outline: 1px solid #33a0ce !important;
    }

    ${e} section {
      outline: 1px solid #66b8da !important;
    }

    ${e} header {
      outline: 1px solid #99cfe7 !important;
    }

    ${e} footer {
      outline: 1px solid #cce7f3 !important;
    }

    ${e} h1 {
      outline: 1px solid #162544 !important;
    }

    ${e} h2 {
      outline: 1px solid #314e6e !important;
    }

    ${e} h3 {
      outline: 1px solid #3e5e85 !important;
    }

    ${e} h4 {
      outline: 1px solid #449baf !important;
    }

    ${e} h5 {
      outline: 1px solid #c7d1cb !important;
    }

    ${e} h6 {
      outline: 1px solid #4371d0 !important;
    }

    ${e} main {
      outline: 1px solid #2f4f90 !important;
    }

    ${e} address {
      outline: 1px solid #1a2c51 !important;
    }

    ${e} div {
      outline: 1px solid #036cdb !important;
    }

    ${e} p {
      outline: 1px solid #ac050b !important;
    }

    ${e} hr {
      outline: 1px solid #ff063f !important;
    }

    ${e} pre {
      outline: 1px solid #850440 !important;
    }

    ${e} blockquote {
      outline: 1px solid #f1b8e7 !important;
    }

    ${e} ol {
      outline: 1px solid #ff050c !important;
    }

    ${e} ul {
      outline: 1px solid #d90416 !important;
    }

    ${e} li {
      outline: 1px solid #d90416 !important;
    }

    ${e} dl {
      outline: 1px solid #fd3427 !important;
    }

    ${e} dt {
      outline: 1px solid #ff0043 !important;
    }

    ${e} dd {
      outline: 1px solid #e80174 !important;
    }

    ${e} figure {
      outline: 1px solid #ff00bb !important;
    }

    ${e} figcaption {
      outline: 1px solid #bf0032 !important;
    }

    ${e} table {
      outline: 1px solid #00cc99 !important;
    }

    ${e} caption {
      outline: 1px solid #37ffc4 !important;
    }

    ${e} thead {
      outline: 1px solid #98daca !important;
    }

    ${e} tbody {
      outline: 1px solid #64a7a0 !important;
    }

    ${e} tfoot {
      outline: 1px solid #22746b !important;
    }

    ${e} tr {
      outline: 1px solid #86c0b2 !important;
    }

    ${e} th {
      outline: 1px solid #a1e7d6 !important;
    }

    ${e} td {
      outline: 1px solid #3f5a54 !important;
    }

    ${e} col {
      outline: 1px solid #6c9a8f !important;
    }

    ${e} colgroup {
      outline: 1px solid #6c9a9d !important;
    }

    ${e} button {
      outline: 1px solid #da8301 !important;
    }

    ${e} datalist {
      outline: 1px solid #c06000 !important;
    }

    ${e} fieldset {
      outline: 1px solid #d95100 !important;
    }

    ${e} form {
      outline: 1px solid #d23600 !important;
    }

    ${e} input {
      outline: 1px solid #fca600 !important;
    }

    ${e} keygen {
      outline: 1px solid #b31e00 !important;
    }

    ${e} label {
      outline: 1px solid #ee8900 !important;
    }

    ${e} legend {
      outline: 1px solid #de6d00 !important;
    }

    ${e} meter {
      outline: 1px solid #e8630c !important;
    }

    ${e} optgroup {
      outline: 1px solid #b33600 !important;
    }

    ${e} option {
      outline: 1px solid #ff8a00 !important;
    }

    ${e} output {
      outline: 1px solid #ff9619 !important;
    }

    ${e} progress {
      outline: 1px solid #e57c00 !important;
    }

    ${e} select {
      outline: 1px solid #e26e0f !important;
    }

    ${e} textarea {
      outline: 1px solid #cc5400 !important;
    }

    ${e} details {
      outline: 1px solid #33848f !important;
    }

    ${e} summary {
      outline: 1px solid #60a1a6 !important;
    }

    ${e} command {
      outline: 1px solid #438da1 !important;
    }

    ${e} menu {
      outline: 1px solid #449da6 !important;
    }

    ${e} del {
      outline: 1px solid #bf0000 !important;
    }

    ${e} ins {
      outline: 1px solid #400000 !important;
    }

    ${e} img {
      outline: 1px solid #22746b !important;
    }

    ${e} iframe {
      outline: 1px solid #64a7a0 !important;
    }

    ${e} embed {
      outline: 1px solid #98daca !important;
    }

    ${e} object {
      outline: 1px solid #00cc99 !important;
    }

    ${e} param {
      outline: 1px solid #37ffc4 !important;
    }

    ${e} video {
      outline: 1px solid #6ee866 !important;
    }

    ${e} audio {
      outline: 1px solid #027353 !important;
    }

    ${e} source {
      outline: 1px solid #012426 !important;
    }

    ${e} canvas {
      outline: 1px solid #a2f570 !important;
    }

    ${e} track {
      outline: 1px solid #59a600 !important;
    }

    ${e} map {
      outline: 1px solid #7be500 !important;
    }

    ${e} area {
      outline: 1px solid #305900 !important;
    }

    ${e} a {
      outline: 1px solid #ff62ab !important;
    }

    ${e} em {
      outline: 1px solid #800b41 !important;
    }

    ${e} strong {
      outline: 1px solid #ff1583 !important;
    }

    ${e} i {
      outline: 1px solid #803156 !important;
    }

    ${e} b {
      outline: 1px solid #cc1169 !important;
    }

    ${e} u {
      outline: 1px solid #ff0430 !important;
    }

    ${e} s {
      outline: 1px solid #f805e3 !important;
    }

    ${e} small {
      outline: 1px solid #d107b2 !important;
    }

    ${e} abbr {
      outline: 1px solid #4a0263 !important;
    }

    ${e} q {
      outline: 1px solid #240018 !important;
    }

    ${e} cite {
      outline: 1px solid #64003c !important;
    }

    ${e} dfn {
      outline: 1px solid #b4005a !important;
    }

    ${e} sub {
      outline: 1px solid #dba0c8 !important;
    }

    ${e} sup {
      outline: 1px solid #cc0256 !important;
    }

    ${e} time {
      outline: 1px solid #d6606d !important;
    }

    ${e} code {
      outline: 1px solid #e04251 !important;
    }

    ${e} kbd {
      outline: 1px solid #5e001f !important;
    }

    ${e} samp {
      outline: 1px solid #9c0033 !important;
    }

    ${e} var {
      outline: 1px solid #d90047 !important;
    }

    ${e} mark {
      outline: 1px solid #ff0053 !important;
    }

    ${e} bdi {
      outline: 1px solid #bf3668 !important;
    }

    ${e} bdo {
      outline: 1px solid #6f1400 !important;
    }

    ${e} ruby {
      outline: 1px solid #ff7b93 !important;
    }

    ${e} rt {
      outline: 1px solid #ff2f54 !important;
    }

    ${e} rp {
      outline: 1px solid #803e49 !important;
    }

    ${e} span {
      outline: 1px solid #cc2643 !important;
    }

    ${e} br {
      outline: 1px solid #db687d !important;
    }

    ${e} wbr {
      outline: 1px solid #db175b !important;
    }`;
    }
    var p1 = (e, t) => {
        let r = t.globals || {},
          n = [!0, 'true'].includes(r[Tr]),
          o = t.viewMode === 'docs',
          i = ja(() => d1(o ? '[data-story-block="true"]' : '.sb-show-main'), [t]);
        return (
          It(() => {
            let a = o ? `addon-outline-docs-${t.id}` : 'addon-outline';
            return (
              n ? c1(a, i) : pd(a),
              () => {
                pd(a);
              }
            );
          }, [n, i, t]),
          e()
        );
      },
      S4 = globalThis.FEATURES?.outline ? [p1] : [],
      A4 = { [Tr]: !1 };
    var x4 = { [ht]: { value: void 0, isRotated: !1 } };
    ke();
    le();
    G();
    ce();
    le();
    G();
    ce();
    G();
    le();
    G();
    ce();
    G();
    G();
    ce();
    le();
    G();
    ce();
    le();
    G();
    ce();
    le();
    G();
    G();
    le();
    G();
    le();
    G();
    ke();
    le();
    G();
    ce();
    ke();
    le();
    G();
    G();
    G();
    le();
    G();
    le();
    G();
    ce();
    le();
    G();
    ce();
    le();
    G();
    ce();
    le();
    G();
    ce();
    ke();
    le();
    G();
    ce();
    ke();
    le();
    G();
    ke();
    le();
    G();
    le();
    G();
    ce();
    ke();
    le();
    G();
    ce();
    G();
    G();
    ce();
    G();
    G();
    ce();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    le();
    le();
    G();
    ce();
    G();
    G();
    le();
    le();
    G();
    ce();
    le();
    G();
    ce();
    ke();
    le();
    G();
    ce();
    ke();
    le();
    G();
    le();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    G();
    le();
    G();
    ke();
    le();
    G();
    ce();
    le();
    G();
    ce();
    ke();
    le();
    G();
    ce();
    le();
    G();
    ce();
    G();
    G();
    ce();
    ke();
    G();
    G();
    ce();
    ke();
    G();
    G();
    ce();
    ke();
    G();
    G();
    ce();
    ke();
    le();
    G();
    G();
    ke();
    var iE = P.div(cl, ({ theme: e }) => ({
        backgroundColor: e.base === 'light' ? 'rgba(0,0,0,.01)' : 'rgba(255,255,255,.01)',
        borderRadius: e.appBorderRadius,
        border: `1px dashed ${e.appBorderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        margin: '25px 0 40px',
        color: Je(0.3, e.color.defaultText),
        fontSize: e.typography.size.s2,
      })),
      sE = (e) => u.createElement(iE, { ...e, className: 'docblock-emptyblock sb-unstyled' });
    function yr() {
      return (
        (yr = Object.assign
          ? Object.assign.bind()
          : function (e) {
              for (var t = 1; t < arguments.length; t++) {
                var r = arguments[t];
                for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
              }
              return e;
            }),
        yr.apply(this, arguments)
      );
    }
    var lE = ['children', 'options'],
      Ud = [
        'allowFullScreen',
        'allowTransparency',
        'autoComplete',
        'autoFocus',
        'autoPlay',
        'cellPadding',
        'cellSpacing',
        'charSet',
        'classId',
        'colSpan',
        'contentEditable',
        'contextMenu',
        'crossOrigin',
        'encType',
        'formAction',
        'formEncType',
        'formMethod',
        'formNoValidate',
        'formTarget',
        'frameBorder',
        'hrefLang',
        'inputMode',
        'keyParams',
        'keyType',
        'marginHeight',
        'marginWidth',
        'maxLength',
        'mediaGroup',
        'minLength',
        'noValidate',
        'radioGroup',
        'readOnly',
        'rowSpan',
        'spellCheck',
        'srcDoc',
        'srcLang',
        'srcSet',
        'tabIndex',
        'useMap',
      ].reduce((e, t) => ((e[t.toLowerCase()] = t), e), { class: 'className', for: 'htmlFor' }),
      Vd = { amp: '&', apos: "'", gt: '>', lt: '<', nbsp: '\xA0', quot: '\u201C' },
      uE = ['style', 'script', 'pre'],
      cE = ['src', 'href', 'data', 'formAction', 'srcDoc', 'action'],
      dE =
        /([-A-Z0-9_:]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|(?:\{((?:\\.|{[^}]*?}|[^}])*)\})))?/gi,
      pE = /\n{2,}$/,
      Hd = /^(\s*>[\s\S]*?)(?=\n\n|$)/,
      mE = /^ *> ?/gm,
      hE = /^(?:\[!([^\]]*)\]\n)?([\s\S]*)/,
      fE = /^ {2,}\n/,
      gE = /^(?:([-*_])( *\1){2,}) *(?:\n *)+\n/,
      Jd = /^(?: {1,3})?(`{3,}|~{3,}) *(\S+)? *([^\n]*?)?\n([\s\S]*?)(?:\1\n?|$)/,
      qd = /^(?: {4}[^\n]+\n*)+(?:\n *)+\n?/,
      yE = /^(`+)((?:\\`|(?!\1)`|[^`])+)\1/,
      bE = /^(?:\n *)*\n/,
      EE = /\r\n?/g,
      SE = /^\[\^([^\]]+)](:(.*)((\n+ {4,}.*)|(\n(?!\[\^).+))*)/,
      AE = /^\[\^([^\]]+)]/,
      TE = /\f/g,
      wE = /^---[ \t]*\n(.|\n)*\n---[ \t]*\n/,
      _E = /^\s*?\[(x|\s)\]/,
      zd = /^ *(#{1,6}) *([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/,
      Gd = /^ *(#{1,6}) +([^\n]+?)(?: +#*)?(?:\n *)*(?:\n|$)/,
      Wd = /^([^\n]+)\n *(=|-)\2{2,} *\n/,
      Ri =
        /^ *(?!<[a-z][^ >/]* ?\/>)<([a-z][^ >/]*) ?((?:[^>]*[^/])?)>\n?(\s*(?:<\1[^>]*?>[\s\S]*?<\/\1>|(?!<\1\b)[\s\S])*?)<\/\1>(?!<\/\1>)\n*/i,
      vE = /&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi,
      Yd = /^<!--[\s\S]*?(?:-->)/,
      xE = /^(data|aria|x)-[a-z_][a-z\d_.-]*$/,
      Ii = /^ *<([a-z][a-z0-9:]*)(?:\s+((?:<.*?>|[^>])*))?\/?>(?!<\/\1>)(\s*\n)?/i,
      CE = /^\{.*\}$/,
      OE = /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
      RE = /^<([^ >]+[:@\/][^ >]+)>/,
      IE = /-([a-z])?/gi,
      Kd = /^(\|.*)\n(?: *(\|? *[-:]+ *\|[-| :]*)\n((?:.*\|.*\n)*))?\n?/,
      DE = /^[^\n]+(?:  \n|\n{2,})/,
      PE = /^\[([^\]]*)\]:\s+<?([^\s>]+)>?\s*("([^"]*)")?/,
      NE = /^!\[([^\]]*)\] ?\[([^\]]*)\]/,
      kE = /^\[([^\]]*)\] ?\[([^\]]*)\]/,
      FE = /(\n|^[-*]\s|^#|^ {2,}|^-{2,}|^>\s)/,
      LE = /\t/g,
      BE = /(^ *\||\| *$)/g,
      ME = /^ *:-+: *$/,
      $E = /^ *:-+ *$/,
      jE = /^ *-+: *$/,
      No = (e) => `(?=[\\s\\S]+?\\1${e ? '\\1' : ''})`,
      ko = '((?:\\[.*?\\][([].*?[)\\]]|<.*?>(?:.*?<.*?>)?|`.*?`|\\\\\\1|[\\s\\S])+?)',
      UE = RegExp(`^([*_])\\1${No(1)}${ko}\\1\\1(?!\\1)`),
      VE = RegExp(`^([*_])${No(0)}${ko}\\1(?!\\1)`),
      HE = RegExp(`^(==)${No(0)}${ko}\\1`),
      JE = RegExp(`^(~~)${No(0)}${ko}\\1`),
      qE = /^(:[a-zA-Z0-9-_]+:)/,
      zE = /^\\([^0-9A-Za-z\s])/,
      GE = /\\([^0-9A-Za-z\s])/g,
      WE = /^[\s\S](?:(?!  \n|[0-9]\.|http)[^=*_~\-\n:<`\\\[!])*/,
      YE = /^\n+/,
      KE = /^([ \t]*)/,
      XE = /(?:^|\n)( *)$/,
      os = '(?:\\d+\\.)',
      as = '(?:[*+-])';
    function Ip(e) {
      return '( *)(' + (e === 1 ? os : as) + ') +';
    }
    var Dp = Ip(1),
      Pp = Ip(2);
    function Np(e) {
      return RegExp('^' + (e === 1 ? Dp : Pp));
    }
    var ZE = Np(1),
      QE = Np(2);
    function kp(e) {
      return RegExp(
        '^' +
          (e === 1 ? Dp : Pp) +
          '[^\\n]*(?:\\n(?!\\1' +
          (e === 1 ? os : as) +
          ' )[^\\n]*)*(\\n|$)',
        'gm',
      );
    }
    var e2 = kp(1),
      t2 = kp(2);
    function Fp(e) {
      let t = e === 1 ? os : as;
      return RegExp(
        '^( *)(' + t + ') [\\s\\S]+?(?:\\n{2,}(?! )(?!\\1' + t + ' (?!' + t + ' ))\\n*|\\s*\\n*$)',
      );
    }
    var Lp = Fp(1),
      Bp = Fp(2);
    function Xd(e, t) {
      let r = t === 1,
        n = r ? Lp : Bp,
        o = r ? e2 : t2,
        i = r ? ZE : QE;
      return {
        t: (a) => i.test(a),
        o: Hr(function (a, l) {
          let s = XE.exec(l.prevCapture);
          return s && (l.list || (!l.inline && !l.simple)) ? n.exec((a = s[1] + a)) : null;
        }),
        i: 1,
        u(a, l, s) {
          let d = r ? +a[2] : void 0,
            p = a[0]
              .replace(
                pE,
                `
`,
              )
              .match(o),
            m = !1;
          return {
            items: p.map(function (h, g) {
              let E = i.exec(h)[0].length,
                b = RegExp('^ {1,' + E + '}', 'gm'),
                _ = h.replace(b, '').replace(i, ''),
                y = g === p.length - 1,
                S =
                  _.indexOf(`

`) !== -1 ||
                  (y && m);
              m = S;
              let A = s.inline,
                T = s.list,
                C;
              ((s.list = !0),
                S
                  ? ((s.inline = !1),
                    (C =
                      gn(_) +
                      `

`))
                  : ((s.inline = !0), (C = gn(_))));
              let x = l(C, s);
              return ((s.inline = A), (s.list = T), x);
            }),
            ordered: r,
            start: d,
          };
        },
        l: (a, l, s) =>
          e(
            a.ordered ? 'ol' : 'ul',
            { key: s.key, start: a.type === '20' ? a.start : void 0 },
            a.items.map(function (d, p) {
              return e('li', { key: p }, l(d, s));
            }),
          ),
      };
    }
    var r2 = RegExp(
        `^\\[((?:\\[[^\\[\\]]*(?:\\[[^\\[\\]]*\\][^\\[\\]]*)*\\]|[^\\[\\]])*)\\]\\(\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['"]([\\s\\S]*?)['"])?\\s*\\)`,
      ),
      n2 = /^!\[(.*?)\]\( *((?:\([^)]*\)|[^() ])*) *"?([^)"]*)?"?\)/;
    function Zd(e) {
      return typeof e == 'string';
    }
    function gn(e) {
      let t = e.length;
      for (; t > 0 && e[t - 1] <= ' ';) t--;
      return e.slice(0, t);
    }
    function To(e, t) {
      return e.startsWith(t);
    }
    function o2(e, t, r) {
      if (Array.isArray(r)) {
        for (let n = 0; n < r.length; n++) if (To(e, r[n])) return !0;
        return !1;
      }
      return r(e, t);
    }
    function mn(e) {
      return e
        .replace(/[ÀÁÂÃÄÅàáâãäåæÆ]/g, 'a')
        .replace(/[çÇ]/g, 'c')
        .replace(/[ðÐ]/g, 'd')
        .replace(/[ÈÉÊËéèêë]/g, 'e')
        .replace(/[ÏïÎîÍíÌì]/g, 'i')
        .replace(/[Ññ]/g, 'n')
        .replace(/[øØœŒÕõÔôÓóÒò]/g, 'o')
        .replace(/[ÜüÛûÚúÙù]/g, 'u')
        .replace(/[ŸÿÝý]/g, 'y')
        .replace(/[^a-z0-9- ]/gi, '')
        .replace(/ /gi, '-')
        .toLowerCase();
    }
    function a2(e) {
      return jE.test(e) ? 'right' : ME.test(e) ? 'center' : $E.test(e) ? 'left' : null;
    }
    function Qd(e, t, r, n) {
      let o = r.inTable;
      r.inTable = !0;
      let i = [[]],
        a = '';
      function l() {
        if (!a) return;
        let s = i[i.length - 1];
        (s.push.apply(s, t(a, r)), (a = ''));
      }
      return (
        e
          .trim()
          .split(/(`[^`]*`|\\\||\|)/)
          .filter(Boolean)
          .forEach((s, d, p) => {
            s.trim() === '|' && (l(), n) ? d !== 0 && d !== p.length - 1 && i.push([]) : (a += s);
          }),
        l(),
        (r.inTable = o),
        i
      );
    }
    function i2(e, t, r) {
      r.inline = !0;
      let n = e[2] ? e[2].replace(BE, '').split('|').map(a2) : [],
        o = e[3]
          ? (function (a, l, s) {
              return a
                .trim()
                .split(
                  `
`,
                )
                .map(function (d) {
                  return Qd(d, l, s, !0);
                });
            })(e[3], t, r)
          : [],
        i = Qd(e[1], t, r, !!o.length);
      return (
        (r.inline = !1),
        o.length ? { align: n, cells: o, header: i, type: '25' } : { children: i, type: '21' }
      );
    }
    function ep(e, t) {
      return e.align[t] == null ? {} : { textAlign: e.align[t] };
    }
    function Hr(e) {
      return ((e.inline = 1), e);
    }
    function gr(e) {
      return Hr(function (t, r) {
        return r.inline ? e.exec(t) : null;
      });
    }
    function Kt(e) {
      return Hr(function (t, r) {
        return r.inline || r.simple ? e.exec(t) : null;
      });
    }
    function Lt(e) {
      return function (t, r) {
        return r.inline || r.simple ? null : e.exec(t);
      };
    }
    function yo(e) {
      return Hr(function (t) {
        return e.exec(t);
      });
    }
    var s2 = /(javascript|vbscript|data(?!:image)):/i;
    function l2(e) {
      try {
        let t = decodeURIComponent(e).replace(/[^A-Za-z0-9/:]/g, '');
        if (s2.test(t)) return null;
      } catch {
        return null;
      }
      return e;
    }
    function _t(e) {
      return e && e.replace(GE, '$1');
    }
    function wo(e, t, r) {
      let n = r.inline || !1,
        o = r.simple || !1;
      ((r.inline = !0), (r.simple = !0));
      let i = e(t, r);
      return ((r.inline = n), (r.simple = o), i);
    }
    function u2(e, t, r) {
      let n = r.inline || !1,
        o = r.simple || !1;
      ((r.inline = !1), (r.simple = !0));
      let i = e(t, r);
      return ((r.inline = n), (r.simple = o), i);
    }
    function c2(e, t, r) {
      let n = r.inline || !1;
      r.inline = !1;
      let o = e(t, r);
      return ((r.inline = n), o);
    }
    var Di = (e, t, r) => ({ children: wo(t, e[2], r) });
    function Pi() {
      return {};
    }
    function Ni() {
      return null;
    }
    function d2(...e) {
      return e.filter(Boolean).join(' ');
    }
    function ki(e, t, r) {
      let n = e,
        o = t.split('.');
      for (; o.length && ((n = n[o[0]]), n !== void 0);) o.shift();
      return n || r;
    }
    function p2(e = '', t = {}) {
      ((t.overrides = t.overrides || {}),
        (t.namedCodesToUnicode = t.namedCodesToUnicode ? yr({}, Vd, t.namedCodesToUnicode) : Vd));
      let r = t.slugify || mn,
        n = t.sanitizer || l2,
        o = t.createElement || te,
        i = [Hd, Jd, qd, t.enforceAtxHeadings ? Gd : zd, Wd, Kd, Lp, Bp],
        a = [...i, DE, Ri, Yd, Ii];
      function l(y, S) {
        for (let A = 0; A < y.length; A++) if (y[A].test(S)) return !0;
        return !1;
      }
      function s(y, S, ...A) {
        let T = ki(t.overrides, y + '.props', {});
        return o(
          (function (C, x) {
            let v = ki(x, C);
            return v
              ? typeof v == 'function' || (typeof v == 'object' && 'render' in v)
                ? v
                : ki(x, C + '.component', C)
              : C;
          })(y, t.overrides),
          yr({}, S, T, { className: d2(S?.className, T.className) || void 0 }),
          ...A,
        );
      }
      function d(y) {
        y = y.replace(wE, '');
        let S = !1;
        t.forceInline ? (S = !0) : t.forceBlock || (S = FE.test(y) === !1);
        let A = b(
          E(
            S
              ? y
              : gn(y).replace(YE, '') +
                  `

`,
            { inline: S },
          ),
        );
        for (; Zd(A[A.length - 1]) && !A[A.length - 1].trim();) A.pop();
        if (t.wrapper === null) return A;
        let T = t.wrapper || (S ? 'span' : 'div'),
          C;
        if (A.length > 1 || t.forceWrapper) C = A;
        else {
          if (A.length === 1)
            return ((C = A[0]), typeof C == 'string' ? s('span', { key: 'outer' }, C) : C);
          C = null;
        }
        return o(T, { key: 'outer' }, C);
      }
      function p(y, S) {
        if (!S || !S.trim()) return null;
        let A = S.match(dE);
        return A
          ? A.reduce(function (T, C) {
              let x = C.indexOf('=');
              if (x !== -1) {
                let v = (function (F) {
                    return (
                      F.indexOf('-') !== -1 &&
                        F.match(xE) === null &&
                        (F = F.replace(IE, function (z, k) {
                          return k.toUpperCase();
                        })),
                      F
                    );
                  })(C.slice(0, x)).trim(),
                  I = (function (F) {
                    let z = F[0];
                    return (z === '"' || z === "'") && F.length >= 2 && F[F.length - 1] === z
                      ? F.slice(1, -1)
                      : F;
                  })(C.slice(x + 1).trim()),
                  N = Ud[v] || v;
                if (N === 'ref') return T;
                let B = (T[N] = (function (F, z, k, R) {
                  return z === 'style'
                    ? (function (O) {
                        let L = [],
                          $ = '',
                          M = !1,
                          J = !1,
                          j = '';
                        if (!O) return L;
                        for (let Z = 0; Z < O.length; Z++) {
                          let ue = O[Z];
                          if (
                            ((ue !== '"' && ue !== "'") ||
                              M ||
                              (J ? ue === j && ((J = !1), (j = '')) : ((J = !0), (j = ue))),
                            ue === '(' && $.endsWith('url')
                              ? (M = !0)
                              : ue === ')' && M && (M = !1),
                            ue !== ';' || J || M)
                          )
                            $ += ue;
                          else {
                            let me = $.trim();
                            if (me) {
                              let ie = me.indexOf(':');
                              if (ie > 0) {
                                let fe = me.slice(0, ie).trim(),
                                  xe = me.slice(ie + 1).trim();
                                L.push([fe, xe]);
                              }
                            }
                            $ = '';
                          }
                        }
                        let W = $.trim();
                        if (W) {
                          let Z = W.indexOf(':');
                          if (Z > 0) {
                            let ue = W.slice(0, Z).trim(),
                              me = W.slice(Z + 1).trim();
                            L.push([ue, me]);
                          }
                        }
                        return L;
                      })(k).reduce(function (O, [L, $]) {
                        return (
                          (O[L.replace(/(-[a-z])/g, (M) => M[1].toUpperCase())] = R($, F, L)),
                          O
                        );
                      }, {})
                    : cE.indexOf(z) !== -1
                      ? R(_t(k), F, z)
                      : (k.match(CE) && (k = _t(k.slice(1, k.length - 1))),
                        k === 'true' || (k !== 'false' && k));
                })(y, v, I, n));
                typeof B == 'string' && (Ri.test(B) || Ii.test(B)) && (T[N] = d(B.trim()));
              } else C !== 'style' && (T[Ud[C] || C] = !0);
              return T;
            }, {})
          : null;
      }
      let m = [],
        h = {},
        g = {
          0: {
            t: ['>'],
            o: Lt(Hd),
            i: 1,
            u(y, S, A) {
              let [, T, C] = y[0].replace(mE, '').match(hE);
              return { alert: T, children: S(C, A) };
            },
            l(y, S, A) {
              let T = { key: A.key };
              return (
                y.alert &&
                  ((T.className = 'markdown-alert-' + r(y.alert.toLowerCase(), mn)),
                  y.children.unshift({
                    attrs: {},
                    children: [{ type: '27', text: y.alert }],
                    noInnerParse: !0,
                    type: '11',
                    tag: 'header',
                  })),
                s('blockquote', T, S(y.children, A))
              );
            },
          },
          1: { t: ['  '], o: yo(fE), i: 1, u: Pi, l: (y, S, A) => s('br', { key: A.key }) },
          2: {
            t: ['--', '__', '**', '- ', '* ', '_ '],
            o: Lt(gE),
            i: 1,
            u: Pi,
            l: (y, S, A) => s('hr', { key: A.key }),
          },
          3: {
            t: ['    '],
            o: Lt(qd),
            i: 0,
            u: (y) => ({ lang: void 0, text: _t(gn(y[0].replace(/^ {4}/gm, ''))) }),
            l: (y, S, A) =>
              s(
                'pre',
                { key: A.key },
                s('code', yr({}, y.attrs, { className: y.lang ? 'lang-' + y.lang : '' }), y.text),
              ),
          },
          4: {
            t: ['```', '~~~'],
            o: Lt(Jd),
            i: 0,
            u: (y) => ({
              attrs: p('code', y[3] || ''),
              lang: y[2] || void 0,
              text: y[4],
              type: '3',
            }),
          },
          5: {
            t: ['`'],
            o: Kt(yE),
            i: 3,
            u: (y) => ({ text: _t(y[2]) }),
            l: (y, S, A) => s('code', { key: A.key }, y.text),
          },
          6: {
            t: ['[^'],
            o: Lt(SE),
            i: 0,
            u: (y) => (m.push({ footnote: y[2], identifier: y[1] }), {}),
            l: Ni,
          },
          7: {
            t: ['[^'],
            o: gr(AE),
            i: 1,
            u: (y) => ({ target: '#' + r(y[1], mn), text: y[1] }),
            l: (y, S, A) =>
              s(
                'a',
                { key: A.key, href: n(y.target, 'a', 'href') },
                s('sup', { key: A.key }, y.text),
              ),
          },
          8: {
            t: ['[ ]', '[x]'],
            o: gr(_E),
            i: 1,
            u: (y) => ({ completed: y[1].toLowerCase() === 'x' }),
            l: (y, S, A) =>
              s('input', { checked: y.completed, key: A.key, readOnly: !0, type: 'checkbox' }),
          },
          9: {
            t: ['#'],
            o: Lt(t.enforceAtxHeadings ? Gd : zd),
            i: 1,
            u: (y, S, A) => ({ children: wo(S, y[2], A), id: r(y[2], mn), level: y[1].length }),
            l: (y, S, A) => s('h' + y.level, { id: y.id, key: A.key }, S(y.children, A)),
          },
          10: {
            t: (y) => {
              let S = y.indexOf(`
`);
              return S > 0 && S < y.length - 1 && (y[S + 1] === '=' || y[S + 1] === '-');
            },
            o: Lt(Wd),
            i: 1,
            u: (y, S, A) => ({ children: wo(S, y[1], A), level: y[2] === '=' ? 1 : 2, type: '9' }),
          },
          11: {
            t: ['<'],
            o: yo(Ri),
            i: 1,
            u(y, S, A) {
              let [, T] = y[3].match(KE),
                C = RegExp('^' + T, 'gm'),
                x = y[3].replace(C, ''),
                v = l(a, x) ? c2 : wo,
                I = y[1].toLowerCase(),
                N = uE.indexOf(I) !== -1,
                B = (N ? I : y[1]).trim(),
                F = { attrs: p(B, y[2]), noInnerParse: N, tag: B };
              if (((A.inAnchor = A.inAnchor || I === 'a'), N)) F.text = y[3];
              else {
                let z = A.inHTML;
                ((A.inHTML = !0), (F.children = v(S, x, A)), (A.inHTML = z));
              }
              return ((A.inAnchor = !1), F);
            },
            l: (y, S, A) =>
              s(y.tag, yr({ key: A.key }, y.attrs), y.text || (y.children ? S(y.children, A) : '')),
          },
          13: {
            t: ['<'],
            o: yo(Ii),
            i: 1,
            u(y) {
              let S = y[1].trim();
              return { attrs: p(S, y[2] || ''), tag: S };
            },
            l: (y, S, A) => s(y.tag, yr({}, y.attrs, { key: A.key })),
          },
          12: { t: ['<!--'], o: yo(Yd), i: 1, u: () => ({}), l: Ni },
          14: {
            t: ['!['],
            o: Kt(n2),
            i: 1,
            u: (y) => ({ alt: _t(y[1]), target: _t(y[2]), title: _t(y[3]) }),
            l: (y, S, A) =>
              s('img', {
                key: A.key,
                alt: y.alt || void 0,
                title: y.title || void 0,
                src: n(y.target, 'img', 'src'),
              }),
          },
          15: {
            t: ['['],
            o: gr(r2),
            i: 3,
            u: (y, S, A) => ({ children: u2(S, y[1], A), target: _t(y[2]), title: _t(y[3]) }),
            l: (y, S, A) =>
              s(
                'a',
                { key: A.key, href: n(y.target, 'a', 'href'), title: y.title },
                S(y.children, A),
              ),
          },
          16: {
            t: ['<'],
            o: gr(RE),
            i: 0,
            u(y) {
              let S = y[1],
                A = !1;
              return (
                S.indexOf('@') !== -1 &&
                  S.indexOf('//') === -1 &&
                  ((A = !0), (S = S.replace('mailto:', ''))),
                { children: [{ text: S, type: '27' }], target: A ? 'mailto:' + S : S, type: '15' }
              );
            },
          },
          17: {
            t: (y, S) =>
              !S.inAnchor && !t.disableAutoLink && (To(y, 'http://') || To(y, 'https://')),
            o: gr(OE),
            i: 0,
            u: (y) => ({
              children: [{ text: y[1], type: '27' }],
              target: y[1],
              title: void 0,
              type: '15',
            }),
          },
          20: Xd(s, 1),
          33: Xd(s, 2),
          19: {
            t: [
              `
`,
            ],
            o: Lt(bE),
            i: 3,
            u: Pi,
            l: () => `
`,
          },
          21: {
            o: Hr(function (y, S) {
              if (
                S.inline ||
                S.simple ||
                (S.inHTML &&
                  y.indexOf(`

`) === -1 &&
                  S.prevCapture.indexOf(`

`) === -1)
              )
                return null;
              let A = '',
                T = 0;
              for (;;) {
                let x = y.indexOf(
                    `
`,
                    T,
                  ),
                  v = y.slice(T, x === -1 ? void 0 : x + 1);
                if (l(i, v) || ((A += v), x === -1 || !v.trim())) break;
                T = x + 1;
              }
              let C = gn(A);
              return C === '' ? null : [A, , C];
            }),
            i: 3,
            u: Di,
            l: (y, S, A) => s('p', { key: A.key }, S(y.children, A)),
          },
          22: {
            t: ['['],
            o: gr(PE),
            i: 0,
            u: (y) => ((h[y[1]] = { target: y[2], title: y[4] }), {}),
            l: Ni,
          },
          23: {
            t: ['!['],
            o: Kt(NE),
            i: 0,
            u: (y) => ({ alt: y[1] ? _t(y[1]) : void 0, ref: y[2] }),
            l: (y, S, A) =>
              h[y.ref]
                ? s('img', {
                    key: A.key,
                    alt: y.alt,
                    src: n(h[y.ref].target, 'img', 'src'),
                    title: h[y.ref].title,
                  })
                : null,
          },
          24: {
            t: (y) => y[0] === '[' && y.indexOf('](') === -1,
            o: gr(kE),
            i: 0,
            u: (y, S, A) => ({ children: S(y[1], A), fallbackChildren: y[0], ref: y[2] }),
            l: (y, S, A) =>
              h[y.ref]
                ? s(
                    'a',
                    { key: A.key, href: n(h[y.ref].target, 'a', 'href'), title: h[y.ref].title },
                    S(y.children, A),
                  )
                : s('span', { key: A.key }, y.fallbackChildren),
          },
          25: {
            t: ['|'],
            o: Lt(Kd),
            i: 1,
            u: i2,
            l(y, S, A) {
              let T = y;
              return s(
                'table',
                { key: A.key },
                s(
                  'thead',
                  null,
                  s(
                    'tr',
                    null,
                    T.header.map(function (C, x) {
                      return s('th', { key: x, style: ep(T, x) }, S(C, A));
                    }),
                  ),
                ),
                s(
                  'tbody',
                  null,
                  T.cells.map(function (C, x) {
                    return s(
                      'tr',
                      { key: x },
                      C.map(function (v, I) {
                        return s('td', { key: I, style: ep(T, I) }, S(v, A));
                      }),
                    );
                  }),
                ),
              );
            },
          },
          27: {
            o: Hr(function (y, S) {
              let A;
              return (To(y, ':') && (A = qE.exec(y)), A || WE.exec(y));
            }),
            i: 4,
            u(y) {
              let S = y[0];
              return {
                text:
                  S.indexOf('&') === -1
                    ? S
                    : S.replace(vE, (A, T) => t.namedCodesToUnicode[T] || A),
              };
            },
            l: (y) => y.text,
          },
          28: {
            t: ['**', '__'],
            o: Kt(UE),
            i: 2,
            u: (y, S, A) => ({ children: S(y[2], A) }),
            l: (y, S, A) => s('strong', { key: A.key }, S(y.children, A)),
          },
          29: {
            t: (y) => {
              let S = y[0];
              return (S === '*' || S === '_') && y[1] !== S;
            },
            o: Kt(VE),
            i: 3,
            u: (y, S, A) => ({ children: S(y[2], A) }),
            l: (y, S, A) => s('em', { key: A.key }, S(y.children, A)),
          },
          30: { t: ['\\'], o: Kt(zE), i: 1, u: (y) => ({ text: y[1], type: '27' }) },
          31: {
            t: ['=='],
            o: Kt(HE),
            i: 3,
            u: Di,
            l: (y, S, A) => s('mark', { key: A.key }, S(y.children, A)),
          },
          32: {
            t: ['~~'],
            o: Kt(JE),
            i: 3,
            u: Di,
            l: (y, S, A) => s('del', { key: A.key }, S(y.children, A)),
          },
        };
      t.disableParsingRawHTML === !0 && (delete g[11], delete g[13]);
      let E = (function (y) {
          var S = Object.keys(y);
          function A(T, C) {
            var x = [];
            if (((C.prevCapture = C.prevCapture || ''), T.trim()))
              for (; T;)
                for (var v = 0; v < S.length;) {
                  var I = S[v],
                    N = y[I];
                  if (!N.t || o2(T, C, N.t)) {
                    var B = N.o(T, C);
                    if (B && B[0]) {
                      T = T.substring(B[0].length);
                      var F = N.u(B, A, C);
                      ((C.prevCapture += B[0]), F.type || (F.type = I), x.push(F));
                      break;
                    }
                    v++;
                  } else v++;
                }
            return ((C.prevCapture = ''), x);
          }
          return (
            S.sort(function (T, C) {
              return y[T].i - y[C].i || (T < C ? -1 : 1);
            }),
            function (T, C) {
              return A(
                (function (x) {
                  return x
                    .replace(
                      EE,
                      `
`,
                    )
                    .replace(TE, '')
                    .replace(LE, '    ');
                })(T),
                C,
              );
            }
          );
        })(g),
        b = (function (y, S) {
          return function A(T, C = {}) {
            if (Array.isArray(T)) {
              let x = C.key,
                v = [],
                I = !1;
              for (let N = 0; N < T.length; N++) {
                C.key = N;
                let B = A(T[N], C),
                  F = Zd(B);
                (F && I ? (v[v.length - 1] += B) : B !== null && v.push(B), (I = F));
              }
              return ((C.key = x), v);
            }
            return (function (x, v, I) {
              let N = y[x.type].l;
              return S ? S(() => N(x, v, I), x, v, I) : N(x, v, I);
            })(T, A, C);
          };
        })(g, t.renderRule),
        _ = d(e);
      return m.length
        ? s(
            'div',
            null,
            _,
            s(
              'footer',
              { key: 'footer' },
              m.map(function (y) {
                return s(
                  'div',
                  { id: r(y.identifier, mn), key: y.identifier },
                  y.identifier,
                  b(E(y.footnote, { inline: !0 })),
                );
              }),
            ),
          )
        : _;
    }
    var m2 = (e) => {
        let { children: t, options: r } = e,
          n = (function (o, i) {
            if (o == null) return {};
            var a,
              l,
              s = {},
              d = Object.keys(o);
            for (l = 0; l < d.length; l++) i.indexOf((a = d[l])) >= 0 || (s[a] = o[a]);
            return s;
          })(e, lE);
        return je(p2(t ?? '', r), n);
      },
      h2 = (e) => ({
        lineHeight: '18px',
        alignItems: 'center',
        marginBottom: 8,
        display: 'inline-block',
        position: 'relative',
        whiteSpace: 'nowrap',
        background: e.boolean.background,
        borderRadius: '3em',
        padding: 1,
        '&[aria-disabled="true"]': { opacity: 0.5, input: { cursor: 'not-allowed' } },
        '@media (forced-colors: active)': {
          background: 'ButtonFace',
          outline: '1px solid ButtonText',
        },
        '&:focus-within': {
          outline: `1px solid ${e.color.secondary}`,
          outlineOffset: 1,
          '@media (forced-colors: active)': { outline: '1px solid Highlight', outlineOffset: 1 },
        },
        input: {
          ...Yn,
          appearance: 'none',
          left: 0,
          top: 0,
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: '3em',
        },
        span: {
          textAlign: 'center',
          fontSize: e.typography.size.s1,
          fontWeight: e.typography.weight.bold,
          lineHeight: '1',
          cursor: 'pointer',
          display: 'inline-block',
          padding: '7px 15px',
          transition: 'all 100ms ease-out',
          userSelect: 'none',
          borderRadius: '3em',
          color: Je(0.5, e.color.defaultText),
          background: 'transparent',
          '&:active': {
            boxShadow: `${Qr(0.05, e.appBorderColor)} 0 0 0 2px inset`,
            color: Qr(1, e.appBorderColor),
          },
          '&:first-of-type': { paddingRight: 8 },
          '&:last-of-type': { paddingLeft: 8 },
          '@media (forced-colors: active)': { color: 'ButtonText', boxShadow: 'none' },
        },
        'input:checked ~ span:last-of-type, input:not(:checked) ~ span:first-of-type': {
          background: e.boolean.selectedBackground,
          boxShadow:
            e.base === 'light'
              ? `${Qr(0.1, e.appBorderColor)} 0 0 2px`
              : `${e.appBorderColor} 0 0 0 1px`,
          color: e.color.defaultText,
          padding: '7px 15px',
          '@media (forced-colors: active)': {
            forcedColorAdjust: 'none',
            background: 'Highlight',
            color: 'HighlightText',
            boxShadow: 'none',
            outline: '1px solid ButtonText',
          },
        },
      }),
      f2 = P.label(({ theme: e }) => h2(e)),
      g2 = (e) => e === 'true',
      y2 = ({ name: e, storyId: t, value: r, onChange: n, onBlur: o, onFocus: i, argType: a }) => {
        let l = se(() => n(!1), [n]),
          s = !!a?.table?.readonly;
        if (r === void 0)
          return u.createElement(
            Ee,
            {
              ariaLabel: !1,
              variant: 'outline',
              size: 'medium',
              id: Yr(e, t),
              onClick: l,
              disabled: s,
            },
            'Set boolean',
          );
        let d = Ke(e, t),
          p = typeof r == 'string' ? g2(r) : r;
        return u.createElement(
          f2,
          { 'aria-disabled': s, htmlFor: d, 'aria-label': e },
          u.createElement('input', {
            id: d,
            type: 'checkbox',
            onChange: (m) => n(m.target.checked),
            checked: p,
            role: 'switch',
            disabled: s,
            name: e,
            onBlur: o,
            onFocus: i,
          }),
          u.createElement('span', { 'aria-hidden': 'true' }, 'False'),
          u.createElement('span', { 'aria-hidden': 'true' }, 'True'),
        );
      },
      b2 = (e) => {
        let [t, r, n] = e.split('-'),
          o = new Date();
        return (o.setFullYear(parseInt(t, 10), parseInt(r, 10) - 1, parseInt(n, 10)), o);
      },
      E2 = (e) => {
        let [t, r] = e.split(':'),
          n = new Date();
        return (n.setHours(parseInt(t, 10)), n.setMinutes(parseInt(r, 10)), n);
      },
      S2 = (e) => {
        let t = new Date(e),
          r = `000${t.getFullYear()}`.slice(-4),
          n = `0${t.getMonth() + 1}`.slice(-2),
          o = `0${t.getDate()}`.slice(-2);
        return `${r}-${n}-${o}`;
      },
      A2 = (e) => {
        let t = new Date(e),
          r = `0${t.getHours()}`.slice(-2),
          n = `0${t.getMinutes()}`.slice(-2);
        return `${r}:${n}`;
      },
      tp = P(Ye.Input)(({ theme: e }) => ({
        '&[readonly]': { background: e.base === 'light' ? e.color.lighter : 'transparent' },
        '&::-webkit-calendar-picker-indicator': {
          opacity: 0.5,
          height: 12,
          filter: e.base === 'light' ? void 0 : 'invert(1)',
        },
      })),
      T2 = P.fieldset({
        flex: 1,
        display: 'flex',
        border: 0,
        marginInline: 0,
        padding: 0,
        gap: 10,
        'div:first-of-type': { flex: 4 },
        'div:last-of-type': { flex: 3 },
      }),
      w2 = ({ name: e, storyId: t, value: r, onChange: n, onFocus: o, onBlur: i, argType: a }) => {
        let [l, s] = X(!0),
          d = he(),
          p = he(),
          m = !!a?.table?.readonly;
        ee(() => {
          l !== !1 &&
            (d && d.current && (d.current.value = r ? S2(r) : ''),
            p && p.current && (p.current.value = r ? A2(r) : ''));
        }, [r]);
        let h = (b) => {
            if (!b.target.value) return n();
            let _ = b2(b.target.value),
              y = new Date(r ?? '');
            y.setFullYear(_.getFullYear(), _.getMonth(), _.getDate());
            let S = y.getTime();
            (S && n(S), s(!!S));
          },
          g = (b) => {
            if (!b.target.value) return n();
            let _ = E2(b.target.value),
              y = new Date(r ?? '');
            (y.setHours(_.getHours()), y.setMinutes(_.getMinutes()));
            let S = y.getTime();
            (S && n(S), s(!!S));
          },
          E = Ke(e, t);
        return u.createElement(
          T2,
          null,
          u.createElement('legend', { className: 'sb-sr-only' }, e),
          u.createElement('label', { htmlFor: `${E}-date`, className: 'sb-sr-only' }, 'Date'),
          u.createElement(tp, {
            type: 'date',
            max: '9999-12-31',
            ref: d,
            id: `${E}-date`,
            name: `${E}-date`,
            readOnly: m,
            onChange: h,
            onFocus: o,
            onBlur: i,
          }),
          u.createElement('label', { htmlFor: `${E}-time`, className: 'sb-sr-only' }, 'Time'),
          u.createElement(tp, {
            type: 'time',
            id: `${E}-time`,
            name: `${E}-time`,
            ref: p,
            onChange: g,
            readOnly: m,
            onFocus: o,
            onBlur: i,
          }),
          l ? null : u.createElement('div', null, 'invalid'),
        );
      },
      _2 = P.label({ display: 'flex' }),
      v2 = (e) => {
        let t = parseFloat(e);
        return Number.isNaN(t) ? void 0 : t;
      },
      x2 = P(Ye.Input)(({ theme: e }) => ({
        background: e.base === 'light' ? e.color.lighter : 'transparent',
      })),
      C2 = ({
        name: e,
        storyId: t,
        value: r,
        onChange: n,
        min: o,
        max: i,
        step: a,
        onBlur: l,
        onFocus: s,
        argType: d,
      }) => {
        let [p, m] = X(typeof r == 'number' ? r : ''),
          [h, g] = X(!1),
          [E, b] = X(null),
          _ = !!d?.table?.readonly,
          y = se(
            (T) => {
              m(T.target.value);
              let C = parseFloat(T.target.value);
              if (Number.isNaN(C)) b(new Error(`'${T.target.value}' is not a number`));
              else {
                let x = C;
                (typeof o == 'number' && x < o && (x = o),
                  typeof i == 'number' && x > i && (x = i),
                  n(x),
                  b(null),
                  x !== C && m(String(x)));
              }
            },
            [n, b, o, i],
          ),
          S = se(() => {
            (m('0'), n(0), g(!0));
          }, [g]),
          A = he(null);
        return (
          ee(() => {
            h && A.current && A.current.select();
          }, [h]),
          ee(() => {
            let T = typeof r == 'number' ? r : '';
            p !== T && m(T);
          }, [r]),
          r === void 0
            ? u.createElement(
                Ee,
                {
                  ariaLabel: !1,
                  variant: 'outline',
                  size: 'medium',
                  id: Yr(e, t),
                  onClick: S,
                  disabled: _,
                },
                'Set number',
              )
            : u.createElement(
                _2,
                null,
                u.createElement(x2, {
                  ref: A,
                  id: Ke(e, t),
                  type: 'number',
                  onChange: y,
                  size: 'flex',
                  placeholder: 'Edit number...',
                  value: p,
                  valid: E ? 'error' : void 0,
                  autoFocus: h,
                  readOnly: _,
                  name: e,
                  min: o,
                  max: i,
                  step: a,
                  onFocus: s,
                  onBlur: l,
                }),
              )
        );
      },
      Mp = (e, t) => {
        let r = t && Object.entries(t).find(([n, o]) => o === e);
        return r ? r[0] : void 0;
      },
      Gi = (e, t) =>
        e && t
          ? Object.entries(t)
              .filter((r) => e.includes(r[1]))
              .map((r) => r[0])
          : [],
      $p = (e, t) => e && t && e.map((r) => t[r]),
      O2 = P.fieldset(
        { border: 'none', marginInline: 0, padding: 0, display: 'flex', alignItems: 'flex-start' },
        ({ $isInline: e }) =>
          e
            ? { flexWrap: 'wrap', gap: 15, label: { display: 'inline-flex' } }
            : { flexDirection: 'column', gap: 8, label: { display: 'flex' } },
      ),
      R2 = P.span(({ $readOnly: e }) => ({ opacity: e ? 0.5 : 1 })),
      I2 = P.label(({ $readOnly: e }) => ({
        lineHeight: '20px',
        alignItems: 'center',
        cursor: e ? 'not-allowed' : 'pointer',
        input: { cursor: e ? 'not-allowed' : 'pointer', margin: 0, marginRight: 6 },
      })),
      rp = ({
        name: e,
        storyId: t,
        options: r,
        value: n,
        onChange: o,
        isInline: i,
        argType: a,
      }) => {
        if (!r)
          return (
            _e.warn(`Checkbox with no options: ${e}`),
            u.createElement(u.Fragment, null, '-')
          );
        let l = Gi(n || [], r),
          [s, d] = X(l),
          p = !!a?.table?.readonly,
          m = (g) => {
            let E = g.target.value,
              b = [...s];
            (b.includes(E) ? b.splice(b.indexOf(E), 1) : b.push(E), o($p(b, r)), d(b));
          };
        ee(() => {
          d(Gi(n || [], r));
        }, [n]);
        let h = Ke(e, t);
        return u.createElement(
          O2,
          { $isInline: i },
          u.createElement('legend', { className: 'sb-sr-only' }, e),
          Object.keys(r).map((g, E) => {
            let b = `${h}-${E}`;
            return u.createElement(
              I2,
              { key: b, htmlFor: b, $readOnly: p },
              u.createElement('input', {
                type: 'checkbox',
                disabled: p,
                id: b,
                name: b,
                value: g,
                onChange: m,
                checked: s?.includes(g),
              }),
              u.createElement(R2, { $readOnly: p }, g),
            );
          }),
        );
      },
      D2 = P.fieldset(
        { border: 'none', marginInline: 0, padding: 0, display: 'flex', alignItems: 'flex-start' },
        ({ isInline: e }) =>
          e
            ? { flexWrap: 'wrap', gap: 15, label: { display: 'inline-flex' } }
            : { flexDirection: 'column', gap: 8, label: { display: 'flex' } },
      ),
      P2 = P.span(({ $readOnly: e }) => ({ opacity: e ? 0.5 : 1 })),
      N2 = P.label(({ $readOnly: e }) => ({
        lineHeight: '20px',
        alignItems: 'center',
        cursor: e ? 'not-allowed' : 'pointer',
        input: { cursor: e ? 'not-allowed' : 'pointer', margin: 0, marginRight: 6 },
      })),
      np = ({
        name: e,
        storyId: t,
        options: r,
        value: n,
        onChange: o,
        isInline: i,
        argType: a,
      }) => {
        if (!r)
          return (_e.warn(`Radio with no options: ${e}`), u.createElement(u.Fragment, null, '-'));
        let l = Mp(n, r),
          s = Ke(e, t),
          d = !!a?.table?.readonly;
        return u.createElement(
          D2,
          { isInline: i },
          u.createElement('legend', { className: 'sb-sr-only' }, e),
          Object.keys(r).map((p, m) => {
            let h = `${s}-${m}`;
            return u.createElement(
              N2,
              { key: h, htmlFor: h, $readOnly: d },
              u.createElement('input', {
                type: 'radio',
                id: h,
                name: s,
                disabled: d,
                value: p,
                onChange: (g) => o(r[g.currentTarget.value]),
                checked: p === l,
              }),
              u.createElement(P2, { $readOnly: d }, p),
            );
          }),
        );
      },
      k2 = {
        appearance: 'none',
        border: '0 none',
        boxSizing: 'inherit',
        display: ' block',
        margin: ' 0',
        background: 'transparent',
        padding: 0,
        fontSize: 'inherit',
        position: 'relative',
      },
      jp = P.select(k2, ({ theme: e }) => ({
        boxSizing: 'border-box',
        position: 'relative',
        padding: '6px 10px',
        width: '100%',
        color: e.input.color || 'inherit',
        background: e.input.background,
        borderRadius: e.input.borderRadius,
        boxShadow: `${e.input.border} 0 0 0 1px inset`,
        fontSize: e.typography.size.s2 - 1,
        lineHeight: '20px',
        '&:focus': { boxShadow: `${e.color.secondary} 0 0 0 1px inset`, outline: 'none' },
        '&[disabled]': { cursor: 'not-allowed', opacity: 0.5 },
        '::placeholder': { color: e.textMutedColor },
        '&[multiple]': {
          overflow: 'auto',
          padding: 0,
          option: {
            display: 'block',
            padding: '6px 10px',
            marginLeft: 1,
            marginRight: 1,
            '&:hover': { background: e.background.hoverable },
            '&:checked': {
              background: 'transparent',
              color: e.color.secondary,
              fontWeight: e.typography.weight.bold,
            },
          },
        },
      })),
      Up = P.span(({ theme: e }) => ({
        display: 'inline-block',
        lineHeight: 'normal',
        overflow: 'hidden',
        position: 'relative',
        verticalAlign: 'top',
        width: '100%',
        svg: {
          position: 'absolute',
          zIndex: 1,
          pointerEvents: 'none',
          height: '12px',
          marginTop: '-6px',
          right: '12px',
          top: '50%',
          fill: e.textMutedColor,
          path: { fill: e.textMutedColor },
        },
      })),
      Fi = 'Choose option...',
      F2 = ({ name: e, storyId: t, value: r, options: n, onChange: o, argType: i }) => {
        let a = (p) => {
            o(n[p.currentTarget.value]);
          },
          l = Mp(r, n) || Fi,
          s = Ke(e, t),
          d = !!i?.table?.readonly;
        return u.createElement(
          Up,
          null,
          u.createElement(Vn, null),
          u.createElement('label', { htmlFor: s, className: 'sb-sr-only' }, e),
          u.createElement(
            jp,
            { disabled: d, id: s, value: l, onChange: a },
            u.createElement('option', { disabled: l === Fi, key: 'no-selection' }, Fi),
            Object.keys(n).map((p) => u.createElement('option', { key: p, value: p }, p)),
          ),
        );
      },
      L2 = ({ name: e, storyId: t, value: r, options: n, onChange: o, argType: i }) => {
        let a = (p) => {
            let m = Array.from(p.currentTarget.options)
              .filter((h) => h.selected)
              .map((h) => h.value);
            o($p(m, n));
          },
          l = Gi(r, n),
          s = Ke(e, t),
          d = !!i?.table?.readonly;
        return u.createElement(
          Up,
          null,
          u.createElement('label', { htmlFor: s, className: 'sb-sr-only' }, e),
          u.createElement(
            jp,
            { disabled: d, id: s, multiple: !0, value: l, onChange: a },
            Object.keys(n).map((p) => u.createElement('option', { key: p, value: p }, p)),
          ),
        );
      },
      op = (e) => {
        let { name: t, options: r } = e;
        return r
          ? e.isMulti
            ? u.createElement(L2, { ...e })
            : u.createElement(F2, { ...e })
          : (_e.warn(`Select with no options: ${t}`), u.createElement(u.Fragment, null, '-'));
      },
      B2 = (e, t) =>
        Array.isArray(e) ? e.reduce((r, n) => ((r[t?.[n] || String(n)] = n), r), {}) : e,
      M2 = {
        check: rp,
        'inline-check': rp,
        radio: np,
        'inline-radio': np,
        select: op,
        'multi-select': op,
      },
      Vr = (e) => {
        let { type: t = 'select', labels: r, argType: n } = e,
          o = {
            ...e,
            argType: n,
            options: n ? B2(n.options, r) : {},
            isInline: t.includes('inline'),
            isMulti: t.includes('multi'),
          },
          i = M2[t];
        if (i) return u.createElement(i, { ...o });
        throw new Error(`Unknown options type: ${t}`);
      },
      $2 = P.div(({ theme: e }) => ({
        position: 'relative',
        ':hover': {
          '& > .rejt-accordion-button::after': { background: e.color.secondary },
          '& > .rejt-accordion-region > :is(.rejt-plus-menu, .rejt-minus-menu)': { opacity: 1 },
        },
      })),
      j2 = P.button(({ theme: e }) => ({
        padding: 0,
        background: 'transparent',
        border: 'none',
        marginRight: '3px',
        lineHeight: '22px',
        color: e.color.secondary,
        '::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          display: 'block',
          width: '100%',
          marginLeft: '-1rem',
          height: '22px',
          background: 'transparent',
          borderRadius: 4,
          transition: 'background 0.2s',
          opacity: 0.1,
          paddingRight: '20px',
        },
        '::before': { content: '""', position: 'absolute' },
        '&[aria-expanded="true"]::before': {
          left: -10,
          top: 10,
          borderTop: '3px solid rgba(153,153,153,0.6)',
          borderLeft: '3px solid transparent',
          borderRight: '3px solid transparent',
        },
        '&[aria-expanded="false"]::before': {
          left: -8,
          top: 8,
          borderTop: '3px solid transparent',
          borderBottom: '3px solid transparent',
          borderLeft: '3px solid rgba(153,153,153,0.6)',
        },
      })),
      U2 = P.div({ display: 'inline' });
    function Vp({ children: e, name: t, collapsed: r, keyPath: n, deep: o, ...i }) {
      let a = `${n.at(-1) ?? 'root'}-${t}-${o}`,
        l = { trigger: `${a}-trigger`, region: `${a}-region` },
        s = n.length > 0 ? 'li' : 'div';
      return u.createElement(
        $2,
        { as: s },
        u.createElement(
          j2,
          {
            type: 'button',
            'aria-expanded': !r,
            id: l.trigger,
            'aria-controls': l.region,
            className: 'rejt-accordion-button',
            ...i,
          },
          t,
          ' :',
        ),
        u.createElement(
          U2,
          {
            role: 'group',
            id: l.region,
            'aria-labelledby': l.trigger,
            className: 'rejt-accordion-region',
          },
          e,
        ),
      );
    }
    var V2 = 'Error',
      H2 = 'Object',
      J2 = 'Array',
      q2 = 'String',
      z2 = 'Number',
      G2 = 'Boolean',
      W2 = 'Date',
      Y2 = 'Null',
      K2 = 'Undefined',
      X2 = 'Function',
      Z2 = 'Symbol',
      Hp = 'ADD_DELTA_TYPE',
      Jp = 'REMOVE_DELTA_TYPE',
      qp = 'UPDATE_DELTA_TYPE',
      is = 'value';
    function br(e) {
      return e !== null &&
        typeof e == 'object' &&
        !Array.isArray(e) &&
        typeof e[Symbol.iterator] == 'function'
        ? 'Iterable'
        : Object.prototype.toString.call(e).slice(8, -1);
    }
    function zp(e, t) {
      let r = br(e),
        n = br(t);
      return (r === 'Function' || n === 'Function') && n !== r;
    }
    var ss = class extends Ot {
      constructor(e) {
        (super(e),
          (this.state = { inputRefKey: null, inputRefValue: null }),
          (this.refInputValue = this.refInputValue.bind(this)),
          (this.refInputKey = this.refInputKey.bind(this)),
          (this.onKeydown = this.onKeydown.bind(this)),
          (this.onSubmit = this.onSubmit.bind(this)));
      }
      componentDidMount() {
        let { inputRefKey: e, inputRefValue: t } = this.state,
          { onlyValue: r } = this.props;
        (e && typeof e.focus == 'function' && e.focus(),
          r && t && typeof t.focus == 'function' && t.focus());
      }
      onKeydown(e) {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return;
        let { inputRefKey: t, inputRefValue: r } = this.state,
          { addButtonElement: n, handleCancel: o } = this.props;
        [t, r, n].some((i) => i === e.target) &&
          ((e.code === 'Enter' || e.key === 'Enter') && (e.preventDefault(), this.onSubmit()),
          (e.code === 'Escape' || e.key === 'Escape') && (e.preventDefault(), o()));
      }
      onSubmit() {
        let {
            handleAdd: e,
            onlyValue: t,
            onSubmitValueParser: r,
            keyPath: n,
            deep: o,
          } = this.props,
          { inputRefKey: i, inputRefValue: a } = this.state,
          l = {};
        if (!t) {
          if (!i.value) return;
          l.key = i.value;
        }
        ((l.newValue = r(!1, n, o, l.key, a.value)), e(l));
      }
      refInputKey(e) {
        this.state.inputRefKey = e;
      }
      refInputValue(e) {
        this.state.inputRefValue = e;
      }
      render() {
        let {
            handleCancel: e,
            onlyValue: t,
            addButtonElement: r,
            cancelButtonElement: n,
            inputElementGenerator: o,
            keyPath: i,
            deep: a,
          } = this.props,
          l = r && je(r, { onClick: this.onSubmit }),
          s = n && je(n, { onClick: e }),
          d = o(is, i, a),
          p = je(d, { placeholder: 'Value', ref: this.refInputValue, onKeyDown: this.onKeydown }),
          m = null;
        if (!t) {
          let h = o('key', i, a);
          m = je(h, { placeholder: 'Key', ref: this.refInputKey, onKeyDown: this.onKeydown });
        }
        return u.createElement('span', { className: 'rejt-add-value-node' }, m, p, l, s);
      }
    };
    ss.defaultProps = {
      onlyValue: !1,
      addButtonElement: u.createElement('button', null, '+'),
      cancelButtonElement: u.createElement('button', null, 'c'),
    };
    var Gp = class extends Ot {
      constructor(e) {
        super(e);
        let t = [...(e.keyPath || []), e.name];
        ((this.state = {
          data: e.data,
          name: e.name,
          keyPath: t ?? [],
          deep: e.deep ?? 0,
          nextDeep: (e.deep ?? 0) + 1,
          collapsed: e.isCollapsed(t, e.deep ?? 0, e.data),
          addFormVisible: !1,
        }),
          (this.handleCollapseMode = this.handleCollapseMode.bind(this)),
          (this.handleRemoveItem = this.handleRemoveItem.bind(this)),
          (this.handleAddMode = this.handleAddMode.bind(this)),
          (this.handleAddValueAdd = this.handleAddValueAdd.bind(this)),
          (this.handleAddValueCancel = this.handleAddValueCancel.bind(this)),
          (this.handleEditValue = this.handleEditValue.bind(this)),
          (this.onChildUpdate = this.onChildUpdate.bind(this)),
          (this.renderCollapsed = this.renderCollapsed.bind(this)),
          (this.renderNotCollapsed = this.renderNotCollapsed.bind(this)));
      }
      static getDerivedStateFromProps(e, t) {
        return e.data !== t.data ? { data: e.data } : null;
      }
      onChildUpdate(e, t) {
        let { data: r, keyPath: n = [] } = this.state;
        ((r[e] = t), this.setState({ data: r }));
        let { onUpdate: o } = this.props,
          i = n.length;
        o(n[i - 1], r);
      }
      handleAddMode() {
        this.setState({ addFormVisible: !0 });
      }
      handleCollapseMode() {
        this.setState((e) => ({ collapsed: !e.collapsed }));
      }
      handleRemoveItem(e) {
        return () => {
          let { beforeRemoveAction: t, logger: r } = this.props,
            { data: n, keyPath: o, nextDeep: i } = this.state,
            a = n[e];
          (t || Promise.resolve.bind(Promise))(e, o, i, a)
            .then(() => {
              let l = { keyPath: o, deep: i, key: e, oldValue: a, type: Jp };
              (n.splice(e, 1), this.setState({ data: n }));
              let { onUpdate: s, onDeltaUpdate: d } = this.props;
              (s(o[o.length - 1], n), d(l));
            })
            .catch(r.error);
        };
      }
      handleAddValueAdd({ newValue: e }) {
        let { data: t, keyPath: r = [], nextDeep: n } = this.state,
          { beforeAddAction: o, logger: i } = this.props,
          a = t.length;
        (o || Promise.resolve.bind(Promise))(a, r, n, e)
          .then(() => {
            ((t[a] = e), this.setState({ data: t }), this.handleAddValueCancel());
            let { onUpdate: l, onDeltaUpdate: s } = this.props;
            (l(r[r.length - 1], t), s({ type: Hp, keyPath: r, deep: n, key: a, newValue: e }));
          })
          .catch(i.error);
      }
      handleAddValueCancel() {
        this.setState({ addFormVisible: !1 });
      }
      handleEditValue({ key: e, value: t }) {
        return new Promise((r, n) => {
          let { beforeUpdateAction: o } = this.props,
            { data: i, keyPath: a, nextDeep: l } = this.state,
            s = i[e];
          (o || Promise.resolve.bind(Promise))(e, a, l, s, t)
            .then(() => {
              ((i[e] = t), this.setState({ data: i }));
              let { onUpdate: d, onDeltaUpdate: p } = this.props;
              (d(a[a.length - 1], i),
                p({ type: qp, keyPath: a, deep: l, key: e, newValue: t, oldValue: s }),
                r(void 0));
            })
            .catch(n);
        });
      }
      renderCollapsed() {
        let { name: e, data: t, keyPath: r, deep: n } = this.state,
          { handleRemove: o, readOnly: i, dataType: a, minusMenuElement: l } = this.props,
          s = i(e, t, r, n, a),
          d =
            l &&
            je(l, {
              onClick: o,
              className: 'rejt-minus-menu',
              'aria-label': `remove the array '${String(e)}'`,
            });
        return u.createElement(
          u.Fragment,
          null,
          u.createElement(
            'span',
            { className: 'rejt-collapsed-value' },
            '[...] ',
            t.length,
            ' ',
            t.length === 1 ? 'item' : 'items',
          ),
          !s && d,
        );
      }
      renderNotCollapsed() {
        let { name: e, data: t, keyPath: r, deep: n, addFormVisible: o, nextDeep: i } = this.state,
          {
            isCollapsed: a,
            handleRemove: l,
            onDeltaUpdate: s,
            readOnly: d,
            dataType: p,
            addButtonElement: m,
            cancelButtonElement: h,
            inputElementGenerator: g,
            textareaElementGenerator: E,
            minusMenuElement: b,
            plusMenuElement: _,
            beforeRemoveAction: y,
            beforeAddAction: S,
            beforeUpdateAction: A,
            logger: T,
            onSubmitValueParser: C,
          } = this.props,
          x = d(e, t, r, n, p),
          v =
            _ &&
            je(_, {
              onClick: this.handleAddMode,
              className: 'rejt-plus-menu',
              'aria-label': `add a new item to the '${String(e)}' array`,
            }),
          I =
            b &&
            je(b, {
              onClick: l,
              className: 'rejt-minus-menu',
              'aria-label': `remove the array '${String(e)}'`,
            });
        return u.createElement(
          u.Fragment,
          null,
          u.createElement('span', { className: 'rejt-not-collapsed-delimiter' }, '['),
          !o && v,
          u.createElement(
            'ul',
            { className: 'rejt-not-collapsed-list' },
            t.map((N, B) =>
              u.createElement(Fo, {
                key: B,
                name: B.toString(),
                data: N,
                keyPath: r,
                deep: i,
                isCollapsed: a,
                handleRemove: this.handleRemoveItem(B),
                handleUpdateValue: this.handleEditValue,
                onUpdate: this.onChildUpdate,
                onDeltaUpdate: s,
                readOnly: d,
                addButtonElement: m,
                cancelButtonElement: h,
                inputElementGenerator: g,
                textareaElementGenerator: E,
                minusMenuElement: b,
                plusMenuElement: _,
                beforeRemoveAction: y,
                beforeAddAction: S,
                beforeUpdateAction: A,
                logger: T,
                onSubmitValueParser: C,
              }),
            ),
          ),
          !x &&
            o &&
            u.createElement(
              'div',
              { className: 'rejt-add-form' },
              u.createElement(ss, {
                handleAdd: this.handleAddValueAdd,
                handleCancel: this.handleAddValueCancel,
                onlyValue: !0,
                addButtonElement: m,
                cancelButtonElement: h,
                inputElementGenerator: g,
                keyPath: r,
                deep: n,
                onSubmitValueParser: C,
              }),
            ),
          u.createElement('span', { className: 'rejt-not-collapsed-delimiter' }, ']'),
          !x && I,
        );
      }
      render() {
        let { name: e, collapsed: t, keyPath: r, deep: n } = this.state,
          o = t ? this.renderCollapsed() : this.renderNotCollapsed();
        return u.createElement(
          Vp,
          { name: e, collapsed: t, deep: n, keyPath: r, onClick: this.handleCollapseMode },
          o,
        );
      }
    };
    Gp.defaultProps = {
      keyPath: [],
      deep: 0,
      minusMenuElement: u.createElement('span', null, ' - '),
      plusMenuElement: u.createElement('span', null, ' + '),
    };
    var Wp = class extends Ot {
      constructor(e) {
        super(e);
        let t = [...(e.keyPath || []), e.name];
        ((this.state = {
          value: e.value,
          name: e.name,
          keyPath: t ?? [],
          deep: e.deep ?? 0,
          editEnabled: !1,
          inputRef: null,
        }),
          (this.handleEditMode = this.handleEditMode.bind(this)),
          (this.refInput = this.refInput.bind(this)),
          (this.handleCancelEdit = this.handleCancelEdit.bind(this)),
          (this.handleEdit = this.handleEdit.bind(this)),
          (this.onKeydown = this.onKeydown.bind(this)));
      }
      static getDerivedStateFromProps(e, t) {
        return e.value !== t.value ? { value: e.value } : null;
      }
      componentDidUpdate() {
        let { editEnabled: e, inputRef: t, name: r, value: n, keyPath: o, deep: i } = this.state,
          { readOnly: a, dataType: l } = this.props,
          s = a(r, n, o, i, l);
        e && !s && typeof t.focus == 'function' && t.focus();
      }
      onKeydown(e) {
        let { inputRef: t } = this.state;
        e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.repeat ||
          t !== e.target ||
          ((e.code === 'Enter' || e.key === 'Enter') && (e.preventDefault(), this.handleEdit()),
          (e.code === 'Escape' || e.key === 'Escape') &&
            (e.preventDefault(), this.handleCancelEdit()));
      }
      handleEdit() {
        let {
            handleUpdateValue: e,
            originalValue: t,
            logger: r,
            onSubmitValueParser: n,
            keyPath: o,
          } = this.props,
          { inputRef: i, name: a, deep: l } = this.state;
        if (!i) return;
        let s = n(!0, o, l, a, i.value),
          d = { value: s, key: a };
        (e || Promise.resolve.bind(Promise))(d)
          .then(() => {
            zp(t, s) || this.handleCancelEdit();
          })
          .catch(r.error);
      }
      handleEditMode() {
        this.setState({ editEnabled: !0 });
      }
      refInput(e) {
        this.state.inputRef = e;
      }
      handleCancelEdit() {
        this.setState({ editEnabled: !1 });
      }
      render() {
        let { name: e, value: t, editEnabled: r, keyPath: n, deep: o } = this.state,
          {
            handleRemove: i,
            originalValue: a,
            readOnly: l,
            dataType: s,
            textareaElementGenerator: d,
            minusMenuElement: p,
            keyPath: m = [],
          } = this.props,
          h = null,
          g = null,
          E = l(e, a, n, o, s);
        if (r && !E) {
          let b = d(is, m, o, e, a, s),
            _ = je(b, { ref: this.refInput, defaultValue: t, onKeyDown: this.onKeydown });
          ((h = u.createElement('span', { className: 'rejt-edit-form' }, _)), (g = null));
        } else {
          h = u.createElement(
            'span',
            { className: 'rejt-value', onClick: E ? void 0 : this.handleEditMode },
            t,
          );
          let b = m.at(-1),
            _ =
              p &&
              je(p, {
                onClick: i,
                className: 'rejt-minus-menu',
                'aria-label': `remove the function '${String(e)}'${String(b) ? ` from '${String(b)}'` : ''}`,
              });
          g = E ? null : _;
        }
        return u.createElement(
          'li',
          { className: 'rejt-value-node' },
          u.createElement('span', { className: 'rejt-name' }, e, ' : '),
          h,
          g,
        );
      }
    };
    Wp.defaultProps = {
      keyPath: [],
      deep: 0,
      handleUpdateValue: () => {},
      cancelButtonElement: u.createElement('button', null, 'c'),
      minusMenuElement: u.createElement('span', null, ' - '),
    };
    var Fo = class extends Ot {
      constructor(e) {
        (super(e),
          (this.state = {
            data: e.data,
            name: e.name,
            keyPath: e.keyPath ?? [],
            deep: e.deep ?? 0,
          }));
      }
      static getDerivedStateFromProps(e, t) {
        return e.data !== t.data ? { data: e.data } : null;
      }
      render() {
        let { data: e, name: t, keyPath: r, deep: n } = this.state,
          {
            isCollapsed: o,
            handleRemove: i,
            handleUpdateValue: a,
            onUpdate: l,
            onDeltaUpdate: s,
            readOnly: d,
            addButtonElement: p,
            cancelButtonElement: m,
            inputElementGenerator: h,
            textareaElementGenerator: g,
            minusMenuElement: E,
            plusMenuElement: b,
            beforeRemoveAction: _,
            beforeAddAction: y,
            beforeUpdateAction: S,
            logger: A,
            onSubmitValueParser: T,
          } = this.props,
          C = () => !0,
          x = br(e);
        switch (x) {
          case V2:
            return u.createElement(Wi, {
              data: e,
              name: t,
              isCollapsed: o,
              keyPath: r,
              deep: n,
              handleRemove: i,
              onUpdate: l,
              onDeltaUpdate: s,
              readOnly: C,
              dataType: x,
              addButtonElement: p,
              cancelButtonElement: m,
              inputElementGenerator: h,
              textareaElementGenerator: g,
              minusMenuElement: E,
              plusMenuElement: b,
              beforeRemoveAction: _,
              beforeAddAction: y,
              beforeUpdateAction: S,
              logger: A,
              onSubmitValueParser: T,
            });
          case H2:
            return u.createElement(Wi, {
              data: e,
              name: t,
              isCollapsed: o,
              keyPath: r,
              deep: n,
              handleRemove: i,
              onUpdate: l,
              onDeltaUpdate: s,
              readOnly: d,
              dataType: x,
              addButtonElement: p,
              cancelButtonElement: m,
              inputElementGenerator: h,
              textareaElementGenerator: g,
              minusMenuElement: E,
              plusMenuElement: b,
              beforeRemoveAction: _,
              beforeAddAction: y,
              beforeUpdateAction: S,
              logger: A,
              onSubmitValueParser: T,
            });
          case J2:
            return u.createElement(Gp, {
              data: e,
              name: t,
              isCollapsed: o,
              keyPath: r,
              deep: n,
              handleRemove: i,
              onUpdate: l,
              onDeltaUpdate: s,
              readOnly: d,
              dataType: x,
              addButtonElement: p,
              cancelButtonElement: m,
              inputElementGenerator: h,
              textareaElementGenerator: g,
              minusMenuElement: E,
              plusMenuElement: b,
              beforeRemoveAction: _,
              beforeAddAction: y,
              beforeUpdateAction: S,
              logger: A,
              onSubmitValueParser: T,
            });
          case q2:
            return u.createElement(Xt, {
              name: t,
              value: `"${e}"`,
              originalValue: e,
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: d,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case z2:
            return u.createElement(Xt, {
              name: t,
              value: e,
              originalValue: e,
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: d,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case G2:
            return u.createElement(Xt, {
              name: t,
              value: e ? 'true' : 'false',
              originalValue: e,
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: d,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case W2:
            return u.createElement(Xt, {
              name: t,
              value: e.toISOString(),
              originalValue: e,
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: C,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case Y2:
            return u.createElement(Xt, {
              name: t,
              value: 'null',
              originalValue: 'null',
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: d,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case K2:
            return u.createElement(Xt, {
              name: t,
              value: 'undefined',
              originalValue: 'undefined',
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: d,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case X2:
            return u.createElement(Wp, {
              name: t,
              value: e.toString(),
              originalValue: e,
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: d,
              dataType: x,
              cancelButtonElement: m,
              textareaElementGenerator: g,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          case Z2:
            return u.createElement(Xt, {
              name: t,
              value: e.toString(),
              originalValue: e,
              keyPath: r,
              deep: n,
              handleRemove: i,
              handleUpdateValue: a,
              readOnly: C,
              dataType: x,
              cancelButtonElement: m,
              inputElementGenerator: h,
              minusMenuElement: E,
              logger: A,
              onSubmitValueParser: T,
            });
          default:
            return null;
        }
      }
    };
    Fo.defaultProps = { keyPath: [], deep: 0 };
    var Wi = class extends Ot {
      constructor(e) {
        super(e);
        let t = e.deep === -1 ? [] : [...(e.keyPath || []), e.name];
        ((this.state = {
          name: e.name,
          data: e.data,
          keyPath: t ?? [],
          deep: e.deep ?? 0,
          nextDeep: (e.deep ?? 0) + 1,
          collapsed: e.isCollapsed(t, e.deep ?? 0, e.data),
          addFormVisible: !1,
        }),
          (this.handleCollapseMode = this.handleCollapseMode.bind(this)),
          (this.handleRemoveValue = this.handleRemoveValue.bind(this)),
          (this.handleAddMode = this.handleAddMode.bind(this)),
          (this.handleAddValueAdd = this.handleAddValueAdd.bind(this)),
          (this.handleAddValueCancel = this.handleAddValueCancel.bind(this)),
          (this.handleEditValue = this.handleEditValue.bind(this)),
          (this.onChildUpdate = this.onChildUpdate.bind(this)),
          (this.renderCollapsed = this.renderCollapsed.bind(this)),
          (this.renderNotCollapsed = this.renderNotCollapsed.bind(this)));
      }
      static getDerivedStateFromProps(e, t) {
        return e.data !== t.data ? { data: e.data } : null;
      }
      onChildUpdate(e, t) {
        let { data: r, keyPath: n = [] } = this.state;
        ((r[e] = t), this.setState({ data: r }));
        let { onUpdate: o } = this.props,
          i = n.length;
        o(n[i - 1], r);
      }
      handleAddMode() {
        this.setState({ addFormVisible: !0 });
      }
      handleAddValueCancel() {
        this.setState({ addFormVisible: !1 });
      }
      handleAddValueAdd({ key: e, newValue: t }) {
        let { data: r, keyPath: n = [], nextDeep: o } = this.state,
          { beforeAddAction: i, logger: a } = this.props;
        (i || Promise.resolve.bind(Promise))(e, n, o, t)
          .then(() => {
            ((r[e] = t), this.setState({ data: r }), this.handleAddValueCancel());
            let { onUpdate: l, onDeltaUpdate: s } = this.props;
            (l(n[n.length - 1], r), s({ type: Hp, keyPath: n, deep: o, key: e, newValue: t }));
          })
          .catch(a.error);
      }
      handleRemoveValue(e) {
        return () => {
          let { beforeRemoveAction: t, logger: r } = this.props,
            { data: n, keyPath: o = [], nextDeep: i } = this.state,
            a = n[e];
          (t || Promise.resolve.bind(Promise))(e, o, i, a)
            .then(() => {
              let l = { keyPath: o, deep: i, key: e, oldValue: a, type: Jp };
              (delete n[e], this.setState({ data: n }));
              let { onUpdate: s, onDeltaUpdate: d } = this.props;
              (s(o[o.length - 1], n), d(l));
            })
            .catch(r.error);
        };
      }
      handleCollapseMode() {
        this.setState((e) => ({ collapsed: !e.collapsed }));
      }
      handleEditValue({ key: e, value: t }) {
        return new Promise((r, n) => {
          let { beforeUpdateAction: o } = this.props,
            { data: i, keyPath: a = [], nextDeep: l } = this.state,
            s = i[e];
          (o || Promise.resolve.bind(Promise))(e, a, l, s, t)
            .then(() => {
              ((i[e] = t), this.setState({ data: i }));
              let { onUpdate: d, onDeltaUpdate: p } = this.props;
              (d(a[a.length - 1], i),
                p({ type: qp, keyPath: a, deep: l, key: e, newValue: t, oldValue: s }),
                r());
            })
            .catch(n);
        });
      }
      renderCollapsed() {
        let { name: e, keyPath: t, deep: r, data: n } = this.state,
          { handleRemove: o, readOnly: i, dataType: a, minusMenuElement: l } = this.props,
          s = Object.getOwnPropertyNames(n),
          d = i(e, n, t, r, a),
          p =
            l &&
            je(l, {
              onClick: o,
              className: 'rejt-minus-menu',
              'aria-label': `remove the object '${String(e)}'`,
            });
        return u.createElement(
          u.Fragment,
          null,
          u.createElement(
            'span',
            { className: 'rejt-collapsed-value' },
            '{...}',
            ' ',
            s.length,
            ' ',
            s.length === 1 ? 'key' : 'keys',
          ),
          !d && p,
        );
      }
      renderNotCollapsed() {
        let { name: e, data: t, keyPath: r, deep: n, nextDeep: o, addFormVisible: i } = this.state,
          {
            isCollapsed: a,
            handleRemove: l,
            onDeltaUpdate: s,
            readOnly: d,
            dataType: p,
            addButtonElement: m,
            cancelButtonElement: h,
            inputElementGenerator: g,
            textareaElementGenerator: E,
            minusMenuElement: b,
            plusMenuElement: _,
            beforeRemoveAction: y,
            beforeAddAction: S,
            beforeUpdateAction: A,
            logger: T,
            onSubmitValueParser: C,
          } = this.props,
          x = Object.getOwnPropertyNames(t),
          v = d(e, t, r, n, p),
          I =
            _ &&
            je(_, {
              onClick: this.handleAddMode,
              className: 'rejt-plus-menu',
              'aria-label': `add a new property to the object '${String(e)}'`,
            }),
          N =
            b &&
            je(b, {
              onClick: l,
              className: 'rejt-minus-menu',
              'aria-label': `remove the object '${String(e)}'`,
            }),
          B = x.map((F) =>
            u.createElement(Fo, {
              key: F,
              name: F,
              data: t[F],
              keyPath: r,
              deep: o,
              isCollapsed: a,
              handleRemove: this.handleRemoveValue(F),
              handleUpdateValue: this.handleEditValue,
              onUpdate: this.onChildUpdate,
              onDeltaUpdate: s,
              readOnly: d,
              addButtonElement: m,
              cancelButtonElement: h,
              inputElementGenerator: g,
              textareaElementGenerator: E,
              minusMenuElement: b,
              plusMenuElement: _,
              beforeRemoveAction: y,
              beforeAddAction: S,
              beforeUpdateAction: A,
              logger: T,
              onSubmitValueParser: C,
            }),
          );
        return u.createElement(
          u.Fragment,
          null,
          u.createElement('span', { className: 'rejt-not-collapsed-delimiter' }, '{'),
          !v && I,
          u.createElement('ul', { className: 'rejt-not-collapsed-list' }, B),
          !v &&
            i &&
            u.createElement(
              'div',
              { className: 'rejt-add-form' },
              u.createElement(ss, {
                handleAdd: this.handleAddValueAdd,
                handleCancel: this.handleAddValueCancel,
                addButtonElement: m,
                cancelButtonElement: h,
                inputElementGenerator: g,
                keyPath: r,
                deep: n,
                onSubmitValueParser: C,
              }),
            ),
          u.createElement('span', { className: 'rejt-not-collapsed-delimiter' }, '}'),
          !v && N,
        );
      }
      render() {
        let { name: e, collapsed: t, keyPath: r, deep: n = 0 } = this.state,
          o = t ? this.renderCollapsed() : this.renderNotCollapsed();
        return u.createElement(
          Vp,
          { name: e, collapsed: t, deep: n, keyPath: r, onClick: this.handleCollapseMode },
          o,
        );
      }
    };
    Wi.defaultProps = {
      keyPath: [],
      deep: 0,
      minusMenuElement: u.createElement('span', null, ' - '),
      plusMenuElement: u.createElement('span', null, ' + '),
    };
    var Xt = class extends Ot {
      constructor(e) {
        super(e);
        let t = [...(e.keyPath || []), e.name];
        ((this.state = {
          value: e.value,
          name: e.name,
          keyPath: t ?? [],
          deep: e.deep ?? 0,
          editEnabled: !1,
          inputRef: null,
        }),
          (this.handleEditMode = this.handleEditMode.bind(this)),
          (this.refInput = this.refInput.bind(this)),
          (this.handleCancelEdit = this.handleCancelEdit.bind(this)),
          (this.handleEdit = this.handleEdit.bind(this)),
          (this.onKeydown = this.onKeydown.bind(this)));
      }
      static getDerivedStateFromProps(e, t) {
        return e.value !== t.value ? { value: e.value } : null;
      }
      componentDidUpdate() {
        let { editEnabled: e, inputRef: t, name: r, value: n, keyPath: o, deep: i } = this.state,
          { readOnly: a, dataType: l } = this.props,
          s = a(r, n, o, i, l);
        e && !s && typeof t.focus == 'function' && t.focus();
      }
      onKeydown(e) {
        let { inputRef: t } = this.state;
        e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.repeat ||
          t !== e.target ||
          ((e.code === 'Enter' || e.key === 'Enter') && (e.preventDefault(), this.handleEdit()),
          (e.code === 'Escape' || e.key === 'Escape') &&
            (e.preventDefault(), this.handleCancelEdit()));
      }
      handleEdit() {
        let {
            handleUpdateValue: e,
            originalValue: t,
            logger: r,
            onSubmitValueParser: n,
            keyPath: o,
          } = this.props,
          { inputRef: i, name: a, deep: l } = this.state;
        if (!i) return;
        let s = n(!0, o, l, a, i.value),
          d = { value: s, key: a };
        (e || Promise.resolve.bind(Promise))(d)
          .then(() => {
            zp(t, s) || this.handleCancelEdit();
          })
          .catch(r.error);
      }
      handleEditMode() {
        this.setState({ editEnabled: !0 });
      }
      refInput(e) {
        this.state.inputRef = e;
      }
      handleCancelEdit() {
        this.setState({ editEnabled: !1 });
      }
      render() {
        let { name: e, value: t, editEnabled: r, keyPath: n, deep: o } = this.state,
          {
            handleRemove: i,
            originalValue: a,
            readOnly: l,
            dataType: s,
            inputElementGenerator: d,
            minusMenuElement: p,
            keyPath: m,
          } = this.props,
          h = l(e, a, n, o, s),
          g = r && !h,
          E = d(is, m, o, e, a, s),
          b = je(E, {
            ref: this.refInput,
            defaultValue: JSON.stringify(a),
            onKeyDown: this.onKeydown,
          }),
          _ = n.at(-2),
          y =
            p &&
            je(p, {
              onClick: i,
              className: 'rejt-minus-menu',
              'aria-label': `remove the property '${String(e)}' with value '${String(a)}'${String(_) ? ` from '${String(_)}'` : ''}`,
            });
        return u.createElement(
          'li',
          { className: 'rejt-value-node' },
          u.createElement('span', { className: 'rejt-name' }, e, ' : '),
          g
            ? u.createElement('span', { className: 'rejt-edit-form' }, b)
            : u.createElement(
                'span',
                { className: 'rejt-value', onClick: h ? void 0 : this.handleEditMode },
                String(t),
              ),
          !h && !g && y,
        );
      }
    };
    Xt.defaultProps = {
      keyPath: [],
      deep: 0,
      handleUpdateValue: () => Promise.resolve(),
      cancelButtonElement: u.createElement('button', null, 'c'),
      minusMenuElement: u.createElement('span', null, ' - '),
    };
    function Q2(e) {
      let t = e;
      if (t.indexOf('function') === 0) return (0, eval)(`(${t})`);
      try {
        t = JSON.parse(e);
      } catch {}
      return t;
    }
    var Yp = class extends Ot {
      constructor(e) {
        (super(e),
          (this.state = { data: e.data, rootName: e.rootName }),
          (this.onUpdate = this.onUpdate.bind(this)),
          (this.removeRoot = this.removeRoot.bind(this)));
      }
      static getDerivedStateFromProps(e, t) {
        return e.data !== t.data || e.rootName !== t.rootName
          ? { data: e.data, rootName: e.rootName }
          : null;
      }
      onUpdate(e, t) {
        (this.setState({ data: t }), this.props.onFullyUpdate?.(t));
      }
      removeRoot() {
        this.onUpdate(null, null);
      }
      render() {
        let { data: e, rootName: t } = this.state,
          {
            isCollapsed: r,
            onDeltaUpdate: n,
            readOnly: o,
            addButtonElement: i,
            cancelButtonElement: a,
            inputElement: l,
            textareaElement: s,
            minusMenuElement: d,
            plusMenuElement: p,
            beforeRemoveAction: m,
            beforeAddAction: h,
            beforeUpdateAction: g,
            logger: E,
            onSubmitValueParser: b,
            fallback: _ = null,
          } = this.props,
          y = br(e),
          S = o;
        br(o) === 'Boolean' && (S = () => o);
        let A = l;
        l && br(l) !== 'Function' && (A = () => l);
        let T = s;
        return (
          s && br(s) !== 'Function' && (T = () => s),
          y === 'Object' || y === 'Array'
            ? u.createElement(
                'div',
                { className: 'rejt-tree' },
                u.createElement(Fo, {
                  data: e,
                  name: t || 'root',
                  deep: -1,
                  isCollapsed: r ?? (() => !1),
                  onUpdate: this.onUpdate,
                  onDeltaUpdate: n ?? (() => {}),
                  readOnly: S,
                  addButtonElement: i,
                  cancelButtonElement: a,
                  inputElementGenerator: A,
                  textareaElementGenerator: T,
                  minusMenuElement: d,
                  plusMenuElement: p,
                  handleRemove: this.removeRoot,
                  beforeRemoveAction: m,
                  beforeAddAction: h,
                  beforeUpdateAction: g,
                  logger: E ?? {},
                  onSubmitValueParser: b ?? ((C) => C),
                }),
              )
            : _
        );
      }
    };
    Yp.defaultProps = {
      rootName: 'root',
      isCollapsed: (e, t) => t !== -1,
      readOnly: () => !1,
      onFullyUpdate: () => {},
      onDeltaUpdate: () => {},
      beforeRemoveAction: () => Promise.resolve(),
      beforeAddAction: () => Promise.resolve(),
      beforeUpdateAction: () => Promise.resolve(),
      logger: { error: () => {} },
      onSubmitValueParser: (e, t, r, n, o) => Q2(o),
      inputElement: () => u.createElement('input', null),
      textareaElement: () => u.createElement('textarea', null),
      fallback: null,
    };
    var { window: eS } = globalThis,
      tS = P.div(({ theme: e }) => ({
        position: 'relative',
        display: 'flex',
        isolation: 'isolate',
        gap: 8,
        '.rejt-tree': { flex: 1, marginLeft: '1rem', fontSize: '13px', listStyleType: 'none' },
        '.rejt-value-node:hover': { '& > button': { opacity: 1 } },
        '.rejt-add-form': { marginLeft: 10 },
        '.rejt-add-value-node': { display: 'inline-flex', alignItems: 'center' },
        '.rejt-name': { color: e.color.secondary, lineHeight: '22px' },
        '.rejt-not-collapsed-list': { listStyle: 'none', margin: '0 0 0 1rem', padding: 0 },
        '.rejt-not-collapsed-delimiter': { lineHeight: '22px' },
        '.rejt-value': {
          display: 'inline-block',
          border: '1px solid transparent',
          borderRadius: 4,
          margin: '1px 0',
          padding: '0 4px',
          cursor: 'text',
          color: e.color.defaultText,
        },
        '.rejt-value-node:hover > .rejt-value': {
          background: e.base === 'light' ? e.color.lighter : 'hsl(0 0 100 / 0.02)',
          borderColor: e.appBorderColor,
        },
        '.rejt-collapsed-value': { color: e.color.defaultText },
      })),
      ap = P.button(({ theme: e, primary: t }) => ({
        border: 0,
        height: 20,
        margin: 1,
        borderRadius: 4,
        background: t ? e.color.secondary : 'transparent',
        color: t ? e.color.lightest : e.color.dark,
        fontWeight: t ? 'bold' : 'normal',
        cursor: 'pointer',
      })),
      ip = P.button(({ theme: e }) => ({
        background: 'none',
        border: 0,
        display: 'inline-flex',
        verticalAlign: 'middle',
        padding: 3,
        marginLeft: 5,
        color: e.textMutedColor,
        opacity: 0,
        transition: 'opacity 0.2s',
        cursor: 'pointer',
        position: 'relative',
        svg: { width: 9, height: 9 },
        ':disabled': { cursor: 'not-allowed' },
        ':hover, :focus-visible': { opacity: 1 },
        '&:hover:not(:disabled), &:focus-visible:not(:disabled)': {
          '&.rejt-plus-menu': { color: e.color.ancillary },
          '&.rejt-minus-menu': { color: e.color.negative },
        },
      })),
      sp = P.input(({ theme: e, placeholder: t }) => ({
        outline: 0,
        margin: t ? 1 : '1px 0',
        padding: '3px 4px',
        color: e.color.defaultText,
        background: e.background.app,
        border: `1px solid ${e.appBorderColor}`,
        borderRadius: 4,
        lineHeight: '14px',
        width: t === 'Key' ? 80 : 120,
        '&:focus': { border: `1px solid ${e.color.secondary}` },
      })),
      rS = P(Jt)({ alignSelf: 'flex-start', order: 2, marginRight: -10 }),
      nS = P(Ye.Textarea)(({ theme: e }) => ({
        flex: 1,
        padding: '7px 6px',
        fontFamily: e.typography.fonts.mono,
        fontSize: '12px',
        lineHeight: '18px',
        '&::placeholder': { fontFamily: e.typography.fonts.base, fontSize: '13px' },
        '&:placeholder-shown': { padding: '7px 10px' },
      })),
      oS = { bubbles: !0, cancelable: !0, key: 'Enter', code: 'Enter', keyCode: 13 },
      aS = (e) => {
        e.currentTarget.dispatchEvent(new eS.KeyboardEvent('keydown', oS));
      },
      iS = (e) => {
        e.currentTarget.select();
      },
      lp = ({ name: e, storyId: t, value: r, onChange: n, argType: o }) => {
        let i = st(),
          a = we(() => r && Gs(r), [r]),
          l = a != null,
          [s, d] = X(!l),
          [p, m] = X(null),
          h = !!o?.table?.readonly,
          g = se(
            (C) => {
              try {
                (C && n(JSON.parse(C)), m(null));
              } catch (x) {
                m(x);
              }
            },
            [n],
          ),
          [E, b] = X(!1),
          _ = se(() => {
            (n({}), b(!0));
          }, [n, b]),
          y = he(null);
        ee(() => {
          E && y.current && y.current.select();
        }, [E]);
        let S = we(() => JSON.stringify(a ?? '', null, 2), [a]);
        if (!l)
          return u.createElement(
            Ee,
            { ariaLabel: !1, disabled: h, id: Yr(e, t), onClick: _ },
            'Set object',
          );
        let A = u.createElement(nS, {
            ref: y,
            id: Ke(e, t),
            minRows: 3,
            name: e,
            key: S,
            defaultValue: S,
            onBlur: (C) => g(C.target.value),
            placeholder: 'Edit JSON string...',
            autoFocus: E,
            valid: p ? 'error' : void 0,
            readOnly: h,
          }),
          T = Array.isArray(r) || (typeof r == 'object' && r?.constructor === Object);
        return u.createElement(
          tS,
          null,
          T &&
            u.createElement(
              rS,
              {
                disabled: h,
                pressed: s,
                ariaLabel: `Edit ${e} as JSON`,
                onClick: (C) => {
                  (C.preventDefault(), d((x) => !x));
                },
                variant: 'ghost',
                padding: 'small',
                size: 'small',
              },
              u.createElement(wl, null),
            ),
          s
            ? A
            : u.createElement(Yp, {
                readOnly: h || !T,
                isCollapsed: T ? void 0 : () => !0,
                data: a,
                rootName: e,
                onFullyUpdate: n,
                cancelButtonElement: u.createElement(ap, { type: 'button' }, 'Cancel'),
                addButtonElement: u.createElement(ap, { type: 'submit', primary: !0 }, 'Save'),
                plusMenuElement: u.createElement(ip, { type: 'button' }, u.createElement($n, null)),
                minusMenuElement: u.createElement(
                  ip,
                  { type: 'button' },
                  u.createElement(Ml, null),
                ),
                inputElement: (C, x, v, I) =>
                  I ? u.createElement(sp, { onFocus: iS, onBlur: aS }) : u.createElement(sp, null),
                fallback: A,
              }),
        );
      },
      sS = P.input(({ theme: e, min: t, max: r, value: n, disabled: o }) => {
        let i = {
            background:
              e.base === 'light'
                ? `linear-gradient(to right, 
          ${e.color.green} 0%, ${e.color.green} ${((n - t) / (r - t)) * 100}%, 
          ${xn(0.02, e.input.background)} ${((n - t) / (r - t)) * 100}%, 
          ${xn(0.02, e.input.background)} 100%)`
                : `linear-gradient(to right, 
          ${e.color.green} 0%, ${e.color.green} ${((n - t) / (r - t)) * 100}%, 
          ${Cn(0.02, e.input.background)} ${((n - t) / (r - t)) * 100}%, 
          ${Cn(0.02, e.input.background)} 100%)`,
            borderRadius: 6,
            boxShadow: `${e.base == 'dark' ? 'hsl(0 0 100 / 0.4)' : 'hsl(0 0 0 / 0.44)'} 0 0 0 1px inset`,
            cursor: o ? 'not-allowed' : 'pointer',
            height: 6,
            width: '100%',
          },
          a = { borderColor: or(e.color.secondary, 0.4) },
          l = {
            width: 16,
            height: 16,
            borderRadius: 50,
            cursor: o ? 'not-allowed' : 'grab',
            background: e.input.background,
            border: `1px solid ${e.base == 'dark' ? 'hsl(0 0 100 / 0.4)' : 'hsl(0 0 0 / 0.44)'}`,
            boxShadow: e.base === 'light' ? `0 1px 3px 0px ${or(e.appBorderColor, 0.2)}` : 'unset',
            transition: 'all 150ms ease-out',
          },
          s = {
            background: `${xn(0.05, e.input.background)}`,
            transform: 'scale3d(1.1, 1.1, 1.1) translateY(-1px)',
            transition: 'all 50ms ease-out',
          },
          d = {
            background: `${e.input.background}`,
            transform: 'scale3d(1, 1, 1) translateY(0px)',
          },
          p = {
            borderColor: e.color.secondary,
            boxShadow: e.base === 'light' ? `0 0px 5px 0px ${e.color.secondary}` : 'unset',
          };
        return {
          appearance: 'none',
          backgroundColor: 'transparent',
          width: '100%',
          '&::-webkit-slider-runnable-track': i,
          '&::-moz-range-track': i,
          '&::-ms-track': { ...i, color: 'transparent' },
          '&::-moz-range-thumb': { ...l, '&:hover': s, '&:active': d },
          '&::-webkit-slider-thumb': {
            ...l,
            marginTop: '-6px',
            appearance: 'none',
            '&:hover': s,
            '&:active': d,
          },
          '&::-ms-thumb': { ...l, marginTop: 0, '&:hover': s, '&:active': d },
          '&:focus': {
            outline: 'none',
            '&::-webkit-slider-runnable-track': a,
            '&::-moz-range-track': a,
            '&::-ms-track': a,
            '&::-webkit-slider-thumb': p,
            '&::-moz-range-thumb': p,
            '&::-ms-thumb': p,
          },
          '&::-ms-fill-lower': { borderRadius: 6 },
          '&::-ms-fill-upper': { borderRadius: 6 },
          '@supports (-ms-ime-align:auto)': { 'input[type=range]': { margin: '0' } },
        };
      }),
      Kp = P.span({
        paddingLeft: 5,
        paddingRight: 5,
        fontSize: 12,
        whiteSpace: 'nowrap',
        fontFeatureSettings: 'tnum',
        fontVariantNumeric: 'tabular-nums',
      }),
      lS = P(Kp)(({ numberOFDecimalsPlaces: e, max: t }) => ({
        width: `${e + t.toString().length * 2 + 3}ch`,
        textAlign: 'right',
        flexShrink: 0,
      })),
      uS = P.div(({ readOnly: e }) => ({
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        opacity: e ? 0.5 : 1,
      }));
    function cS(e) {
      let t = e.toString().match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
      return t ? Math.max(0, (t[1] ? t[1].length : 0) - (t[2] ? +t[2] : 0)) : 0;
    }
    var dS = ({
        name: e,
        storyId: t,
        value: r,
        onChange: n,
        min: o = 0,
        max: i = 100,
        step: a = 1,
        onBlur: l,
        onFocus: s,
        argType: d,
      }) => {
        let p = (b) => {
            n(v2(b.target.value));
          },
          m = r !== void 0,
          h = we(() => cS(a), [a]),
          g = !!d?.table?.readonly,
          E = Ke(e, t);
        return u.createElement(
          uS,
          { readOnly: g },
          u.createElement('label', { htmlFor: E, className: 'sb-sr-only' }, e),
          u.createElement(Kp, null, o),
          u.createElement(sS, {
            id: E,
            type: 'range',
            disabled: g,
            onChange: p,
            name: e,
            min: o,
            max: i,
            step: a,
            onFocus: s,
            onBlur: l,
            value: r ?? o,
          }),
          u.createElement(
            lS,
            { numberOFDecimalsPlaces: h, max: i },
            m ? r.toFixed(h) : '--',
            ' / ',
            i,
          ),
        );
      },
      pS = P.label({ display: 'flex' }),
      mS = P.div(({ isMaxed: e }) => ({
        marginLeft: '0.75rem',
        paddingTop: '0.35rem',
        color: e ? 'red' : void 0,
      })),
      hS = ({
        name: e,
        storyId: t,
        value: r,
        onChange: n,
        onFocus: o,
        onBlur: i,
        maxLength: a,
        argType: l,
      }) => {
        let s = (E) => {
            n(E.target.value);
          },
          d = !!l?.table?.readonly,
          [p, m] = X(!1),
          h = se(() => {
            (n(''), m(!0));
          }, [m]);
        if (r === void 0)
          return u.createElement(
            Ee,
            {
              ariaLabel: !1,
              variant: 'outline',
              size: 'medium',
              disabled: d,
              id: Yr(e, t),
              onClick: h,
            },
            'Set string',
          );
        let g = typeof r == 'string';
        return u.createElement(
          pS,
          null,
          u.createElement(Ye.Textarea, {
            id: Ke(e, t),
            maxLength: a,
            onChange: s,
            disabled: d,
            size: 'flex',
            placeholder: 'Edit string...',
            autoFocus: p,
            valid: g ? void 0 : 'error',
            name: e,
            value: g ? r : '',
            onFocus: o,
            onBlur: i,
          }),
          a && u.createElement(mS, { isMaxed: r?.length === a }, r?.length ?? 0, ' / ', a),
        );
      },
      fS = P(Ye.Input)({ padding: 10 });
    function gS(e) {
      e.forEach((t) => {
        t.startsWith('blob:') && URL.revokeObjectURL(t);
      });
    }
    var yS = ({
        onChange: e,
        name: t,
        storyId: r,
        accept: n = 'image/*',
        value: o,
        argType: i,
      }) => {
        let a = he(null),
          l = i?.control?.readOnly;
        function s(p) {
          if (!p.target.files) return;
          let m = Array.from(p.target.files).map((h) => URL.createObjectURL(h));
          (e(m), gS(o || []));
        }
        ee(() => {
          o == null && a.current && (a.current.value = '');
        }, [o, t]);
        let d = Ke(t, r);
        return u.createElement(
          u.Fragment,
          null,
          u.createElement('label', { htmlFor: d, className: 'sb-sr-only' }, t),
          u.createElement(fS, {
            ref: a,
            id: d,
            type: 'file',
            name: t,
            multiple: !0,
            disabled: l,
            onChange: s,
            accept: n,
            size: 'flex',
          }),
        );
      },
      bS = Qs(() => Promise.resolve().then(() => (jd(), $d))),
      ES = (e) =>
        u.createElement(
          Xs,
          { fallback: u.createElement('div', null) },
          u.createElement(bS, { ...e }),
        ),
      SS = {
        array: lp,
        object: lp,
        boolean: y2,
        color: ES,
        date: w2,
        number: C2,
        check: Vr,
        'inline-check': Vr,
        radio: Vr,
        'inline-radio': Vr,
        select: Vr,
        'multi-select': Vr,
        range: dS,
        text: hS,
        file: yS,
      },
      up = () => u.createElement(u.Fragment, null, '-'),
      AS = ({ row: e, arg: t, updateArgs: r, isHovered: n, storyId: o }) => {
        let { key: i, control: a } = e,
          [l, s] = X(!1),
          [d, p] = X({ value: t });
        ee(() => {
          l || p({ value: t });
        }, [l, t]);
        let m = se((_) => (p({ value: _ }), r({ [i]: _ }), _), [r, i]),
          h = se(() => s(!1), []),
          g = se(() => s(!0), []);
        if (!a || a.disable) {
          let _ = a?.disable !== !0 && e?.type?.name !== 'function';
          return n && _
            ? u.createElement(
                ot,
                {
                  href: 'https://storybook.js.org/docs/essentials/controls?ref=ui',
                  target: '_blank',
                  withArrow: !0,
                },
                'Setup controls',
              )
            : u.createElement(up, null);
        }
        let E = {
            name: i,
            storyId: o,
            argType: e,
            value: d.value,
            onChange: m,
            onBlur: h,
            onFocus: g,
          },
          b = SS[a.type] || up;
        return u.createElement(b, { ...E, ...a, controlType: a.type });
      },
      TS = P.table(({ theme: e }) => ({
        '&&': {
          borderCollapse: 'collapse',
          borderSpacing: 0,
          border: 'none',
          tr: { border: 'none !important', background: 'none' },
          'td, th': { padding: 0, border: 'none', width: 'auto!important' },
          marginTop: 0,
          marginBottom: 0,
          'th:first-of-type, td:first-of-type': { paddingLeft: 0 },
          'th:last-of-type, td:last-of-type': { paddingRight: 0 },
          td: {
            paddingTop: 0,
            paddingBottom: 4,
            '&:not(:first-of-type)': { paddingLeft: 10, paddingRight: 0 },
          },
          tbody: { boxShadow: 'none', border: 'none' },
          code: sr({ theme: e }),
          div: { span: { fontWeight: 'bold' } },
          '& code': { margin: 0, display: 'inline-block', fontSize: e.typography.size.s1 },
        },
      })),
      wS = ({ tags: e }) => {
        let t = (e.params || []).filter((i) => i.description),
          r = t.length !== 0,
          n = e.deprecated != null,
          o = e.returns != null && e.returns.description != null;
        return !r && !o && !n
          ? null
          : u.createElement(
              u.Fragment,
              null,
              u.createElement(
                TS,
                null,
                u.createElement(
                  'tbody',
                  null,
                  n &&
                    u.createElement(
                      'tr',
                      { key: 'deprecated' },
                      u.createElement(
                        'td',
                        { colSpan: 2 },
                        u.createElement('strong', null, 'Deprecated'),
                        ': ',
                        e.deprecated?.toString(),
                      ),
                    ),
                  r &&
                    t.map((i) =>
                      u.createElement(
                        'tr',
                        { key: i.name },
                        u.createElement('td', null, u.createElement('code', null, i.name)),
                        u.createElement('td', null, i.description),
                      ),
                    ),
                  o &&
                    u.createElement(
                      'tr',
                      { key: 'returns' },
                      u.createElement('td', null, u.createElement('code', null, 'Returns')),
                      u.createElement('td', null, e.returns?.description),
                    ),
                ),
              ),
            );
      },
      Co = 8,
      cp = P.div(({ isExpanded: e }) => ({
        display: 'flex',
        flexDirection: e ? 'column' : 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        marginBottom: '-4px',
        minWidth: 100,
      })),
      _S = P.details({
        display: 'flex',
        flexDirection: 'column',
        summary: { order: 2 },
        'summary::-webkit-details-marker': { display: 'none' },
        'summary::marker': { content: 'none' },
      }),
      vS = P.div({
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }),
      xS = P.span(sr, ({ theme: e, simple: t = !1 }) => ({
        flex: '0 0 auto',
        fontFamily: e.typography.fonts.mono,
        fontSize: e.typography.size.s1,
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        maxWidth: '100%',
        margin: 0,
        marginRight: '4px',
        marginBottom: '4px',
        paddingTop: '2px',
        paddingBottom: '2px',
        lineHeight: '13px',
        ...(t && { background: 'transparent', border: '0 none', paddingLeft: 0 }),
      })),
      CS = P.summary(({ theme: e }) => ({
        fontFamily: e.typography.fonts.mono,
        color: e.color.secondary,
        cursor: 'pointer',
        lineHeight: 'normal',
        margin: '0 0 4px',
        padding: '1px 6px',
        background: 'none',
        border: 'none',
      })),
      OS = P.button(sr, ({ theme: e }) => ({
        fontFamily: e.typography.fonts.mono,
        color: e.color.secondary,
        fontSize: e.typography.size.s1,
        margin: 0,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': {
          border:
            e.base === 'light' ? '1px solid hsl(0 0 0 / 0.15)' : '1px solid hsl(0 0 100 / 0.15)',
        },
        '&:focus-visible': { outline: `2px solid ${e.color.secondary}`, outlineOffset: '2px' },
      })),
      RS = P.div(({ theme: e }) => ({
        minWidth: 200,
        maxWidth: 800,
        paddingRight: 16,
        fontFamily: e.typography.fonts.mono,
        fontSize: e.typography.size.s1,
        boxSizing: 'content-box',
        '& code': { padding: '0 !important' },
      })),
      IS = P(Sl)({ marginLeft: 4 }),
      DS = P(Vn)({ marginLeft: 4 }),
      PS = () => u.createElement('span', null, '-'),
      ls = ({ text: e, simple: t }) => u.createElement(xS, { simple: t }, e),
      NS = (e) => {
        if (!e) return [e];
        let t = e.split('|').map((r) => r.trim());
        return Is(t);
      },
      dp = (e) =>
        e.slice(0, Co).map((t) => u.createElement(ls, { key: t, text: t === '' ? '""' : t })),
      kS = (e) =>
        e.slice(Co).map((t) => u.createElement(ls, { key: t, text: t === '' ? '""' : t })),
      FS = ({ value: e, initialExpandedArgs: t }) => {
        let { summary: r, detail: n } = e,
          [o, i] = X(!1),
          [a, l] = X(t || !1);
        if (r == null) return null;
        let s = typeof r.toString == 'function' ? r.toString() : r;
        if (n == null) {
          if (/[(){}[\]<>]/.test(s)) return u.createElement(ls, { text: s });
          let d = NS(s),
            p = d.length;
          return p > Co
            ? u.createElement(
                cp,
                { isExpanded: a },
                dp(d),
                u.createElement(
                  _S,
                  { open: a, onToggle: (m) => l(m.currentTarget.open) },
                  u.createElement(vS, null, kS(d)),
                  u.createElement(
                    CS,
                    { role: 'button' },
                    a ? 'Show less...' : `Show ${p - Co} more...`,
                  ),
                ),
              )
            : u.createElement(cp, null, dp(d));
        }
        return u.createElement(
          Ln,
          {
            ariaLabel: 'Arg value details',
            placement: 'bottom',
            visible: o,
            onVisibleChange: (d) => {
              i(d);
            },
            hasCloseButton: !0,
            popover: u.createElement(
              RS,
              null,
              u.createElement(il, { language: 'jsx', format: !1 }, n),
            ),
          },
          u.createElement(
            OS,
            { className: 'sbdocs-expandable' },
            u.createElement('span', null, s),
            o ? u.createElement(IS, null) : u.createElement(DS, null),
          ),
        );
      },
      Li = ({ value: e, initialExpandedArgs: t }) =>
        e == null
          ? u.createElement(PS, null)
          : u.createElement(FS, { value: e, initialExpandedArgs: t }),
      LS = P.span({ fontWeight: 'bold' }),
      BS = P.span(({ theme: e }) => ({
        color: e.color.negative,
        fontFamily: e.typography.fonts.mono,
        cursor: 'help',
      })),
      MS = P.div(({ theme: e }) => ({
        '&&': { p: { margin: '0 0 10px 0' }, a: { color: e.color.secondary } },
        code: { ...sr({ theme: e }), fontSize: 12, fontFamily: e.typography.fonts.mono },
        '& code': { margin: 0, display: 'inline-block' },
        '& pre > code': { whiteSpace: 'pre-wrap' },
      })),
      $S = P.div(({ theme: e, hasDescription: t }) => ({
        color: e.base === 'light' ? Je(0.1, e.color.defaultText) : Je(0.2, e.color.defaultText),
        marginTop: t ? 4 : 0,
      })),
      jS = P.div(({ theme: e, hasDescription: t }) => ({
        color: e.base === 'light' ? Je(0.1, e.color.defaultText) : Je(0.2, e.color.defaultText),
        marginTop: t ? 12 : 0,
        marginBottom: 12,
      })),
      US = P.td(({ expandable: e }) => ({
        paddingLeft: e ? '40px !important' : '20px !important',
      })),
      VS = (e) => e && { summary: typeof e == 'string' ? e : e.name },
      bo = (e) => {
        let [t, r] = X(!1),
          { row: n, updateArgs: o, compact: i, expandable: a, initialExpandedArgs: l } = e,
          { name: s, description: d } = n,
          p = n.table || {},
          m = p.type || VS(n.type),
          h = p.defaultValue || n.defaultValue,
          g = n.type?.required,
          E = d != null && d !== '';
        return u.createElement(
          'tr',
          { onMouseEnter: () => r(!0), onMouseLeave: () => r(!1) },
          u.createElement(
            US,
            { expandable: a ?? !1 },
            u.createElement(LS, null, s),
            g ? u.createElement(BS, { title: 'Required' }, '*') : null,
          ),
          i
            ? null
            : u.createElement(
                'td',
                null,
                E && u.createElement(MS, null, u.createElement(m2, null, d)),
                p.jsDocTags != null
                  ? u.createElement(
                      u.Fragment,
                      null,
                      u.createElement(
                        jS,
                        { hasDescription: E },
                        u.createElement(Li, { value: m, initialExpandedArgs: l }),
                      ),
                      u.createElement(wS, { tags: p.jsDocTags }),
                    )
                  : u.createElement(
                      $S,
                      { hasDescription: E },
                      u.createElement(Li, { value: m, initialExpandedArgs: l }),
                    ),
              ),
          i
            ? null
            : u.createElement(
                'td',
                null,
                u.createElement(Li, { value: h, initialExpandedArgs: l }),
              ),
          o ? u.createElement('td', null, u.createElement(AS, { ...e, isHovered: t })) : null,
        );
      },
      HS = P.div(({ inAddonPanel: e, theme: t }) => ({
        height: e ? '100%' : 'auto',
        display: 'flex',
        border: e ? 'none' : `1px solid ${t.appBorderColor}`,
        borderRadius: e ? 0 : t.appBorderRadius,
        padding: e ? 0 : 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 15,
        background: t.background.content,
      })),
      JS = P.div(({ theme: e }) => ({
        display: 'flex',
        fontSize: e.typography.size.s2 - 1,
        gap: 25,
      })),
      qS = ({ inAddonPanel: e }) => {
        let [t, r] = X(!0);
        return (
          ee(() => {
            let n = setTimeout(() => {
              r(!1);
            }, 100);
            return () => clearTimeout(n);
          }, []),
          t
            ? null
            : u.createElement(
                HS,
                { inAddonPanel: e },
                u.createElement(Fn, {
                  title: e
                    ? 'Interactive story playground'
                    : "Args table with interactive controls couldn't be auto-generated",
                  description: u.createElement(
                    u.Fragment,
                    null,
                    "Controls give you an easy to use interface to test your components. Set your story args and you'll see controls appearing here automatically.",
                  ),
                  footer: u.createElement(
                    JS,
                    null,
                    e &&
                      u.createElement(
                        u.Fragment,
                        null,
                        u.createElement(
                          ot,
                          {
                            href: 'https://storybook.js.org/docs/essentials/controls?ref=ui',
                            target: '_blank',
                            withArrow: !0,
                          },
                          u.createElement(lr, null),
                          ' Read docs',
                        ),
                      ),
                    !e &&
                      u.createElement(
                        ot,
                        {
                          href: 'https://storybook.js.org/docs/essentials/controls?ref=ui',
                          target: '_blank',
                          withArrow: !0,
                        },
                        u.createElement(lr, null),
                        ' Learn how to set that up',
                      ),
                  ),
                }),
              )
        );
      },
      zS = P(Un)(({ theme: e }) => ({
        marginRight: 8,
        marginLeft: -10,
        marginTop: -2,
        height: 12,
        width: 12,
        color: e.base === 'light' ? Je(0.25, e.color.defaultText) : Je(0.3, e.color.defaultText),
        border: 'none',
        display: 'inline-block',
      })),
      GS = P(El)(({ theme: e }) => ({
        marginRight: 8,
        marginLeft: -10,
        marginTop: -2,
        height: 12,
        width: 12,
        color: e.base === 'light' ? Je(0.25, e.color.defaultText) : Je(0.3, e.color.defaultText),
        border: 'none',
        display: 'inline-block',
      })),
      WS = P.span(({ theme: e }) => ({
        display: 'flex',
        lineHeight: '20px',
        alignItems: 'center',
      })),
      YS = P.td(({ theme: e }) => ({
        position: 'relative',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        fontWeight: e.typography.weight.bold,
        fontSize: e.typography.size.s1 - 1,
        color: e.base === 'light' ? Je(0.4, e.color.defaultText) : Je(0.6, e.color.defaultText),
        background: `${e.background.app} !important`,
        '& ~ td': { background: `${e.background.app} !important` },
      })),
      KS = P.td(({ theme: e }) => ({
        position: 'relative',
        fontWeight: e.typography.weight.bold,
        fontSize: e.typography.size.s2 - 1,
        background: e.background.app,
      })),
      XS = P.td({ position: 'relative' }),
      ZS = P.tr(({ theme: e }) => ({
        '&:hover > td': {
          backgroundColor: `${Cn(0.005, e.background.app)} !important`,
          boxShadow: `${e.color.mediumlight} 0 - 1px 0 0 inset`,
          cursor: 'row-resize',
        },
      })),
      pp = P.button({
        background: 'none',
        border: 'none',
        padding: '0',
        font: 'inherit',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        width: '100%',
        color: 'transparent',
        cursor: 'row-resize !important',
      }),
      Bi = ({
        level: e = 'section',
        label: t,
        children: r,
        initialExpanded: n = !0,
        colSpan: o = 3,
      }) => {
        let [i, a] = X(n),
          l = e === 'subsection' ? KS : YS,
          s = r?.length || 0,
          d = e === 'subsection' ? `${s} item${s !== 1 ? 's' : ''}` : '',
          p = `${i ? 'Hide' : 'Show'} ${e === 'subsection' ? s : t} item${s !== 1 ? 's' : ''}`;
        return u.createElement(
          u.Fragment,
          null,
          u.createElement(
            ZS,
            { title: p },
            u.createElement(
              l,
              { colSpan: 1 },
              u.createElement(pp, { onClick: (m) => a(!i), tabIndex: 0 }, p),
              u.createElement(
                WS,
                null,
                i ? u.createElement(zS, null) : u.createElement(GS, null),
                t,
              ),
            ),
            u.createElement(
              XS,
              { colSpan: o - 1 },
              u.createElement(
                pp,
                { onClick: (m) => a(!i), tabIndex: -1, style: { outline: 'none' } },
                p,
              ),
              i ? null : d,
            ),
          ),
          i ? r : null,
        );
      },
      QS = P.div(({ theme: e }) => ({
        width: '100%',
        borderSpacing: 0,
        color: e.color.defaultText,
      })),
      Eo = P.div(({ theme: e }) => ({
        display: 'flex',
        borderBottom: `1px solid ${e.appBorderColor}`,
        '&:last-child': { borderBottom: 0 },
      })),
      ze = P.div(({ position: e, theme: t }) => {
        let r = {
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          padding: '10px 15px',
          alignItems: 'flex-start',
        };
        switch (e) {
          case 'first':
            return { ...r, width: '25%', paddingLeft: 20 };
          case 'second':
            return { ...r, width: '35%' };
          case 'third':
            return { ...r, width: '15%' };
          case 'last':
            return { ...r, width: '25%', paddingRight: 20 };
        }
      }),
      Be = P.div(({ theme: e, width: t, height: r }) => ({
        animation: `${e.animation.glow} 1.5s ease-in-out infinite`,
        background: e.appBorderColor,
        width: t || '100%',
        height: r || 16,
        borderRadius: 3,
      })),
      eA = () =>
        u.createElement(
          QS,
          null,
          u.createElement(
            Eo,
            null,
            u.createElement(ze, { position: 'first' }, u.createElement(Be, { width: '60%' })),
            u.createElement(ze, { position: 'second' }, u.createElement(Be, { width: '30%' })),
            u.createElement(ze, { position: 'third' }, u.createElement(Be, { width: '60%' })),
            u.createElement(ze, { position: 'last' }, u.createElement(Be, { width: '60%' })),
          ),
          u.createElement(
            Eo,
            null,
            u.createElement(ze, { position: 'first' }, u.createElement(Be, { width: '60%' })),
            u.createElement(
              ze,
              { position: 'second' },
              u.createElement(Be, { width: '80%' }),
              u.createElement(Be, { width: '30%' }),
            ),
            u.createElement(ze, { position: 'third' }, u.createElement(Be, { width: '60%' })),
            u.createElement(ze, { position: 'last' }, u.createElement(Be, { width: '60%' })),
          ),
          u.createElement(
            Eo,
            null,
            u.createElement(ze, { position: 'first' }, u.createElement(Be, { width: '60%' })),
            u.createElement(
              ze,
              { position: 'second' },
              u.createElement(Be, { width: '80%' }),
              u.createElement(Be, { width: '30%' }),
            ),
            u.createElement(ze, { position: 'third' }, u.createElement(Be, { width: '60%' })),
            u.createElement(ze, { position: 'last' }, u.createElement(Be, { width: '60%' })),
          ),
          u.createElement(
            Eo,
            null,
            u.createElement(ze, { position: 'first' }, u.createElement(Be, { width: '60%' })),
            u.createElement(
              ze,
              { position: 'second' },
              u.createElement(Be, { width: '80%' }),
              u.createElement(Be, { width: '30%' }),
            ),
            u.createElement(ze, { position: 'third' }, u.createElement(Be, { width: '60%' })),
            u.createElement(ze, { position: 'last' }, u.createElement(Be, { width: '60%' })),
          ),
        ),
      tA = P.table(({ theme: e, compact: t, inAddonPanel: r, inTabPanel: n }) => ({
        '&&': {
          borderSpacing: 0,
          color: e.color.defaultText,
          'td, th': { padding: 0, border: 'none', verticalAlign: 'top', textOverflow: 'ellipsis' },
          fontSize: e.typography.size.s2 - 1,
          lineHeight: '19px',
          textAlign: 'left',
          width: '100%',
          marginTop: r ? 0 : 25,
          marginBottom: r ? 0 : 40,
          'thead th:first-of-type, td:first-of-type': { width: '25%' },
          'th:first-of-type, td:first-of-type': { paddingLeft: 20 },
          'th:nth-of-type(2), td:nth-of-type(2)': { ...(t ? null : { width: '35%' }) },
          'td:nth-of-type(3)': { ...(t ? null : { width: '15%' }) },
          'th:last-of-type, td:last-of-type': {
            paddingRight: 20,
            ...(t ? null : { width: '25%' }),
          },
          th: {
            color: e.textMutedColor,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 15,
            paddingRight: 15,
          },
          td: {
            paddingTop: '10px',
            paddingBottom: '10px',
            '&:not(:first-of-type)': { paddingLeft: 15, paddingRight: 15 },
            '&:last-of-type': { paddingRight: 20 },
          },
          marginInline: r || n ? 0 : 1,
          paddingInline: n ? 3 : 0,
          tbody: {
            ...(r
              ? null
              : {
                  filter:
                    e.base === 'light'
                      ? 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.10))'
                      : 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.20))',
                }),
            '> tr > *': {
              background: e.background.content,
              borderTop: `1px solid ${e.appBorderColor}`,
            },
            ...(r
              ? null
              : {
                  '> tr:first-of-type > *': { borderBlockStart: `1px solid ${e.appBorderColor}` },
                  '> tr:last-of-type > *': { borderBlockEnd: `1px solid ${e.appBorderColor}` },
                  '> tr > *:first-of-type': { borderInlineStart: `1px solid ${e.appBorderColor}` },
                  '> tr > *:last-of-type': { borderInlineEnd: `1px solid ${e.appBorderColor}` },
                  '> tr:first-of-type > td:first-of-type': {
                    borderTopLeftRadius: e.appBorderRadius,
                  },
                  '> tr:first-of-type > td:last-of-type': {
                    borderTopRightRadius: e.appBorderRadius,
                  },
                  '> tr:last-of-type > td:first-of-type': {
                    borderBottomLeftRadius: e.appBorderRadius,
                  },
                  '> tr:last-of-type > td:last-of-type': {
                    borderBottomRightRadius: e.appBorderRadius,
                  },
                }),
          },
          '@media (forced-colors: active)': {
            tbody: { filter: 'none', '> tr > *': { borderColor: 'CanvasText' } },
          },
        },
      })),
      rA = P.div({ position: 'relative' }),
      nA = P.div({ position: 'absolute', right: 22, top: 10 }),
      oA = P(Ee)({ margin: '-4px -12px -4px 0' }),
      aA = {
        alpha: (e, t) => (e.name ?? '').localeCompare(t.name ?? ''),
        requiredFirst: (e, t) =>
          +!!t.type?.required - +!!e.type?.required || (e.name ?? '').localeCompare(t.name ?? ''),
        none: null,
      },
      iA = (e, t) => {
        let r = { ungrouped: [], ungroupedSubsections: {}, sections: {} };
        if (!e) return r;
        Object.entries(e).forEach(([i, a]) => {
          let { category: l, subcategory: s } = a?.table || {};
          if (l) {
            let d = r.sections[l] || { ungrouped: [], subsections: {} };
            if (!s) d.ungrouped.push({ key: i, ...a });
            else {
              let p = d.subsections[s] || [];
              (p.push({ key: i, ...a }), (d.subsections[s] = p));
            }
            r.sections[l] = d;
          } else if (s) {
            let d = r.ungroupedSubsections[s] || [];
            (d.push({ key: i, ...a }), (r.ungroupedSubsections[s] = d));
          } else r.ungrouped.push({ key: i, ...a });
        });
        let n = aA[t],
          o = (i) => (n ? Object.keys(i).reduce((a, l) => ({ ...a, [l]: i[l].sort(n) }), {}) : i);
        return {
          ungrouped: n ? r.ungrouped.sort(n) : r.ungrouped,
          ungroupedSubsections: o(r.ungroupedSubsections),
          sections: Object.keys(r.sections).reduce(
            (i, a) => ({
              ...i,
              [a]: {
                ungrouped: n ? r.sections[a].ungrouped.sort(n) : r.sections[a].ungrouped,
                subsections: o(r.sections[a].subsections),
              },
            }),
            {},
          ),
        };
      },
      sA = (e, t, r) => {
        try {
          return Ua(e, t, r);
        } catch (n) {
          return (ur.warn(n.message), !1);
        }
      },
      lA = (e) => {
        let {
          updateArgs: t,
          resetArgs: r,
          compact: n,
          inAddonPanel: o,
          inTabPanel: i,
          initialExpandedArgs: a,
          sort: l = 'none',
          isLoading: s,
          storyId: d,
        } = e;
        if ('error' in e) {
          let { error: T } = e;
          return u.createElement(
            sE,
            null,
            T,
            '\xA0',
            u.createElement(
              ot,
              { href: 'http://storybook.js.org/docs/?ref=ui', target: '_blank', withArrow: !0 },
              u.createElement(lr, null),
              ' Read the docs',
            ),
          );
        }
        if (s) return u.createElement(eA, null);
        let {
            rows: p,
            args: m,
            globals: h,
          } = 'rows' in e ? e : { rows: void 0, args: void 0, globals: void 0 },
          g = iA(
            Rn(p || {}, (T) => !T?.table?.disable && sA(T, m || {}, h || {})),
            l,
          ),
          E = g.ungrouped.length === 0,
          b = Object.entries(g.sections).length === 0,
          _ = Object.entries(g.ungroupedSubsections).length === 0;
        if (E && b && _) return u.createElement(qS, { inAddonPanel: o });
        let y = 1;
        (t && (y += 1), n || (y += 2));
        let S = Object.keys(g.sections).length > 0,
          A = { updateArgs: t, compact: n, inAddonPanel: o, initialExpandedArgs: a, storyId: d };
        return u.createElement(
          nl,
          null,
          u.createElement(
            rA,
            null,
            t &&
              !s &&
              r &&
              u.createElement(
                nA,
                null,
                u.createElement(
                  oA,
                  {
                    variant: 'ghost',
                    padding: 'small',
                    onClick: () => r(),
                    ariaLabel: 'Reset controls',
                  },
                  u.createElement(Jn, null),
                ),
              ),
            u.createElement(
              tA,
              {
                compact: n,
                inAddonPanel: o,
                inTabPanel: i,
                className: 'docblock-argstable sb-unstyled',
              },
              u.createElement(
                'thead',
                { className: 'docblock-argstable-head' },
                u.createElement(
                  'tr',
                  null,
                  u.createElement('th', null, u.createElement('span', null, 'Name')),
                  n
                    ? null
                    : u.createElement('th', null, u.createElement('span', null, 'Description')),
                  n ? null : u.createElement('th', null, u.createElement('span', null, 'Default')),
                  t ? u.createElement('th', null, u.createElement('span', null, 'Control')) : null,
                ),
              ),
              u.createElement(
                'tbody',
                { className: 'docblock-argstable-body' },
                g.ungrouped.map((T) =>
                  u.createElement(bo, { key: T.key, row: T, arg: m && m[T.key], ...A }),
                ),
                Object.entries(g.ungroupedSubsections).map(([T, C]) =>
                  u.createElement(
                    Bi,
                    { key: T, label: T, level: 'subsection', colSpan: y },
                    C.map((x) =>
                      u.createElement(bo, {
                        key: x.key,
                        row: x,
                        arg: m && m[x.key],
                        expandable: S,
                        ...A,
                      }),
                    ),
                  ),
                ),
                Object.entries(g.sections).map(([T, C]) =>
                  u.createElement(
                    Bi,
                    { key: T, label: T, level: 'section', colSpan: y },
                    C.ungrouped.map((x) =>
                      u.createElement(bo, { key: x.key, row: x, arg: m && m[x.key], ...A }),
                    ),
                    Object.entries(C.subsections).map(([x, v]) =>
                      u.createElement(
                        Bi,
                        { key: x, label: x, level: 'subsection', colSpan: y },
                        v.map((I) =>
                          u.createElement(bo, {
                            key: I.key,
                            row: I,
                            arg: m && m[I.key],
                            expandable: S,
                            ...A,
                          }),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
      Yi = 'addon-controls',
      Xp = 'controls',
      uA = Pa({ from: { transform: 'translateY(40px)' }, to: { transform: 'translateY(0)' } }),
      cA = Pa({ from: { background: 'var(--highlight-bg-color)' }, to: {} }),
      dA = P.div({
        containerType: 'size',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 41,
        overflow: 'hidden',
        zIndex: 1,
      }),
      pA = P(tl)(({ theme: e }) => ({
        '--highlight-bg-color': e.base === 'dark' ? '#153B5B' : '#E0F0FF',
        paddingInline: 4,
        animation: `${uA} 300ms, ${cA} 2s`,
        background: e.background.bar,
        borderTop: `1px solid ${e.appBorderColor}`,
        fontSize: e.typography.size.s2,
        '@container (max-width: 799px)': { flexDirection: 'row', justifyContent: 'flex-end' },
      })),
      mA = P.div({
        display: 'flex',
        flex: '99 0 auto',
        alignItems: 'center',
        marginInlineStart: 7,
        marginInlineEnd: 10,
        gap: 6,
      }),
      hA = P.div(({ theme: e }) => ({
        display: 'flex',
        flex: '1 0 0',
        alignItems: 'center',
        gap: 2,
        color: e.textMutedColor,
        fontSize: e.typography.size.s2,
      })),
      Mi = P.div({
        '@container (max-width: 799px)': {
          lineHeight: 0,
          textIndent: '-9999px',
          '&::after': {
            content: 'attr(data-short-label)',
            display: 'block',
            lineHeight: 'initial',
            textIndent: '0',
          },
        },
      }),
      fA = P(Ye.Input)(({ theme: e }) => ({
        '::placeholder': { color: e.color.mediumdark },
        '&:invalid:not(:placeholder-shown)': { boxShadow: `${e.color.negative} 0 0 0 1px inset` },
      })),
      gA = ({ saveStory: e, createStory: t, resetArgs: r }) => {
        let n = u.useRef(null),
          [o, i] = u.useState(!1),
          [a, l] = u.useState(!1),
          [s, d] = u.useState(''),
          [p, m] = u.useState(null),
          h = async () => {
            o || (i(!0), await e().catch(() => {}), i(!1));
          },
          g = () => {
            (l(!0), d(''), setTimeout(() => n.current?.focus(), 0));
          },
          E = (S) => {
            let A = S.target.value
              .replace(/^[^a-z]/i, '')
              .replace(/[^a-z0-9-_ ]/gi, '')
              .replaceAll(/([-_ ]+[a-z0-9])/gi, (T) => T.toUpperCase().replace(/[-_ ]/g, ''));
            d(A.charAt(0).toUpperCase() + A.slice(1));
          },
          b = async (S) => {
            if ((S.preventDefault(), !o))
              try {
                (m(null),
                  i(!0),
                  await t(s.replace(/^[^a-z]/i, '').replaceAll(/[^a-z0-9]/gi, '')),
                  l(!1),
                  i(!1));
              } catch (A) {
                (m(A.message), i(!1));
              }
          },
          _ = o ? 'Saving changes to story' : 'Save changes to story',
          y = 'Create new story with these settings';
        return u.createElement(
          dA,
          { id: 'save-from-controls' },
          u.createElement(
            pA,
            {
              innerStyle: {
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              },
            },
            u.createElement(
              hA,
              null,
              u.createElement(
                Ee,
                { ariaLabel: _, tooltip: _, disabled: o, onClick: h },
                u.createElement(jn, null),
                u.createElement(Mi, { 'data-short-label': 'Save' }, 'Update story'),
              ),
              u.createElement(
                Ee,
                { ariaLabel: y, tooltip: y, onClick: g },
                u.createElement($n, null),
                u.createElement(Mi, { 'data-short-label': 'New' }, 'Create new story'),
              ),
              u.createElement(
                Ee,
                { ariaLabel: 'Reset changes', onClick: () => r() },
                u.createElement(Jn, null),
                u.createElement('span', null, 'Reset'),
              ),
            ),
            u.createElement(
              Rt,
              { ariaLabel: 'Create new story', width: 350, open: a, onOpenChange: l },
              u.createElement(
                Ye,
                { onSubmit: b, id: 'create-new-story-form' },
                u.createElement(
                  Rt.Content,
                  null,
                  u.createElement(
                    Rt.Header,
                    null,
                    u.createElement(Rt.Title, null, 'Create new story'),
                    u.createElement(
                      Rt.Description,
                      null,
                      'This will add a new story to your existing stories file.',
                    ),
                  ),
                  u.createElement(fA, {
                    onChange: E,
                    placeholder: 'Story export name',
                    readOnly: o,
                    ref: n,
                    value: s,
                  }),
                  u.createElement(
                    Rt.Actions,
                    null,
                    u.createElement(
                      Ee,
                      {
                        ariaLabel: !1,
                        disabled: o || !s,
                        size: 'medium',
                        type: 'submit',
                        variant: 'solid',
                      },
                      'Create',
                    ),
                    u.createElement(
                      Rt.Close,
                      { asChild: !0 },
                      u.createElement(
                        Ee,
                        { ariaLabel: !1, disabled: o, size: 'medium', type: 'reset' },
                        'Cancel',
                      ),
                    ),
                  ),
                ),
              ),
              p && u.createElement(Rt.Error, null, p),
            ),
            u.createElement(
              mA,
              null,
              u.createElement(
                Mi,
                { 'data-short-label': 'Unsaved changes' },
                'You modified this story. Do you want to save your changes?',
              ),
            ),
          ),
        );
      },
      mp = (e) =>
        Object.entries(e).reduce(
          (t, [r, n]) => (n !== void 0 ? Object.assign(t, { [r]: n }) : t),
          {},
        ),
      yA = P.div(({ showSaveFromUI: e, theme: t }) => ({
        height: '100%',
        maxHeight: '100vh',
        paddingBottom: e ? 41 : 0,
        backgroundColor: t.background.content,
        table: { backgroundColor: t.background.app },
      })),
      bA = ({ saveStory: e, createStory: t }) => {
        let r = Pe(),
          [n, o] = X(!0),
          [i, a, l, s] = Jl(),
          [d] = At(),
          p = qn(),
          { expanded: m, sort: h, presetColors: g, disableSaveFromUI: E = !1 } = Tt(Xp, {}),
          { path: b, previewInitialized: _ } = Gn(),
          y = r.getCurrentStoryData();
        ee(() => {
          _ && o(!1);
        }, [_]);
        let S = Object.values(p).some((x) => x?.control),
          A = Object.entries(p).reduce((x, [v, I]) => {
            let N = I?.control;
            return (
              typeof N != 'object' || N?.type !== 'color' || N?.presetColors
                ? (x[v] = I)
                : (x[v] = { ...I, control: { ...N, presetColors: g } }),
              x
            );
          }, {}),
          T = we(() => !!i && !!s && !$t(mp(i), mp(s)), [i, s]),
          C =
            S &&
            y.type === 'story' &&
            y.subtype !== 'test' &&
            T &&
            K.CONFIG_TYPE === 'DEVELOPMENT' &&
            E !== !0;
        return u.createElement(
          yA,
          { showSaveFromUI: C },
          u.createElement(lA, {
            key: b,
            compact: !m && S,
            rows: A,
            args: i,
            globals: d,
            updateArgs: a,
            resetArgs: l,
            inAddonPanel: !0,
            sort: h,
            isLoading: n,
          }),
          C && u.createElement(gA, { resetArgs: l, saveStory: e, createStory: t }),
        );
      };
    function EA() {
      let e = Pe().getSelectedPanel(),
        t = qn(),
        r = Object.values(t).filter((o) => o?.control && !o?.table?.disable).length,
        n =
          r === 0
            ? null
            : u.createElement(Rr, { compact: !0, status: e === Yi ? 'active' : 'neutral' }, r);
      return u.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        u.createElement('span', null, 'Controls'),
        n,
      );
    }
    async function Ki(e, t, r = 1) {
      if (r > 10) throw new Error('We could not select the new story. Please try again.');
      try {
        e(t);
      } catch {
        return (await new Promise((n) => setTimeout(n, 500)), Ki(e, t, r + 1));
      }
    }
    var hp = (e) =>
        JSON.stringify(e, (t, r) => (typeof r == 'function' ? '__sb_empty_function_arg__' : r)),
      F6 = Oe.register(Yi, (e) => {
        if (globalThis?.FEATURES?.controls) {
          let t = Oe.getChannel(),
            r = async () => {
              let o = e.getCurrentStoryData();
              if (o.type !== 'story') throw new Error('Not a story');
              try {
                let i = await Da(t, xa, Mn, {
                  args: hp(
                    Object.entries(o.args || {}).reduce(
                      (a, [l, s]) => ($t(s, o.initialArgs?.[l]) || (a[l] = s), a),
                      {},
                    ),
                  ),
                  csfId: o.id,
                  importPath: o.importPath,
                });
                e.addNotification({
                  id: 'save-story-success',
                  icon: u.createElement(Ia, { color: Wn.positive }),
                  content: {
                    headline: 'Story saved',
                    subHeadline: u.createElement(
                      u.Fragment,
                      null,
                      'Updated story ',
                      u.createElement('b', null, i.sourceStoryName),
                      '.',
                    ),
                  },
                  duration: 8e3,
                });
              } catch (i) {
                throw (
                  e.addNotification({
                    id: 'save-story-error',
                    icon: u.createElement(_l, { color: Wn.negative }),
                    content: {
                      headline: 'Failed to save story',
                      subHeadline:
                        i?.message ||
                        'Check the Storybook process on the command line for more details.',
                    },
                    duration: 8e3,
                  }),
                  i
                );
              }
            },
            n = async (o) => {
              let i = e.getCurrentStoryData();
              if (i.type !== 'story') throw new Error('Not a story');
              let a = await Da(t, xa, Mn, {
                args: i.args && hp(i.args),
                csfId: i.id,
                importPath: i.importPath,
                name: o,
              });
              e.addNotification({
                id: 'save-story-success',
                icon: u.createElement(Ia, { color: Wn.positive }),
                content: {
                  headline: 'Story created',
                  subHeadline: u.createElement(
                    u.Fragment,
                    null,
                    'Added story ',
                    u.createElement('b', null, a.newStoryName),
                    ' based on ',
                    u.createElement('b', null, a.sourceStoryName),
                    '.',
                  ),
                },
                duration: 8e3,
                onClick: ({ onDismiss: l }) => {
                  (l(), Ki(e.selectStory, a.newStoryId));
                },
              });
            };
          (Oe.add(Yi, {
            title: EA,
            type: Qe.PANEL,
            paramKey: Xp,
            render: ({ active: o }) =>
              !o || !e.getCurrentStoryData()
                ? null
                : u.createElement(
                    kn,
                    { active: o, hasHorizontalScrollbar: !0, hasScrollbar: !0 },
                    u.createElement(bA, { saveStory: r, createStory: n }),
                  ),
          }),
            t.on(Mn, (o) => {
              if (!o.success) return;
              let i = e.getCurrentStoryData();
              i.type === 'story' &&
                (e.resetStoryArgs(i),
                o.payload.newStoryId && Ki(e.selectStory, o.payload.newStoryId));
            }));
        }
      });
    function SA() {
      let e = Pe().getSelectedPanel(),
        [{ count: t }, r] = Pr(Cr, { count: 0 });
      zn({
        [Or]: () => {
          r((o) => ({ ...o, count: o.count + 1 }));
        },
        [Dr]: () => {
          r((o) => ({ ...o, count: 0 }));
        },
        [_a]: () => {
          r((o) => ({ ...o, count: 0 }));
        },
      });
      let n =
        t === 0
          ? null
          : u.createElement(Rr, { compact: !0, status: e === wa ? 'active' : 'neutral' }, t);
      return u.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        u.createElement('span', null, 'Actions'),
        n,
      );
    }
    var AA = Object.create,
      us = Object.defineProperty,
      TA = Object.getOwnPropertyDescriptor,
      Zp = Object.getOwnPropertyNames,
      wA = Object.getPrototypeOf,
      _A = Object.prototype.hasOwnProperty,
      cs = (e, t) =>
        function () {
          return (t || (0, e[Zp(e)[0]])((t = { exports: {} }).exports, t), t.exports);
        },
      vA = (e, t) => {
        for (var r in t) us(e, r, { get: t[r], enumerable: !0 });
      },
      xA = (e, t, r, n) => {
        if ((t && typeof t == 'object') || typeof t == 'function')
          for (let o of Zp(t))
            !_A.call(e, o) &&
              o !== r &&
              us(e, o, { get: () => t[o], enumerable: !(n = TA(t, o)) || n.enumerable });
        return e;
      },
      CA = (e, t, r) => (
        (r = e != null ? AA(wA(e)) : {}),
        xA(t || !e || !e.__esModule ? us(r, 'default', { value: e, enumerable: !0 }) : r, e)
      ),
      OA = cs({
        'node_modules/is-object/index.js'(e, t) {
          'use strict';
          t.exports = function (r) {
            return typeof r == 'object' && r !== null;
          };
        },
      }),
      RA = cs({
        'node_modules/is-window/index.js'(e, t) {
          'use strict';
          t.exports = function (r) {
            if (r == null) return !1;
            var n = Object(r);
            return n === n.window;
          };
        },
      }),
      IA = cs({
        'node_modules/is-dom/index.js'(e, t) {
          var r = OA(),
            n = RA();
          function o(i) {
            return !r(i) || !n(window) || typeof window.Node != 'function'
              ? !1
              : typeof i.nodeType == 'number' && typeof i.nodeName == 'string';
          }
          t.exports = o;
        },
      }),
      Oo = {};
    vA(Oo, { chromeDark: () => DA, chromeLight: () => PA });
    var DA = {
        BASE_FONT_FAMILY: 'Menlo, monospace',
        BASE_FONT_SIZE: '11px',
        BASE_LINE_HEIGHT: 1.2,
        BASE_BACKGROUND_COLOR: 'rgb(36, 36, 36)',
        BASE_COLOR: 'rgb(213, 213, 213)',
        OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
        OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 5,
        OBJECT_NAME_COLOR: 'rgb(227, 110, 236)',
        OBJECT_VALUE_NULL_COLOR: 'rgb(127, 127, 127)',
        OBJECT_VALUE_UNDEFINED_COLOR: 'rgb(127, 127, 127)',
        OBJECT_VALUE_REGEXP_COLOR: 'rgb(233, 63, 59)',
        OBJECT_VALUE_STRING_COLOR: 'rgb(233, 63, 59)',
        OBJECT_VALUE_SYMBOL_COLOR: 'rgb(233, 63, 59)',
        OBJECT_VALUE_NUMBER_COLOR: 'hsl(252, 100%, 75%)',
        OBJECT_VALUE_BOOLEAN_COLOR: 'hsl(252, 100%, 75%)',
        OBJECT_VALUE_FUNCTION_PREFIX_COLOR: 'rgb(85, 106, 242)',
        HTML_TAG_COLOR: 'rgb(93, 176, 215)',
        HTML_TAGNAME_COLOR: 'rgb(93, 176, 215)',
        HTML_TAGNAME_TEXT_TRANSFORM: 'lowercase',
        HTML_ATTRIBUTE_NAME_COLOR: 'rgb(155, 187, 220)',
        HTML_ATTRIBUTE_VALUE_COLOR: 'rgb(242, 151, 102)',
        HTML_COMMENT_COLOR: 'rgb(137, 137, 137)',
        HTML_DOCTYPE_COLOR: 'rgb(192, 192, 192)',
        ARROW_COLOR: 'rgb(145, 145, 145)',
        ARROW_MARGIN_RIGHT: 3,
        ARROW_FONT_SIZE: 12,
        ARROW_ANIMATION_DURATION: '0',
        TREENODE_FONT_FAMILY: 'Menlo, monospace',
        TREENODE_FONT_SIZE: '11px',
        TREENODE_LINE_HEIGHT: 1.2,
        TREENODE_PADDING_LEFT: 12,
        TABLE_BORDER_COLOR: 'rgb(85, 85, 85)',
        TABLE_TH_BACKGROUND_COLOR: 'rgb(44, 44, 44)',
        TABLE_TH_HOVER_COLOR: 'rgb(48, 48, 48)',
        TABLE_SORT_ICON_COLOR: 'black',
        TABLE_DATA_BACKGROUND_IMAGE:
          'linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0) 50%, rgba(51, 139, 255, 0.0980392) 50%, rgba(51, 139, 255, 0.0980392))',
        TABLE_DATA_BACKGROUND_SIZE: '128px 32px',
      },
      PA = {
        BASE_FONT_FAMILY: 'Menlo, monospace',
        BASE_FONT_SIZE: '11px',
        BASE_LINE_HEIGHT: 1.2,
        BASE_BACKGROUND_COLOR: 'white',
        BASE_COLOR: 'black',
        OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
        OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 5,
        OBJECT_NAME_COLOR: 'rgb(136, 19, 145)',
        OBJECT_VALUE_NULL_COLOR: 'rgb(128, 128, 128)',
        OBJECT_VALUE_UNDEFINED_COLOR: 'rgb(128, 128, 128)',
        OBJECT_VALUE_REGEXP_COLOR: 'rgb(196, 26, 22)',
        OBJECT_VALUE_STRING_COLOR: 'rgb(196, 26, 22)',
        OBJECT_VALUE_SYMBOL_COLOR: 'rgb(196, 26, 22)',
        OBJECT_VALUE_NUMBER_COLOR: 'rgb(28, 0, 207)',
        OBJECT_VALUE_BOOLEAN_COLOR: 'rgb(28, 0, 207)',
        OBJECT_VALUE_FUNCTION_PREFIX_COLOR: 'rgb(13, 34, 170)',
        HTML_TAG_COLOR: 'rgb(168, 148, 166)',
        HTML_TAGNAME_COLOR: 'rgb(136, 18, 128)',
        HTML_TAGNAME_TEXT_TRANSFORM: 'lowercase',
        HTML_ATTRIBUTE_NAME_COLOR: 'rgb(153, 69, 0)',
        HTML_ATTRIBUTE_VALUE_COLOR: 'rgb(26, 26, 166)',
        HTML_COMMENT_COLOR: 'rgb(35, 110, 37)',
        HTML_DOCTYPE_COLOR: 'rgb(192, 192, 192)',
        ARROW_COLOR: '#6e6e6e',
        ARROW_MARGIN_RIGHT: 3,
        ARROW_FONT_SIZE: 12,
        ARROW_ANIMATION_DURATION: '0',
        TREENODE_FONT_FAMILY: 'Menlo, monospace',
        TREENODE_FONT_SIZE: '11px',
        TREENODE_LINE_HEIGHT: 1.2,
        TREENODE_PADDING_LEFT: 12,
        TABLE_BORDER_COLOR: '#aaa',
        TABLE_TH_BACKGROUND_COLOR: '#eee',
        TABLE_TH_HOVER_COLOR: 'hsla(0, 0%, 90%, 1)',
        TABLE_SORT_ICON_COLOR: '#6e6e6e',
        TABLE_DATA_BACKGROUND_IMAGE:
          'linear-gradient(to bottom, white, white 50%, rgb(234, 243, 255) 50%, rgb(234, 243, 255))',
        TABLE_DATA_BACKGROUND_SIZE: '128px 32px',
      },
      Qp = In([{}, () => {}]),
      $i = {
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        OUserSelect: 'none',
        userSelect: 'none',
      },
      _o = (e) => ({
        DOMNodePreview: {
          htmlOpenTag: {
            base: { color: e.HTML_TAG_COLOR },
            tagName: { color: e.HTML_TAGNAME_COLOR, textTransform: e.HTML_TAGNAME_TEXT_TRANSFORM },
            htmlAttributeName: { color: e.HTML_ATTRIBUTE_NAME_COLOR },
            htmlAttributeValue: { color: e.HTML_ATTRIBUTE_VALUE_COLOR },
          },
          htmlCloseTag: {
            base: { color: e.HTML_TAG_COLOR },
            offsetLeft: { marginLeft: -e.TREENODE_PADDING_LEFT },
            tagName: { color: e.HTML_TAGNAME_COLOR, textTransform: e.HTML_TAGNAME_TEXT_TRANSFORM },
          },
          htmlComment: { color: e.HTML_COMMENT_COLOR },
          htmlDoctype: { color: e.HTML_DOCTYPE_COLOR },
        },
        ObjectPreview: {
          objectDescription: { fontStyle: 'italic' },
          preview: { fontStyle: 'italic' },
          arrayMaxProperties: e.OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES,
          objectMaxProperties: e.OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES,
        },
        ObjectName: { base: { color: e.OBJECT_NAME_COLOR }, dimmed: { opacity: 0.6 } },
        ObjectValue: {
          objectValueNull: { color: e.OBJECT_VALUE_NULL_COLOR },
          objectValueUndefined: { color: e.OBJECT_VALUE_UNDEFINED_COLOR },
          objectValueRegExp: { color: e.OBJECT_VALUE_REGEXP_COLOR },
          objectValueString: { color: e.OBJECT_VALUE_STRING_COLOR },
          objectValueSymbol: { color: e.OBJECT_VALUE_SYMBOL_COLOR },
          objectValueNumber: { color: e.OBJECT_VALUE_NUMBER_COLOR },
          objectValueBoolean: { color: e.OBJECT_VALUE_BOOLEAN_COLOR },
          objectValueFunctionPrefix: {
            color: e.OBJECT_VALUE_FUNCTION_PREFIX_COLOR,
            fontStyle: 'italic',
          },
          objectValueFunctionName: { fontStyle: 'italic' },
        },
        TreeView: { treeViewOutline: { padding: 0, margin: 0, listStyleType: 'none' } },
        TreeNode: {
          treeNodeBase: {
            color: e.BASE_COLOR,
            backgroundColor: e.BASE_BACKGROUND_COLOR,
            lineHeight: e.TREENODE_LINE_HEIGHT,
            cursor: 'default',
            boxSizing: 'border-box',
            listStyle: 'none',
            fontFamily: e.TREENODE_FONT_FAMILY,
            fontSize: e.TREENODE_FONT_SIZE,
          },
          treeNodePreviewContainer: {},
          treeNodePlaceholder: {
            whiteSpace: 'pre',
            fontSize: e.ARROW_FONT_SIZE,
            marginRight: e.ARROW_MARGIN_RIGHT,
            ...$i,
          },
          treeNodeArrow: {
            base: {
              color: e.ARROW_COLOR,
              display: 'inline-block',
              fontSize: e.ARROW_FONT_SIZE,
              marginRight: e.ARROW_MARGIN_RIGHT,
              ...(parseFloat(e.ARROW_ANIMATION_DURATION) > 0
                ? { transition: `transform ${e.ARROW_ANIMATION_DURATION} ease 0s` }
                : {}),
              ...$i,
            },
            expanded: {
              WebkitTransform: 'rotateZ(90deg)',
              MozTransform: 'rotateZ(90deg)',
              transform: 'rotateZ(90deg)',
            },
            collapsed: {
              WebkitTransform: 'rotateZ(0deg)',
              MozTransform: 'rotateZ(0deg)',
              transform: 'rotateZ(0deg)',
            },
          },
          treeNodeChildNodesContainer: { margin: 0, paddingLeft: e.TREENODE_PADDING_LEFT },
        },
        TableInspector: {
          base: {
            color: e.BASE_COLOR,
            position: 'relative',
            border: `1px solid ${e.TABLE_BORDER_COLOR}`,
            fontFamily: e.BASE_FONT_FAMILY,
            fontSize: e.BASE_FONT_SIZE,
            lineHeight: '120%',
            boxSizing: 'border-box',
            cursor: 'default',
          },
        },
        TableInspectorHeaderContainer: {
          base: { top: 0, height: '17px', left: 0, right: 0, overflowX: 'hidden' },
          table: {
            tableLayout: 'fixed',
            borderSpacing: 0,
            borderCollapse: 'separate',
            height: '100%',
            width: '100%',
            margin: 0,
          },
        },
        TableInspectorDataContainer: {
          tr: { display: 'table-row' },
          td: {
            boxSizing: 'border-box',
            border: 'none',
            height: '16px',
            verticalAlign: 'top',
            padding: '1px 4px',
            WebkitUserSelect: 'text',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            lineHeight: '14px',
          },
          div: {
            position: 'static',
            top: '17px',
            bottom: 0,
            overflowY: 'overlay',
            transform: 'translateZ(0)',
            left: 0,
            right: 0,
            overflowX: 'hidden',
          },
          table: {
            positon: 'static',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            borderTop: '0 none transparent',
            margin: 0,
            backgroundImage: e.TABLE_DATA_BACKGROUND_IMAGE,
            backgroundSize: e.TABLE_DATA_BACKGROUND_SIZE,
            tableLayout: 'fixed',
            borderSpacing: 0,
            borderCollapse: 'separate',
            width: '100%',
            fontSize: e.BASE_FONT_SIZE,
            lineHeight: '120%',
          },
        },
        TableInspectorTH: {
          base: {
            position: 'relative',
            height: 'auto',
            textAlign: 'left',
            backgroundColor: e.TABLE_TH_BACKGROUND_COLOR,
            borderBottom: `1px solid ${e.TABLE_BORDER_COLOR}`,
            fontWeight: 'normal',
            verticalAlign: 'middle',
            padding: '0 4px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            lineHeight: '14px',
            ':hover': { backgroundColor: e.TABLE_TH_HOVER_COLOR },
          },
          div: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: e.BASE_FONT_SIZE,
            lineHeight: '120%',
          },
        },
        TableInspectorLeftBorder: {
          none: { borderLeft: 'none' },
          solid: { borderLeft: `1px solid ${e.TABLE_BORDER_COLOR}` },
        },
        TableInspectorSortIcon: {
          display: 'block',
          marginRight: 3,
          width: 8,
          height: 7,
          marginTop: -7,
          color: e.TABLE_SORT_ICON_COLOR,
          fontSize: 12,
          ...$i,
        },
      }),
      Xi = 'chromeLight',
      em = In(_o(Oo[Xi])),
      at = (e) => Dn(em)[e],
      ds =
        (e) =>
        ({ theme: t = Xi, ...r }) => {
          let n = we(() => {
            switch (Object.prototype.toString.call(t)) {
              case '[object String]':
                return _o(Oo[t]);
              case '[object Object]':
                return _o(t);
              default:
                return _o(Oo[Xi]);
            }
          }, [t]);
          return u.createElement(em.Provider, { value: n }, u.createElement(e, { ...r }));
        },
      NA = ({ expanded: e, styles: t }) =>
        u.createElement(
          'span',
          { style: { ...t.base, ...(e ? t.expanded : t.collapsed) } },
          '\u25B6',
        ),
      kA = Ze((e) => {
        e = {
          expanded: !0,
          nodeRenderer: ({ name: p }) => u.createElement('span', null, p),
          onClick: () => {},
          shouldShowArrow: !1,
          shouldShowPlaceholder: !0,
          ...e,
        };
        let {
            expanded: t,
            onClick: r,
            children: n,
            nodeRenderer: o,
            title: i,
            shouldShowArrow: a,
            shouldShowPlaceholder: l,
          } = e,
          s = at('TreeNode'),
          d = o;
        return u.createElement(
          'li',
          { 'aria-expanded': t, role: 'treeitem', style: s.treeNodeBase, title: i },
          u.createElement(
            'div',
            { style: s.treeNodePreviewContainer, onClick: r },
            a || Ks.count(n) > 0
              ? u.createElement(NA, { expanded: t, styles: s.treeNodeArrow })
              : l && u.createElement('span', { style: s.treeNodePlaceholder }, '\xA0'),
            u.createElement(d, { ...e }),
          ),
          u.createElement(
            'ol',
            { role: 'group', style: s.treeNodeChildNodesContainer },
            t ? n : void 0,
          ),
        );
      }),
      Ro = '$',
      fp = '*';
    function vo(e, t) {
      return !t(e).next().done;
    }
    var FA = (e) =>
        Array.from({ length: e }, (t, r) =>
          [Ro].concat(Array.from({ length: r }, () => '*')).join('.'),
        ),
      LA = (e, t, r, n, o) => {
        let i = []
            .concat(FA(n))
            .concat(r)
            .filter((l) => typeof l == 'string'),
          a = [];
        return (
          i.forEach((l) => {
            let s = l.split('.'),
              d = (p, m, h) => {
                if (h === s.length) {
                  a.push(m);
                  return;
                }
                let g = s[h];
                if (h === 0) vo(p, t) && (g === Ro || g === fp) && d(p, Ro, h + 1);
                else if (g === fp)
                  for (let { name: E, data: b } of t(p)) vo(b, t) && d(b, `${m}.${E}`, h + 1);
                else {
                  let E = p[g];
                  vo(E, t) && d(E, `${m}.${g}`, h + 1);
                }
              };
            d(e, '', 0);
          }),
          a.reduce((l, s) => ((l[s] = !0), l), { ...o })
        );
      },
      tm = Ze((e) => {
        let { data: t, dataIterator: r, path: n, depth: o, nodeRenderer: i } = e,
          [a, l] = Dn(Qp),
          s = vo(t, r),
          d = !!a[n],
          p = se(() => s && l((m) => ({ ...m, [n]: !d })), [s, l, n, d]);
        return u.createElement(
          kA,
          {
            expanded: d,
            onClick: p,
            shouldShowArrow: s,
            shouldShowPlaceholder: o > 0,
            nodeRenderer: i,
            ...e,
          },
          d
            ? [...r(t)].map(({ name: m, data: h, ...g }) =>
                u.createElement(tm, {
                  name: m,
                  data: h,
                  depth: o + 1,
                  path: `${n}.${m}`,
                  key: m,
                  dataIterator: r,
                  nodeRenderer: i,
                  ...g,
                }),
              )
            : null,
        );
      }),
      rm = Ze(
        ({
          name: e,
          data: t,
          dataIterator: r,
          nodeRenderer: n,
          expandPaths: o,
          expandLevel: i,
        }) => {
          let a = at('TreeView'),
            l = X({}),
            [, s] = l;
          return (
            Pn(() => s((d) => LA(t, r, o, i, d)), [t, r, o, i]),
            u.createElement(
              Qp.Provider,
              { value: l },
              u.createElement(
                'ol',
                { role: 'tree', style: a.treeViewOutline },
                u.createElement(tm, {
                  name: e,
                  data: t,
                  dataIterator: r,
                  depth: 0,
                  path: Ro,
                  nodeRenderer: n,
                }),
              ),
            )
          );
        },
      ),
      ps = ({ name: e, dimmed: t = !1, styles: r = {} }) => {
        let n = at('ObjectName'),
          o = { ...n.base, ...(t ? n.dimmed : {}), ...r };
        return u.createElement('span', { style: o }, e);
      },
      yn = ({ object: e, styles: t }) => {
        let r = at('ObjectValue'),
          n = (o) => ({ ...r[o], ...t });
        switch (typeof e) {
          case 'bigint':
            return u.createElement('span', { style: n('objectValueNumber') }, String(e), 'n');
          case 'number':
            return u.createElement('span', { style: n('objectValueNumber') }, String(e));
          case 'string':
            return u.createElement('span', { style: n('objectValueString') }, '"', e, '"');
          case 'boolean':
            return u.createElement('span', { style: n('objectValueBoolean') }, String(e));
          case 'undefined':
            return u.createElement('span', { style: n('objectValueUndefined') }, 'undefined');
          case 'object':
            return e === null
              ? u.createElement('span', { style: n('objectValueNull') }, 'null')
              : e instanceof Date
                ? u.createElement('span', null, e.toString())
                : e instanceof RegExp
                  ? u.createElement('span', { style: n('objectValueRegExp') }, e.toString())
                  : Array.isArray(e)
                    ? u.createElement('span', null, `Array(${e.length})`)
                    : e.constructor
                      ? typeof e.constructor.isBuffer == 'function' && e.constructor.isBuffer(e)
                        ? u.createElement('span', null, `Buffer[${e.length}]`)
                        : u.createElement('span', null, e.constructor.name)
                      : u.createElement('span', null, 'Object');
          case 'function':
            return u.createElement(
              'span',
              null,
              u.createElement('span', { style: n('objectValueFunctionPrefix') }, '\u0192\xA0'),
              u.createElement('span', { style: n('objectValueFunctionName') }, e.name, '()'),
            );
          case 'symbol':
            return u.createElement('span', { style: n('objectValueSymbol') }, e.toString());
          default:
            return u.createElement('span', null);
        }
      },
      nm = Object.prototype.hasOwnProperty,
      BA = Object.prototype.propertyIsEnumerable;
    function Zi(e, t) {
      let r = Object.getOwnPropertyDescriptor(e, t);
      if (r.get)
        try {
          return r.get();
        } catch {
          return r.get;
        }
      return e[t];
    }
    function gp(e, t) {
      return e.length === 0 ? [] : e.slice(1).reduce((r, n) => r.concat([t, n]), [e[0]]);
    }
    var Qi = ({ data: e }) => {
        let t = at('ObjectPreview'),
          r = e;
        if (typeof r != 'object' || r === null || r instanceof Date || r instanceof RegExp)
          return u.createElement(yn, { object: r });
        if (Array.isArray(r)) {
          let n = t.arrayMaxProperties,
            o = r.slice(0, n).map((a, l) => u.createElement(yn, { key: l, object: a }));
          r.length > n && o.push(u.createElement('span', { key: 'ellipsis' }, '\u2026'));
          let i = r.length;
          return u.createElement(
            u.Fragment,
            null,
            u.createElement('span', { style: t.objectDescription }, i === 0 ? '' : `(${i})\xA0`),
            u.createElement('span', { style: t.preview }, '[', gp(o, ', '), ']'),
          );
        } else {
          let n = t.objectMaxProperties,
            o = [];
          for (let a in r)
            if (nm.call(r, a)) {
              let l;
              o.length === n - 1 &&
                Object.keys(r).length > n &&
                (l = u.createElement('span', { key: 'ellipsis' }, '\u2026'));
              let s = Zi(r, a);
              if (
                (o.push(
                  u.createElement(
                    'span',
                    { key: a },
                    u.createElement(ps, { name: a || '""' }),
                    ':\xA0',
                    u.createElement(yn, { object: s }),
                    l,
                  ),
                ),
                l)
              )
                break;
            }
          let i = r.constructor ? r.constructor.name : 'Object';
          return u.createElement(
            u.Fragment,
            null,
            u.createElement('span', { style: t.objectDescription }, i === 'Object' ? '' : `${i} `),
            u.createElement('span', { style: t.preview }, '{', gp(o, ', '), '}'),
          );
        }
      },
      MA = ({ name: e, data: t }) =>
        typeof e == 'string'
          ? u.createElement(
              'span',
              null,
              u.createElement(ps, { name: e }),
              u.createElement('span', null, ': '),
              u.createElement(Qi, { data: t }),
            )
          : u.createElement(Qi, { data: t }),
      $A = ({ name: e, data: t, isNonenumerable: r = !1 }) => {
        let n = t;
        return u.createElement(
          'span',
          null,
          typeof e == 'string'
            ? u.createElement(ps, { name: e, dimmed: r })
            : u.createElement(Qi, { data: e }),
          u.createElement('span', null, ': '),
          u.createElement(yn, { object: n }),
        );
      },
      jA = (e, t) =>
        function* (r) {
          if (!((typeof r == 'object' && r !== null) || typeof r == 'function')) return;
          let n = Array.isArray(r);
          if (!n && r[Symbol.iterator]) {
            let o = 0;
            for (let i of r) {
              if (Array.isArray(i) && i.length === 2) {
                let [a, l] = i;
                yield { name: a, data: l };
              } else yield { name: o.toString(), data: i };
              o++;
            }
          } else {
            let o = Object.getOwnPropertyNames(r);
            t === !0 && !n ? o.sort() : typeof t == 'function' && o.sort(t);
            for (let i of o)
              if (BA.call(r, i)) {
                let a = Zi(r, i);
                yield { name: i || '""', data: a };
              } else if (e) {
                let a;
                try {
                  a = Zi(r, i);
                } catch {}
                a !== void 0 && (yield { name: i, data: a, isNonenumerable: !0 });
              }
            e &&
              r !== Object.prototype &&
              (yield { name: '__proto__', data: Object.getPrototypeOf(r), isNonenumerable: !0 });
          }
        },
      UA = ({ depth: e, name: t, data: r, isNonenumerable: n }) =>
        e === 0
          ? u.createElement(MA, { name: t, data: r })
          : u.createElement($A, { name: t, data: r, isNonenumerable: n }),
      VA = ({ showNonenumerable: e = !1, sortObjectKeys: t, nodeRenderer: r, ...n }) => {
        let o = jA(e, t),
          i = r || UA;
        return u.createElement(rm, { nodeRenderer: i, dataIterator: o, ...n });
      },
      HA = ds(VA);
    function JA(e) {
      if (typeof e == 'object') {
        let t = [];
        if (Array.isArray(e)) {
          let n = e.length;
          t = [...Array(n).keys()];
        } else e !== null && (t = Object.keys(e));
        let r = t.reduce((n, o) => {
          let i = e[o];
          return (
            typeof i == 'object' &&
              i !== null &&
              Object.keys(i).reduce((a, l) => (a.includes(l) || a.push(l), a), n),
            n
          );
        }, []);
        return { rowHeaders: t, colHeaders: r };
      }
    }
    var qA = ({ rows: e, columns: t, rowsData: r }) => {
        let n = at('TableInspectorDataContainer'),
          o = at('TableInspectorLeftBorder');
        return u.createElement(
          'div',
          { style: n.div },
          u.createElement(
            'table',
            { style: n.table },
            u.createElement('colgroup', null),
            u.createElement(
              'tbody',
              null,
              e.map((i, a) =>
                u.createElement(
                  'tr',
                  { key: i, style: n.tr },
                  u.createElement('td', { style: { ...n.td, ...o.none } }, i),
                  t.map((l) => {
                    let s = r[a];
                    return typeof s == 'object' && s !== null && nm.call(s, l)
                      ? u.createElement(
                          'td',
                          { key: l, style: { ...n.td, ...o.solid } },
                          u.createElement(yn, { object: s[l] }),
                        )
                      : u.createElement('td', { key: l, style: { ...n.td, ...o.solid } });
                  }),
                ),
              ),
            ),
          ),
        );
      },
      zA = (e) =>
        u.createElement(
          'div',
          {
            style: {
              position: 'absolute',
              top: 1,
              right: 0,
              bottom: 1,
              display: 'flex',
              alignItems: 'center',
            },
          },
          e.children,
        ),
      GA = ({ sortAscending: e }) => {
        let t = at('TableInspectorSortIcon'),
          r = e ? '\u25B2' : '\u25BC';
        return u.createElement('div', { style: t }, r);
      },
      yp = ({
        sortAscending: e = !1,
        sorted: t = !1,
        onClick: r = void 0,
        borderStyle: n = {},
        children: o,
        ...i
      }) => {
        let a = at('TableInspectorTH'),
          [l, s] = X(!1),
          d = se(() => s(!0), []),
          p = se(() => s(!1), []);
        return u.createElement(
          'th',
          {
            ...i,
            style: { ...a.base, ...n, ...(l ? a.base[':hover'] : {}) },
            onMouseEnter: d,
            onMouseLeave: p,
            onClick: r,
          },
          u.createElement('div', { style: a.div }, o),
          t && u.createElement(zA, null, u.createElement(GA, { sortAscending: e })),
        );
      },
      WA = ({
        indexColumnText: e = '(index)',
        columns: t = [],
        sorted: r,
        sortIndexColumn: n,
        sortColumn: o,
        sortAscending: i,
        onTHClick: a,
        onIndexTHClick: l,
      }) => {
        let s = at('TableInspectorHeaderContainer'),
          d = at('TableInspectorLeftBorder');
        return u.createElement(
          'div',
          { style: s.base },
          u.createElement(
            'table',
            { style: s.table },
            u.createElement(
              'tbody',
              null,
              u.createElement(
                'tr',
                null,
                u.createElement(
                  yp,
                  { borderStyle: d.none, sorted: r && n, sortAscending: i, onClick: l },
                  e,
                ),
                t.map((p) =>
                  u.createElement(
                    yp,
                    {
                      borderStyle: d.solid,
                      key: p,
                      sorted: r && o === p,
                      sortAscending: i,
                      onClick: a.bind(null, p),
                    },
                    p,
                  ),
                ),
              ),
            ),
          ),
        );
      },
      YA = ({ data: e, columns: t }) => {
        let r = at('TableInspector'),
          [{ sorted: n, sortIndexColumn: o, sortColumn: i, sortAscending: a }, l] = X({
            sorted: !1,
            sortIndexColumn: !1,
            sortColumn: void 0,
            sortAscending: !1,
          }),
          s = se(() => {
            l(({ sortIndexColumn: E, sortAscending: b }) => ({
              sorted: !0,
              sortIndexColumn: !0,
              sortColumn: void 0,
              sortAscending: E ? !b : !0,
            }));
          }, []),
          d = se((E) => {
            l(({ sortColumn: b, sortAscending: _ }) => ({
              sorted: !0,
              sortIndexColumn: !1,
              sortColumn: E,
              sortAscending: E === b ? !_ : !0,
            }));
          }, []);
        if (typeof e != 'object' || e === null) return u.createElement('div', null);
        let { rowHeaders: p, colHeaders: m } = JA(e);
        t !== void 0 && (m = t);
        let h = p.map((E) => e[E]),
          g;
        if (
          (i !== void 0
            ? (g = h.map((E, b) => (typeof E == 'object' && E !== null ? [E[i], b] : [void 0, b])))
            : o && (g = p.map((E, b) => [p[b], b])),
          g !== void 0)
        ) {
          let E = (_, y) => (S, A) => {
              let T = _(S),
                C = _(A),
                x = typeof T,
                v = typeof C,
                I = (B, F) => (B < F ? -1 : B > F ? 1 : 0),
                N;
              if (x === v) N = I(T, C);
              else {
                let B = {
                  string: 0,
                  number: 1,
                  object: 2,
                  symbol: 3,
                  boolean: 4,
                  undefined: 5,
                  function: 6,
                };
                N = I(B[x], B[v]);
              }
              return (y || (N = -N), N);
            },
            b = g.sort(E((_) => _[0], a)).map((_) => _[1]);
          ((p = b.map((_) => p[_])), (h = b.map((_) => h[_])));
        }
        return u.createElement(
          'div',
          { style: r.base },
          u.createElement(WA, {
            columns: m,
            sorted: n,
            sortIndexColumn: o,
            sortColumn: i,
            sortAscending: a,
            onTHClick: d,
            onIndexTHClick: s,
          }),
          u.createElement(qA, { rows: p, columns: m, rowsData: h }),
        );
      },
      KA = ds(YA),
      XA = 80,
      om = (e) =>
        e.childNodes.length === 0 ||
        (e.childNodes.length === 1 &&
          e.childNodes[0].nodeType === Node.TEXT_NODE &&
          e.textContent.length < XA),
      ZA = ({ tagName: e, attributes: t, styles: r }) =>
        u.createElement(
          'span',
          { style: r.base },
          '<',
          u.createElement('span', { style: r.tagName }, e),
          (() => {
            if (t) {
              let n = [];
              for (let o = 0; o < t.length; o++) {
                let i = t[o];
                n.push(
                  u.createElement(
                    'span',
                    { key: o },
                    ' ',
                    u.createElement('span', { style: r.htmlAttributeName }, i.name),
                    '="',
                    u.createElement('span', { style: r.htmlAttributeValue }, i.value),
                    '"',
                  ),
                );
              }
              return n;
            }
          })(),
          '>',
        ),
      bp = ({ tagName: e, isChildNode: t = !1, styles: r }) =>
        u.createElement(
          'span',
          { style: Object.assign({}, r.base, t && r.offsetLeft) },
          '</',
          u.createElement('span', { style: r.tagName }, e),
          '>',
        ),
      QA = {
        1: 'ELEMENT_NODE',
        3: 'TEXT_NODE',
        7: 'PROCESSING_INSTRUCTION_NODE',
        8: 'COMMENT_NODE',
        9: 'DOCUMENT_NODE',
        10: 'DOCUMENT_TYPE_NODE',
        11: 'DOCUMENT_FRAGMENT_NODE',
      },
      eT = ({ isCloseTag: e, data: t, expanded: r }) => {
        let n = at('DOMNodePreview');
        if (e)
          return u.createElement(bp, {
            styles: n.htmlCloseTag,
            isChildNode: !0,
            tagName: t.tagName,
          });
        switch (t.nodeType) {
          case Node.ELEMENT_NODE:
            return u.createElement(
              'span',
              null,
              u.createElement(ZA, {
                tagName: t.tagName,
                attributes: t.attributes,
                styles: n.htmlOpenTag,
              }),
              om(t) ? t.textContent : !r && '\u2026',
              !r && u.createElement(bp, { tagName: t.tagName, styles: n.htmlCloseTag }),
            );
          case Node.TEXT_NODE:
            return u.createElement('span', null, t.textContent);
          case Node.CDATA_SECTION_NODE:
            return u.createElement('span', null, '<![CDATA[' + t.textContent + ']]>');
          case Node.COMMENT_NODE:
            return u.createElement('span', { style: n.htmlComment }, '<!--', t.textContent, '-->');
          case Node.PROCESSING_INSTRUCTION_NODE:
            return u.createElement('span', null, t.nodeName);
          case Node.DOCUMENT_TYPE_NODE:
            return u.createElement(
              'span',
              { style: n.htmlDoctype },
              '<!DOCTYPE ',
              t.name,
              t.publicId ? ` PUBLIC "${t.publicId}"` : '',
              !t.publicId && t.systemId ? ' SYSTEM' : '',
              t.systemId ? ` "${t.systemId}"` : '',
              '>',
            );
          case Node.DOCUMENT_NODE:
            return u.createElement('span', null, t.nodeName);
          case Node.DOCUMENT_FRAGMENT_NODE:
            return u.createElement('span', null, t.nodeName);
          default:
            return u.createElement('span', null, QA[t.nodeType]);
        }
      },
      tT = function* (e) {
        if (e && e.childNodes) {
          if (om(e)) return;
          for (let t = 0; t < e.childNodes.length; t++) {
            let r = e.childNodes[t];
            (r.nodeType === Node.TEXT_NODE && r.textContent.trim().length === 0) ||
              (yield { name: `${r.tagName}[${t}]`, data: r });
          }
          e.tagName && (yield { name: 'CLOSE_TAG', data: { tagName: e.tagName }, isCloseTag: !0 });
        }
      },
      rT = (e) => u.createElement(rm, { nodeRenderer: eT, dataIterator: tT, ...e }),
      nT = ds(rT),
      oT = CA(IA()),
      aT = ({ table: e = !1, data: t, ...r }) =>
        e
          ? u.createElement(KA, { data: t, ...r })
          : (0, oT.default)(t)
            ? u.createElement(nT, { data: t, ...r })
            : u.createElement(HA, { data: t, ...r }),
      iT = P.div({
        display: 'flex',
        padding: 0,
        borderLeft: '5px solid transparent',
        borderBottom: '1px solid transparent',
        transition: 'all 0.1s',
        alignItems: 'flex-start',
        whiteSpace: 'pre',
      }),
      sT = P.div(({ theme: e }) => ({
        backgroundColor: Qr(0.5, e.appBorderColor),
        color: e.color.inverseText,
        fontSize: e.typography.size.s1,
        fontWeight: e.typography.weight.bold,
        lineHeight: 1,
        padding: '1px 5px',
        borderRadius: 20,
        margin: '2px 0px',
      })),
      lT = P.div({ flex: 1, padding: '0 0 0 5px' }),
      am = Zs(({ children: e, className: t }, r) =>
        u.createElement(ol, { ref: r, horizontal: !0, vertical: !0, className: t }, e),
      );
    am.displayName = 'UnstyledWrapped';
    var uT = P(am)({ margin: 0, padding: '10px 5px 20px' }),
      cT = ql(({ theme: e, ...t }) =>
        u.createElement(aT, { theme: e.addonActionsTheme || 'chromeLight', table: !1, ...t }),
      ),
      dT = ({ actions: e, expandLevel: t, onClear: r }) => {
        let n = he(null),
          o = n.current,
          i = o && o.scrollHeight - o.scrollTop === o.clientHeight;
        return (
          ee(() => {
            i && (n.current.scrollTop = n.current.scrollHeight);
          }, [i, e.length]),
          u.createElement(
            Ht,
            null,
            u.createElement(
              uT,
              { ref: n },
              e.map((a) =>
                u.createElement(
                  iT,
                  { key: a.id },
                  a.count > 1 && u.createElement(sT, null, a.count),
                  u.createElement(
                    lT,
                    null,
                    u.createElement(cT, {
                      sortObjectKeys: !0,
                      showNonenumerable: !1,
                      name: a.data.name,
                      data: a.data.args ?? a.data,
                      expandLevel: t,
                    }),
                  ),
                ),
              ),
            ),
            u.createElement(el, { actionItems: [{ title: 'Clear', onClick: r }] }),
          )
        );
      },
      pT = (e, t) => {
        try {
          return $t(e, t);
        } catch {
          return !1;
        }
      };
    function mT({ active: e, api: t }) {
      let [r, n] = X([]),
        o = Tt(Ta)?.expandLevel ?? 1,
        i = se(() => {
          (t.emit(_a), n([]));
        }, [t]),
        a = se((d) => {
          n((p) => {
            let m = d.options.limit ?? 50,
              h = p.length ? p[p.length - 1] : null;
            if (h && pT(h.data, d.data)) {
              let g = [...p];
              return ((g[g.length - 1] = { ...h, count: h.count + 1 }), g.slice(-m));
            } else {
              let g = { ...d, count: 1 };
              return [...p, g].slice(-m);
            }
          });
        }, []),
        l = se(() => {
          r.length > 0 && r[0].options.clearOnStoryChange && i();
        }, [r, i]);
      ee(
        () => (
          t.on(Or, a),
          t.on(Dr, l),
          () => {
            (t.off(Or, a), t.off(Dr, l));
          }
        ),
        [t, a, l],
      );
      let s = we(() => ({ actions: r, expandLevel: o, onClear: i }), [r, o, i]);
      return e ? u.createElement(dT, { ...s }) : null;
    }
    var p9 = Oe.register(Cr, (e) => {
        globalThis?.FEATURES?.actions &&
          Oe.add(wa, {
            title: SA,
            type: Qe.PANEL,
            render: ({ active: t }) => u.createElement(mT, { api: e, active: !!t }),
            paramKey: Ta,
          });
      }),
      Lo = 'storybook/interactions',
      ms = `${Lo}/panel`,
      hT = 'interactions',
      fT = 'writing-tests/integrations/vitest-addon',
      gT = `${fT}#what-happens-when-there-are-different-test-results-in-multiple-environments`,
      yT = 'writing-stories/play-function#writing-stories-with-the-play-function',
      xt = 'internal_render_call',
      Zt = 'storybook/a11y',
      S9 = `${Zt}/panel`,
      A9 = `${Zt}/ui`,
      T9 = `${Zt}/result`,
      w9 = `${Zt}/request`,
      _9 = `${Zt}/running`,
      v9 = `${Zt}/error`,
      x9 = `${Zt}/manual`,
      C9 = `${Zt}/select`,
      bT = 'writing-tests/accessibility-testing',
      O9 = `${bT}#why-are-my-tests-failing-in-different-environments`,
      En = 'storybook/test',
      R9 = `${En}/test-provider`,
      ET = `${En}/channel`,
      ST = 'writing-tests/integrations/vitest-addon',
      I9 = `${ST}#what-happens-if-vitest-itself-has-an-error`,
      AT = {
        id: En,
        initialState: {
          config: { coverage: !1, a11y: !1 },
          watching: !1,
          cancelling: !1,
          fatalError: void 0,
          index: { entries: {}, v: 5 },
          previewAnnotations: [],
          currentRun: {
            triggeredBy: void 0,
            config: { coverage: !1, a11y: !1 },
            componentTestStatuses: [],
            a11yStatuses: [],
            a11yReports: {},
            reports: {},
            componentTestCount: { success: 0, error: 0 },
            a11yCount: { success: 0, warning: 0, error: 0 },
            storyIds: void 0,
            totalTestCount: void 0,
            startedAt: void 0,
            finishedAt: void 0,
            unhandledErrors: [],
            coverageSummary: void 0,
          },
        },
      },
      D9 = `UNIVERSAL_STORE:${AT.id}`,
      TT = 'storybook/component-test',
      P9 = `${En}/trigger-test-run-request`,
      N9 = `${En}/trigger-test-run-response`,
      wT = We(On(), 1);
    function _T({ onlyFirst: e = !1 } = {}) {
      let t = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
      ].join('|');
      return new RegExp(t, e ? void 0 : 'g');
    }
    var vT = _T();
    function xT(e) {
      if (typeof e != 'string') throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);
      return e.replace(vT, '');
    }
    function CT(e) {
      return !!e?.[hT]?.disable;
    }
    function OT(e) {
      return im(e) || sm(e);
    }
    function im(e) {
      return (
        e &&
        typeof e == 'object' &&
        'name' in e &&
        typeof e.name == 'string' &&
        e.name === 'AssertionError'
      );
    }
    function sm(e) {
      return (
        e &&
        typeof e == 'object' &&
        'message' in e &&
        typeof e.message == 'string' &&
        xT(e.message).startsWith('expect(')
      );
    }
    function RT(e) {
      return new wT.default({ escapeXML: !0, fg: e.color.defaultText, bg: e.background.content });
    }
    function hs() {
      let e = st();
      return RT(e);
    }
    var IT = P.div(({ theme: { color: e, typography: t, background: r } }) => ({
        textAlign: 'start',
        padding: '11px 15px',
        fontSize: `${t.size.s2 - 1}px`,
        fontWeight: t.weight.regular,
        lineHeight: '1rem',
        background: r.app,
        borderBottom: `1px solid ${e.border}`,
        color: e.defaultText,
        backgroundClip: 'padding-box',
        position: 'relative',
      })),
      DT = ({ storyUrl: e }) =>
        u.createElement(
          IT,
          null,
          'Debugger controls are not available on composed Storybooks.',
          ' ',
          u.createElement(
            ot,
            {
              href: `${e}&addonPanel=${ms}`,
              target: '_blank',
              rel: 'noopener noreferrer',
              withArrow: !0,
            },
            'Open in external Storybook',
          ),
        ),
      PT = P.div(({ theme: e }) => ({
        display: 'flex',
        fontSize: e.typography.size.s2 - 1,
        gap: 25,
      })),
      NT = () => {
        let [e, t] = X(!0),
          r = Pe().getDocsUrl({ subpath: yT, versioned: !0, renderer: !0 });
        return (
          ee(() => {
            let n = setTimeout(() => {
              t(!1);
            }, 100);
            return () => clearTimeout(n);
          }, []),
          e
            ? null
            : u.createElement(
                'div',
                null,
                u.createElement(Fn, {
                  title: 'Interactions',
                  description: u.createElement(
                    u.Fragment,
                    null,
                    "Interactions allow you to verify the functional aspects of UIs. Write a play function for your story and you'll see it run here.",
                  ),
                  footer: u.createElement(
                    PT,
                    null,
                    u.createElement(
                      ot,
                      { href: r, target: '_blank', withArrow: !0 },
                      u.createElement(lr, null),
                      ' Read docs',
                    ),
                  ),
                }),
              )
        );
      };
    function es(e) {
      var t,
        r,
        n = '';
      if (e)
        if (typeof e == 'object')
          if (Array.isArray(e))
            for (t = 0; t < e.length; t++) e[t] && (r = es(e[t])) && (n && (n += ' '), (n += r));
          else for (t in e) e[t] && (r = es(t)) && (n && (n += ' '), (n += r));
        else typeof e != 'boolean' && !e.call && (n && (n += ' '), (n += e));
      return n;
    }
    function Io() {
      for (var e = 0, t, r = ''; e < arguments.length;)
        (t = es(arguments[e++])) && (r && (r += ' '), (r += t));
      return r;
    }
    var fs = (e) => Array.isArray(e) || (ArrayBuffer.isView(e) && !(e instanceof DataView)),
      lm = (e) =>
        e !== null &&
        typeof e == 'object' &&
        !fs(e) &&
        !(e instanceof Date) &&
        !(e instanceof RegExp) &&
        !(e instanceof Error) &&
        !(e instanceof WeakMap) &&
        !(e instanceof WeakSet),
      kT = (e) => lm(e) || fs(e) || typeof e == 'function' || e instanceof Promise,
      um = (e) => {
        let t = /unique/;
        return Promise.race([e, t]).then(
          (r) => (r === t ? ['pending'] : ['fulfilled', r]),
          (r) => ['rejected', r],
        );
      },
      vt = async (e, t, r, n, o, i) => {
        let a = { key: e, depth: r, value: t, type: 'value', parent: void 0 };
        if (t && kT(t) && r < 100) {
          let l = [],
            s = 'object';
          if (fs(t)) {
            for (let d = 0; d < t.length; d++)
              l.push(async () => {
                let p = await vt(d.toString(), t[d], r + 1, n);
                return ((p.parent = a), p);
              });
            s = 'array';
          } else {
            let d = Object.getOwnPropertyNames(t);
            n && d.sort();
            for (let p = 0; p < d.length; p++) {
              let m;
              try {
                m = t[d[p]];
              } catch {}
              l.push(async () => {
                let h = await vt(d[p], m, r + 1, n);
                return ((h.parent = a), h);
              });
            }
            if ((typeof t == 'function' && (s = 'function'), t instanceof Promise)) {
              let [p, m] = await um(t);
              (l.push(async () => {
                let h = await vt('<state>', p, r + 1, n);
                return ((h.parent = a), h);
              }),
                p !== 'pending' &&
                  l.push(async () => {
                    let h = await vt('<value>', m, r + 1, n);
                    return ((h.parent = a), h);
                  }),
                (s = 'promise'));
            }
            if (t instanceof Map) {
              let p = Array.from(t.entries()).map((m) => {
                let [h, g] = m;
                return { '<key>': h, '<value>': g };
              });
              (l.push(async () => {
                let m = await vt('<entries>', p, r + 1, n);
                return ((m.parent = a), m);
              }),
                l.push(async () => {
                  let m = await vt('size', t.size, r + 1, n);
                  return ((m.parent = a), m);
                }),
                (s = 'map'));
            }
            if (t instanceof Set) {
              let p = Array.from(t.entries()).map((m) => m[1]);
              (l.push(async () => {
                let m = await vt('<entries>', p, r + 1, n);
                return ((m.parent = a), m);
              }),
                l.push(async () => {
                  let m = await vt('size', t.size, r + 1, n);
                  return ((m.parent = a), m);
                }),
                (s = 'set'));
            }
          }
          (t !== Object.prototype &&
            i &&
            l.push(async () => {
              let d = await vt('<prototype>', Object.getPrototypeOf(t), r + 1, n, !0);
              return ((d.parent = a), d);
            }),
            (a.type = s),
            (a.children = l),
            (a.isPrototype = o));
        }
        return a;
      },
      FT = (e, t, r) => vt('root', e, 0, t === !1 ? t : !0, void 0, r === !1 ? r : !0);
    function Ep(e, t) {
      var r = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        (t &&
          (n = n.filter(function (o) {
            return Object.getOwnPropertyDescriptor(e, o).enumerable;
          })),
          r.push.apply(r, n));
      }
      return r;
    }
    function Do(e) {
      for (var t = 1; t < arguments.length; t++) {
        var r = arguments[t] != null ? arguments[t] : {};
        t % 2
          ? Ep(Object(r), !0).forEach(function (n) {
              xs(e, n, r[n]);
            })
          : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
            : Ep(Object(r)).forEach(function (n) {
                Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
              });
      }
      return e;
    }
    function ts(e) {
      var t,
        r,
        n = '';
      if (e)
        if (typeof e == 'object')
          if (Array.isArray(e))
            for (t = 0; t < e.length; t++) e[t] && (r = ts(e[t])) && (n && (n += ' '), (n += r));
          else for (t in e) e[t] && (r = ts(t)) && (n && (n += ' '), (n += r));
        else typeof e != 'boolean' && !e.call && (n && (n += ' '), (n += e));
      return n;
    }
    function LT() {
      for (var e = 0, t, r = ''; e < arguments.length;)
        (t = ts(arguments[e++])) && (r && (r += ' '), (r += t));
      return r;
    }
    var BT = ['children'],
      rs = u.createContext({ theme: 'chrome', colorScheme: 'light' }),
      MT = (e) => {
        let { children: t } = e,
          r = Sr(e, BT),
          n = u.useContext(rs);
        return u.createElement(rs.Provider, { value: Do(Do({}, n), r) }, t);
      },
      Bo = (e, t = {}) => {
        let r = u.useContext(rs),
          n = e.theme || r.theme || 'chrome',
          o = e.colorScheme || r.colorScheme || 'light',
          i = LT(t[n], t[o]);
        return { currentColorScheme: o, currentTheme: n, themeClass: i };
      };
    function ns(e) {
      var t,
        r,
        n = '';
      if (e)
        if (typeof e == 'object')
          if (Array.isArray(e))
            for (t = 0; t < e.length; t++) e[t] && (r = ns(e[t])) && (n && (n += ' '), (n += r));
          else for (t in e) e[t] && (r = ns(t)) && (n && (n += ' '), (n += r));
        else typeof e != 'boolean' && !e.call && (n && (n += ' '), (n += e));
      return n;
    }
    function hn() {
      for (var e = 0, t, r = ''; e < arguments.length;)
        (t = ns(arguments[e++])) && (r && (r += ' '), (r += t));
      return r;
    }
    var $T = u.createContext({ isChild: !1, depth: 0, hasHover: !0 }),
      ji = $T,
      et = {
        tree: 'Tree-tree-fbbbe38',
        item: 'Tree-item-353d6f3',
        group: 'Tree-group-d3c3d8a',
        label: 'Tree-label-d819155',
        focusWhite: 'Tree-focusWhite-f1e00c2',
        arrow: 'Tree-arrow-03ab2e7',
        hover: 'Tree-hover-3cc4e5d',
        open: 'Tree-open-3f1a336',
        dark: 'Tree-dark-1b4aa00',
        chrome: 'Tree-chrome-bcbcac6',
        light: 'Tree-light-09174ee',
      },
      jT = [
        'theme',
        'hover',
        'colorScheme',
        'children',
        'label',
        'className',
        'onUpdate',
        'onSelect',
        'open',
      ],
      Po = (e) => {
        let {
            theme: t,
            hover: r,
            colorScheme: n,
            children: o,
            label: i,
            className: a,
            onUpdate: l,
            onSelect: s,
            open: d,
          } = e,
          p = Sr(e, jT),
          { themeClass: m, currentTheme: h } = Bo({ theme: t, colorScheme: n }, et),
          [g, E] = X(d);
        ee(() => {
          E(d);
        }, [d]);
        let b = (M) => {
            (E(M), l && l(M));
          },
          _ = u.Children.count(o) > 0,
          y = (M, J) => {
            if (M.isSameNode(J || null)) return;
            (M.querySelector('[tabindex="-1"]')?.focus(),
              M.setAttribute('aria-selected', 'true'),
              J?.removeAttribute('aria-selected'));
          },
          S = (M, J) => {
            let j = M;
            for (; j && j.parentElement;) {
              if (j.getAttribute('role') === J) return j;
              j = j.parentElement;
            }
            return null;
          },
          A = (M) => {
            let J = S(M, 'tree');
            return J ? Array.from(J.querySelectorAll('li')) : [];
          },
          T = (M) => {
            let J = S(M, 'group'),
              j = J?.previousElementSibling;
            if (j && j.getAttribute('tabindex') === '-1') {
              let W = j.parentElement,
                Z = M.parentElement;
              y(W, Z);
            }
          },
          C = (M, J) => {
            let j = A(M);
            (j.forEach((W) => {
              W.removeAttribute('aria-selected');
            }),
              J === 'start' && j[0] && y(j[0]),
              J === 'end' && j[j.length - 1] && y(j[j.length - 1]));
          },
          x = (M, J) => {
            let j = A(M) || [];
            for (let W = 0; W < j.length; W++) {
              let Z = j[W];
              if (Z.getAttribute('aria-selected') === 'true') {
                J === 'up' && j[W - 1]
                  ? y(j[W - 1], Z)
                  : J === 'down' && j[W + 1] && y(j[W + 1], Z);
                return;
              }
            }
            y(j[0]);
          },
          v = (M, J) => {
            let j = M.target;
            ((M.key === 'Enter' || M.key === ' ') && b(!g),
              M.key === 'ArrowRight' && g && !J ? x(j, 'down') : M.key === 'ArrowRight' && b(!0),
              M.key === 'ArrowLeft' && (!g || J) ? T(j) : M.key === 'ArrowLeft' && b(!1),
              M.key === 'ArrowDown' && x(j, 'down'),
              M.key === 'ArrowUp' && x(j, 'up'),
              M.key === 'Home' && C(j, 'start'),
              M.key === 'End' && C(j, 'end'));
          },
          I = (M, J) => {
            let j = M.target,
              W = S(j, 'treeitem'),
              Z = A(j) || [],
              ue = !1;
            for (let me = 0; me < Z.length; me++) {
              let ie = Z[me];
              if (ie.getAttribute('aria-selected') === 'true') {
                W && ((ue = !0), y(W, ie));
                break;
              }
            }
            (!ue && W && y(W), J || b(!g));
          },
          N = (M) => {
            let J = M.currentTarget;
            !J.contains(document.activeElement) &&
              J.getAttribute('role') === 'tree' &&
              J.setAttribute('tabindex', '0');
          },
          B = (M) => {
            let J = M.target;
            if (J.getAttribute('role') === 'tree') {
              let j = J.querySelector('[aria-selected="true"]');
              (j ? y(j) : x(J, 'down'), J.setAttribute('tabindex', '-1'));
            }
          },
          F = () => {
            s?.();
          },
          z = (M) => {
            let J = M * 0.9 + 0.3;
            return { paddingLeft: `${J}em`, width: `calc(100% - ${J}em)` };
          },
          { isChild: k, depth: R, hasHover: O } = u.useContext(ji),
          L = O ? r : !1;
        if (!k)
          return u.createElement(
            'ul',
            ge(
              {
                role: 'tree',
                tabIndex: 0,
                className: hn(et.tree, et.group, m, a),
                onFocus: B,
                onBlur: N,
              },
              p,
            ),
            u.createElement(
              ji.Provider,
              { value: { isChild: !0, depth: 0, hasHover: L } },
              u.createElement(Po, e),
            ),
          );
        if (!_)
          return u.createElement(
            'li',
            ge({ role: 'treeitem', className: et.item }, p),
            u.createElement(
              'div',
              {
                role: 'button',
                className: hn(et.label, { [et.hover]: L, [et.focusWhite]: h === 'firefox' }),
                tabIndex: -1,
                style: z(R),
                onKeyDown: (M) => {
                  v(M, k);
                },
                onClick: (M) => I(M, !0),
                onFocus: F,
              },
              u.createElement('span', null, i),
            ),
          );
        let $ = hn(et.arrow, { [et.open]: g });
        return u.createElement(
          'li',
          { role: 'treeitem', 'aria-expanded': g, className: et.item },
          u.createElement(
            'div',
            {
              role: 'button',
              tabIndex: -1,
              className: hn(et.label, { [et.hover]: L, [et.focusWhite]: h === 'firefox' }),
              style: z(R),
              onClick: (M) => I(M),
              onKeyDown: (M) => v(M),
              onFocus: F,
            },
            u.createElement(
              'span',
              null,
              u.createElement('span', { 'aria-hidden': !0, className: $ }),
              u.createElement('span', null, i),
            ),
          ),
          u.createElement(
            'ul',
            ge({ role: 'group', className: hn(a, et.group) }, p),
            g &&
              u.Children.map(o, (M) =>
                u.createElement(
                  ji.Provider,
                  { value: { isChild: !0, depth: R + 1, hasHover: L } },
                  M,
                ),
              ),
          ),
        );
      };
    Po.defaultProps = { open: !1, hover: !0 };
    var be = {
        'object-inspector': 'ObjectInspector-object-inspector-0c33e82',
        objectInspector: 'ObjectInspector-object-inspector-0c33e82',
        'object-label': 'ObjectInspector-object-label-b81482b',
        objectLabel: 'ObjectInspector-object-label-b81482b',
        text: 'ObjectInspector-text-25f57f3',
        key: 'ObjectInspector-key-4f712bb',
        value: 'ObjectInspector-value-f7ec2e5',
        string: 'ObjectInspector-string-c496000',
        regex: 'ObjectInspector-regex-59d45a3',
        error: 'ObjectInspector-error-b818698',
        boolean: 'ObjectInspector-boolean-2dd1642',
        number: 'ObjectInspector-number-a6daabb',
        undefined: 'ObjectInspector-undefined-3a68263',
        null: 'ObjectInspector-null-74acb50',
        function: 'ObjectInspector-function-07bbdcd',
        'function-decorator': 'ObjectInspector-function-decorator-3d22c24',
        functionDecorator: 'ObjectInspector-function-decorator-3d22c24',
        prototype: 'ObjectInspector-prototype-f2449ee',
        dark: 'ObjectInspector-dark-0c96c97',
        chrome: 'ObjectInspector-chrome-2f3ca98',
        light: 'ObjectInspector-light-78bef54',
      },
      UT = ['ast', 'theme', 'showKey', 'colorScheme', 'className'],
      tt = (e, t, r, n, o) => {
        let i = e.includes('-') ? `"${e}"` : e,
          a = o <= 0;
        return u.createElement(
          'span',
          { className: be.text },
          !a &&
            n &&
            u.createElement(
              u.Fragment,
              null,
              u.createElement('span', { className: be.key }, i),
              u.createElement('span', null, ':\xA0'),
            ),
          u.createElement('span', { className: r }, t),
        );
      },
      cm = (e) => {
        let { ast: t, theme: r, showKey: n, colorScheme: o, className: i } = e,
          a = Sr(e, UT),
          { themeClass: l } = Bo({ theme: r, colorScheme: o }, be),
          [s, d] = X(u.createElement('span', null)),
          p = u.createElement('span', null);
        return (
          ee(() => {
            t.value instanceof Promise &&
              (async (m) => {
                d(tt(t.key, `Promise { "${await um(m)}" }`, be.key, n, t.depth));
              })(t.value);
          }, [t, n]),
          typeof t.value == 'number' || typeof t.value == 'bigint'
            ? (p = tt(t.key, String(t.value), be.number, n, t.depth))
            : typeof t.value == 'boolean'
              ? (p = tt(t.key, String(t.value), be.boolean, n, t.depth))
              : typeof t.value == 'string'
                ? (p = tt(t.key, `"${t.value}"`, be.string, n, t.depth))
                : typeof t.value > 'u'
                  ? (p = tt(t.key, 'undefined', be.undefined, n, t.depth))
                  : typeof t.value == 'symbol'
                    ? (p = tt(t.key, t.value.toString(), be.string, n, t.depth))
                    : typeof t.value == 'function'
                      ? (p = tt(t.key, `${t.value.name}()`, be.key, n, t.depth))
                      : typeof t.value == 'object' &&
                        (t.value === null
                          ? (p = tt(t.key, 'null', be.null, n, t.depth))
                          : Array.isArray(t.value)
                            ? (p = tt(t.key, `Array(${t.value.length})`, be.key, n, t.depth))
                            : t.value instanceof Date
                              ? (p = tt(t.key, `Date ${t.value.toString()}`, be.value, n, t.depth))
                              : t.value instanceof RegExp
                                ? (p = tt(t.key, t.value.toString(), be.regex, n, t.depth))
                                : t.value instanceof Error
                                  ? (p = tt(t.key, t.value.toString(), be.error, n, t.depth))
                                  : lm(t.value)
                                    ? (p = tt(t.key, '{\u2026}', be.key, n, t.depth))
                                    : (p = tt(
                                        t.key,
                                        t.value.constructor.name,
                                        be.key,
                                        n,
                                        t.depth,
                                      ))),
          u.createElement('span', ge({ className: Io(l, i) }, a), s, p)
        );
      };
    cm.defaultProps = { showKey: !0 };
    var dm = cm,
      VT = ['ast', 'theme', 'previewMax', 'open', 'colorScheme', 'className'],
      Sn = (e, t, r) => {
        let n = [];
        for (let o = 0; o < e.length; o++) {
          let i = e[o];
          if (
            (i.isPrototype ||
              (n.push(u.createElement(dm, { key: i.key, ast: i, showKey: r })),
              o < e.length - 1 ? n.push(', ') : n.push(' ')),
            i.isPrototype && o === e.length - 1 && (n.pop(), n.push(' ')),
            o === t - 1 && e.length > t)
          ) {
            n.push('\u2026 ');
            break;
          }
        }
        return n;
      },
      HT = (e, t, r, n) => {
        let o = e.value.length;
        return t
          ? u.createElement('span', null, 'Array(', o, ')')
          : u.createElement(
              u.Fragment,
              null,
              u.createElement('span', null, `${n === 'firefox' ? 'Array' : ''}(${o}) [ `),
              Sn(e.children, r, !1),
              u.createElement('span', null, ']'),
            );
      },
      JT = (e, t, r, n) =>
        e.isPrototype
          ? u.createElement('span', null, `Object ${n === 'firefox' ? '{ \u2026 }' : ''}`)
          : t
            ? u.createElement('span', null, '{\u2026}')
            : u.createElement(
                u.Fragment,
                null,
                u.createElement('span', null, `${n === 'firefox' ? 'Object ' : ''}{ `),
                Sn(e.children, r, !0),
                u.createElement('span', null, '}'),
              ),
      qT = (e, t, r) =>
        t
          ? u.createElement('span', null, `Promise { "${String(e.children[0].value)}" }`)
          : u.createElement(
              u.Fragment,
              null,
              u.createElement('span', null, 'Promise { '),
              Sn(e.children, r, !0),
              u.createElement('span', null, '}'),
            ),
      zT = (e, t, r, n) => {
        let { size: o } = e.value;
        return t
          ? u.createElement('span', null, `Map(${o})`)
          : u.createElement(
              u.Fragment,
              null,
              u.createElement('span', null, `Map${n === 'chrome' ? `(${o})` : ''} { `),
              Sn(e.children, r, !0),
              u.createElement('span', null, '}'),
            );
      },
      GT = (e, t, r) => {
        let { size: n } = e.value;
        return t
          ? u.createElement('span', null, 'Set(', n, ')')
          : u.createElement(
              u.Fragment,
              null,
              u.createElement('span', null, `Set(${e.value.size}) {`),
              Sn(e.children, r, !0),
              u.createElement('span', null, '}'),
            );
      },
      pm = (e) => {
        let { ast: t, theme: r, previewMax: n, open: o, colorScheme: i, className: a } = e,
          l = Sr(e, VT),
          { themeClass: s, currentTheme: d } = Bo({ theme: r, colorScheme: i }, be),
          p = t.isPrototype || !1,
          m = Io(be.objectLabel, s, a, { [be.prototype]: p }),
          h = t.depth <= 0,
          g = () =>
            u.createElement(
              'span',
              { className: p ? be.prototype : be.key },
              h ? '' : `${t.key}: `,
            );
        return t.type === 'array'
          ? u.createElement(
              'span',
              ge({ className: m }, l),
              u.createElement(g, null),
              HT(t, o, n, d),
            )
          : t.type === 'function'
            ? u.createElement(
                'span',
                ge({ className: m }, l),
                u.createElement(g, null),
                d === 'chrome' &&
                  u.createElement('span', { className: be.functionDecorator }, '\u0192 '),
                u.createElement(
                  'span',
                  { className: Io({ [be.function]: !p }) },
                  `${t.value.name}()`,
                ),
              )
            : t.type === 'promise'
              ? u.createElement(
                  'span',
                  ge({ className: m }, l),
                  u.createElement(g, null),
                  qT(t, o, n),
                )
              : t.type === 'map'
                ? u.createElement(
                    'span',
                    ge({ className: m }, l),
                    u.createElement(g, null),
                    zT(t, o, n, d),
                  )
                : t.type === 'set'
                  ? u.createElement(
                      'span',
                      ge({ className: m }, l),
                      u.createElement(g, null),
                      GT(t, o, n),
                    )
                  : u.createElement(
                      'span',
                      ge({ className: m }, l),
                      u.createElement(g, null),
                      JT(t, o, n, d),
                    );
      };
    pm.defaultProps = { previewMax: 8, open: !1 };
    var WT = pm,
      gs = (e) => {
        let { ast: t, expandLevel: r, depth: n } = e,
          [o, i] = X(),
          [a, l] = X(n < r);
        return (
          ee(() => {
            (async () => {
              if (t.type !== 'value') {
                let s = t.children.map((m) => m()),
                  d = await Promise.all(s),
                  p = Do(Do({}, t), {}, { children: d });
                i(p);
              }
            })();
          }, [t]),
          o
            ? u.createElement(
                Po,
                {
                  hover: !1,
                  open: a,
                  label: u.createElement(WT, { open: a, ast: o }),
                  onSelect: () => {
                    var s;
                    (s = e.onSelect) === null || s === void 0 || s.call(e, t);
                  },
                  onUpdate: (s) => {
                    l(s);
                  },
                },
                o.children.map((s) =>
                  u.createElement(gs, {
                    key: s.key,
                    ast: s,
                    depth: n + 1,
                    expandLevel: r,
                    onSelect: e.onSelect,
                  }),
                ),
              )
            : u.createElement(Po, {
                hover: !1,
                label: u.createElement(dm, { ast: t }),
                onSelect: () => {
                  var s;
                  (s = e.onSelect) === null || s === void 0 || s.call(e, t);
                },
              })
        );
      };
    gs.defaultProps = { expandLevel: 0, depth: 0 };
    var YT = gs,
      KT = [
        'data',
        'expandLevel',
        'sortKeys',
        'includePrototypes',
        'className',
        'theme',
        'colorScheme',
        'onSelect',
      ],
      mm = (e) => {
        let {
            data: t,
            expandLevel: r,
            sortKeys: n,
            includePrototypes: o,
            className: i,
            theme: a,
            colorScheme: l,
            onSelect: s,
          } = e,
          d = Sr(e, KT),
          [p, m] = X(void 0),
          {
            themeClass: h,
            currentTheme: g,
            currentColorScheme: E,
          } = Bo({ theme: a, colorScheme: l }, be);
        return (
          ee(() => {
            (async () => m(await FT(t, n, o)))();
          }, [t, n, o]),
          u.createElement(
            'div',
            ge({ className: Io(be.objectInspector, i, h) }, d),
            p &&
              u.createElement(
                MT,
                { theme: g, colorScheme: E },
                u.createElement(YT, { ast: p, expandLevel: r, onSelect: s }),
              ),
          )
        );
      };
    mm.defaultProps = { expandLevel: 0, sortKeys: !0, includePrototypes: !0 };
    var XT = {
        base: '#444',
        nullish: '#7D99AA',
        string: '#16B242',
        number: '#5D40D0',
        boolean: '#f41840',
        objectkey: '#698394',
        instance: '#A15C20',
        function: '#EA7509',
        muted: '#7D99AA',
        tag: { name: '#6F2CAC', suffix: '#1F99E5' },
        date: '#459D9C',
        error: { name: '#D43900', message: '#444' },
        regex: { source: '#A15C20', flags: '#EA7509' },
        meta: '#EA7509',
        method: '#0271B6',
      },
      ZT = {
        base: '#eee',
        nullish: '#aaa',
        string: '#5FE584',
        number: '#6ba5ff',
        boolean: '#ff4191',
        objectkey: '#accfe6',
        instance: '#E3B551',
        function: '#E3B551',
        muted: '#aaa',
        tag: { name: '#f57bff', suffix: '#8EB5FF' },
        date: '#70D4D3',
        error: { name: '#f40', message: '#eee' },
        regex: { source: '#FAD483', flags: '#E3B551' },
        meta: '#FAD483',
        method: '#5EC1FF',
      },
      Ve = () => {
        let { base: e } = st();
        return e === 'dark' ? ZT : XT;
      },
      QT = /[^A-Z0-9]/i,
      Sp = /[\s.,…]+$/gm,
      hm = (e, t) => {
        if (e.length <= t) return e;
        for (let r = t - 1; r >= 0; r -= 1)
          if (QT.test(e[r]) && r > 10) return `${e.slice(0, r).replace(Sp, '')}\u2026`;
        return `${e.slice(0, t).replace(Sp, '')}\u2026`;
      },
      ew = (e) => {
        try {
          return JSON.stringify(e, null, 1);
        } catch {
          return String(e);
        }
      },
      fm = (e, t) =>
        e.flatMap((r, n) =>
          n === e.length - 1 ? [r] : [r, u.cloneElement(t, { key: `sep${n}` })],
        ),
      Er = ({ value: e, nested: t, showObjectInspector: r, callsById: n, ...o }) => {
        switch (!0) {
          case e === null:
            return u.createElement(tw, { ...o });
          case e === void 0:
            return u.createElement(rw, { ...o });
          case Array.isArray(e):
            return u.createElement(iw, { ...o, value: e, callsById: n });
          case typeof e == 'string':
            return u.createElement(nw, { ...o, value: e });
          case typeof e == 'number':
            return u.createElement(ow, { ...o, value: e });
          case typeof e == 'boolean':
            return u.createElement(aw, { ...o, value: e });
          case Object.prototype.hasOwnProperty.call(e, '__date__'):
            return u.createElement(dw, { ...o, ...e.__date__ });
          case Object.prototype.hasOwnProperty.call(e, '__error__'):
            return u.createElement(pw, { ...o, ...e.__error__ });
          case Object.prototype.hasOwnProperty.call(e, '__regexp__'):
            return u.createElement(mw, { ...o, ...e.__regexp__ });
          case Object.prototype.hasOwnProperty.call(e, '__function__'):
            return u.createElement(uw, { ...o, ...e.__function__ });
          case Object.prototype.hasOwnProperty.call(e, '__symbol__'):
            return u.createElement(hw, { ...o, ...e.__symbol__ });
          case Object.prototype.hasOwnProperty.call(e, '__element__'):
            return u.createElement(cw, { ...o, ...e.__element__ });
          case Object.prototype.hasOwnProperty.call(e, '__class__'):
            return u.createElement(lw, { ...o, ...e.__class__ });
          case Object.prototype.hasOwnProperty.call(e, '__callId__'):
            return u.createElement(ys, { call: n?.get(e.__callId__), callsById: n });
          case Object.prototype.toString.call(e) === '[object Object]':
            return u.createElement(sw, { value: e, showInspector: r, callsById: n, ...o });
          default:
            return u.createElement(fw, { value: e, ...o });
        }
      },
      tw = (e) => {
        let t = Ve();
        return u.createElement('span', { style: { color: t.nullish }, ...e }, 'null');
      },
      rw = (e) => {
        let t = Ve();
        return u.createElement('span', { style: { color: t.nullish }, ...e }, 'undefined');
      },
      nw = ({ value: e, ...t }) => {
        let r = Ve();
        return u.createElement(
          'span',
          { style: { color: r.string }, ...t },
          JSON.stringify(hm(e, 50)),
        );
      },
      ow = ({ value: e, ...t }) => {
        let r = Ve();
        return u.createElement('span', { style: { color: r.number }, ...t }, e);
      },
      aw = ({ value: e, ...t }) => {
        let r = Ve();
        return u.createElement('span', { style: { color: r.boolean }, ...t }, String(e));
      },
      iw = ({ value: e, nested: t = !1, callsById: r }) => {
        let n = Ve();
        if (t) return u.createElement('span', { style: { color: n.base } }, '[\u2026]');
        let o = e
            .slice(0, 3)
            .map((a, l) =>
              u.createElement(Er, {
                key: `${l}--${JSON.stringify(a)}`,
                value: a,
                nested: !0,
                callsById: r,
              }),
            ),
          i = fm(o, u.createElement('span', null, ', '));
        return e.length <= 3
          ? u.createElement('span', { style: { color: n.base } }, '[', i, ']')
          : u.createElement(
              'span',
              { style: { color: n.base } },
              '(',
              e.length,
              ') [',
              i,
              ', \u2026]',
            );
      },
      sw = ({ showInspector: e, value: t, callsById: r, nested: n = !1 }) => {
        let o = st().base === 'dark',
          i = Ve();
        if (e)
          return u.createElement(
            u.Fragment,
            null,
            u.createElement(mm, {
              id: 'interactions-object-inspector',
              data: t,
              includePrototypes: !1,
              colorScheme: o ? 'dark' : 'light',
            }),
          );
        if (n) return u.createElement('span', { style: { color: i.base } }, '{\u2026}');
        let a = fm(
          Object.entries(t)
            .slice(0, 2)
            .map(([l, s]) =>
              u.createElement(
                Ht,
                { key: l },
                u.createElement('span', { style: { color: i.objectkey } }, l, ': '),
                u.createElement(Er, { value: s, callsById: r, nested: !0 }),
              ),
            ),
          u.createElement('span', null, ', '),
        );
        return Object.keys(t).length <= 2
          ? u.createElement('span', { style: { color: i.base } }, '{ ', a, ' }')
          : u.createElement(
              'span',
              { style: { color: i.base } },
              '(',
              Object.keys(t).length,
              ') ',
              '{ ',
              a,
              ', \u2026 }',
            );
      },
      lw = ({ name: e }) => {
        let t = Ve();
        return u.createElement('span', { style: { color: t.instance } }, e);
      },
      uw = ({ name: e }) => {
        let t = Ve();
        return e
          ? u.createElement('span', { style: { color: t.function } }, e)
          : u.createElement(
              'span',
              { style: { color: t.nullish, fontStyle: 'italic' } },
              'anonymous',
            );
      },
      cw = ({ prefix: e, localName: t, id: r, classNames: n = [], innerText: o }) => {
        let i = e ? `${e}:${t}` : t,
          a = Ve();
        return u.createElement(
          'span',
          { style: { wordBreak: 'keep-all' } },
          u.createElement('span', { key: `${i}_lt`, style: { color: a.muted } }, '<'),
          u.createElement('span', { key: `${i}_tag`, style: { color: a.tag.name } }, i),
          u.createElement(
            'span',
            { key: `${i}_suffix`, style: { color: a.tag.suffix } },
            r ? `#${r}` : n.reduce((l, s) => `${l}.${s}`, ''),
          ),
          u.createElement('span', { key: `${i}_gt`, style: { color: a.muted } }, '>'),
          !r &&
            n.length === 0 &&
            o &&
            u.createElement(
              u.Fragment,
              null,
              u.createElement('span', { key: `${i}_text` }, o),
              u.createElement('span', { key: `${i}_close_lt`, style: { color: a.muted } }, '<'),
              u.createElement(
                'span',
                { key: `${i}_close_tag`, style: { color: a.tag.name } },
                '/',
                i,
              ),
              u.createElement('span', { key: `${i}_close_gt`, style: { color: a.muted } }, '>'),
            ),
        );
      },
      dw = ({ value: e }) => {
        let t = new Date(e);
        isNaN(Number(t)) && (_e.warn('Invalid date value:', e), (t = null));
        let r = Ve();
        if (!t)
          return u.createElement(
            'span',
            { style: { whiteSpace: 'nowrap', color: r.date } },
            'Invalid date',
          );
        let [n, o, i] = t.toISOString().split(/[T.Z]/);
        return u.createElement(
          'span',
          { style: { whiteSpace: 'nowrap', color: r.date } },
          n,
          u.createElement('span', { style: { opacity: 0.7 } }, 'T'),
          o === '00:00:00' ? u.createElement('span', { style: { opacity: 0.7 } }, o) : o,
          i === '000' ? u.createElement('span', { style: { opacity: 0.7 } }, '.', i) : `.${i}`,
          u.createElement('span', { style: { opacity: 0.7 } }, 'Z'),
        );
      },
      pw = ({ name: e, message: t }) => {
        let r = Ve();
        return u.createElement(
          'span',
          { style: { color: r.error.name } },
          e,
          t && ': ',
          t &&
            u.createElement(
              'span',
              { style: { color: r.error.message }, title: t.length > 50 ? t : '' },
              hm(t, 50),
            ),
        );
      },
      mw = ({ flags: e, source: t }) => {
        let r = Ve();
        return u.createElement(
          'span',
          { style: { whiteSpace: 'nowrap', color: r.regex.flags } },
          '/',
          u.createElement('span', { style: { color: r.regex.source } }, t),
          '/',
          e,
        );
      },
      hw = ({ description: e }) => {
        let t = Ve();
        return u.createElement(
          'span',
          { style: { whiteSpace: 'nowrap', color: t.instance } },
          'Symbol(',
          e && u.createElement('span', { style: { color: t.meta } }, '"', e, '"'),
          ')',
        );
      },
      fw = ({ value: e }) => {
        let t = Ve();
        return u.createElement('span', { style: { color: t.meta } }, ew(e));
      },
      gw = ({ label: e }) => {
        let t = Ve(),
          { typography: r } = st();
        return u.createElement(
          'span',
          { style: { color: t.base, fontFamily: r.fonts.base, fontSize: r.size.s2 - 1 } },
          e,
        );
      },
      ys = ({ call: e, callsById: t }) => {
        if (!e) return null;
        if (e.method === 'step' && e.path?.length === 0)
          return u.createElement(gw, { label: e.args[0] });
        let r = e.path?.flatMap((i, a) => {
            let l = i.__callId__;
            return [
              l
                ? u.createElement(ys, { key: `elem${a}`, call: t?.get(l), callsById: t })
                : u.createElement('span', { key: `elem${a}` }, i),
              u.createElement('wbr', { key: `wbr${a}` }),
              u.createElement('span', { key: `dot${a}` }, '.'),
            ];
          }),
          n = e.args?.flatMap((i, a, l) => {
            let s = u.createElement(Er, { key: `node${a}`, value: i, callsById: t });
            return a < l.length - 1
              ? [
                  s,
                  u.createElement('span', { key: `comma${a}` }, ',\xA0'),
                  u.createElement('wbr', { key: `wbr${a}` }),
                ]
              : [s];
          }),
          o = Ve();
        return u.createElement(
          u.Fragment,
          null,
          u.createElement('span', { style: { color: o.base } }, r),
          u.createElement('span', { style: { color: o.method } }, e.method),
          u.createElement(
            'span',
            { style: { color: o.base } },
            '(',
            u.createElement('wbr', null),
            n,
            u.createElement('wbr', null),
            ')',
          ),
        );
      },
      Ap = (e, t = 0) => {
        for (let r = t, n = 1; r < e.length; r += 1)
          if ((e[r] === '(' ? (n += 1) : e[r] === ')' && (n -= 1), n === 0)) return e.slice(t, r);
        return '';
      },
      Ui = (e) => {
        try {
          return e === 'undefined' ? void 0 : JSON.parse(e);
        } catch {
          return e;
        }
      },
      yw = P.span(({ theme: e }) => ({
        color: e.base === 'light' ? e.color.positiveText : e.color.positive,
      })),
      bw = P.span(({ theme: e }) => ({
        color: e.base === 'light' ? e.color.negativeText : e.color.negative,
      })),
      Vi = ({ value: e, parsed: t }) =>
        t
          ? u.createElement(Er, { showObjectInspector: !0, value: e, style: { color: '#D43900' } })
          : u.createElement(bw, null, e),
      Hi = ({ value: e, parsed: t }) =>
        t
          ? typeof e == 'string' && e.startsWith('called with')
            ? u.createElement(u.Fragment, null, e)
            : u.createElement(Er, {
                showObjectInspector: !0,
                value: e,
                style: { color: '#16B242' },
              })
          : u.createElement(yw, null, e),
      Tp = ({ message: e, style: t = {} }) => {
        let r = hs(),
          n = e.split(`
`);
        return u.createElement(
          'pre',
          { style: { margin: 0, padding: '8px 10px 8px 36px', fontSize: ft.size.s1, ...t } },
          n.flatMap((o, i) => {
            if (o.startsWith('expect(')) {
              let m = Ap(o, 7),
                h = m ? 7 + m.length : 0,
                g = m && o.slice(h).match(/\.(to|last|nth)[A-Z]\w+\(/);
              if (g) {
                let E = h + (g.index ?? 0) + g[0].length,
                  b = Ap(o, E);
                if (b)
                  return [
                    'expect(',
                    u.createElement(Vi, { key: `received_${m}`, value: m }),
                    o.slice(h, E),
                    u.createElement(Hi, { key: `expected_${b}`, value: b }),
                    o.slice(E + b.length),
                    u.createElement('br', { key: `br${i}` }),
                  ];
              }
            }
            if (o.match(/^\s*- /))
              return [
                u.createElement(Hi, { key: o + i, value: o }),
                u.createElement('br', { key: `br${i}` }),
              ];
            if (o.match(/^\s*\+ /) || o.match(/^Received: $/))
              return [
                u.createElement(Vi, { key: o + i, value: o }),
                u.createElement('br', { key: `br${i}` }),
              ];
            let [, a, l] = o.match(/^(Expected|Received): (.*)$/) || [];
            if (a && l)
              return a === 'Expected'
                ? [
                    'Expected: ',
                    u.createElement(Hi, { key: o + i, value: Ui(l), parsed: !0 }),
                    u.createElement('br', { key: `br${i}` }),
                  ]
                : [
                    'Received: ',
                    u.createElement(Vi, { key: o + i, value: Ui(l), parsed: !0 }),
                    u.createElement('br', { key: `br${i}` }),
                  ];
            let [, s, d] =
              o.match(/(Expected number|Received number|Number) of calls: (\d+)$/i) || [];
            if (s && d)
              return [
                `${s} of calls: `,
                u.createElement(Er, { key: o + i, value: Number(d) }),
                u.createElement('br', { key: `br${i}` }),
              ];
            let [, p] = o.match(/^Received has value: (.+)$/) || [];
            return p
              ? [
                  'Received has value: ',
                  u.createElement(Er, { key: o + i, value: Ui(p) }),
                  u.createElement('br', { key: `br${i}` }),
                ]
              : [
                  u.createElement('span', {
                    key: o + i,
                    dangerouslySetInnerHTML: { __html: r.toHtml(o) },
                  }),
                  u.createElement('br', { key: `br${i}` }),
                ];
          }),
        );
      },
      Ew = P.div({
        width: 14,
        height: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }),
      gm = ({ status: e }) => {
        let t = st();
        switch (e) {
          case 'done':
            return u.createElement(jn, { color: t.color.positive, 'data-testid': 'icon-done' });
          case 'error':
            return u.createElement(Bl, { color: t.color.negative, 'data-testid': 'icon-error' });
          case 'active':
            return u.createElement(Nl, { color: t.color.secondary, 'data-testid': 'icon-active' });
          case 'waiting':
            return u.createElement(
              Ew,
              { 'data-testid': 'icon-waiting' },
              u.createElement(Hn, { color: Je(0.5, '#CCCCCC'), size: 6 }),
            );
          default:
            return null;
        }
      },
      Sw = P.div({
        fontFamily: ft.fonts.mono,
        fontSize: ft.size.s1,
        overflowWrap: 'break-word',
        inlineSize: 'calc( 100% - 40px )',
      }),
      Aw = P('li', { shouldForwardProp: (e) => !['call', 'pausedAt'].includes(e.toString()) })(
        ({ theme: e, call: t }) => ({
          listStyle: 'none',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderBottom: `1px solid ${e.appBorderColor}`,
          fontFamily: ft.fonts.base,
          fontSize: 13,
          ...(t.status === 'error' && {
            backgroundColor: e.base === 'dark' ? Je(0.93, e.color.negative) : e.background.warning,
          }),
          paddingLeft: (t.ancestors?.length ?? 0) * 20,
        }),
        ({ theme: e, call: t, pausedAt: r }) =>
          r === t.id && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -5,
              zIndex: 1,
              borderTop: '4.5px solid transparent',
              borderLeft: `7px solid ${e.color.warning}`,
              borderBottom: '4.5px solid transparent',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -1,
              zIndex: 1,
              width: '100%',
              borderTop: `1.5px solid ${e.color.warning}`,
            },
          },
      ),
      Tw = P.div(({ theme: e, $isNavigationDisabled: t }) => ({
        display: 'flex',
        '&:hover': t ? {} : { background: e.background.hoverable },
      })),
      ww = P('button', { shouldForwardProp: (e) => !['call'].includes(e.toString()) })(
        ({ theme: e, disabled: t, call: r }) => ({
          flex: 1,
          display: 'grid',
          background: 'none',
          border: 0,
          gridTemplateColumns: '15px 1fr',
          alignItems: 'center',
          minHeight: 40,
          margin: 0,
          padding: '8px 15px',
          textAlign: 'start',
          cursor: t || r.status === 'error' ? 'default' : 'pointer',
          '&:focus-visible': {
            outline: 0,
            boxShadow: `inset 3px 0 0 0 ${r.status === 'error' ? e.color.warning : e.color.secondary}`,
            background: r.status === 'error' ? 'transparent' : e.background.hoverable,
          },
          '& > div': { opacity: r.status === 'waiting' ? 0.5 : 1 },
        }),
      ),
      _w = P.div({ display: 'flex', alignItems: 'center', padding: 6 }),
      vw = P(Ee)(({ theme: e }) => ({ color: e.textMutedColor, margin: '0 3px' })),
      Ji = P('div')(({ theme: e }) => ({
        padding: '8px 10px 8px 36px',
        fontSize: ft.size.s1,
        color: e.color.defaultText,
        pre: { margin: 0, padding: 0 },
      })),
      xw = P.span(({ theme: e }) => ({ color: e.base === 'dark' ? '#5EC1FF' : '#0271B6' })),
      Cw = P.span(({ theme: e }) => ({ color: e.base === 'dark' ? '#eee' : '#444' })),
      Ow = P.p(({ theme: e }) => ({
        color: e.base === 'dark' ? e.color.negative : e.color.negativeText,
        fontSize: e.typography.size.s2,
        maxWidth: 500,
        textWrap: 'balance',
      })),
      Rw = (e) => {
        if (e.method === 'step' && e.path?.length === 0 && typeof e.args?.[0] == 'string') {
          let t = e.args[0].trim();
          if (t.length > 0) return t;
        }
        return e.method;
      },
      Iw = ({ isNavigationDisabled: e, stepName: t, statusText: r }) =>
        `${e ? 'Interaction row' : 'Go to interaction row'}: ${t}. Status: ${r}.`,
      Dw = ({ isCollapsed: e, stepName: t }) =>
        `${e ? 'Expand' : 'Collapse'} nested interaction steps for ${t}`,
      Pw = { done: 'passed', error: 'failed', active: 'running', waiting: 'pending' },
      Nw = (e) => (e.status ? Pw[e.status] : 'not run'),
      kw = ({ exception: e }) => {
        let t = hs();
        if (!e) return null;
        if (e.callId === xt)
          return te(
            Ji,
            null,
            te('pre', null, te(xw, null, e.name, ':'), ' ', te(Cw, null, e.message)),
            te(
              Ow,
              null,
              'The component failed to render properly. Automated component tests will not run until this is resolved. Check the full error message in Storybook\u2019s canvas to debug.',
            ),
          );
        if (sm(e)) return te(Tp, { ...e });
        if (im(e))
          return te(
            Ji,
            null,
            te(Tp, {
              message: `${e.message}${
                e.diff
                  ? `

${e.diff}`
                  : ''
              }`,
              style: { padding: 0 },
            }),
            te('p', null, 'See the full stack trace in the browser console.'),
          );
        let r = e.message.split(`

`),
          n = r.length > 1;
        return te(
          Ji,
          null,
          te('pre', { dangerouslySetInnerHTML: { __html: t.toHtml(r[0]) } }),
          n && te('p', null, 'See the full stack trace in the browser console.'),
        );
      },
      Fw = ({
        call: e,
        callsById: t,
        controls: r,
        controlStates: n,
        childCallIds: o,
        isHidden: i,
        isCollapsed: a,
        toggleCollapsed: l,
        pausedAt: s,
      }) => {
        let [d, p] = X(!1),
          m = !n.goto || !e.interceptable || !!e.ancestors?.length,
          h = Rw(e),
          g = Nw(e);
        return i || e.id === xt
          ? null
          : te(
              Aw,
              { call: e, pausedAt: s },
              te(
                Tw,
                { $isNavigationDisabled: m },
                te(
                  ww,
                  {
                    'aria-label': Iw({ isNavigationDisabled: m, stepName: h, statusText: g }),
                    call: e,
                    onClick: () => r.goto(e.id),
                    disabled: m,
                    onMouseEnter: () => n.goto && p(!0),
                    onMouseLeave: () => n.goto && p(!1),
                  },
                  te(gm, { status: d ? 'active' : e.status }),
                  te(
                    Sw,
                    { style: { marginLeft: 6, marginBottom: 1 } },
                    te(ys, { call: e, callsById: t }),
                  ),
                ),
                te(
                  _w,
                  null,
                  (o?.length ?? 0) > 0 &&
                    te(
                      vw,
                      {
                        padding: 'small',
                        variant: 'ghost',
                        onClick: l,
                        ariaLabel: Dw({ isCollapsed: a, stepName: h }),
                        'aria-expanded': !a,
                      },
                      a ? te(Al, null) : te(Un, null),
                    ),
                ),
              ),
              e.status === 'error' &&
                e.exception?.callId === e.id &&
                te(kw, { exception: e.exception }),
            );
      },
      Lw = P.div(({ theme: { color: e, typography: t, background: r } }) => ({
        textAlign: 'start',
        padding: '11px 15px',
        fontSize: `${t.size.s2 - 1}px`,
        fontWeight: t.weight.regular,
        lineHeight: '1rem',
        background: r.app,
        borderBottom: `1px solid ${e.border}`,
        color: e.defaultText,
        backgroundClip: 'padding-box',
        position: 'relative',
        code: {
          fontSize: `${t.size.s1 - 1}px`,
          color: 'inherit',
          margin: '0 0.2em',
          padding: '0 0.2em',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '2px',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
        },
      })),
      Bw = ({ browserTestStatus: e }) => {
        let t = Pe().getDocsUrl({ subpath: gT, versioned: !0, renderer: !0 }),
          [r, n] = e === 'error' ? ['the CLI', 'this browser'] : ['this browser', 'the CLI'];
        return u.createElement(
          Lw,
          null,
          'This interaction test passed in ',
          r,
          ', but the tests failed in ',
          n,
          '.',
          ' ',
          u.createElement(
            ot,
            { href: t, target: '_blank', withArrow: !0 },
            'Learn what could cause this',
          ),
        );
      },
      Mw = {
        rendering: 'mediumdark',
        playing: 'warning',
        completed: 'positive',
        errored: 'negative',
        aborted: 'purple',
      },
      $w = {
        rendering: 'Wait',
        playing: 'Runs',
        completed: 'Pass',
        errored: 'Fail',
        aborted: 'Bail',
      },
      jw = {
        rendering: 'Story is rendering',
        playing: 'Interactions are running',
        completed: 'Story ran successfully',
        errored: 'Story failed to complete',
        aborted: 'Interactions aborted due to file changes',
      },
      Uw = P.div(({ theme: e, status: t }) => ({
        display: 'inline-block',
        padding: '4px 6px 4px 8px',
        borderRadius: '4px',
        backgroundColor: e.color[Mw[t]],
        color: 'white',
        fontFamily: ft.fonts.base,
        textTransform: 'uppercase',
        fontSize: ft.size.s1,
        letterSpacing: 3,
        fontWeight: ft.weight.bold,
        minWidth: 65,
        textAlign: 'center',
      })),
      Vw = ({ status: e }) => {
        let t = $w[e],
          r = jw[e];
        return u.createElement(
          ul,
          {
            hasChrome: !1,
            placement: 'top',
            trigger: 'hover',
            tooltip: u.createElement(ll, { note: r }),
          },
          u.createElement(Uw, { 'aria-label': `Story status: ${t}`, status: e }, t),
        );
      },
      Hw = P.div(({ theme: e }) => ({
        boxShadow: `${e.appBorderColor} 0 -1px 0 0 inset`,
        background: e.background.app,
        position: 'sticky',
        top: 0,
        zIndex: 1,
      })),
      Jw = P(Ee)(({ theme: e }) => ({
        borderRadius: 4,
        padding: 6,
        color: e.textMutedColor,
        '&:not(:disabled)': { '&:hover,&:focus-visible': { color: e.color.secondary } },
      })),
      bn = P(Ee)(({ theme: e }) => ({ color: e.textMutedColor })),
      qw = P(Ee)(({ theme: e }) => ({
        color: e.color.secondary,
        fontWeight: e.typography.weight.bold,
        justifyContent: 'flex-end',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        fontSize: 13,
        lineHeight: 24,
      })),
      zw = P(rl)(({ theme: e }) => ({
        color: e.textMutedColor,
        cursor: 'default',
        fontWeight: e.typography.weight.regular,
        justifyContent: 'flex-end',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        margin: 0,
        fontSize: 13,
      })),
      Gw = P.div({ display: 'flex', alignItems: 'center', flex: 1, gap: 6 }),
      Ww = P(bn)({ marginInlineStart: 3 }),
      Yw = P(Jw)({ marginInline: 3, lineHeight: '12px' }),
      Kw = P(bn)(({ theme: e, animating: t, disabled: r }) => ({
        opacity: r ? 0.5 : 1,
        svg: { animation: t ? `${e.animation.rotate360} 200ms ease-out` : void 0 },
      })),
      Xw = ({
        controls: e,
        controlStates: t,
        status: r,
        storyFileName: n,
        onScrollToEnd: o,
        importPath: i,
        canOpenInEditor: a,
        api: l,
      }) => {
        let s = r === 'errored' ? 'Scroll to error' : 'Scroll to end',
          d = st();
        return u.createElement(
          Hw,
          null,
          u.createElement(
            sl,
            {
              backgroundColor: d.background.app,
              innerStyle: { gap: 6, paddingInline: 15 },
              'aria-label': 'Component test playback controls',
            },
            u.createElement(
              Gw,
              null,
              u.createElement(Vw, { status: r }),
              u.createElement(Yw, { ariaLabel: !1, onClick: o, disabled: !o }, s),
              u.createElement(al, null),
              u.createElement(
                Ww,
                {
                  padding: 'small',
                  variant: 'ghost',
                  ariaLabel: 'Go to start',
                  onClick: e.start,
                  disabled: !t.start,
                },
                u.createElement(Fl, null),
              ),
              u.createElement(
                bn,
                {
                  padding: 'small',
                  variant: 'ghost',
                  ariaLabel: 'Go back',
                  onClick: e.back,
                  disabled: !t.back,
                },
                u.createElement(Pl, null),
              ),
              u.createElement(
                bn,
                {
                  padding: 'small',
                  variant: 'ghost',
                  ariaLabel: 'Go forward',
                  onClick: e.next,
                  disabled: !t.next,
                },
                u.createElement(kl, null),
              ),
              u.createElement(
                bn,
                {
                  padding: 'small',
                  variant: 'ghost',
                  ariaLabel: 'Go to end',
                  onClick: e.end,
                  disabled: !t.end,
                },
                u.createElement(vl, null),
              ),
              u.createElement(
                Kw,
                { padding: 'small', variant: 'ghost', ariaLabel: 'Rerun', onClick: e.rerun },
                u.createElement($l, null),
              ),
            ),
            (i || n) &&
              (a
                ? u.createElement(
                    qw,
                    {
                      padding: 'small',
                      size: 'small',
                      variant: 'ghost',
                      ariaLabel: 'Open in editor',
                      onClick: () => {
                        l.openInEditor({ file: i });
                      },
                    },
                    n,
                  )
                : u.createElement(zw, null, n)),
          ),
        );
      },
      Zw = P.div(({ theme: e }) => ({ height: '100%', background: e.background.content })),
      Qw = P.section({ position: 'relative' }),
      e_ = P.h3(Yn),
      t_ = P.ol({ margin: 0, padding: 0 }),
      wp = P.div(({ theme: e }) => ({
        borderBottom: `1px solid ${e.appBorderColor}`,
        backgroundColor: e.base === 'dark' ? Je(0.93, e.color.negative) : e.background.warning,
        padding: 15,
        fontSize: e.typography.size.s2 - 1,
        lineHeight: '19px',
      })),
      qi = P.code(({ theme: e }) => ({
        margin: '0 1px',
        padding: 3,
        fontSize: e.typography.size.s1 - 1,
        lineHeight: 1,
        verticalAlign: 'top',
        background: 'rgba(0, 0, 0, 0.05)',
        border: `1px solid ${e.appBorderColor}`,
        borderRadius: 3,
      })),
      _p = P.div({ paddingBottom: 4, fontWeight: 'bold' }),
      r_ = P.p({ margin: 0, padding: '0 0 20px' }),
      vp = P.pre(({ theme: e }) => ({
        margin: 0,
        padding: 0,
        '&:not(:last-child)': { paddingBottom: 16 },
        fontSize: e.typography.size.s1 - 1,
      })),
      xp = {
        rendering: 'Component test is rendering.',
        playing: 'Component test is running.',
        completed: 'Component test completed successfully.',
        errored: 'Component test failed.',
        aborted: 'Component test was aborted.',
      },
      n_ = (e, t) => (e === 'completed' && t ? xp.errored : xp[e]),
      o_ = Ze(function ({
        storyUrl: e,
        status: t,
        calls: r,
        controls: n,
        controlStates: o,
        interactions: i,
        fileName: a,
        hasException: l,
        caughtException: s,
        unhandledErrors: d,
        pausedAt: p,
        onScrollToEnd: m,
        endRef: h,
        hasResultMismatch: g,
        browserTestStatus: E,
        importPath: b,
        canOpenInEditor: _,
        api: y,
      }) {
        let S = hs(),
          A = i.some((v) => v.id !== xt),
          T = t === 'rendering' || t === 'playing',
          C = n_(t, l),
          x = t === 'errored' || (t === 'completed' && l);
        return (
          ee(() => {
            Cs(C, x ? 'assertive' : 'polite');
          }, [C, x]),
          te(
            Zw,
            null,
            g && te(Bw, { browserTestStatus: E }),
            o.detached && (A || l) && te(DT, { storyUrl: e }),
            te(Xw, {
              controls: n,
              controlStates: o,
              status: t,
              storyFileName: a,
              onScrollToEnd: m,
              importPath: b,
              canOpenInEditor: _,
              api: y,
            }),
            te(
              Qw,
              null,
              te(e_, null, 'Interaction steps'),
              te(
                t_,
                { 'aria-busy': T },
                i.map((v) =>
                  te(Fw, {
                    key: v.id,
                    call: v,
                    callsById: r,
                    controls: n,
                    controlStates: o,
                    childCallIds: v.childCallIds,
                    isHidden: v.isHidden,
                    isCollapsed: v.isCollapsed,
                    toggleCollapsed: v.toggleCollapsed,
                    pausedAt: p,
                  }),
                ),
              ),
            ),
            s &&
              !OT(s) &&
              te(
                wp,
                null,
                te(_p, null, 'Caught exception in ', te(qi, null, 'play'), ' function'),
                te(vp, {
                  'data-chromatic': 'ignore',
                  dangerouslySetInnerHTML: { __html: S.toHtml(Cp(s)) },
                }),
              ),
            d &&
              te(
                wp,
                null,
                te(_p, null, 'Unhandled Errors'),
                te(
                  r_,
                  null,
                  'Found ',
                  d.length,
                  ' unhandled error',
                  d.length > 1 ? 's' : '',
                  ' ',
                  'while running the play function. This might cause false positive assertions. Resolve unhandled errors or ignore unhandled errors with setting the',
                  te(qi, null, 'test.dangerouslyIgnoreUnhandledErrors'),
                  ' ',
                  'parameter to ',
                  te(qi, null, 'true'),
                  '.',
                ),
                d.map((v, I) => te(vp, { key: I, 'data-chromatic': 'ignore' }, Cp(v))),
              ),
            te('div', { ref: h }),
            t === 'completed' && !s && !A && te(NT, null),
          )
        );
      });
    function Cp(e) {
      return e.stack || `${e.name}: ${e.message}`;
    }
    var fn = { detached: !1, start: !1, back: !1, goto: !1, next: !1, end: !1 },
      Op = {
        rendering: 'rendering',
        playing: 'playing',
        completed: 'completed',
        errored: 'errored',
        aborted: 'aborted',
      },
      a_ = ['completed', 'errored', 'aborted'],
      i_ = {
        done: 'status-value:success',
        error: 'status-value:error',
        active: 'status-value:pending',
        waiting: 'status-value:pending',
      },
      s_ = ({ log: e, calls: t, collapsed: r, setCollapsed: n }) => {
        let o = new Map(),
          i = new Map();
        return e
          .map(({ callId: a, ancestors: l, status: s }) => {
            let d = !1;
            return (
              l.forEach((p) => {
                (r.has(p) && (d = !0), i.set(p, (i.get(p) || []).concat(a)));
              }),
              { ...t.get(a), status: s, isHidden: d }
            );
          })
          .map((a) => {
            let l =
              a.status === 'error' &&
              a.ancestors &&
              o.get(a.ancestors.slice(-1)[0])?.status === 'active'
                ? 'active'
                : a.status;
            return (
              o.set(a.id, { ...a, status: l }),
              {
                ...a,
                status: l,
                childCallIds: i.get(a.id),
                isCollapsed: r.has(a.id),
                toggleCollapsed: () =>
                  n((s) => (s.has(a.id) ? s.delete(a.id) : s.add(a.id), new Set(s))),
              }
            );
          });
      },
      So = (e, { log: t, calls: r, collapsed: n, setCollapsed: o }) =>
        s_({ log: t, calls: r, collapsed: n, setCollapsed: o }).reduce(
          (i, a) => (
            a.id === xt
              ? i.interactions.push(a)
              : e.status !== 'rendering' &&
                ((i.controlStates = e.controlStates),
                i.interactions.push(a),
                a.method !== 'step' && i.interactionsCount++),
            i
          ),
          { ...e, controlStates: fn, interactions: [], interactionsCount: 0 },
        ),
      zi = (e, t) => ({
        id: xt,
        method: 'render',
        args: [],
        cursor: 0,
        storyId: e,
        ancestors: [],
        path: [],
        interceptable: !0,
        retain: !1,
        exception: t,
      }),
      Ao = (e) => ({ callId: xt, status: e, ancestors: [] }),
      l_ = Ze(function ({ refId: e, storyId: t, storyUrl: r }) {
        let { statusValue: n, testRunId: o } = Hl((j) => {
            let W = e ? void 0 : j[t]?.[TT];
            return { statusValue: W?.value, testRunId: W?.data?.testRunId };
          }),
          i = Gn(),
          a = Pe(),
          l = a.getData(i.storyId, i.refId)?.importPath,
          s = K.CONFIG_TYPE === 'DEVELOPMENT' && !i.refId,
          [d, p] = Pr(Lo, {
            status: 'rendering',
            controlStates: fn,
            interactions: [],
            interactionsCount: 0,
            hasException: !1,
            pausedAt: void 0,
            caughtException: void 0,
            unhandledErrors: void 0,
          }),
          [m, h] = X(void 0),
          [g, E] = X(new Set()),
          [b, _] = X(!1),
          {
            status: y = 'rendering',
            controlStates: S = fn,
            interactions: A = [],
            pausedAt: T = void 0,
            caughtException: C = void 0,
            unhandledErrors: x = void 0,
          } = d,
          v = he([Ao('active')]),
          I = he(new Map([[xt, zi(t)]])),
          N = ({ status: j, ...W }) => I.current.set(W.id, W),
          B = he();
        ee(() => {
          let j;
          return (
            K.IntersectionObserver &&
              ((j = new K.IntersectionObserver(([W]) => h(W.isIntersecting ? void 0 : W.target), {
                root: K.document.querySelector('#storybook-panel-root [role="tabpanel"]'),
              })),
              B.current && j.observe(B.current)),
            () => j?.disconnect()
          );
        }, []);
        let F = he(void 0),
          z = he(0),
          k = zn(
            {
              [Me.CALL]: N,
              [Me.SYNC]: (j) => {
                ((v.current = [Ao('done'), ...j.logItems]),
                  p((W) =>
                    So(
                      { ...W, controlStates: j.controlStates, pausedAt: j.pausedAt },
                      { log: v.current, calls: I.current, collapsed: g, setCollapsed: E },
                    ),
                  ));
              },
              [qt]: (j) => {
                (F.current === j.storyId && ['preparing', 'loading'].includes(j.newPhase)) ||
                  (F.current === j.storyId
                    ? (z.current = Math.max(z.current, j.renderId || 0))
                    : ((z.current = j.renderId || 0), (F.current = j.storyId)),
                  z.current === j.renderId &&
                    (j.newPhase === 'rendering'
                      ? ((v.current = [Ao('active')]),
                        I.current.set(xt, zi(t)),
                        p({
                          status: 'rendering',
                          controlStates: fn,
                          pausedAt: void 0,
                          interactions: [],
                          interactionsCount: 0,
                          hasException: !1,
                          caughtException: void 0,
                          unhandledErrors: void 0,
                        }))
                      : p((W) => {
                          let Z =
                            j.newPhase in Op && !a_.includes(W.status) ? Op[j.newPhase] : W.status;
                          return So(
                            { ...W, status: Z, pausedAt: void 0 },
                            { log: v.current, calls: I.current, collapsed: g, setCollapsed: E },
                          );
                        })));
              },
              [Oa]: (j) => {
                ((v.current = [Ao('error')]),
                  I.current.set(xt, zi(t, { ...j, callId: xt })),
                  p((W) =>
                    So(
                      {
                        ...W,
                        hasException: !0,
                        caughtException: void 0,
                        controlStates: fn,
                        pausedAt: void 0,
                      },
                      { log: v.current, calls: I.current, collapsed: g, setCollapsed: E },
                    ),
                  ));
              },
              [va]: (j) => {
                p((W) => ({ ...W, caughtException: j, hasException: !0 }));
              },
              [Ra]: (j) => {
                p((W) => ({ ...W, unhandledErrors: j, hasException: !0 }));
              },
            },
            [g],
          );
        ee(() => {
          p((j) => So(j, { log: v.current, calls: I.current, collapsed: g, setCollapsed: E }));
        }, [p, g]);
        let R = we(
            () => ({
              start: () => k(Me.START, { storyId: t }),
              back: () => k(Me.BACK, { storyId: t }),
              goto: (j) => k(Me.GOTO, { storyId: t, callId: j }),
              next: () => k(Me.NEXT, { storyId: t }),
              end: () => k(Me.END, { storyId: t }),
              rerun: () => {
                k(Ir, { storyId: t });
              },
            }),
            [k, t],
          ),
          O = Tt('fileName', ''),
          [L] = O.toString().split('/').slice(-1),
          $ = () => m?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
          M = !!C || !!x || A.some((j) => j.status === 'error'),
          J = we(
            () =>
              y !== 'playing' && (A.length > 0 || M)
                ? M
                  ? 'error'
                  : 'done'
                : y === 'playing'
                  ? 'active'
                  : void 0,
            [y, A, M],
          );
        return (
          ee(() => {
            if (J && n && n !== 'status-value:pending' && n !== i_[J]) {
              let j = setTimeout(
                () =>
                  _(
                    (W) => (
                      W ||
                        k(ET, {
                          type: 'test-discrepancy',
                          payload: {
                            browserStatus: J === 'done' ? 'PASS' : 'FAIL',
                            cliStatus: J === 'done' ? 'FAIL' : 'PASS',
                            storyId: t,
                            testRunId: o,
                          },
                        }),
                      !0
                    ),
                  ),
                2e3,
              );
              return () => clearTimeout(j);
            } else _(!1);
          }, [k, J, n, t, o]),
          u.createElement(
            Ht,
            { key: 'component-tests' },
            u.createElement(o_, {
              storyUrl: r,
              status: y,
              hasResultMismatch: b,
              browserTestStatus: J,
              calls: I.current,
              controls: R,
              controlStates: { ...S, detached: !!e || S.detached },
              interactions: A,
              fileName: L,
              hasException: M,
              caughtException: C,
              unhandledErrors: x,
              pausedAt: T,
              endRef: B,
              onScrollToEnd: m && $,
              importPath: l,
              canOpenInEditor: s,
              api: a,
            }),
          )
        );
      });
    function u_() {
      let e = Pe().getSelectedPanel(),
        [t = {}] = Pr(Lo),
        { status: r, hasException: n, interactionsCount: o } = t;
      return u.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        u.createElement('span', null, 'Interactions'),
        o && r !== 'errored' && !n
          ? u.createElement(Rr, { compact: !0, status: e === ms ? 'active' : 'neutral' }, o)
          : null,
        r === 'errored' || n ? u.createElement(gm, { status: 'error' }) : null,
      );
    }
    var _j = Oe.register(Lo, () => {
        if (globalThis?.FEATURES?.interactions) {
          let e = ({ state: t }) => {
            let r = (t.refId && t.refs[t.refId]?.url) || document.location.origin,
              { pathname: n, search: o = '' } = t.location,
              i = n + (t.refId ? o.replace(`/${t.refId}_`, '/') : o);
            return { refId: t.refId, storyId: t.storyId, storyUrl: r + i };
          };
          Oe.add(ms, {
            type: Qe.PANEL,
            title: () => u.createElement(u_, null),
            match: ({ viewMode: t }) => t === 'story',
            disabled: CT,
            render: ({ active: t }) =>
              u.createElement(
                kn,
                { active: !!t },
                u.createElement(Vl, { filter: e }, (r) => u.createElement(l_, { ...r })),
              ),
          });
        }
      }),
      c_ = Ze(function () {
        let e = Tt(St),
          [t, r, n] = At(),
          { options: o = _n, disable: i = !0 } = e || {};
        if (i) return null;
        let a = t[St] || {},
          l = a.value,
          s = a.grid || !1,
          d = o[l],
          p = !!n?.[St],
          m = Object.keys(o).length;
        return u.createElement(d_, {
          length: m,
          backgroundMap: o,
          item: d,
          updateGlobals: r,
          backgroundName: l,
          isLocked: p,
          isGridActive: s,
        });
      }),
      d_ = Ze(function (e) {
        let {
            length: t,
            updateGlobals: r,
            backgroundMap: n,
            backgroundName: o,
            isLocked: i,
            isGridActive: a,
          } = e,
          l = se(
            (d) => {
              r({ [St]: d });
            },
            [r],
          ),
          s = Object.entries(n).map(([d, p]) => ({
            value: d,
            title: p.name,
            icon: u.createElement(Hn, { color: p?.value || 'grey' }),
          }));
        return u.createElement(
          Ht,
          null,
          u.createElement(
            Jt,
            {
              padding: 'small',
              variant: 'ghost',
              key: 'grid',
              pressed: a,
              disabled: i,
              ariaLabel: i ? 'Grid set by story parameters' : 'Grid visibility',
              tooltip: i ? 'Grid set by story parameters' : 'Toggle grid visibility',
              onClick: () => l({ value: o, grid: !a }),
            },
            u.createElement(xl, null),
          ),
          t > 0
            ? u.createElement(Bn, {
                resetLabel: 'Reset background',
                onReset: () => l(void 0),
                disabled: i,
                key: 'background',
                icon: u.createElement(Dl, null),
                ariaLabel: i ? 'Background set by story parameters' : 'Preview background',
                tooltip: i ? 'Background set by story parameters' : 'Change background',
                defaultOptions: o,
                options: s,
                onSelect: (d) => l({ value: d, grid: a }),
              })
            : null,
        );
      }),
      Dj = Oe.register(Tn, () => {
        globalThis?.FEATURES?.backgrounds &&
          Oe.add(Tn, {
            title: 'Backgrounds',
            type: Qe.TOOL,
            match: ({ viewMode: e, tabId: t }) => !!(e && e.match(/^(story|docs)$/)) && !t,
            render: () => u.createElement(c_, null),
          });
      }),
      p_ = () => {
        let [e, t] = At(),
          { measureEnabled: r } = e || {},
          n = Pe(),
          o = se(() => t({ measureEnabled: !r }), [t, r]);
        return (
          ee(() => {
            n.setAddonShortcut(rr, {
              label: 'Toggle Measure',
              defaultShortcut: ['M'],
              actionName: 'measure',
              showInMenu: !1,
              action: o,
            });
          }, [o, n]),
          u.createElement(
            Jt,
            {
              key: Vo,
              pressed: r,
              padding: 'small',
              variant: 'ghost',
              ariaLabel: 'Measure tool',
              tooltip: 'Toggle measure',
              ariaDescription:
                'When enabled, this tool shows dimensions and whitespace (margin, padding, border) for the currently hovered element in the preview area. Does not work with keyboard focus.',
              onClick: o,
            },
            u.createElement(Ll, null),
          )
        );
      },
      Mj = Oe.register(rr, () => {
        globalThis?.FEATURES?.measure &&
          Oe.add(Vo, {
            type: Qe.TOOL,
            title: 'Measure',
            match: ({ viewMode: e, tabId: t }) => e === 'story' && !t,
            render: () => u.createElement(p_, null),
          });
      }),
      m_ = Ze(function () {
        let [e, t] = At(),
          r = Pe(),
          n = [!0, 'true'].includes(e[Tr]),
          o = se(() => t({ [Tr]: !n }), [n, t]);
        return (
          ee(() => {
            r.setAddonShortcut(wn, {
              label: 'Toggle Outline',
              defaultShortcut: ['alt', 'O'],
              actionName: 'outline',
              showInMenu: !1,
              action: o,
            });
          }, [o, r]),
          u.createElement(
            Jt,
            {
              key: 'outline',
              padding: 'small',
              variant: 'ghost',
              pressed: n,
              ariaLabel: 'Outline tool',
              ariaDescription:
                'When enabled, this tool displays the outline of every element in the preview area, which helps understand their layout.',
              tooltip: 'Toggle outline',
              onClick: o,
            },
            u.createElement(Il, null),
          )
        );
      }),
      qj = Oe.register(wn, () => {
        globalThis?.FEATURES?.outline &&
          Oe.add(wn, {
            title: 'Outline',
            type: Qe.TOOL,
            match: ({ viewMode: e, tabId: t }) => !!(e && e.match(/^(story|docs)$/)) && !t,
            render: () => u.createElement(m_, null),
          });
      }),
      h_ = /^([0-9]{1,4})([a-z]{0,4})-([0-9]{1,4})([a-z]{0,4})$/,
      f_ = 40,
      g_ = 40,
      Rp = (e, t, r = 1) => {
        let n = Object.keys(e),
          o = (t ? n.indexOf(t) : -1) + r;
        return o < 0 ? n[n.length - 1] : o >= n.length ? n[0] : n[o];
      },
      xo = (e, t) =>
        typeof e == 'string'
          ? { value: e, isRotated: t }
          : { value: e?.value, isRotated: e?.isRotated ?? t },
      y_ = (e, t, r, n, o, i, a) => {
        if (a !== 'story')
          return {
            name: 'Responsive',
            type: 'desktop',
            width: '100%',
            height: '100%',
            value: '100pct-100pct',
            option: void 0,
            isCustom: !1,
            isDefault: !0,
            isLocked: !0,
            isRotated: !1,
          };
        let l = xo(e?.[ht]),
          s = xo(r?.[ht]),
          d = xo(t?.[ht]),
          p = ht in t,
          m = p ? d : s,
          h = p ? s : d,
          g = m?.value ?? h?.value ?? l?.value,
          E = m?.isRotated ?? h?.isRotated ?? l?.isRotated ?? !1,
          b = Object.keys(n),
          _ = i || ht in t || !b.length,
          [y, S, A, T, C] = g?.match(h_) || [];
        if (y) {
          let x = A && A !== 'px' ? S : Math.max(Number(S), f_),
            v = C && C !== 'px' ? T : Math.max(Number(T), g_),
            I = `${x}${A === 'pct' ? '%' : A || 'px'}`,
            N = `${v}${C === 'pct' ? '%' : C || 'px'}`,
            B = o ? n[o] : void 0;
          return {
            name: B?.name ?? 'Custom',
            type: B?.type ?? 'other',
            width: E ? N : I,
            height: E ? I : N,
            value: y,
            option: void 0,
            isCustom: !0,
            isDefault: !1,
            isLocked: _,
            isRotated: E,
          };
        }
        if (g && b.length) {
          let { name: x, styles: v, type: I = 'other' } = n[g] ?? n[b[0]];
          return {
            name: x,
            type: I,
            width: E ? v.height : v.width,
            height: E ? v.width : v.height,
            value: g,
            option: g,
            isCustom: !1,
            isDefault: !1,
            isLocked: _,
            isRotated: E,
          };
        }
        return {
          name: 'Responsive',
          type: 'desktop',
          width: '100%',
          height: '100%',
          value: '100pct-100pct',
          option: void 0,
          isCustom: !1,
          isDefault: !0,
          isLocked: _,
          isRotated: !1,
        };
      },
      b_ = () => {
        let e = Pe(),
          { viewMode: t } = e.getUrlState(),
          r = he(),
          n = Tt(ht),
          [o, i, a, l] = At(),
          { options: s = Ws, disable: d = !1 } = n || {},
          {
            name: p,
            type: m,
            width: h,
            height: g,
            value: E,
            option: b,
            isCustom: _,
            isDefault: y,
            isLocked: S,
            isRotated: A,
          } = y_(o, a, l, s, r.current, d, t),
          T = se((x) => i({ [ht]: xo(x, !1) }), [i]),
          C = se(
            (x, v) => {
              let I = x.replace(/px$/, '').replace(/%$/, 'pct'),
                N = v.replace(/px$/, '').replace(/%$/, 'pct'),
                B = A ? `${N}-${I}` : `${I}-${N}`;
              T({ value: B, isRotated: A });
            },
            [T, A],
          );
        return (
          ee(() => {
            n &&
              b &&
              (Object.hasOwn(s, b)
                ? (r.current = b)
                : ((r.current = void 0), ht in a || T({ value: void 0, isRotated: !1 })));
          }, [n, a, s, b, T]),
          ee(() => {
            (e.setAddonShortcut(ir, {
              label: 'Next viewport',
              defaultShortcut: ['alt', 'V'],
              actionName: 'next',
              action: () => T({ value: Rp(s, r.current), isRotated: A }),
            }),
              e.setAddonShortcut(ir, {
                label: 'Previous viewport',
                defaultShortcut: ['alt', 'shift', 'V'],
                actionName: 'previous',
                action: () => T({ value: Rp(s, r.current, -1), isRotated: A }),
              }),
              e.setAddonShortcut(ir, {
                label: 'Reset viewport',
                defaultShortcut: ['alt', 'control', 'V'],
                actionName: 'reset',
                action: () => T({ value: void 0, isRotated: !1 }),
              }));
          }, [e, T, s, A]),
          we(
            () => ({
              name: p,
              type: m,
              width: h,
              height: g,
              value: E,
              option: b,
              isCustom: _,
              isDefault: y,
              isLocked: S,
              isRotated: A,
              options: s,
              lastSelectedOption: r.current,
              resize: C,
              reset: () => T({ value: void 0, isRotated: !1 }),
              rotate: () => T({ value: E, isRotated: !A }),
              select: (x) => T({ value: x, isRotated: A }),
            }),
            [p, m, h, g, E, b, _, y, A, S, s, C, T],
          )
        );
      },
      E_ = {
        desktop: u.createElement(bl, null),
        mobile: u.createElement(Rl, null),
        tablet: u.createElement(jl, null),
        watch: u.createElement(Ul, null),
        other: u.createElement(Tl, null),
      },
      S_ = P.div(({ theme: e }) => ({
        display: 'flex',
        gap: 2,
        marginLeft: 20,
        fontFamily: e.typography.fonts.mono,
        fontSize: e.typography.size.s1 - 1,
        fontWeight: e.typography.weight.regular,
        color: e.textMutedColor,
      })),
      A_ = () => {
        let {
            name: e,
            value: t,
            isDefault: r,
            isLocked: n,
            options: o,
            reset: i,
            select: a,
          } = b_(),
          l = we(
            () =>
              Object.entries(o).map(([s, d]) => ({
                value: s,
                title: d.name,
                icon: E_[d.type],
                right: u.createElement(
                  S_,
                  null,
                  u.createElement('span', null, d.styles.width.replace('px', '')),
                  u.createElement('span', null, '\xD7'),
                  u.createElement('span', null, d.styles.height.replace('px', '')),
                ),
              })),
            [o],
          );
        return u.createElement(
          Bn,
          {
            resetLabel: 'Reset viewport',
            onReset: i,
            key: 'viewport',
            disabled: n,
            ariaLabel: n ? 'Viewport size set by story parameters' : 'Viewport size',
            ariaDescription:
              'Select a viewport among predefined options for the preview area, or reset to the default viewport.',
            tooltip: n ? 'Viewport set by story parameters' : 'Change viewport',
            defaultOptions: t,
            options: l,
            onSelect: (s) => a(s),
            icon: u.createElement(Cl, null),
          },
          r ? null : e,
        );
      },
      t8 = Oe.register(ir, () => {
        globalThis?.FEATURES?.viewport &&
          Oe.add(Ys, {
            title: 'viewport / media-queries',
            type: Qe.TOOL,
            match: ({ viewMode: e, tabId: t }) => e === 'story' && !t,
            render: () => te(A_, null),
          });
      });
  })();
} catch (e) {
  console.error('[Storybook] One of your manager-entries failed: ' + import.meta.url, e);
}
