/* eslint-disable react-refresh/only-export-components --
   internal primitives module (classes + glyphs + trigger component),
   not a fast-refresh boundary; consumers re-render through their own
   files. */
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { FloatingBehavior } from './floating';

import { css } from '@linaria/core';

/**
 * Shared trigger building block of the picker families (Select's
 * floating paths, Cascader, TreeSelect) and the native-select caret
 * overlay (SelectCore's single paths, ModelPicker): the base trigger
 * skin, the 12x12 stroke chevron glyphs, the caret slot and the popup
 * aria wiring of the trigger button.
 *
 * Deliberately NOT shared — genuinely drifted, they stay local to each
 * family (the drift discipline): gap/flex-wrap/padding/font-size per
 * trigger shape, the focus arm (`:focus, :focus-within` for Select's
 * tags box vs `:focus-visible` elsewhere), hover/disabled arms, and
 * per-site caret deltas (centering, inline-end push).
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
