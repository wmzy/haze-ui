/* eslint-disable react-refresh/only-export-components --
   internal primitives module (classes + glyphs + trigger component),
   not a fast-refresh boundary; consumers re-render through their own
   files. */
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { FloatingBehavior } from './floating';

import { css } from '@linaria/core';

/**
 * Shared trigger building block of the picker families (Select's
 * floating paths, Cascader, TreeSelect) and the native-select paths
 * (SelectCore's single modes, ModelPicker): the base trigger skin,
 * the native-select skin, the maxTagCount overflow badge, the
 * tier-aware panel width cascade, the 12x12 stroke chevron glyphs,
 * the caret slot and the popup aria wiring of the trigger button.
 *
 * Deliberately NOT shared — genuinely drifted, they stay local to each
 * family (the drift discipline): gap/flex-wrap/padding/font-size per
 * trigger shape, the floating focus arm (`:focus, :focus-within` for
 * Select's tags box vs `:focus-visible` elsewhere) and per-site caret
 * deltas (centering, inline-end push). The native-select skin's
 * hover/focus/disabled arms are shared verbatim — SelectCore and
 * ModelPicker agree token for token.
 */

/**
 * Trigger button base: the declaration set shared verbatim by the
 * Select (floating), Cascader and TreeSelect triggers. Extension
 * classes layered after it add only properties it does not declare,
 * so cascade order between the two can never matter.
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
