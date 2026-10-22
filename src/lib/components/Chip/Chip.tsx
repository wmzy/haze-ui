import type { ReactNode } from 'react';

import { base, solidColors, outlineColors, iconStyle, closeBtn } from './chip-styles';

type ChipProps = {
  variant?: 'solid' | 'outline';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
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
};

export default function Chip({
  variant = 'solid',
  color = 'default',
  icon,
  onClose,
  removeLabel = 'Remove',
  className,
  children,
}: ChipProps) {
  const colorClass = variant === 'outline' ? outlineColors[color] : solidColors[color];

  return (
    <span data-slot="chip" x-class={[base, colorClass, className]}>
      {icon && <span data-slot="icon" x-class={[iconStyle]}>{icon}</span>}
      {children}
      {onClose && (
        <button data-slot="remove-button" type="button" x-class={[closeBtn]} onClick={onClose} aria-label={removeLabel}>
          ×
        </button>
      )}
    </span>
  );
}

export type { ChipProps };
