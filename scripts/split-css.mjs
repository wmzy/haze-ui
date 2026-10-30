#!/usr/bin/env node
/**
 * Group the per-module CSS emitted by the lib build (`*.wyw-in-js.css`,
 * one file per module thanks to preserveModules + cssCodeSplit) into
 * consumer-facing subpaths:
 *
 *   dist/css/tokens.css        theme + design tokens (import once)
 *   dist/css/<component>.css   one file per component dir (kebab-case)
 *   dist/css/form.css          react-f0rm integration (FormItem)
 *   dist/haze-ui.css           full aggregate, served as 'haze-ui/styles.css'
 *   dist/css-manifest.json     export -> css-file mapping for tooling
 *
 * Components never import each other, so a component dir's CSS is
 * self-contained; tokens are the only shared layer and live in tokens.css.
 * Per-component files therefore require tokens.css (once), not each other.
 * Shared internal layers under src/lib/utils (the floating primitives) are
 * the one exception: their CSS is inlined into every consuming component's
 * file so those files stay self-contained too.
 *
 * Invariants enforced at the end (non-zero exit on failure):
 *   - every `.wyw-in-js.css` file is covered by at least one group
 *     (shared layers intentionally ride along with several)
 *   - the aggregate's class-name set equals the union of module CSS
 *   - no dangling `.wyw-in-js.css` import/require survives in dist JS —
 *     the styles are carried by `haze-ui/styles.css` / `haze-ui/css/*`,
 *     so the per-module side-effect imports are stripped together with
 *     the files (1.11.0 shipped them dangling: Node ESM, vitest inline
 *     and vite build all fail to resolve the removed files)
 *   - css-manifest.json partitions the barrel's value exports into
 *     families/noCss, and every css group is reachable via an export
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const cssDir = path.join(distDir, 'css');

const kebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();

/** Recursively collect `*.wyw-in-js.css` files as paths relative to dist/. */
function collectModuleCss(dir = distDir, prefix = '') {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectModuleCss(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.wyw-in-js.css')) {
      files.push(rel);
    }
  }
  return files;
}

const moduleCssFiles = collectModuleCss().sort();
if (moduleCssFiles.length === 0) {
  console.error('split-css: no *.wyw-in-js.css found under dist/ — did the lib build run?');
  process.exit(1);
}

