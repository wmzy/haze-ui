/**
 * RSC-safe module manifest — source modules whose dist output is free of
 * the 'use client' banner so they can be imported directly from React
 * Server Components (same idea as shadcn's RSC-safe static components).
 *
 * A module qualifies only when ALL of the following hold (verified by
 * reading the compiled dist output, not just the source):
 *   - no React hook calls anywhere in the module — useControl/useState/
 *     useEffect/useRef/useCallback and custom `use*` hooks alike (the
 *     remaining hook-driven exclusions are documented in the list below);
 *   - no top-level DOM/window access (module side effects must be
 *     server-safe);
 *   - every in-package import stays inside this set — the transitive
 *     closure is part of the contract, because a server bundler that
 *     reaches a 'use client' module through a safe module turns that
 *     import into a client reference and the render throws. Bare imports
 *     (react/jsx-runtime) are externalized and always fine.
 *
 * Keys are paths relative to src/lib/. Consumed by vite.config.mts (banner
 * suppression during the lib build) and src/lib/dist-esm-contract.test.ts
 * (published-artifact assertions, including the transitive closure check).
 *
 * Keep additions conservative: a 'use client' banner on a server-safe
 * module is harmless, the reverse breaks RSC imports.
 */
export const RSC_SAFE_MODULES = new Set([
  // The x-class runtime every styled component compiles against: a pure
  // function with zero imports. Must be banner-free because every safe
  // component's dist output imports it.
  'utils/classnames.ts',
  // The shared numeric clamp: zero imports, no hooks, no DOM access —
  // the same purity class as classnames above.
  'utils/math.ts',
  // Shared text-match helpers (utils/text-match.ts): the substring
  // range finder + segment splitter Highlight and Tree search delegate
  // to — zero imports, same purity class as math above. Required for
  // the RSC-safe closure: Highlight.tsx (safe-listed) imports it.
  'utils/text-match.ts',
  // Menu-family shared skins: pure Linaria class constants — no hooks,
  // no DOM access; the @linaria/core import is elided at build time, so
  // the dist module is a bare constant list.
  'utils/menu-skins.ts',
  // The shared visually-hidden clip class (utils/sr-only.ts): a single
  // Linaria class whose only import is the bare @linaria/core
  // (externalized) — no hooks, no DOM access. Its css rides with the
  // consuming component groups (sharedLayers in split-css.mjs).
  'utils/sr-only.ts',
  // Shared field skin: pure Linaria class constants (surface chrome,
  // :focus-within ring, native input/textarea chrome, size map) — no
  // hooks, no DOM access, only the externalized @linaria/core import.
  'utils/field-skin.ts',
  // Shared keyboard focus ring (utils/focus-ring.ts): pure Linaria
  // class constants — imported by RSC-safe BreadcrumbItem, StatusBar
  // and TabBar.
  'utils/focus-ring.ts',
  // Shared tag skin (tag list/chip/remove button): the same purity
  // class as menu-skins above.
  'utils/tag-skin.ts',
  // Child-walk helper (utils/walk-children.ts): pure React.Children
  // traversal — no hooks, no DOM access, only react imports.
  'utils/walk-children.ts',
  // Shared disclosure skins (utils/disclosure-skin.ts): pure Linaria
  // class constants — same purity class as menu-skins above.
  'utils/disclosure-skin.ts',
  // Shared timeline skeleton (utils/timeline-skin.ts): pure Linaria
  // class constants. Required for the RSC-safe closure: Timeline.tsx
  // (safe-listed) imports this module.
  'utils/timeline-skin.ts',
  // Shared agentic status vocabulary (utils/agentic-status.ts): pure
  // union/tone/label constants with zero imports. The safe-listed
  // timeline-skin references it type-only (elided in dist), but the
  // module is pure either way and the agentic components consume it at
  // runtime.
  'utils/agentic-status.ts',
  // Shared preset rows (utils/preset-list-skin.ts): pure Linaria class
  // constants.
  'utils/preset-list-skin.ts',
  // Shared choice-input skin (utils/choice-skin.ts): the Checkbox/Radio
  // box + label bases — same purity class as menu-skins above.
  'utils/choice-skin.ts',
  // Shared status skin (utils/status-skin.ts): pure Linaria class
  // constants + plain color/role records — no hooks, no DOM access.
  // Required for the RSC-safe closure: the safe-listed Badge/Tag/Chip/
  // Progress/Indicator style modules import it. The solid/stroke
  // siblings (status-solid-skin / status-stroke-skin) are the same
  // purity class, split per the one-css-map-per-module rule Linaria's
  // member-key display naming forces (see status-skin.ts header).
  'utils/status-skin.ts',
  'utils/status-solid-skin.ts',
  'utils/status-stroke-skin.ts',
  // Design tokens: pure constants plus OKLCH math. In-package imports stay
  // within the group (palette -> oklch, registry -> oklch + palette,
  // brands -> palette; density/zoom import spacing's SPACE_PX and zoom
  // imports typography's TEXT_SIZE_PX — pure integer records, closure
  // stays in-group).
  'tokens/colors.ts',
  'tokens/brands.ts',
  'tokens/spacing.ts',
  'tokens/z-index.ts',
  'tokens/density.ts',
  'tokens/typography.ts',
  'tokens/motion.ts',
  'tokens/zoom.ts',
  'tokens/palette.ts',
  'tokens/oklch.ts',
  'tokens/registry.ts',
  'tokens/index.ts',
  // The haze-ui/icons subpath barrel: pure named re-exports of the
  // external lucide-react (bare import, outside the in-package closure)
  // plus the frozen hazeIconSize constant — no hooks, no DOM access.
  'icons/index.ts',
  // Pure presentational components (verified hook-free, react/linaria
  // imports only). Directories are atomic: a dir joins the list only when
  // every module its barrel re-exports is safe.
  'components/AspectRatio/AspectRatio.tsx',
  'components/AspectRatio/index.ts',
  'components/Badge/Badge.tsx',
  'components/Badge/index.ts',
  'components/Badge/badge-styles.ts',
  'components/Card/Card.tsx',
  'components/Card/index.ts',
  // CodeBlock was here until wave 5's audit caught it going stale: the
  // async highlighter feature (wave 1-4) added useState/useEffect/
  // useMemo. The banner/list self-consistency test cannot see that (it
  // only compares banners against list membership), so hook usage must
  // be re-audited on every list touch.
  'components/Container/Container.tsx',
  'components/Container/index.ts',
  'components/Divider/Divider.tsx',
  'components/Divider/index.ts',
  'components/Flex/Flex.tsx',
  'components/Flex/index.ts',
  'components/Grid/Grid.tsx',
  'components/Grid/GridItem.tsx',
  'components/Grid/grid-item-styles.ts',
  'components/Grid/index.ts',
  'components/Icon/Icon.tsx',
  'components/Icon/index.ts',
  'components/Indicator/Indicator.tsx',
  'components/Indicator/index.ts',
  'components/Kbd/Kbd.tsx',
  'components/Kbd/index.ts',
  'components/Skeleton/Skeleton.tsx',
  'components/Skeleton/index.ts',
  'components/Mark/Mark.tsx',
  'components/Mark/index.ts',
  'components/Highlight/Highlight.tsx',
  'components/Highlight/index.ts',
  'components/NumberFormatter/NumberFormatter.tsx',
  'components/NumberFormatter/index.ts',
  'components/Fieldset/Fieldset.tsx',
  'components/Fieldset/index.ts',
  'components/VisuallyHidden/VisuallyHidden.tsx',
  'components/VisuallyHidden/index.ts',
  'components/Sparkline/Sparkline.tsx',
  'components/Sparkline/index.ts',
  'components/Sparkline/sparkline-styles.ts',
  // Heatmap: pure render from props (labels are prop functions, no
  // useStrings / no hooks of any kind); imports only its sibling
  // styles module besides the classnames runtime.
  'components/Heatmap/Heatmap.tsx',
  'components/Heatmap/index.ts',
  'components/Heatmap/heatmap-styles.ts',
  'components/Stat/Stat.tsx',
  'components/Stat/index.ts',
  'components/Typography/Typography.tsx',
  'components/Typography/index.ts',
  // De-hooked for RSC safety: their only hook was useStrings, and a
  // server tree could never source those strings from a client
  // LocaleProvider anyway (context does not cross the RSC boundary).
  // The copy became props with inlined English defaults — removeLabel
  // (Tag/Chip), native aria-label defaults (Breadcrumb/Progress), an
  // overflowLabel formatter (AvatarGroup). Note the use(LocaleContext)
  // variant is structurally impossible: LocaleContext.ts calls
  // createContext at module scope, the react-server condition of React
  // does not even export createContext, so it can never join a safe
  // closure.
  'components/Tag/Tag.tsx',
  'components/Tag/tag-styles.ts',
  'components/Tag/index.ts',
  'components/Chip/Chip.tsx',
  'components/Chip/chip-styles.ts',
  'components/Chip/index.ts',
  'components/Breadcrumb/Breadcrumb.tsx',
  'components/Breadcrumb/BreadcrumbItem.tsx',
  'components/Breadcrumb/index.ts',
  'components/Progress/Progress.tsx',
  'components/Progress/progress-styles.ts',
  'components/Progress/index.ts',
  'components/AvatarGroup/AvatarGroup.tsx',
  'components/AvatarGroup/index.ts',
  // Still excluded, with reasons:
  // - Empty: useStrings drives the visible default description text and
  //   the `empty` section is the flagship of the LocaleProvider strings
  //   override story (LocaleProvider.test.tsx layering tests + the
  //   LocaleProvider demo both ride it) — de-hooking would orphan that.
  // - Avatar: useState tracks the img onError fallback — genuinely
  //   internal UI state, no props-only replacement exists.
  // - ActivityRail / DateTimePicker / Queue / LoadingOverlay: hook-free
  //   themselves but their closures reach client modules (Tooltip,
  //   Datepicker, Spinner's useStrings).
  //
  // Verified hook-free additions below needed no source changes: pure
  // presentational, imports stay inside the safe set. TabBar composes
  // Badge; NavigationBar's NavLink wraps render in forwardRef — not a
  // hook, and it renders fine on the server (ref is simply absent).
  'components/Affix/Affix.tsx',
  'components/Affix/index.ts',
  'components/Descriptions/Descriptions.tsx',
  'components/Descriptions/index.ts',
  'components/List/List.tsx',
  'components/List/ListItem.tsx',
  'components/List/index.ts',
  'components/NavigationBar/NavigationBar.tsx',
  'components/NavigationBar/NavLink.tsx',
  'components/NavigationBar/index.ts',
  'components/Result/Result.tsx',
  'components/Result/index.ts',
  'components/StatusBar/StatusBar.tsx',
  'components/StatusBar/index.ts',
  'components/TabBar/TabBar.tsx',
  'components/TabBar/index.ts',
  'components/Timeline/Timeline.tsx',
  'components/Timeline/index.ts',
]);

/**
 * Relativize an absolute module id (rollup `facadeModuleId` etc.) against
 * src/lib. Returns undefined for ids outside src/lib or with no id at all
 * (shared chunks without a module facade).
 */
export function libRelativeModuleId(moduleId) {
  if (!moduleId) return undefined;
  const normalized = moduleId.replaceAll('\\', '/').split('?')[0];
  const marker = '/src/lib/';
  const at = normalized.lastIndexOf(marker);
  return at === -1 ? undefined : normalized.slice(at + marker.length);
}

/** True when the module id is one of the RSC-safe source modules. */
export function isRscSafeModule(moduleId) {
  const rel = libRelativeModuleId(moduleId);
  return rel !== undefined && RSC_SAFE_MODULES.has(rel);
}

/** The safe list mapped to dist paths ('components/Badge/Badge.tsx' -> '.../Badge.js'). */
export const rscSafeDistPaths = () =>
  new Set([...RSC_SAFE_MODULES].map((key) => key.replace(/\.tsx?$/, '.js')));
