/* eslint-disable react-refresh/only-export-components --
   internal primitives module (classes + glyphs + trigger component),
   not a fast-refresh boundary; consumers re-render through their own
   files. */
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { FloatingBehavior } from './floating';

import { css } from '@linaria/core';

import { pickerFieldInput } from './field-skin';

/**
 * Shared trigger building block of the picker families (Select's
 * floating paths, Cascader, TreeSelect) and the native-select paths
 * (SelectCore's single modes, ModelPicker): the base trigger skin,
 * the native-select skin, the maxTagCount overflow badge, the
 * tier-aware panel width cascade, the 12x12 stroke chevron glyphs,
 * the caret slot and the popup aria wiring of the trigger button.
 *
 * Also hosts the shared panel-surface classes the picker families
 * wear: the listbox chrome (plain and virtualized, Select/Combobox),
 * the virtual row stretch, the searchable-panel search input
 * (Select/Cascader/TreeSelect), the loading/empty state blocks (skin
 * plus the PickerPanelLoading/PickerPanelEmpty rows Select and
 * Cascader render), the group-heading typography, the option-row skeleton (+ density
 * variant, highlighted/selected decorations), and the readonly input
 * trigger the date/time families
 * anchor their popup panels on (PickerInputTrigger). The chip-row
 * affordances (chip capsule skin, pointer-only remove × and clear
 * affordance, the chips + overflow-badge JSX) live next door in
 * utils/picker-chips; the closed-panel query reset lives in the
 * css-less utils/use-panel-query.
 *
 * Deliberately NOT shared — genuinely drifted, they stay local to each
 * family (the drift discipline): gap/flex-wrap/padding/font-size per
 * trigger shape, the hover and disabled arms (TreeSelect and Select's
 * floating trigger ship them verbatim, Cascader's trigger ships
 * neither — hoisting them would add hover feedback Cascader never
 * had), Select's tags-box focus delta (`:focus, :focus-within` for
 * the box whose inline input owns focus, broader than the shared
 * `:focus-visible`), per-site caret deltas (centering, inline-end
 * push), panel paddings/radius deltas and Select's multiple-mode
 * checkbox visual (the only selectedness decoration still local —
 * choice-skin keeps its decorations local by design). The
 * native-select skin's
 * hover/focus/disabled arms are shared verbatim — SelectCore and
 * ModelPicker agree token for token.
 */

/**
 * Trigger button base: the declaration set shared verbatim by the
 * Select (floating), Cascader and TreeSelect triggers, including the
 * keyboard focus arm — the one state arm every consumer's local delta
 * shipped verbatim (Select's tags box keeps its own broader
 * `:focus, :focus-within` delta for the inline input, which draws the
 * same declarations). Extension classes layered after it add only
 * properties it does not declare — where selectors do overlap the
 * declarations are identical, so cascade order between the two can
 * never matter.
 */