// Shared internal layers under src/lib/utils: their CSS must ride along
// with every consuming component group, or per-component files such as
// css/popover.css would carry only the visual skin without the floating
// positioning classes. Key = module path below dist (no extension);
// value = consuming css group names.
const sharedLayers = {
  'utils/floating': [
    'combobox',
    'context-menu',
    'datepicker',
    'dropdown-menu',
    'menu',
    'navigation-menu',
    'notification-center',
    'popconfirm',
    'popover',
    'select',
    'tree-select',
    'tooltip',
  ],
  // Sortable css layers: utils/sortable-handle (the drag-handle class
  // TagGroupItem applies to its label) rides with tag-group via
  // TagGroupItem; utils/sortable (the SortableItem wrapper node css) rides
  // with tag-group via SortableTagGroup. The tag-input sortable variant
  // uses the css-less SortableRegion — its tag classes now come from
  // the shared utils/tag-skin.ts layer, registered separately below.
  'utils/sortable': ['tag-group'],
  'utils/sortable-handle': ['tag-group'],
  // Shared sr-only clip class (utils/sr-only.ts): rides with every
  // component group whose members render the visually-hidden pattern
  // directly (Tabs' status-word label, FileInput's native input,
  // FilePreview's status text) or through utils/native-form.tsx — the
  // FormData bridge module went css-less when its boolean hidden input
  // adopted the shared clip class, so its former consumer families are
  // folded in here instead (a native-form entry would now fail the
  // "emitted no module CSS" guard).
  'utils/sr-only': [
    'chart',
    'chat-message',
    'color-picker',
    'file-input',
    'file-preview',
    'image-crop',
    'inline-completion',
    'otp-input',
    'rating',
    'rich-text-editor',
    'segmented',
    'select',
    'streaming-text',
    'switch',
    'tag-input',
    'tabs',
    'trace',
    'visually-hidden',
  ],
  // Shared truncate triad (utils/truncate.ts): overflow hidden +
  // text-overflow ellipsis + white-space nowrap as one class — the
  // one-line clip idiom 12 files wore as local copies before the
  // promotion. Pure css module; Typography is an RSC-safe consumer
  // (see scripts/rsc-safe.mjs).
  'utils/truncate': [
    'cascader',
    'conversation-list',
    'copy-button',
    'file-preview',
    'heatmap',
    'schedule',
    'select',
    'tree',
    'tree-select',
    'typography',
    'upload',
  ],
  // Shared unsupported-notice skin (utils/unsupported-skin.ts): the
  // dashed fallback surface the canvas components (Signature,
  // ImageCrop) paint when 2d context is unavailable. Per-site sizing
  // (ImageCrop's aspect box, Signature's px dimensions) stays local as
  // companion classes. Pure css module (scripts/rsc-safe.mjs).
  'utils/unsupported-skin': ['image-crop', 'signature'],
  // Menu-family shared skins (utils/menu-skins.ts): the item base/state
  // skins, slot skins, panel surfaces and divider shared by the three
  // menu families ride with each family's css.
  'utils/menu-skins': ['menu', 'dropdown-menu', 'context-menu', 'cascader', 'command'],
  // Shared navigation-item chrome (utils/nav-item-skin.ts): the muted
  // item base with its hover wash, the fixed-size icon slot, the corner
  // badge anchor and the token-parameterized active arm that TabBar's
  // icon-over-label items and ActivityRail's square rail items compose
  // (sizing/typography, indicator geometry and the active token pair
  // stay family-local deltas).
  'utils/nav-item-skin': ['tab-bar', 'activity-rail'],
  // Shared field skin (utils/field-skin.ts): the surface chrome, the
  // :focus-within focus ring, the native input/textarea chrome and the
  // field size map the field families wear. masked-input and any other
  // InputCore compositor is covered automatically through the input
  // family's css via the css-manifest dependency closure, not listed —
  // that closure only maps component-dir imports (utils modules carry
  // no css group of their own), so a family that imports the layer
  // directly while shipping its own css file must be listed explicitly
  // (ChatInput and RichTextEditor compose just focusWithinRing).
  'utils/field-skin': [
    'chat-input',
    'color-picker',
    'combobox',
    'command',
    'date-range-picker',
    'datepicker',
    'file-input',
    'inline-completion',
    'inline-edit',
    'input',
    'mentions',
    'number-input',
    'otp-input',
    'prompt-input',
    'rich-text-editor',
    'signature',
    'tag-input',
    'textarea',
    'time-picker',
  ],
  // Shared tag skin (utils/tag-skin.ts): the tag list/chip/remove-button
  // classes TagInput and PromptInput both wear; the sortable-mode drag
  // classes stay in tag-input's own tag-input-styles.ts.
  'utils/tag-skin': ['prompt-input', 'tag-input', 'tag-group'],
  // Shared suggest listbox skin (utils/suggest-list-skin.ts): the
  // anchored listbox chrome plus option/highlighted/hint rows the two
  // textarea-suggest surfaces (PromptInput tokens, Mentions mentions)
  // render; max-height stays a per-site local override.
  'utils/suggest-list-skin': ['mentions', 'prompt-input'],
  // Shared state-option row (utils/state-option-skin.ts): the centered
  // muted-text row Combobox's loading/empty state rows and Command's
  // empty row render as aria-disabled options (keeps the listbox's
  // owned-element contract satisfied while nothing is selectable);
  // padding density and Combobox's spinner gap stay local deltas
  // composed behind the shared base.
  'utils/state-option-skin': ['combobox', 'command'],
  // Shared quiet-button skin (utils/quiet-button-skin.ts): the bordered
  // transparent hover-wash button recipe (reset + border + bg-subtle
  // hover + typography) the inline affordances wear; the md/sm density
  // pair and per-site extras (forced-colors companions, icon gaps) ride
  // as local x-class companions. First adopters: AsyncSection's retry
  // and ErrorBoundary's fallback (byte-identical pair at extraction).
  'utils/quiet-button-skin': [
    'async-section',
    'chat-message',
    'ellipsis',
    'error-boundary',
    'image',
    'notification-center',
    'queue',
    'sidebar',
    'sources',
    'spoiler',
  ],
  // Shared disclosure summary/content skins (utils/disclosure-skin.ts):
  // the details/summary header + content typography shared by
  // Accordion's items and Disclosure ride with both families' css.
  'utils/disclosure-skin': ['accordion', 'disclosure'],
  // Shared timeline skeleton (utils/timeline-skin.ts): list/row/dot
  // geometry, the muted text skins, the status-marker ring arms and
  // glyph map, and the expandable-disclosure layer shared by Timeline,
  // StepTimeline, Trace, Plan, JsonView, Sources and ToolCallCard ride
  // with every consuming family's css.
  'utils/timeline-skin': [
    'json-view',
    'plan',
    'sources',
    'step-timeline',
    'timeline',
    'tool-call-card',
    'trace',
  ],
  // Shared disclosure chevron glyph (utils/disclosure-chevron.tsx): the
  // stroke-compensated lucide ChevronRight and its rotate transition
  // rendered by the expandable data families ride with each family's css.
  'utils/disclosure-chevron': ['json-view', 'sources', 'trace'],
  // Shared preset shortcut rows (utils/preset-list-skin.ts) heading
  // the Datepicker and DateRangePicker panels ride with both css.
  'utils/preset-list-skin': ['datepicker', 'date-range-picker'],
  // Picker trigger base (utils/picker-trigger.tsx): the shared trigger
  // skin, the native-select skin, the maxTagCount overflow badge, the
  // tier-aware panel width cascade, the caret slot and the
  // native-select caret overlay ride with every family that renders a
  // picker trigger button, a native-select trigger or an anchored
  // picker panel (Select floating + SelectCore, Cascader, TreeSelect,
  // ModelPicker, Combobox, PromptInput, Mentions), plus the readonly
  // input trigger the date/time families anchor on (Datepicker,
  // TimePicker). No rsc-safe entry: the module renders DOM.
  'utils/picker-trigger': [
    'cascader',
    'combobox',
    'datepicker',
    'mentions',
    'model-picker',
    'prompt-input',
    'select',
    'time-picker',
    'tree',
    'tree-select',
  ],
  // Picker chip row (utils/picker-chips.tsx): the chip capsule skin,
  // the pointer-only remove × and clear affordance, and the chips +
  // maxTagCount overflow-badge JSX the multi-value triggers render
  // (Select floating, TreeSelect; Combobox composes just the badge —
  // its chips keep Chip's own onClose button). Cascader renders no
  // chips and only consumes the css-less utils/use-panel-query, so it
  // is not listed. No rsc-safe entry: the module renders DOM.
  'utils/picker-chips': ['combobox', 'select', 'tree-select'],
  // Shared choice-input skin (utils/choice-skin.ts): the 24px box
  // geometry, idle/hover/focus/disabled chrome, forced-colors baseline
  // and the label base Checkbox and Radio both wear; TreeItem's row
  // checkbox (a role=checkbox span) wears the box chrome too; the
  // :checked decorations (checkmark vs dot) stay local per component.
  'utils/choice-skin': ['checkbox', 'radio', 'tree'],
  // Shared resize-grip skin (utils/grip-skin.ts): the 24/44px hit strip
  // + 2px hairline chrome (hover/focus wash, focus ring, forced-colors
  // baseline, per-orientation geometry) that Splitter's dividers and
  // Resizable's handles wear; component-local extras (collapse-trigger
  // reveal / touch-action + expander cursor) stay in their families.
  'utils/grip-skin': ['resizable', 'splitter'],
  // Shared status skin (utils/status-skin.ts): the semantic
  // subtle/solid/stroke color axes, the live-region role map and the
  // dismiss (×) button chrome shared by the status display family.
  // Alert composes its color-mix border layer locally; Tag layers its
  // font-size:inherit glyph arm and Banner its 2.5rem trigger box over
  // the shared box via specificity-armed overrides (cascade order
  // differs between dev injection and this split). Meter imports the
  // type only — no css, so it is not a consumer here.
  'utils/status-skin': [
    'alert',
    'banner',
    'badge',
    'chip',
    'notification-center',
    'tag',
    'toast',
  ],
  // Shared callout skin (utils/callout-skin.ts): the surface box
  // model, padding and body typography plus the flexing content
  // column the structural-mirror callout pair composes — Alert's
  // flex-start icon column, Banner's centered trigger row, Alert's
  // color-mix border layer and Banner's forced-colors boundary stay
  // local (genuine geometry differences, not spelling drift). The
  // status tint classes and dismiss chrome ride via utils/status-skin;
  // no rsc-safe entry: nothing RSC-listed imports this module.
  'utils/callout-skin': ['alert', 'banner', 'async-section'],
  // Solid/stroke status axes (progress bar fill, circle stroke,
  // indicator tone dots) — separate modules from status-skin because
  // same-keyed css maps in one file collide under Linaria's member-key
  // class naming (see utils/status-skin.ts header). Progress/Indicator
  // reference status-skin types only (build-time elided, no css ride).
  'utils/status-solid-skin': [
    'indicator',
    'progress',
    'token-counter',
    'tool-call-card',
  ],
  'utils/status-stroke-skin': ['progress', 'sparkline'],
  // Shared spinner glyph (utils/spinner-glyph.tsx): the ring+arc svg
  // and the spin loop (reduced-motion collapsed to a single 0.01ms
  // iteration) that Spinner and Toast's loading variant both render.
  // Renders DOM — no rsc-safe entry.
  'utils/spinner-glyph': ['spinner', 'toast', 'async-section', 'tree'],
  // Shared citation chrome (utils/citation-skin.ts): the mono [N] index
  // badge and the outbound-title link Sources' list rows and
  // InlineCitation's card header both render; InlineCitation's medium
  // title weight stays a call-site delta composed on citationLink.
  'utils/citation-skin': ['sources', 'inline-citation'],
  // Shared floating-panel surface (utils/panel-skin.ts): the border +
  // radius-lg + bg + shadow-lg chrome (with the forced-colors
  // CanvasText border restatement) every overlay panel wears; width
  // bounds and padding stay call-site deltas composed via x-class.
  // The bare variant (no typography) serves the picker/date panels,
  // and the lifted variant (radius-xl + shadow-xl, borderless + the
  // modal focus ring) serves Dialog's top-layer tier.
  // DateRangePicker deliberately not a consumer: its inline panel
  // floats one shadow step lower (shadow-md) and a layered override
  // would resolve by stylesheet order, which differs between dev
  // injection and this split.
  'utils/panel-skin': [
    'cascader',
    'color-picker',
    'confirm-dialog',
    'dialog',
    'datepicker',
    'hover-card',
    'inline-citation',
    'navigation-menu',
    'notification-center',
    'popconfirm',
    'popover',
    'time-picker',
    'tooltip',
    'tree-select',
  ],
  // Shared danger remap (utils/danger-remap.ts): the custom-property
  // remap turning a solid Button onto the danger token family that
  // Popconfirm's okVariant='danger' and ConfirmDialog's variant='danger'
  // both wear on their confirm buttons (formerly byte-identical local
  // copies). Kept out of status-solid-skin so the progress/indicator
  // fill classes do not ride into these families.
  'utils/danger-remap': ['popconfirm', 'confirm-dialog'],
  // Shared dialog-family motion (utils/dialog-skin.ts): the scrim
  // fades for every overlay plus the modal scale-and-fade panels
  // (Dialog, ConfirmDialog) — the native <dialog> trio arms the
  // [open][data-state] ::backdrop, BottomSheet's Presence-driven div
  // arms its own fade; Drawer's placement slide and BottomSheet's
  // sheet slide stay family-local.
  'utils/dialog-skin': ['dialog', 'drawer', 'confirm-dialog', 'bottom-sheet', 'tour'],
  // Shared keyboard focus ring (utils/focus-ring.ts): the pure
  // :focus-visible box-shadow ring + forced-colors Highlight fallback
  // every interactive family composes; field-shaped :focus sites use
  // field-skin's fieldFocusRing/focusWithinRing instead, pseudo-element
  // thumbs stay local.
  'utils/focus-ring': [
    'activity-rail',
    'back-to-top',
    'breadcrumb',
    'button',
    'calendar',
    'chat-container',
    'color-picker',
    'data-table',
    'drawer',
    'float-button',
    'image',
    'inline-citation',
    'json-view',
    'navigation-bar',
    'navigation-menu',
    'pagination',
    'rating',
    'schedule',
    'segmented',
    'sidebar',
    'signature',
    'splitter',
    'status-bar',
    'switch',
    'tab-bar',
    'tabs',
    'time-picker',
    'toast',
    'toggle',
    'toolbar',
  ],
  // (utils/focus-ring.ts also exports outlineFocusVisible — the bare
  // outline arm Schedule/Upload/JsonView/Splitter/Toast wear; those
  // families are in the list above.)
  // Shared attached-row seam (utils/seam-skin.ts): the -1px seam +
  // corner collapse + focus z-lift recipe InputGroup/PhoneInput rows
  // and ButtonGroup (both orientations) wear.
  'utils/seam-skin': ['input-group', 'phone-input', 'button-group'],
  // Shared prose typography (utils/prose-skin.ts): the heading ladder,
  // list/code/pre/blockquote rules RichTextEditor's content area and
  // MarkdownRenderer both render (MarkdownRenderer wins conflicts).
  'utils/prose-skin': ['rich-text-editor', 'markdown-renderer'],
  // Shared thin meter bar (utils/meter-skin.ts): track + fill + width
  // transition for Plan's progress strip, TokenCounter's budget bar and
  // Meter's gauge bar (colors/timing tones stay per-family deltas).
  'utils/meter-skin': ['meter', 'plan', 'token-counter'],
  // The segmented date/time input engine (utils/segmented-field.tsx):
  // moved out of the DateField component dir so TimeField's
  // cross-family consumption rides a registered shared layer instead
  // of a sibling component directory.
  'utils/segmented-field': ['date-field', 'time-field'],
  // Shared mono-panel base (utils/mono-panel-skin.ts): mono font +
  // text-xs + relaxed leading + border + radius-md + overflow hidden
  // outer chrome DiffViewer and LogViewer wore as byte-identical
  // wrapper copies (family chrome stays local deltas).
  'utils/mono-panel-skin': ['diff-viewer', 'log-viewer'],
  // FloatButton's FAB skin exported for the sibling BackToTop: like
  // segmented-field above, the cross-family consumption rides a
  // registered shared layer instead of relying on the sibling
  // component directory's group (BackToTop.css stays self-contained).
  'components/FloatButton/float-button-styles': ['back-to-top'],
};

