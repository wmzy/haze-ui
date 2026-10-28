import type { ReactNode, Ref } from 'react';
import type { StatusColor } from '../../utils/status-skin';

import { dismissBtn } from '../../utils/status-skin';

import { base, solidColors, outlineColors, iconStyle, closeBtnGap } from './chip-styles';

type ChipProps = {
  variant?: 'solid' | 'outline';
  /** Semantic status color. */
  color?: StatusColor;
  icon?: ReactNode;
  onClose?: () => void;
  /**
   * Accessible label for the remove button. Inlined default keeps Chip
   * hook-free (RSC-safe: no useStrings); locale-aware callers pass
   * their own string.
   */
  removeLabel?: string;
  className?: string;
  children: ReactNode;
  /** Forwarded to the root span (data-slot='chip'). */
  ref?: Ref<HTMLSpanElement>;
};

export default function Chip({
  variant = 'solid',
  color = 'default',
  icon,
  onClose,
  removeLabel = 'Remove',
  className,
  children,
  ref,
}: ChipProps) {
  const colorClass = variant === 'outline' ? outlineColors[color] : solidColors[color];

  return (
    <span ref={ref} data-slot="chip" x-class={[base, colorClass, className]}>
      {icon && <span data-slot="icon" x-class={[iconStyle]}>{icon}</span>}
      {children}
      {onClose && (
        <button
          data-slot="remove-button"
          type="button"
          x-class={[dismissBtn, closeBtnGap]}
          onClick={onClose}
          aria-label={removeLabel}
        >
          ×
        </button>
      )}
    </span>
  );
}

export type { ChipProps };
