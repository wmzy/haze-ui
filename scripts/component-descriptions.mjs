/**
 * The one hand-written blurb table behind both generated component indexes:
 *
 *   - llms.txt (scripts/generate-llms.mjs) — one bullet per demo sidebar
 *     entry of src/views/Layout/component-groups.ts;
 *   - the shadcn registry (scripts/generate-registry.mjs) — the
 *     `description` of every css-family item in registry/ + registry.json.
 *
 * Keys are css families (kebab-case component directories). That is also the
 * sidebar `route`, the props.json `cssFamily` and the registry item name —
 * one identity for all of them.
 *
 * Entry shapes:
 *   'text'              both outputs use the sentence verbatim.
 *   same('Text')        both outputs use the sentence; llms.txt spells it
 *                       with a lower-case first letter (its bullets read
 *                       "- **Name** — …"), the registry keeps the capital.
 *   { llms, registry }  the outputs word the blurb differently — each text
 *                       verbatim, nothing is normalised.
 *   { llms }            llms.txt only — the key must be in CSS_LESS.
 *   { registry }        registry only — the key must be in REGISTRY_ONLY.
 *
 * The self-check at the bottom runs on import, so an entry that is
 * one-sided without being listed, a listed key that is not one-sided, a
 * malformed entry or a stale exception fails both generators at start-up
 * (an uncaught `component-descriptions: …` error). Generate-registry also
 * re-checks CSS_LESS against the build's css-manifest on every run.
 */

/**
 * Components without a stylesheet of their own (`noCss` in
 * dist/css-manifest.json): they have a demo page and an llms.txt bullet,
 * but the registry wraps css families only and never asks for a blurb.
 * This is the exhaustive list of keys allowed to skip the registry side.
 * generate-registry re-checks the premise on every run — once one of these
 * ships its own stylesheet the build fails until the registry blurb is
 * written and the key is removed here.
 */
export const CSS_LESS = new Set([
  'config-provider',
  'date-time-picker',
  'fullscreen',
  'highlight',
  'locale-provider',
  'masked-input',
  'number-formatter',
]);

/**
 * The other direction: registry items without a sidebar entry — the
 * theme-class family, which llms.txt describes in its Design tokens
 * section instead.
 */
const REGISTRY_ONLY = new Set(['tokens']);

/** One sentence for both outputs (see the entry shapes above). */
const same = (registry) => ({
  llms: registry.charAt(0).toLowerCase() + registry.slice(1),
  registry,
});