/**
 * Map a dist-relative module css path to its consumer-facing group name.
 * Shared layers under utils/ return null — they are inlined into consumer
 * groups below instead of forming a group of their own.
 */
function groupOfModule(rel) {
  const segments = rel.split('/');
  if (segments[0] === 'tokens') return 'tokens';
  if (segments[0] === 'components') return kebab(segments[1]);
  if (segments[0] === 'form') return 'form';
  if (segments[0] === 'utils') return null;
  console.error(`split-css: unexpected module CSS location ${rel}`);
  return process.exit(1);
}

// Map output name -> list of module css paths (relative to dist/).
const groups = new Map();
for (const rel of moduleCssFiles) {
  const name = groupOfModule(rel);
  if (name === null) continue; // utils/ shared layers ride along via sharedLayers
  if (!groups.has(name)) groups.set(name, []);
  groups.get(name).push(rel);
}

// Inline each shared layer's CSS into its consumer groups.
for (const [key, consumers] of Object.entries(sharedLayers)) {
  const rel = `${key}.wyw-in-js.css`;
  if (!moduleCssFiles.includes(rel)) {
    console.error(`split-css: shared layer ${key} emitted no module CSS — stale sharedLayers entry?`);
    process.exit(1);
  }
  for (const name of consumers) {
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(rel);
  }
}

