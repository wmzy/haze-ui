import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import { useBusyPressable } from '../../hooks/useBusyPressable';
import Spinner from '../Spinner/Spinner';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import {
  base,
  label as labelClass,
  link as linkClass,
  loading,
  sizes,
  squareSizes,
  variants,
} from './styles';

/**
 * Component-level tokens: Button can be rethemed per-component by setting
 * `--haze-button-*` custom properties on `:root` or any ancestor —
 * `--haze-button-height-sm|md|lg`, `--haze-button-font-size-sm|md|lg`,
 * `--haze-button-radius` (fallbacks and usage documented in ./styles).
 * ButtonLink and Toggle wear the same skin and follow along.
 */
type ButtonOwnProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
  /**
   * Busy state: swaps the label ink for a spinner (the button keeps its
   * width — the label still sizes the cell, just transparent), forces
   * `disabled` so click/Enter/submit are blocked at the platform level,
   * and sets `aria-busy`. Pass an object to replace the default spinner
   * (`icon`) or the announced label text (`text` — visually replaces
   * the children while busy, e.g. "Saving…").
   *
   * On anchors/custom components (`as`) there is no native `disabled`:
   * busy reports `aria-disabled`/`aria-busy` and the skin drops pointer
   * events, but keyboard users can still focus — pass `tabIndex={-1}`
   * yourself to fully lock a busy link.
   */
  loading?: boolean | { icon?: ReactNode; text?: ReactNode };
};

/**
 * MUI-OverridableComponent-shaped polymorphism: own props first, then
 * the target element's props minus the colliding keys. The wiring
 * (classes, data-slot, aria, type gating) always lands on the rendered
 * element — the same "wiring wins" precedence as FormItem's `as`.
 */
type ButtonProps<T extends ElementType = 'button'> = ButtonOwnProps & {
  /**
   * Render element. `'button'` (default) renders a native button;
   * `'a'` renders an anchor wearing the button skin — link semantics
   * (`href`, ⌘/middle-click, crawlers) without a ButtonLink import.
   * Any component works the same way (e.g. a router Link) as long as it
   * forwards props and ref to a DOM element.
   *
   * Element-specific defaults are gated: `type='button'` is only set on
   * the native-button shape, so anchors never carry the attribute.
   */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof ButtonOwnProps | 'as' | 'type'>;

/**
 * DOM contract: `children` always render inside a
 * `<span data-slot='label'>` (so the busy state can hide the ink while
 * keeping the width); a busy render adds
 * `<span data-slot='indicator' aria-hidden>` next to it. Selectors or
 * tests targeting `button > textNode` need updating — this wrapper
 * shipped in the `loading` wave (minor).
 */
export default function Button<T extends ElementType = 'button'>({
  variant = 'solid',
  size: sizeProp,
  square = false,
  loading: loadingProp = false,
  as,
  className,
  children,
  disabled: disabledProp,
  ...rest
}: ButtonProps<T>) {
  // Three tiers: explicit prop → ConfigProvider default → built-in 'md'.
  // The built-in stays last so a missing provider renders exactly what
  // Button rendered before the wiring (byte-identical).
  const config = useConfigDefaults('Button');
  const size = sizeProp ?? config.size ?? 'md';
  const sizeClass = square ? squareSizes[size] : sizes[size];

  const busy = Boolean(loadingProp);
  const busyProps = useBusyPressable(busy, disabledProp);
  const busyIcon =
    typeof loadingProp === 'object' ? loadingProp.icon : undefined;
  const busyText =
    typeof loadingProp === 'object' ? loadingProp.text : undefined;

  const Tag = (as ?? 'button');
  // Only the native button shape carries type/disabled; anchors and
  // custom components report state through aria instead.
  const isNativeButton = as === undefined || as === 'button';

  return (
    <Tag
      {...(isNativeButton
        ? { type: 'button' as const, disabled: busyProps.disabled }
        : { 'aria-disabled': busyProps.disabled || undefined })}
      data-slot={isNativeButton ? 'button' : 'button-link'}
      data-loading={busy || undefined}
      aria-busy={busyProps['aria-busy']}
      x-class={[
        base,
        variants[variant],
        sizeClass,
        !isNativeButton && linkClass,
        busy && loading,
        className,
      ]}
      {...rest}
    >
      <span data-slot='label' x-class={[labelClass]}>
        {busy && busyText !== undefined ? busyText : children}
      </span>
      {busy && (
        // always aria-hidden: without it the default Spinner's
        // role=status label ("Loading") gets concatenated into the
        // control's accessible name; the busy phase is already
        // announced by the control's own aria-busy
        <span data-slot='indicator' aria-hidden>
          {busyIcon ?? <Spinner size='sm' />}
        </span>
      )}
    </Tag>
  );
}

export type { ButtonOwnProps, ButtonProps };
