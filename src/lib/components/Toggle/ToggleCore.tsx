import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  MouseEvent,
} from 'react';

import { css } from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';
import { ghostVariant, solidVariant } from '../../utils/button-variant-skin';
import { base, sizes, squareSizes } from '../Button/styles';

type ToggleCoreOwnProps = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /** Native click event passthrough — invoked with the DOM event after
   * `onPressedChange`, so a spread can never override the controlled callback. */
  onNativeClick?: ComponentPropsWithoutRef<'button'>['onClick'];
  size?: 'sm' | 'md' | 'lg';
  /** Equal padding on all sides — for icon-only square toggles. */
  square?: boolean;
  className?: string;
};

/**
 * Polymorphic like Button's `as`: the toggle skin and the pressed wiring
 * (`aria-pressed`, click → `onPressedChange`) always land on the rendered
 * element. `as='a'` renders a pressed-state anchor — `type='button'` is
 * gated to the native-button shape.
 */
type ToggleCoreProps<T extends ElementType = 'button'> = ToggleCoreOwnProps & {
  /** Render element — 'button' (default), 'a', or any component that
   * forwards props and ref to a DOM element (a router Link). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof ToggleCoreOwnProps | 'as' | 'type' | 'aria-pressed'>;

/**
 * Surface keyed on pressed state — mutually exclusive like Button's
 * variants, so no emission-order games decide which background wins.
 * Unpressed is a quiet ghost (the toggle recedes); pressed goes solid
 * primary (the "this state is on" signal), each with its own
 * interaction-state tokens. Both surfaces are Button's own variant
 * arms (utils/button-variant-skin — the toggle is a ghost or solid
 * Button whose fill is keyed on `pressed` instead of a `variant` prop).
 */
const surfaces = {
  rest: ghostVariant,
  pressed: solidVariant,
} as const;

/**
 * Forced-colors: the pressed fill flattens onto Canvas — the on/off
 * signal would vanish against the transparent rest state. Pressed
 * renders as the Windows-native Highlight chip (stable across
 * hover/active, which the UA would flatten back to Canvas). Toggle's
 * own delta over the shared solid surface: Button's solid variant ships
 * no forced-colors arm.
 *
 * The compound `&[data-slot]` selector keeps every arm of this delta
 * winning over the shared variant's hover/active backgrounds in any
 * cascade order (dev-server injection order and the dist split-css
 * order disagree — quiet-button-skin's header); and the disabled ink
 * restates Button's base GrayText at the raised specificity, so a
 * disabled pressed toggle stays disabled-looking in both orders too
 * (against the plain base arm it would be a same-specificity tie).
 */
const pressedForcedColors = css`
  @media (forced-colors: active) {
    &[data-slot='toggle'] {
      background: Highlight;
      color: HighlightText;

      &:hover,
      &:active {
        background: Highlight;
      }

      &:disabled {
        color: GrayText;
      }
    }
  }
`;

/**
 * The controlled half of Toggle: a momentary pressed-state button
 * (`<button aria-pressed>`) — one-shot commands like bold/mute, not the
 * on/off *setting* that Switch's `role="switch"` carries. State never
 * lives here: it renders `pressed` and reports clicks through
 * `onPressedChange`, so the sugar (or any owner) owns the truth.
 */
export default function ToggleCore<T extends ElementType = 'button'>({
  pressed,
  onPressedChange,
  onNativeClick,
  size = 'md',
  square = false,
  as,
  className,
  ...rest
}: ToggleCoreProps<T>) {
  const sizeClass = square ? squareSizes[size] : sizes[size];
  const Tag = (as ?? 'button');
  // Only the native button shape carries type; anchors and custom
  // components keep their own element semantics.
  const isNativeButton = as === undefined || as === 'button';
  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      aria-pressed={pressed}
      data-slot='toggle'
      x-class={[
        base,
        focusRingVisible,
        surfaces[pressed ? 'pressed' : 'rest'],
        pressed && pressedForcedColors,
        sizeClass,
        className,
      ]}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        // The historical onNativeClick signature stays button-typed; the
        // event itself is whatever element `as` rendered.
        onPressedChange(!pressed);
        onNativeClick?.(event);
      }}
      {...rest}
    />
  );
}

export type { ToggleCoreOwnProps, ToggleCoreProps };