const read = (rel) => readFileSync(path.join(distDir, rel), 'utf8').trim();
const banner = (name) => `/* haze-ui ${name} — generated by scripts/split-css.mjs, do not edit */`;

/**
 * Every shipped rule lives in the `haze` cascade layer: unlayered
 * consumer CSS always wins over layered library CSS regardless of
 * source order or specificity, which makes `data-slot`/token
 * overrides deterministic. (Theme classes like `.lightTheme` are
 * layered too — a consumer's unlayered variable override beats them
 * without specificity sit-ups.) @layer needs Safari 16.4+, already
 * the floor per browserslist.
 */
const wrapLayer = (body) => `@layer haze {\n${body}\n}\n`;

mkdirSync(cssDir, { recursive: true });

// tokens first, then everything else alphabetically — deterministic output.
const orderedNames = [...groups.keys()].sort((a, b) =>
  a === 'tokens' ? -1 : b === 'tokens' ? 1 : a.localeCompare(b)
);

for (const name of orderedNames) {
  const body = groups.get(name).map(read).join('\n');
  writeFileSync(path.join(cssDir, `${name}.css`), `${banner(name)}\n${wrapLayer(body)}`);
}

// Full aggregate for the `haze-ui/styles.css` subpath (same layering).
const aggregate = orderedNames.map((name) => wrapLayer(groups.get(name).map(read).join('\n'))).join('\n');
writeFileSync(path.join(distDir, 'haze-ui.css'), aggregate);