export const COMPONENT_DESCRIPTIONS = {
  // General
  avatar: same(
    'User avatar with image, size variants and fallback content when the image is missing.'
  ),
  'avatar-group': same(
    'Stacks avatars in overlapping rows with a `+N` overflow chip (`max`/`total`).'
  ),
  badge: {
    llms: 'small inline status label with a semantic `color` prop.',
    registry: 'Small inline status label with variant and color options.',
  },
  button: {
    llms: 'action button with `variant`/`size`/`square` options; native `<button>` under the hood.',
    registry:
      'Action button with `variant`/`size`/`square` options over a native `<button>`; `ButtonLink` renders the same styles as an anchor.',
  },
  'button-group': {
    llms: 'attached button bar — corners and seams merge via wrapper CSS while children stay real focusable `Button`s; group-wide `size`/`variant`/`disabled` fill in on children that leave them unset, `ButtonGroupSeparator` divides the bar (1px rule or a glyph/label).',
    registry:
      'Attached button bar: merged corners and seams, group-wide size/variant/disabled, separator sub-component.',
  },
  'copy-button': {
    llms: 'one-click copy button over Button’s skin and `useClipboard`: copies `value` or a lazy `getValue()` on click, flips into a copied state for `copiedTimeout` ms (copy→check glyph, Copy→Copied accessible name, visually-hidden `role=status` announcement); render-prop children receive the copied state. `Snippet` is the code-chip form — mono content with a small ghost CopyButton; the clipboard always gets `value`, never the display children.',
    registry:
      'Copy-to-clipboard button (Button skin, useClipboard plumbing, copied-state feedback with SR announcement) plus Snippet: the inline mono code chip with a docked copy button.',
  },
  divider: same('Content separator line, horizontal or vertical.'),
  icon: same('Inline SVG icon wrapper with token-sized `sm`/`md`/`lg` boxes.'),
  tag: {
    llms: 'compact status label with semantic `color` and an optional close button.',
    registry:
      'Compact status label with variant color and optional close button.',
  },
  'tag-group': {
    llms: 'flex-wrap container laying out Tag children with consistent gap; `sortable` + `onReorder(nextOrder)` for dnd-kit drag reordering.',
    registry:
      'Flex-wrap container laying out Tag children with consistent gap; `SortableTagGroup` + `onReorder` for dnd-kit drag reordering.',
  },
  typography: same(
    'Text primitives: `Title`, `Text`, `Paragraph` on typography tokens.'
  ),
  ellipsis: {
    llms: 'interactive text truncation: N-line clamp with truncation detection, optional tooltip and expand/collapse.',
    registry:
      'Interactive text truncation: N-line clamp with truncation detection, optional tooltip and expand/collapse; Typography also ships a pure-CSS `ellipsis` prop.',
  },
  'count-up': same(
    'Animated number ticker: rAF + ease-out interpolation toward `to`, honoring `prefers-reduced-motion` with an instant snap.'
  ),
  countdown: {
    llms: 'deadline countdown with second-boundary-aligned setTimeout-chain ticks, `onFinish` firing once, and adaptive `d`/`h:mm:ss` formatting.',
    registry:
      'Deadline countdown: `value` timestamp or Date, setTimeout-chain ticks aligned to second boundaries (no interval drift), `onFinish` fires once, adaptive `1d hh:mm:ss` / `hh:mm:ss` default format with `format`/`render` escape hatches.',
  },
  mark: {
    llms: 'text-level highlight — semantic `<mark>` skinned with status tokens.',
    registry:
      'Text-level highlight — semantic `<mark>` skinned with the status tokens (`warning`/`primary`/`success`/`danger`).',
  },
  highlight: {
    llms: 'search-result text highlighting: marks substrings of a text prop inside Mark elements; needles are escaped (no innerHTML).',
  },
  'number-formatter': {
    llms: 'presentational number formatting powered by Intl: locale + formatOptions (currency, unit, percent) with prefix/suffix.',
  },

  // Layout
  'app-shell': {
    llms: 'application frame with sticky header, collapsible sidebar (`ControlOrValue`), content and footer slots; CSS-Grid layout, sidebar turns overlay below 768px.',
    registry:
      'Application frame with sticky header, collapsible sidebar, content and footer slots; the sidebar becomes an overlay below 768px.',
  },
  'activity-rail':
    'VSCode-style vertical icon rail (`nav`): 44px items with icon/label/badge/active indicator, tooltip labels and `slot="end"` bottom pinning.',
  'aspect-ratio': same('Boxes children to a fixed width/height ratio.'),
  container: same('Centered max-width page container with horizontal padding.'),
  flex: same('Flexbox layout primitive mapping props to flex CSS.'),
  grid: {
    llms: 'CSS grid layout primitive.',
    registry: 'CSS grid layout primitive with `GridItem` children.',
  },
  masonry: {
    llms: 'pinboard layout: JS greedy column distribution balances children across `columns` (order-first, shortest-column-next).',
    registry:
      'Masonry (pinboard) layout: JS greedy column distribution balances children across `columns`.',
  },
  resizable: {
    llms: 'split-pane group with draggable dividers (`ResizableGroup`, horizontal or vertical); px `defaultSize`/`minSize`/`maxSize` per panel (`id`-keyed), keyboard arrows (16px), `collapsible`/`collapsed` control and `onResizeCommit(sizes)` for persistence.',
    registry:
      'Split-pane group with draggable dividers, horizontal or vertical; px sizing per panel with `onResizeCommit` for persistence.',
  },
  'scroll-area': {
    llms: 'scrollable region with overlay scrollbar thumbs: `maxHeight` sugar one-liner or compound `ScrollViewport`/`Scrollbar`/`ScrollThumb` composition; `type` = `hover`/`always`/`scroll` thumb visibility, keyboard-focusable viewport, draggable/pageable tracks, RTL-mirrored thumbs.',
    registry:
      'Scrollable region with overlay scrollbar thumbs: `maxHeight` sugar or compound `ScrollViewport`/`Scrollbar`/`ScrollThumb` parts; `type` = `hover`/`always`/`scroll` visibility, keyboard-focusable viewport, RTL-mirrored thumbs.',
  },
  sidebar: {
    llms: 'app sidebar shell with controllable collapsed state (`aside` + rail width tokens).',
    registry:
      'App sidebar shell with controllable collapsed state: `SidebarGroup`/`SidebarItem`/`SidebarFooter`/`SidebarToggle` parts.',
  },
  splitter: {
    llms: 'multi-pane split layout with implicit draggable dividers (AntD `Splitter` semantics); `sizes` as percentages of the pane area (`ControlOrValue` of `number[]`, live `onSizesChange`), per-pane `min`/`max` percent clamps, opt-in per-pane `collapsible` (divider collapse/expand triggers with pre-collapse restore, localized labels), keyboard arrows (5% steps) + Home/End, RTL-mirrored; px-sized panes live in `ResizableGroup`.',
    registry:
      'Multi-pane split layout with implicit draggable dividers (AntD Splitter semantics): `sizes` in percent of the pane area (`ControlOrValue` array), per-pane `min`/`max` clamps, opt-in `collapsible` panes with divider collapse/expand triggers, keyboard arrows and pointer drags.',
  },
  'status-bar':
    'VSCode-style status strip (`footer`): `left`/`right` groups, selectable `StatusItem`s, `priority` items survive the mobile breakpoint.',
  'tab-bar': {
    llms: 'mobile bottom navigation (the ActivityRail viewport peer): 56px strip with safe-area inset, icon+label items, badge, `onSelect`/`onReselect` (tap-active-again) semantics.',
    registry:
      'Mobile bottom navigation (the ActivityRail viewport peer): 56px safe-area strip, icon+label items, badge, `onSelect`/`onReselect` semantics.',
  },
  workbench: {
    llms: 'IDE-style application frame (`100dvh`): activityBar/sidebar/auxiliaryBar/panel/statusBar/tabBar slots with px-resizable, collapsible regions (`ControlOrValue`), maximizable bottom panel; below 768px side regions become overlays and the tabBar takes over.',
    registry:
      'IDE-style application frame (`100dvh`): activityBar/sidebar/auxiliaryBar/panel/statusBar/tabBar slots with px-resizable collapsible regions and a maximizable bottom panel; below 768px sides become overlays and the tabBar takes over.',
  },

  // Forms
  cascader: {
    llms: 'multi-level drill-down selector committing a path of option values; `onSearch` filters remotely while `loading` shows the pending state.',
    registry:
      'Multi-level drill-down selector committing a path of option values; `onSearch` filters remotely, `loading` shows the pending state.',
  },
  checkbox: {
    llms: 'checkbox input with controllable `checked` state.',
    registry:
      'Checkbox input with controllable `checked` state; `CheckboxCore` is the headless form-bindable core.',
  },
  'color-picker': same(
    'Color selector with controllable value and preset swatches.'
  ),
  combobox: same(
    'Autocomplete text input with filterable option list; `onSearch` defers filtering to the host.'
  ),
  'date-field': {
    llms: 'segmented date input (year/month/day spinbuttons) typing `YYYY-MM-DD` directly — no calendar; `DateFieldCore` is the headless core.',
    registry:
      'Segmented date input: year/month/day spinbuttons typed directly (`YYYY-MM-DD` value); `DateFieldCore` is the headless core.',
  },
  datepicker: {
    llms: 'date input with popup calendar (`YYYY-MM-DD` value); `showTime` adds a time-of-day field.',
    registry:
      'Date input with popup calendar (`YYYY-MM-DD` value); `showTime` adds a time-of-day field. `DatepickerCore` is the headless core.',
  },
  // sidebar route; the registry table used to key it `datetime-picker`
  'date-time-picker': {
    llms: 'date+time picker (Datepicker with the time row always on); `showSeconds` opt-in; value serializes "YYYY-MM-DD HH:mm[:ss]".',
  },
  'date-range-picker': same(
    'Picks a start/end date range, with built-in or custom `presets` (Today, Last 7 days, …).'
  ),
  fieldset: same(
    'Semantic form grouping: native `fieldset`+`legend` (group named by the legend), `disabled` disables every control inside.'
  ),
  'file-input': same('Trigger element that opens a hidden native file input.'),
  form: 'react-f0rm field wrapper adding label, error and aria wiring to controlled cores.',
  'image-crop': same(
    'Interactive image cropper pairing with Upload: controllable normalized CropRect value, aspect lock, circle avatar mask, pointer drag with corner handles, full keyboard operation (arrows move, Shift+arrows resize) and a getCroppedCanvas ref API.'
  ),
  'inline-edit': same('Click-to-edit text value in place.'),
  input: {
    llms: 'text input with `leftSection`/`rightSection` adornments; sugar over `InputCore`.',
    registry:
      'Text input with adornments; `InputCore` is the headless form-bindable core.',
  },
  'input-group': {
    llms: 'field cluster merging `Input`/`Select` with prefix/suffix `InputGroupAddon` cells (icon, text) and an optional trailing `Button` into one attached control; the composition layer keeps zero state — the field value contract is untouched.',
    registry:
      'Field cluster: prefix/suffix addons (icon, text, button) merged with Input/Select into one attached control.',
  },
  'masked-input': {
    llms: 'masked text input enforcing a pattern (`9` digit, `a` letter, `A` uppercase letter, `*` alphanumeric, `\\` escape); literals render as typed, `unmask()` extracts the raw slot content.',
  },
  mentions: {
    llms: 'mentions input with trigger-character suggestions picked from an option list.',
    registry:
      'Mentions input with trigger-character suggestions picked from an option list (`MentionsCore` is the headless core).',
  },
  'number-input': same('Numeric input with `min`/`max`/`step`.'),
  'otp-input': same(
    'One-time-password input of `length` segmented character boxes.'
  ),
  'password-input': same('Text input with a visibility reveal toggle.'),
  'phone-input': {
    llms: 'international phone input on libphonenumber-js: country select joined seamlessly to the number field, E.164-ish value, `isValidPhone()` helper.',
    registry:
      'International phone input backed by libphonenumber-js: country select joined seamlessly to the number field, E.164-ish value, `isValidPhone()` pure helper.',
  },
  radio: {
    llms: 'radio option and group with controllable selection.',
    registry:
      'Radio option and group with controllable selection (`Radio`, `RadioGroup`, headless `RadioGroupCore`).',
  },
  rating: same('Star rating with half-step support.'),
  'rich-text-editor': {
    llms: 'Tiptap-powered rich text editor (a haze-ui dependency) with built-in formatting toolbar and controllable HTML `value`.',
    registry:
      'Tiptap-powered rich text editor with a built-in formatting toolbar and controllable HTML `value`.',
  },
  segmented: same('Segmented control selecting one option from a compact set.'),
  select: same(
    'Dropdown select over `SelectCore` with `<option>` children; `onSearch` enables server-side filtering.'
  ),
  signature: same(
    'Canvas signature pad committing a PNG data URL on every stroke, with undo, clear and a no-canvas fallback notice.'
  ),
  slider: same('Native range slider with controllable value.'),
  switch: same('Toggle switch (`role="switch"`) with controllable `checked`.'),
  'tag-input': {
    llms: 'enter-to-commit token input over `TagInputCore`; `sortable` enables dnd-kit drag reordering (new order via `onChange`).',
    registry:
      'Enter-to-commit token input; `SortableTagInput` enables dnd-kit drag reordering (via `onChange`).',
  },
  'time-grid': {
    llms: "single-select `'HH:mm'` slot grid generated from `from`/`to` (inclusive) and a minute `step` (default 60): ARIA radiogroup of native buttons with roving tabindex, arrows move-and-select, `value` is ControlOrValue, `name` rides a hidden input bridge for FormData/server actions.",
    registry:
      "Single-select 'HH:mm' slot grid from a from/to window and minute step; radiogroup semantics with roving-tabindex arrow selection, controllable value, disabled slots.",
  },
  textarea: same('Multiline text input.'),
  'time-field': {
    llms: 'segmented time-of-day input (hour/minute/second spinbuttons, optional 12-hour AM/PM) typing `HH:mm[:ss]` directly.',
    registry:
      'Segmented time-of-day input: hour/minute/second spinbuttons with optional 12-hour AM/PM (`HH:mm[:ss]` value).',
  },
  'time-picker': same('Time-of-day input with controllable value.'),
  toggle: {
    llms: 'two-state pressed button (`aria-pressed`) with sizes and `square` icon mode; `ToolbarToggle` variant rides toolbar roving focus.',
    registry:
      'Two-state pressed button (`aria-pressed`) with sizes and `square` icon mode.',
  },
  transfer: same(
    'Two-column shuttle moving options between source and target lists.'
  ),
  'tree-select': same(
    'Tree selection in a floating panel (AntD TreeSelect counterpart): selectable rows commit one key, cascading checkboxes commit `string[]`, with panel search, lazy `loadData` and chip overflow.'
  ),
  upload: same(
    'File picker with accumulating `File[]` value, `accept`/`multiple`, `directory` picking and `listType` rendering.'
  ),

  // Overlays
  'bottom-sheet': same(
    'Mobile-style sheet sliding from the bottom screen edge.'
  ),
  'confirm-dialog': same(
    'Ready-made confirm dialog with confirm/cancel actions and a danger variant.'
  ),
  'context-menu': same('Floating menu opened on right-click.'),
  dialog: same('Modal dialog with focus trapping.'),
  drawer: same('Edge-anchored sliding panel (`placement` left/right).'),
  'dropdown-menu': {
    llms: 'click-triggered floating menu.',
    registry:
      'Click-triggered floating menu with `DropdownMenuTrigger`/`Content`/`Item`/`Separator` parts.',
  },
  'hover-card': same(
    'Non-modal floating preview (avatar card, link summary) anchored to its trigger.'
  ),
  menu: same(
    'Lightweight toggle menu with a trigger and statically positioned panel (`MenuItem`, `MenuDivider`).'
  ),
  'notification-center': {
    llms: 'persistent notification feed behind a bell trigger: unread-count badge, severity/kind rows (`task`/`agent`/`system`), mark-all-read and clear-all — declarative `items`, not an imperative open() API.',
    registry:
      'Persistent notification feed behind a bell trigger: unread-count badge, severity/kind rows, mark-all-read and clear-all — declarative `items`, not an imperative open() API.',
  },
  popconfirm: same(
    'Anchored confirmation bubble with confirm/cancel actions and async busy support.'
  ),
  popover: same('Floating popover anchored to a trigger element.'),
  tooltip: same('Hover/focus hint bubble.'),

  // Data Display
  accordion: {
    llms: 'collapsible section list (`AccordionItem` with `title`).',
    registry: 'Collapsible section list with titled `AccordionItem` sections.',
  },
  calendar: same(
    'Month-grid date surface with `min`/`max`, locale and `weekStartsOn`.'
  ),
  card: same('Content card with `elevated`/`outlined`/`filled` variants.'),
  carousel: same('Slideshow with controllable active index and autoplay.'),
  chart: {
    llms: 'line/area/bar/pie charts over `recharts` (a haze-ui dependency), colors and axes on haze tokens; series cycle the semantic palette, `renderTooltip` customizes the tooltip.',
    registry:
      'Line/area/bar/pie charts over recharts with colors and axes on haze tokens; series cycle the semantic palette, `renderTooltip` customizes the tooltip.',
  },
  chip: same('Rounded status chip with optional icon and close button.'),
  'code-block': same(
    'Monospace code container with a language badge; `highlight` plugs in an async syntax highlighter.'
  ),
  'data-table': {
    llms: 'feature table on `@tanstack/react-table` (sorting, row selection, client or `manual` pagination); `dataTableToCsv` exports the rows.',
    registry:
      'Feature table on @tanstack/react-table with sorting, (manual) pagination, row selection and `dataTableToCsv` export.',
  },
  descriptions: {
    llms: 'definition-list description groups (`dl`/`dt`/`dd` on CSS Grid): `items` pairs, `columns`, `bordered`, `size`.',
    registry:
      'Definition-list description groups (`dl`/`dt`/`dd` over CSS Grid): `items` pairs, `columns`, `bordered`, `size`.',
  },
  image: same(
    'Image with fallback, `aspectRatio`/`objectFit` control and click-to-preview overlay; `ImagePreviewGroup` wraps child images in a shared gallery lightbox (arrows, counter, thumbnail strip).'
  ),
  indicator: {
    llms: 'corner badge attached to a host element: dot or count label, tone + corner position, zero hides unless `showZero`.',
    registry:
      'Corner badge attached to a host element (avatar, icon button): dot or count label, tone + corner position, zero-badge hides unless `showZero`.',
  },
  'json-view': same(
    'Collapsible JSON tree viewer with per-kind leaf colors, depth-based default expansion, truncation hints and an optional copy button.'
  ),
  kbd: same('Keyboard key-cap styling for shortcuts.'),
  list: {
    llms: 'styled `ul`/`ol`/plain list variants.',
    registry: 'Styled `ul`/`ol`/plain list with `ListItem` children.',
  },
  progress: same('Progress bar or circle driven by a percentage `value`.'),
  meter: {
    llms: 'read-only semantic gauge (React Aria `role=meter` + aria-valuenow/min/max): `value` normalized over `min`/`max`, `thresholds` bands recolor track (subtle wash) and bar (solid color) as the value crosses each `at` bound, `label` wires a visible label via aria-labelledby, `showValue` renders the numeric readout, `size` sm/md/lg matches Progress bar heights.',
    registry:
      'Read-only semantic gauge: value normalized over min/max, threshold bands recolor track and bar, visible label + aria-labelledby, showValue readout, three track sizes.',
  },
  'qr-code': {
    llms: 'QR code rendered as one crisp SVG path with `value`/`size`/`level`/`bordered` options and theme-token module/background colors.',
    registry:
      'QR code rendered as one crisp SVG path over the `qrcode` engine dependency; theme-token module/background colors with `value`/`size`/`level`/`bordered` options.',
  },
  schedule: {
    llms: 'calendar surface with day/week/month views — pointer drag and keyboard rescheduling, month grid with +N overflow chips.',
    registry:
      'Calendar surface with day/week/month views, drag-and-keyboard rescheduling and a month grid with overflow chips.',
  },
  sparkline: {
    llms: 'inline-SVG mini trend chart (line/area variants, semantic stroke colors); stateless, recharts-free and RSC-safe.',
    registry:
      'Inline-SVG mini trend chart (line/area variants, tone colors); stateless, recharts-free and RSC-safe.',
  },
  heatmap: {
    llms: 'GitHub-style activity calendar: week columns × weekday rows of squares, `data` (array or Record) binned into `levels` intensity steps (default 4) and tinted via `color-mix` of primary↔bg-subtle — light/dark/brand themes follow automatically; `getLabel`/`getMonthLabel`/`getWeekdayLabel`/`summary` carry all i18n, RSC-safe (hook-free).',
    registry:
      'GitHub-style activity calendar: week × weekday grid of squares, intensity-binned by value (levels prop), theme-aware color-mix scale, label props for all i18n.',
  },
  spoiler: {
    llms: 'collapsed long-content gate ("show more/less"): height-capped preview with a fade edge; controllable `expanded`.',
    registry:
      'Collapsed long-content gate ("show more/less"): height-capped preview with a fade edge and a toggle button; `expanded` is controllable.',
  },
  stat: {
    llms: 'metric display with title, value and trend indicator.',
    registry:
      'Metric display with title, value and trend indicator (`StatGroup` container).',
  },
  table: {
    llms: 'styled semantic table (`striped`, `bordered`).',
    registry:
      'Styled semantic table (`striped`, `bordered`) with head/body/row/cell parts.',
  },
  timeline: same('Vertical timeline container for `TimelineItem` children.'),
  tree: {
    llms: 'hierarchical tree with expand, select and check state, async `loadData` and `searchValue` filtering.',
    registry:
      'Hierarchical tree with expand, select, check state, async `loadData` and `searchValue` filtering.',
  },
  'virtual-list': same(
    'Windowed list rendering only visible rows; fixed or measured dynamic heights.'
  ),
  watermark: {
    llms: 'tiled canvas watermark layer over children (or `fullscreen`); theme-aware color, degrades gracefully without canvas 2d support.',
    registry:
      'Tiled canvas watermark layer over children (or `fullscreen`), theme-aware color.',
  },

  // Navigation
  affix: same(
    'Fixes children to a viewport edge once scrolled past an offset.'
  ),
  anchor: {
    llms: 'sticky scroll-spy navigation: `items` list highlighting the active section (IntersectionObserver, controllable `activeId`), click scrolls with `offsetTop`.',
    registry:
      'Sticky scroll-spy navigation: an `items` list highlighting the active section, click scrolls with an offset.',
  },
  'back-to-top': same(
    'Floating scroll-to-top button appearing past a scroll threshold.'
  ),
  breadcrumb: same('Breadcrumb trail nav with configurable separator.'),
  command: {
    llms: 'command palette surface: `CommandInput` plus filterable `CommandItem`s.',
    registry:
      'Command palette surface: `CommandInput` plus filterable `CommandItem`s in a `CommandList`.',
  },
  'float-button': {
    llms: 'floating action button over the page; `FloatButtonGroup` stacks actions behind an expand trigger, with back-to-top and help glyphs built in.',
    registry:
      'Floating action button over the page (`FloatButtonGroup` for expandable stacks) with built-in back-to-top and help glyphs.',
  },
  'navigation-bar': {
    llms: 'top nav bar with `brand` and `end` slots.',
    registry: 'Top nav bar with `brand` and `end` slots plus `NavLink` items.',
  },
  'navigation-menu': {
    llms: 'hover mega-menu navigation (WAI-ARIA disclosure navigation pattern): `NavigationMenuTrigger` opens `NavigationMenuContent` panels with a ~100ms intent dwell and ~300ms pointer grace, instantly switching between open panels; `activeValue` is controllable, Escape closes, left/right arrows traverse triggers.',
    registry:
      'Hover mega-menu navigation bar: triggers open large content panels (link columns, card grids — any ReactNode) after an intent dwell with a pointer grace period; controllable `activeValue`, Escape closes, arrows traverse triggers.',
  },
  pagination: same(
    'Page navigation with controllable `page` and ellipsis windows.'
  ),
  stepper: same('Step indicator driven by `activeStep` (`Step` children).'),
  tabs: {
    llms: 'tab panel switcher with controllable active tab; document affordances on `Tab` (`icon`, `status` dot, `closable` ×/Delete) and `TabList` overflow ⋯ menu; `SortableTabList` adds dnd-kit drag reordering.',
    registry:
      'Tab panel switcher with controllable active tab (`TabList`, `Tab`, `TabPanel`).',
  },
  toolbar: {
    llms: 'button group with toolbar a11y (roving tabindex; `ToolbarButton`, `ToolbarSeparator`).',
    registry:
      'Button group with toolbar a11y (roving tabindex): `ToolbarButton`, `ToolbarSeparator`, `ToolbarToggle`.',
  },
  tour: same(
    'Guided walkthrough spotlighting `steps` behind a mask, controllable `current`.'
  ),

  // Feedback
  alert: same('Inline status message box.'),
  'async-section': same(
    'Declarative loading / error / content states for async data.'
  ),
  banner: {
    llms: 'dismissible top banner with semantic status colors.',
    registry:
      'Dismissible top banner with info/success/warning/danger variants.',
  },
  empty: same('Empty-state placeholder with image and description.'),
  'error-boundary': {
    llms: 'render-error boundary: class component catching subtree throws, rendering a fallback (`fallback` node or render prop receiving `error`/`info`/`resetErrorBoundary`) with a reset callback; `resetKeys` shallow-change resets.',
    registry:
      'Render-error boundary: class component catching subtree throws, rendering a fallback (`fallback` node or render prop) with a reset callback; `resetKeys` shallow-change resets.',
  },
  result: same(
    'Result feedback page: status illustration (`success`/`error`/`info`/`warning`/`403`/`404`/`500`), `title`, `subTitle` and an `extra` action area; `icon` replaces the default illustration.'
  ),
  skeleton: same(
    'Shimmering loading placeholder (`text`/`circular`/`rectangular`).'
  ),
  spinner: same('Loading spinner.'),
  'loading-overlay': {
    llms: 'container-level loading state: dims content, centers a spinner (or custom loader), `aria-busy` mirrors the phase.',
    registry:
      'Container-level loading state: dims content and centers a spinner (or custom loader) above it, `aria-busy` mirrors the phase.',
  },
  toast: {
    llms: 'toast notifications via `useToast` + `ToastContainer` (imperative `toast()` helper included).',
    registry:
      'Toast notifications via `useToast` + `ToastContainer`, with the imperative `toast()` helper.',
  },

  // AI & Chat
  'approval-card': same(
    'Approval gate with approve / deny actions for agent-initiated operations.'
  ),
  'chat-container': same(
    'Chat transcript scroll container with stick-to-bottom auto-scroll.'
  ),
  'chat-input': same(
    'Message composer with a controllable value and onSend callback.'
  ),
  'chat-message': same(
    'Chat bubble with role-based layout (user / assistant / system), avatar, name, timestamp and delivery status.'
  ),
  'conversation-list': same(
    'Selectable list of conversations for a chat-history sidebar.'
  ),
  'diff-viewer': same(
    'Renders the line diff between old and new content for agent-proposed edits.'
  ),
  'file-preview': {
    llms: 'attachment card with image thumbnail or extension badge, upload progress and remove/retry actions.',
    registry:
      'Attachment card with image thumbnail or extension badge, size formatting, upload progress and remove/retry actions.',
  },
  'follow-up-suggestions': {
    llms: 'AI-chat follow-up suggestions: wrapping row of clickable prompt chips (role=list/listitem) with loading skeletons and disabled states.',
    registry:
      'Wrapping row of clickable AI-chat follow-up suggestion chips with loading skeleton and disabled states.',
  },
  'inline-citation': same(
    'Inline superscript citation marker that opens a floating source card with title, snippet and optional outbound link.'
  ),
  'inline-completion': {
    llms: 'ghost-text completion overlay for input/textarea; Tab accepts the suggestion, Escape dismisses it.',
    registry:
      'Ghost-text completion overlay for input/textarea: Tab accepts the suggestion, Escape dismisses it.',
  },
  'log-viewer': same('Scrollable log stream with severity-level filtering.'),
  'markdown-renderer': same(
    'Renders markdown content (including code blocks) for assistant responses.'
  ),
  'model-picker': same('Controllable dropdown for selecting the active model.'),
  plan: same(
    'Agent plan and progress display: `Plan` + `Plan.Item` step list whose statuses drive an auto progress bar and summary.'
  ),
  'prompt-input':
    'AI prompt composer: auto-growing textarea with inline context tags, `@`-trigger suggestions and a configurable submit key.',
  queue: {
    llms: 'queue of pending agent actions or messages — `Queue` + `Queue.Item` with queued/sending/failed status and optional per-item removal.',
    registry:
      'Queue of pending agent actions or messages (`Queue` + `Queue.Item`) with queued/sending/failed status and optional per-item removal.',
  },
  sources: {
    llms: 'numbered citation list for RAG answers; excerpts reveal on hover/focus with a controllable `expanded` set, `compact` renders inline `[1] [2]` badges.',
    registry:
      'Numbered citation list for RAG answers; excerpts reveal on hover/focus with a controllable `expanded` set, `compact` footnote form included.',
  },
  'step-timeline': same(
    'Vertical timeline of agent execution steps — per-step status (incl. `running`), timing, collapsible detail panels and nested sub-steps.'
  ),
  'streaming-text': same(
    'Typewriter effect that reveals streaming text character by character, with an optional cursor.'
  ),
  'task-list': {
    llms: 'agent task checklist: TaskList/TaskListItem checkbox rows strike through and dim when done; compound children or items data.',
    registry:
      'Agent task checklist (`TaskList` + `TaskListItem`): checkbox rows strike through and dim when done; compound children or `items` data-driven.',
  },
  'thinking-indicator': same(
    'Animated bouncing-dots indicator that the agent is processing.'
  ),
  'token-counter': same(
    'Context-window token usage counter with budget progress.'
  ),
  'tool-call-card': same(
    'Card presenting an agent tool call — name, input, output and running state.'
  ),
  trace: {
    llms: 'line-by-line agent reasoning trace — `Trace` + `TraceItem` steps with `pending`/`running`/`done`/`error` status, custom icons, collapsible `details` and sr-only status-change announcements.',
    registry:
      'Line-by-line agent reasoning trace: `Trace` + `TraceItem` steps with pending/running/done/error status, custom icons, collapsible `details` and sr-only status announcements.',
  },

  // Utilities
  collapsible: {
    llms: 'unstyled open/close container with controllable `open` state.',
    registry:
      'Unstyled open/close container with controllable `open` state (`CollapsibleTrigger`, `CollapsibleContent`).',
  },
  'config-provider': {
    llms: 'per-component prop-default overrides (one section per exported component — sizes, delays, slot classNames) read via `useConfigDefaults()`, plus a global `density` knob (normal | compact) that density-aware components (Table) apply by re-declaring the spacing scale; explicit props always win, providers nest with shallow per-section merge, and components without a provider keep their built-in defaults.',
  },
  disclosure: same(
    'Summary-header disclosure panel (details/summary semantics).'
  ),
  fullscreen: {
    llms: 'wrap-mode Fullscreen API binding around a single trigger child with controllable `fullscreen` state; `useFullscreen()` hook also exported.',
  },
  'locale-provider': {
    llms: 'supplies UI string packs (built-in English, zh-CN and ja-JP) to locale-aware components; `direction` (explicit or locale-derived) feeds `useDirection()`; `createStrings(base, overrides)` derives packs without forking the table. RTL locales (ar/he/fa/…) are derived automatically.',
  },
  'swipe-action': same(
    'Swipe-to-reveal row actions on left/right edges with a commit threshold.'
  ),
  'pull-to-refresh': {
    llms: 'mobile pull-to-refresh gesture over scrolling children: hand-written pointer/touch state machine (idle → pulling → ready → refreshing) with damped finger-follow, scroll-edge canRefresh gate, promise-gated spinner head and a render-prop indicator.',
    registry:
      'Mobile pull-to-refresh gesture wrapper: pointer/touch state machine (idle → pulling → ready → refreshing) with damped pull, scroll-edge canRefresh gate and a promise-gated spinner head.',
  },
  'visually-hidden': {
    llms: 'screen-reader-only content: clipped off the visual canvas, kept in the a11y tree.',
    registry:
      'Screen-reader-only content primitive: clipped off every visual axis while staying in the a11y tree (the icon-only-button label soup).',
  },

  // No sidebar entry: the theme-class family.
  tokens: {
    registry:
      'Theme classes for haze-ui: `lightTheme`/`darkTheme`/`autoTheme` (zero-JS system-following) plus `spacing` and `typography`, applied to a root element to activate the `--haze-*` design tokens.',
  },
};