export const pickerTrigger = css`
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  text-align: start;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:focus-visible {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * Native-select trigger skin: the chrome shared verbatim by the
 * native `<select>` paths — SelectCore's single modes (the
 * padding/font-size metrics ride its local `sizes` variants) and
 * ModelPicker (whose local extension carries the md pair). The same
 * declaration set the floating `pickerTrigger` has where the two
 * agree (border/radius/fill/color/typography/cursor/transition) plus
 * the native-element specifics: `appearance: none` removes the
 * painted caret (the `pickerNativeCaret` overlay replaces it) and the
 * reserved `padding-inline-end` gives that overlay room. The
 * hover/focus/disabled arms are state arms of the class itself, so a
 * consumer extension class can never flip them by injection order —
 * extensions add only properties this skin does not declare.
 */
export const pickerNativeSelect = css`
  display: block;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  appearance: none;
  padding-inline-end: var(--haze-space-8);
  cursor: pointer;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * The `+N` overflow badge of the picker triggers' `maxTagCount`
 * (Select's floating trigger, Combobox, TreeSelect): presentational
 * (selection lives in the value, removal through the panel or the
 * clear affordance), with the full overflow label list in the native
 * `title` tooltip.
 */
export const pickerOverflowBadge = css`
  display: inline-flex;
  align-items: center;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  line-height: 1;
  white-space: nowrap;
  padding: var(--haze-space-1) var(--haze-space-2);
  cursor: default;
`;

/**
 * Tier-aware width cascade of the picker panels (Select/Combobox
 * listboxes and their virtual variants, TreeSelect's panel,
 * PromptInput's suggestion listbox): the fallback tier's containing
 * block is the trigger-width wrapper, so `100%` matches it; the
 * anchored tier's containing block is the viewport-wide position-area
 * region, so the second declaration re-pins the panel to the
 * trigger's border-box width and drops as invalid on engines without
 * anchor positioning, leaving the fallback intact. Consumers pass it
 * ahead of their chrome class (the space-joined `visualClass` pattern
 * of ContextMenuContent) — the two declare disjoint properties, so
 * cascade order between them can never matter.
 */
export const pickerPanelWidth = css`
  box-sizing: border-box;
  min-width: 100%;
  min-width: anchor-size(width);
`;

/**
 * Chrome of the plain (scrolling) listbox of the picker panels (Select's
 * floating paths, Combobox) on top of the shared tier-aware width
 * cascade (`pickerPanelWidth` — pass it ahead of this class): the
 * scroll cap and the surface chrome. Mentions/PromptInput keep their
 * own listbox skin (`utils/suggest-list-skin`) — their panels are
 * textarea-width-anchored, a different containing-block contract.
 */
export const pickerListbox = css`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

/**
 * Virtualized picker panel: same chrome, no scroll box — the
 * VirtualList scrollport owns scrolling. Keeping the plain class
 * untouched avoids a nested scroll container that could grow a second
 * scrollbar under a border-box consumer (2px of panel border would
 * overflow the cap).
 */
export const pickerListboxVirtual = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

/**
 * Fixed row height, in px, of a virtualized picker/menu row: the
 * natural row box — space-2 padding block (8+8) plus the text-sm line
 * box at leading-normal (14 × 1.5 = 21). Virtualization math needs it
 * as a JS number while the row chrome stretches rows to fill it
 * (`pickerVirtualRow` below), so the number and the row skeleton
 * cannot be allowed to drift apart. Single source for the four
 * virtualized consumers — Combobox, Cascader, Command and Menu (each
 * keeps a local alias under its family-facing name). Select's virtual
 * rows deliberately stay at their own 29 (SelectFloating's
 * OPTION_ROW_HEIGHT — space-1 block padding plus the taller 1.125rem
 * checkbox line box): a different row chrome, not a drift of this one.
 */
export const PICKER_ROW_HEIGHT = 37;

/**
 * Stretch a virtualized option over its absolutely-positioned,
 * fixed-height row wrapper so hover/highlight cover the full row.
 */
export const pickerVirtualRow = css`
  height: 100%;
  box-sizing: border-box;
`;

/**
 * Search input heading a searchable picker panel (Select's searchable
 * panel, Cascader's remote-search panel, TreeSelect's showSearch
 * panel) — three byte-identical copies before this module. Stacks
 * above the options area through its `margin-block-end`; consumers
 * compose their panel chrome separately.
 */
export const pickerSearchInput = css`
  display: block;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
  padding: var(--haze-space-1) var(--haze-space-2);
  margin-block-end: var(--haze-space-2);

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/**
 * Loading state of the options area — the skin half of the Spinner
 * row PickerPanelLoading renders (Spinner plus copy, centered).
 */
export const pickerLoadingBlock = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-3);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

/** Empty-search state of the options area — the skin PickerPanelEmpty
 * renders. */
export const pickerEmptyBlock = css`
  padding: var(--haze-space-3);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  text-align: center;
`;

/**
 * Group-heading typography of the picker listboxes (Select's grouped
 * options, Combobox's grouped options — shared by the plain row and
 * the sticky virtualized header, whose chrome stays local per site).
 * Hosted here rather than importing menu-skins' `menuGroupLabel`:
 * the declaration set is identical but menu-skins is scoped to the
 * menu families, and hosting in the picker layer keeps the shared css
 * riding with families that already consume this module — no new
 * sharedLayers wiring for either consumer.
 */
export const pickerGroupLabel = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-muted);
`;

/**
 * Option-row skeleton of the picker listboxes (Select's option rows,
 * Combobox's options): row layout, typography, cursor and the
 * hover/active/disabled arms. The highlighted/selected decorations
 * live just below (`pickerOptionActive`/`pickerOptionSelected`);
 * Select's multiple-mode checkbox visual stays local (choice-skin
 * keeps its decorations local by design).
 */
export const pickerOptionRow = css`
  display: flex;
  align-items: center;
  padding: var(--haze-space-1) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;

  /* maxCount cap and option-level disabled: unselected options at the
     cap stay visible but inert — no hover/active feedback, dimmed,
     not-allowed cursor. The attribute gate keeps enabled rows
     byte-identical. */
  &:hover:not([data-disabled]) {
    background: var(--haze-color-bg-subtle);
  }

  &:active:not([data-disabled]) {
    background: var(--haze-color-bg-muted);
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * The comfortable density Combobox's options wear over
 * {@link pickerOptionRow}: one step more padding plus the background
 * transition Select's dense rows never had. A literal sibling composed
 * after the base, never contending with it in the cascade.
 */
export const pickerOptionRowComfortable = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  transition: background var(--haze-duration-fast);
`;

/**
 * Highlighted (keyboard-active) option row over the
 * `pickerOptionRow` skeleton: the bg-subtle wash — the keyboard
 * highlight, not hover. Select, Combobox ride this layer already
 * via sharedLayers (their copies were byte-identical).
 */
export const pickerOptionActive = css`
  background: var(--haze-color-bg-subtle);
`;

/**
 * Selected option decoration: medium weight plus the primary tint —
 * Select's single mode, Combobox's options and Cascader's active
 * drill-down path (byte-identical copies before this module; the
 * declaration order differs in Select's copy, immaterial — the two
 * longhands never contend). Select's multiple mode shows its local
 * checkbox visual instead — one selectedness cue per mode.
 */
export const pickerOptionSelected = css`
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-primary);
`;

/**
 * Caret slot base: the declaration subset shared by every trigger
 * caret (and Cascader's option chevrons). The glyph is tinted through
 * `currentColor`, so the token color above is the single source of the
 * caret's color in both themes.
 */
export const pickerCaret = css`
  display: inline-flex;
  flex-shrink: 0;
  color: var(--haze-color-text-muted);