// Class-set parity check: aggregate must contain exactly the union of all
// module classes (no lost and no duplicated-with-different-content rules).
const classSet = (css) => new Set(css.match(/\.haze-[A-Za-z0-9_-]+/g) ?? []);
const union = new Set();
for (const rel of moduleCssFiles) {
  for (const cls of classSet(read(rel))) union.add(cls);
}
const aggregateClasses = classSet(aggregate);
const missing = [...union].filter((c) => !aggregateClasses.has(c));
const extra = [...aggregateClasses].filter((c) => !union.has(c));
if (missing.length > 0 || extra.length > 0) {
  console.error(`split-css: aggregate mismatch (missing: ${missing}, extra: ${extra})`);
  process.exit(1);
}

// ---- dist/css-manifest.json ---------------------------------------------
// Machine-readable export -> css-file mapping, published as the
// 'haze-ui/css-manifest.json' subpath. Consumers' on-demand css tooling
// (e.g. vite plugins) reads it instead of re-deriving kebab-case names or
// hand-maintaining family tables — those drift whenever a sub-component
// shares its directory's stylesheet (InputCore -> input.css once broke a
// consumer build exactly that way).
//
// Both sides are derived from this build's own artifacts, so no second
// hand-written table exists:
//   - export -> defining module: parsed from dist/index.js, where rollup
//     has already resolved every barrel re-export to the module that
//     actually defines the export (`import o from "./components/Button/Button.js"`);
//   - module -> css group: the same groupOfModule truth as the file split
//     above. components/<Dir>/ and form/ are whole-directory families
//     (cores and sub-components share the directory's file); tokens/* and
//     hooks/* are judged per module.

