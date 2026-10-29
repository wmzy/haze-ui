import type { ElementType, MouseEvent, ReactNode } from 'react';

import type { ButtonProps } from '../Button';

import { Button } from '../Button';
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden';
import { useStrings } from '../LocaleProvider';
import { useClipboard } from '../../hooks/useClipboard';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';
import { Check } from '../../icons';
import { CopyGlyph } from '../../utils/copy-glyph';

import { copiedSkin, iconSizes } from './copy-button-styles';

/** Semantic slot classes for CopyButton (AntD v6 `classNames` shape;
 * keys follow the data-slot names). */
type CopyButtonClassNames = {
  /** The button element (Button's data-slot='button'). */
  root?: string;
  /** Both glyphs (copy/check); the active one wears the class. */
  icon?: string;
};

type CopyButtonOwnProps = {
  /** The text to copy. */
  value?: string;
  /** Lazy source evaluated on every click (a live reading like the
   * current URL or a fresh token); wins over `value` when both are
   * set. */
  getValue?: () => string;
  /** How long the copied feedback lasts, in ms. Defaults to 2000. */
  copiedTimeout?: number;
  /** Accessible name while idle. Defaults to the `copyButton.copy`
   *  locale pack entry ('Copy'). */
  copyLabel?: string;
  /** Accessible name while copied. Defaults to the `copyButton.copied`
   *  pack entry ('Copied'). */
  copiedLabel?: string;
  /** Slot classes (see {@link CopyButtonClassNames}). */
  classNames?: CopyButtonClassNames;
  /**
   * Element-agnostic click: whatever element `as` rendered, the
   * consumer's handler fires first — the copy wiring rides after it.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

type CopyButtonProps<T extends ElementType = 'button'> = CopyButtonOwnProps & {
  /**
   * Icon or label. Defaults to the copy/check glyph pair; a function
   * receives the copied state so text labels can switch their own
   * wording (`(copied) => copied ? 'Copied!' : 'Copy'`).
   */
  children?: ReactNode | ((copied: boolean) => ReactNode);
  /**
   * Render element, delegated to the underlying `Button`'s polymorphism:
   * `as='a'` renders a real anchor wearing the copy skin (`href` and the
   * rest of the anchor surface type-check), any component works as long
   * as it forwards props and ref to a DOM element.
   */
  as?: T;
} & Omit<ButtonProps<T>, keyof CopyButtonOwnProps | 'children' | 'as'>;

/**
 * A `Button` that copies text to the clipboard on click and flips into
 * a copied state for `copiedTimeout` ms (default 2000): the glyph
 * swaps copy → check (non-solid variants also ink success), the
 * accessible name swaps `copyLabel` → `copiedLabel`, and a visually
 * hidden `role='status'` announces the change to screen readers
 * (WCAG 4.1.3 — the label swap alone is not announced on an already
 * focused control).
 *
 * The copy plumbing is `useClipboard`: async clipboard API first,
 * deprecated `execCommand` fallback second; when both fail the button
 * simply stays idle. Sizing and variants are Button's — including the
 * ConfigProvider `Button.size` default tier. The default shape is the
 * square icon button (`square`, outline); text-label render props pair
 * naturally with `square={false}`.
 *
 * Precedence notes: `getValue` wins over `value`; an explicit
 * `aria-label` passed through the rest props overrides the swapped
 * `copyLabel`/`copiedLabel` naming (statically, for both states).
 */
export default function CopyButton<T extends ElementType = 'button'>({
  value,
  getValue,
  copiedTimeout = 2000,
  copyLabel,
  copiedLabel,
  variant = 'outline',
  square = true,
  size,
  classNames,
  className,
  as,
  children,
  onClick,
  ...rest
}: CopyButtonProps<T>) {
  const { copied, copy } = useClipboard(copiedTimeout);
  const strings = useStrings('copyButton');
  const copyText = copyLabel ?? strings.copy;
  const copiedText = copiedLabel ?? strings.copied;
  // Same resolution tiers as Button (explicit prop → Button's
  // ConfigProvider section → built-in 'md') so the icon step always
  // matches the chrome it sits in.
  const config = useConfigDefaults('Button');
  const resolvedSize = size ?? config.size ?? 'md';
  const iconClass = iconSizes[resolvedSize];

  function handleClick(event: MouseEvent<HTMLElement>) {
    const text = getValue?.() ?? value;
    if (text !== undefined) void copy(text);
    // Element-agnostic event: whatever element `as` rendered, the
    // consumer's handler sees it, typed element-agnostic above.
    onClick?.(event);
  }

  const Glyph = copied ? Check : CopyGlyph;
  // The generic Omit arms are opaque to the type checker; at runtime
  // rest is exactly Button's remainder — CopyButton owns or redeclares
  // every other key (an explicit consumer aria-label still overrides the
  // swapped copy/copied naming, per the documented precedence).
  return (
    <Button
      variant={variant}
      size={size}
      square={square}
      as={as}
      data-copied={copied || undefined}
      aria-label={copied ? copiedText : copyText}
      className={
        [
          className,
          classNames?.root,
          copied && variant !== 'solid' && copiedSkin,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      onClick={handleClick}
      {...(rest as unknown as ButtonProps<T>)}
    >
      {typeof children === 'function' ? (
        children(copied)
      ) : (
        children ?? (
          <Glyph
            x-class={[iconClass, classNames?.icon]}
            width={16}
            height={16}
            aria-hidden='true'
            focusable='false'
          />
        )
      )}
      {/* Status announcement: aria-label swaps silently on a focused
       * control, so the copied transition speaks through a polite
       * live region instead (aria-label keeps naming the button). */}
      <VisuallyHidden role="status">{copied ? copiedText : ''}</VisuallyHidden>
    </Button>
  );
}

export type { CopyButtonClassNames, CopyButtonProps };