`;

/**
 * Native-select caret overlay — the inline-svg replacement of the
 * per-site hardcoded-hex data-URI carets (a `url()` cannot reference a
 * token, and a data-URI svg cannot inherit `currentColor`): the glyph
 * rides `PickerCaret`, so its color is the `text-muted` token and
 * follows the theme. Positioned over the select's reserved inline-end
 * padding; `select:disabled ~ &` mirrors the select's own disabled dim
 * (the painted background-image it replaces used to dim with its
 * host).
 */
export const pickerNativeCaret = css`
  position: absolute;
  inset-inline-end: var(--haze-space-3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;

  select:disabled ~ & {
    opacity: 0.5;
  }
`;

/**
 * Keydown arm shared by the button-trigger pickers (TreeSelect,
 * Cascader): ArrowUp/ArrowDown on a closed trigger opens the panel —
 * a no-op while already open, the same contract Select's and
 * Combobox's `useListboxNavigation` sites get through `onNavigate`.
 */
export function pickerArrowOpen(
  open: boolean,
  setOpen: (next: boolean) => void,
  event: {
    readonly key: string;
    preventDefault: () => void;
  }
): void {
  if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault();
    setOpen(true);
  }
}

export const ChevronDown = () => (
  <svg
    viewBox='0 0 12 12'
    width='12'
    height='12'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    <path d='M2 4l4 4 4-4' />
  </svg>
);

export const ChevronRight = () => (
  <svg
    viewBox='0 0 12 12'
    width='12'
    height='12'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
  >
    <path d='M4 2l4 4-4 4' />
  </svg>
);

type PickerCaretProps = {
  /** Glyph override; the shared ChevronDown by default. */
  glyph?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'className'>;

/**
 * The trigger's inline-end caret slot (`data-slot='icon'`,
 * aria-hidden). Family deltas (centering, inline-end push) ride
 * `className` extension classes.
 */
export function PickerCaret({ glyph, className, ...rest }: PickerCaretProps) {
  return (
    <span
      data-slot='icon'
      aria-hidden='true'
      x-class={[pickerCaret, className]}
      {...rest}
    >
      {glyph ?? <ChevronDown />}
    </span>
  );
}

type PickerTriggerProps = {
  /** Floating wiring: the trigger's inline anchor style plus the
   * pointer-safe toggle handlers (utils/floating). */
  behavior: FloatingBehavior;
  /** `aria-haspopup` token naming the popup's role. */
  popup: 'listbox' | 'menu' | 'tree';
  /** Open state driving `aria-expanded`. */
  open: boolean;
  /** id of the popup element `aria-controls` points at. */
  controlsId: string;
  /** Combobox highlight (`aria-activedescendant`); omitted when
   * undefined. */
  activeDescendant?: string;
  /** Extra classes for the caret slot (e.g. Cascader's
   * `classNames.icon`). */
  caretClassName?: string;
  className?: string;
  children?: ReactNode;
  /** Forwarded to the `<button>` — the floating trigger consumers
   * merge their own refs on top of it. */
  ref?: Ref<HTMLButtonElement>;
} & Omit<
  ComponentPropsWithoutRef<'button'>,
  'type' | 'children' | 'className'
>;

/**
 * The picker trigger button: the shared skin (`pickerTrigger`), the
 * floating wiring, the popup aria set (aria-haspopup/aria-expanded/
 * aria-controls/aria-activedescendant) and the inline-end caret. The
 * value/placeholder body and clear affordance ride `children`;
 * family deltas (combobox role, disabled, invalid state, data
 * attributes) ride the native props through `...rest`.
 */
export function PickerTrigger({
  behavior,
  popup,
  open,
  controlsId,
  activeDescendant,
  caretClassName,
  className,
  children,
  ref,
  ...rest
}: PickerTriggerProps) {
  return (
    <button
      // Spread first — the wiring below must win over a spread (the
      // same ordering rationale the Select trigger has always had).
      {...rest}
      ref={ref}
      data-slot='trigger'
      type='button'
      style={behavior.triggerStyle}
      aria-haspopup={popup}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-activedescendant={activeDescendant}
      onPointerDown={behavior.onTriggerPointerDown}
      onClick={behavior.onTriggerClick}
      x-class={[pickerTrigger, className]}
    >
      {children}
      <PickerCaret className={caretClassName} />
    </button>
  );
}

type PickerInputTriggerProps = {
  /** Floating wiring: the readonly input's inline anchor style plus
   * the pointer-safe toggle handlers (utils/floating). */
  behavior: FloatingBehavior;
  /** `aria-haspopup` token naming the popup's role — `dialog` for the
   * date/time panels (the default), a list role elsewhere. */
  popup?: 'dialog' | 'listbox' | 'menu' | 'tree';
  /** Open state driving `aria-expanded`. */
  open: boolean;
  /** id of the popup panel `aria-controls` points at. */
  controlsId: string;
  className?: string;
  /** Forwarded to the `<input>` — the date-family consumers merge
   * their own refs on top of it. */
  ref?: Ref<HTMLInputElement>;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'children' | 'className' | 'readOnly' | 'role'
>;

/**
 * The readonly picker input trigger: the `readOnly` input the date/time
 * families (Datepicker's trigger, TimePickerPanel's trigger — the
 * DatepickerCore/TimePickerPanel pattern) anchor their popup panels on.
 * The input is an implicit textbox, so `role='combobox'` is restated
 * for the popup aria set (aria-expanded is not supported on the
 * implicit textbox role, ARIA 1.2). The field surface is the shared md
 * `pickerFieldInput` (utils/field-skin); family deltas (cursor,
 * widths, tabular figures) ride `className` extension classes. The
 * pointer/click wiring is disabled-aware: jsdom dispatches pointer and
 * click events on disabled inputs that browsers swallow, so a
 * disabled trigger never toggles on either engine.
 */
export function PickerInputTrigger({
  behavior,
  popup = 'dialog',
  open,
  controlsId,
  className,
  ref,
  ...rest
}: PickerInputTriggerProps) {
  return (
    <input
      // Spread first — the wiring below must win over a spread (the
      // same ordering rationale the trigger button has always had).
      {...rest}
      ref={ref}
      data-slot='input'
      readOnly
      style={behavior.triggerStyle}
      role='combobox'
      aria-haspopup={popup}
      aria-expanded={open}
      aria-controls={controlsId}
      onPointerDown={(event) => {
        // jsdom dispatches pointer events on disabled inputs that
        // browsers swallow; keep the two behaviors aligned.
        if (event.currentTarget.disabled) return;
        behavior.onTriggerPointerDown();
      }}
      onClick={(event) => {
        if (event.currentTarget.disabled) return;
        behavior.onTriggerClick();
      }}
      x-class={[pickerFieldInput, className]}
    />
  );
}

type PickerPanelStateProps = {
  /** Copy of the block — the locale `loading` / `noMatch` string. */
  label: ReactNode;
  /** Consumer slot class (`classNames.loading` / `classNames.empty`). */
  className?: string;
};

/**
 * The loading state block of a picker panel's options area
 * (`data-slot='loading'`): the spinner glyph next to its copy, on the
 * shared `pickerLoadingBlock` skin. The spinner element itself is a
 * caller-supplied node (`<Spinner size='sm' />` — Select's floating
 * paths and Cascader): keeping the component out of this module's
 * imports keeps every other picker-trigger consumer family's bundle
 * Spinner-free. An option-less element wearing role="listbox" would
 * be an axe aria-required-children violation, so the block sits where
 * the listbox would — the spinner's own role="status" announces the
 * state.
 */
export function PickerPanelLoading({
  label,
  className,
  spinner,
}: PickerPanelStateProps & { spinner: ReactNode }) {
  return (
    <div data-slot='loading' x-class={[pickerLoadingBlock, className]}>
      {spinner}
      <span>{label}</span>
    </div>
  );
}

/**
 * The no-match state block of a picker panel's options area
 * (`data-slot='empty'`), on the shared `pickerEmptyBlock` skin.
 * Select's floating paths (a query without matches) and Cascader's
 * searchable panel (an empty rebuilt tree) render it.
 */
export function PickerPanelEmpty({ label, className }: PickerPanelStateProps) {
  return <div data-slot='empty' x-class={[pickerEmptyBlock, className]}>{label}</div>;
}