function fail(message) {
  console.error(`split-css: ${message}`);
  process.exit(1);
}

const indexCode = readFileSync(path.join(distDir, 'index.js'), 'utf8');

// local import binding -> module specifier
const bindings = new Map();
for (const m of indexCode.matchAll(
  /import\s+(?:([$\w]+)\s*,\s*)?(?:\{([^}]*)\}|\*\s+as\s+([$\w]+)|([$\w]+))\s+from\s*["']([^"']+)["']/g
)) {
  const [, defaultWithNamed, named, namespace, def, spec] = m;
  if (def) bindings.set(def, spec);
  if (defaultWithNamed) bindings.set(defaultWithNamed, spec);
  if (namespace) bindings.set(namespace, spec);
  if (!named) continue;
  for (const clause of named.split(',')) {
    const parsed = clause.trim().match(/^([$\w]+)(?:\s+as\s+([$\w]+))?$/);
    if (!parsed) fail(`unparsable import clause "${clause.trim()}" in dist/index.js`);
    bindings.set(parsed[2] ?? parsed[1], spec);
  }
}

// exported name -> module specifier
const exported = new Map();
for (const m of indexCode.matchAll(/^export\s*\{([^}]*)\}\s*;?\s*$/gm)) {
  for (const clause of m[1].split(',')) {
    const parsed = clause.trim().match(/^([$\w]+)(?:\s+as\s+([$\w]+))?$/);
    if (!parsed) fail(`unparsable export clause "${clause.trim()}" in dist/index.js`);
    const name = parsed[2] ?? parsed[1];
    const spec = bindings.get(parsed[1]);
    if (!spec) fail(`export "${name}" (local "${parsed[1]}") has no matching import in dist/index.js`);
    exported.set(name, spec);
  }
}
if (exported.size === 0) fail('no exports parsed from dist/index.js — build output shape changed?');