/** css family → llms.txt bullet text: one per demo sidebar entry. */
export const LLMS_BLURBS = new Map();

/** css family → registry item description: one per css family, tokens included. */
export const REGISTRY_BLURBS = new Map();

/** A bare string is both sides; anything else must be { llms?, registry? }. */
function sidesOf(entry) {
  if (typeof entry === 'string') {
    return entry === '' ? 'an empty string' : { llms: entry, registry: entry };
  }
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
    return 'not a string or an { llms, registry } object';
  }
  const unknown = Object.keys(entry).filter(
    (key) => key !== 'llms' && key !== 'registry'
  );
  if (unknown.length > 0) return `unknown field(s): ${unknown.join(', ')}`;
  if (entry.llms === undefined && entry.registry === undefined) {
    return 'no blurb on either side';
  }
  for (const side of ['llms', 'registry']) {
    const text = entry[side];
    if (text !== undefined && (typeof text !== 'string' || text === '')) {
      return `"${side}" is not a non-empty string`;
    }
  }
  return entry;
}

for (const [family, entry] of Object.entries(COMPONENT_DESCRIPTIONS)) {
  const sides = sidesOf(entry);
  if (typeof sides === 'string') {
    throw new Error(`component-descriptions: "${family}" — ${sides}`);
  }
  if (sides.llms !== undefined) LLMS_BLURBS.set(family, sides.llms);
  if (sides.registry !== undefined) REGISTRY_BLURBS.set(family, sides.registry);
}

// A blurb on one side only is a sync bug unless the key is an acknowledged
// exception — and an exception whose key has grown the other blurb is stale.
const ONE_SIDED = [
  {
    side: 'llms.txt',
    other: 'registry',
    blurbs: LLMS_BLURBS,
    opposite: REGISTRY_BLURBS,
    exceptions: CSS_LESS,
    list: 'CSS_LESS',
  },
  {
    side: 'registry',
    other: 'llms.txt',
    blurbs: REGISTRY_BLURBS,
    opposite: LLMS_BLURBS,
    exceptions: REGISTRY_ONLY,
    list: 'REGISTRY_ONLY',
  },
];
for (const { side, other, blurbs, opposite, exceptions, list } of ONE_SIDED) {
  for (const family of blurbs.keys()) {
    if (!opposite.has(family) && !exceptions.has(family)) {
      throw new Error(
        `component-descriptions: "${family}" is described for ${side} only — write its ${other} blurb, or list the key in ${list} with its reason`
      );
    }
  }
  for (const family of exceptions) {
    if (!blurbs.has(family) || opposite.has(family)) {
      throw new Error(
        `component-descriptions: "${family}" is listed in ${list} but is not a ${side}-only entry — remove it from the list`
      );
    }
  }
}