const families = {};
const noCss = [];
for (const [name, spec] of exported) {
  if (!spec.startsWith('./')) {
    noCss.push(name); // external re-export (react-use-control) — no css of its own
    continue;
  }
  const base = spec.slice(2).replace(/\.js$/, '');
  const segments = base.split('/');
  const family =
    segments[0] === 'components'
      ? segments.slice(0, 2).join('/')
      : segments[0] === 'form'
        ? 'form'
        : base;
  const css = moduleCssFiles.find(
    (rel) => rel === `${family}.wyw-in-js.css` || rel.startsWith(`${family}/`)
  );
  if (css) {
    families[name] = groupOfModule(css);
  } else {
    // Fully-composed family (e.g. Textarea wears only shared field-skin
    // classes): the group's css comes entirely from sharedLayers
    // inlining and is reachable through this export — not dead css.
    // Derive the group without groupOfModule's fail path (dates/ and
    // other roots legitimately have no css group).
    const fallback =
      family.startsWith('components/')
        ? kebab(family.split('/')[1])
        : family === 'form' || family === 'tokens'
          ? family
          : null;
    if (fallback !== null && groups.has(fallback)) families[name] = fallback;
    else noCss.push(name);
  }
}

// Every css group must be reachable through some export, otherwise the
// file ships dead (a component dir that forgot its barrel export).
const unreachable = orderedNames.filter((n) => !Object.values(families).includes(n));
if (unreachable.length > 0) {
  fail(`css groups without any barrel export: ${unreachable.join(', ')} — export them or drop the css`);
}

// ---- cross-family css dependencies --------------------------------------
// An export's family css file only covers rules emitted by its own
// directory. Yet components render other components: <Button loading>
// mounts a Spinner, DateTimePicker is pure sugar over Datepicker, scores
// of Toggle/Toolbar items import Button/styles. The per-family files
// intentionally do NOT embed those rules (each rule ships once), so
// on-demand injection keyed only on the export's own family yields
// unstyled descendants. Derive the additional css files from the very
// artifact being split: DFS each export's root module over dist JS
// import edges, map every reachable module back to its css group, and
// publish the flattened closure as `dependencies` keyed by export name.
// No hand-maintained table — a new cross-component import in src is
// picked up on the next build.

/** Recursively collect dist JS modules as paths relative to dist/. */
function collectJsModules(dir = distDir, prefix = '') {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectJsModules(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.js')) {
      files.push(rel);
    }
  }
  return files;
}
const jsModules = new Set(collectJsModules());

/**
 * Map a dist-relative module path (no extension) to its css group name,
 * or null when the module emits no css of its own. Mirrors the family
 * slicing of the export loop above; utils/* shared layers and
 * hooks/tokens carry no per-component css (shared layers are already
 * inlined into consumer groups by sharedLayers).
 */
function cssGroupOfModulePath(rel) {
  const segments = rel.split('/');
  const family =
    segments[0] === 'components'
      ? segments.slice(0, 2).join('/')
      : segments[0] === 'form'
        ? 'form'
        : null;
  if (!family) return null;
  const css = moduleCssFiles.find(
    (rel) => rel === `${family}.wyw-in-js.css` || rel.startsWith(`${family}/`)
  );
  return css ? groupOfModule(css) : null;
}

// Over-approximate edge extractor: every side-effect import, from-import
// and re-export literal. Dynamic imports would match too — dist has none,
// and an over-wide edge only ever adds a real css file, never a ghost.
const edgePattern = /(?:\bfrom\s*|import\s*)['"]([^'"]+)['"]/g;

// cache: dist-relative js path -> array of resolved dist-relative js paths
const edgeCache = new Map();
function edgesOf(rel) {
  let edges = edgeCache.get(rel);
  if (edges) return edges;
  edges = [];
  const code = readFileSync(path.join(distDir, rel), 'utf8');
  const dir = path.posix.dirname(rel);
  for (const m of code.matchAll(edgePattern)) {
    const spec = m[1];
    if (!spec.startsWith('.') || !spec.endsWith('.js')) continue;
    const resolved = path.posix.normalize(path.posix.join(dir, spec));
    if (jsModules.has(resolved)) edges.push(resolved);
  }
  edgeCache.set(rel, edges);
  return edges;
}

// Full closure per export: own family is implicit (families map / noCss),
// so dependencies lists only *additional* css files. `tokens` is excluded —
// on-demand tooling injects tokens.css unconditionally.
const dependencies = {};
for (const [name, spec] of exported) {
  if (!spec.startsWith('./')) continue; // external re-export: no graph here
  const root = spec.slice(2);
  const own = families[name] ?? null;
  const found = new Set();
  const stack = [root];
  const seen = new Set();
  while (stack.length > 0) {
    const rel = stack.pop();
    if (seen.has(rel)) continue;
    seen.add(rel);
    const group = cssGroupOfModulePath(rel.replace(/\.js$/, ''));
    if (group && group !== 'tokens' && group !== own) found.add(group);
    stack.push(...edgesOf(rel));
  }
  if (found.size > 0) dependencies[name] = [...found].sort();
}

const manifest = {
  families: Object.fromEntries(Object.keys(families).sort().map((k) => [k, families[k]])),
  noCss: [...noCss].sort(),
  dependencies: Object.fromEntries(
    Object.keys(dependencies).sort().map((k) => [k, dependencies[k]])
  ),
};
writeFileSync(path.join(distDir, 'css-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

// The per-module files are superseded by dist/css/* and dist/haze-ui.css;
// drop them so the published package ships each rule exactly once — and
// strip their side-effect imports from the JS outputs, otherwise the
// published package references files that no longer exist.
for (const rel of moduleCssFiles) {
  rmSync(path.join(distDir, rel));
}
stripDanglingCssImports();

/** Remove `import "./x.wyw-in-js.css"` / `require("./x.wyw-in-js.css")` from dist JS. */
function stripDanglingCssImports() {
  const jsExtensions = new Set(['.js', '.cjs', '.mjs']);
  const esmImport = /import\s*["'][^"']*\.wyw-in-js\.css["'];?/g;
  const cjsRequire = /require\(\s*["'][^"']*\.wyw-in-js\.css["']\s*\);?/g;
  const strip = (dir = distDir) => {
    let stripped = 0;
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stripped += strip(full);
      } else if (jsExtensions.has(path.extname(entry.name))) {
        const code = readFileSync(full, 'utf8');
        const next = code.replace(esmImport, '').replace(cjsRequire, '');
        if (next !== code) {
          writeFileSync(full, next);
          stripped += 1;
        }
      }
    }
    return stripped;
  };
  const strippedFiles = strip();
  if (strippedFiles === 0) {
    console.error('split-css: no .wyw-in-js.css imports found in dist JS — build output shape changed?');
    process.exit(1);
  }
  console.log(`split-css: stripped dangling css imports from ${strippedFiles} JS files`);
}

const perComponent = orderedNames.filter((n) => n !== 'tokens').length;
console.log(
  `split-css: ${perComponent} component files + tokens.css + haze-ui.css (${union.size} classes) written to dist/css`
);
console.log(
  `split-css: css-manifest.json written (${Object.keys(families).length} families, ${noCss.length} noCss, ${Object.keys(dependencies).length} with dependencies)`
);
