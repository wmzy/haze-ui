import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type BannerProps = {
  visible?: Control<boolean> | boolean;
  onClose?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  className?: string;
};

const banner = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--haze-space-3) var(--haze-space-4);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  border-radius: var(--haze-radius-md);
`;

const variants: Record<string, string> = {
  info: css`
    background: var(--haze-color-info-light, #e0f2fe);
    color: var(--haze-color-info, #0284c7);
  `,
  success: css`
    background: var(--haze-color-success-light, #dcfce7);
    color: var(--haze-color-success, #16a34a);
  `,
  warning: css`
    background: var(--haze-color-warning-light, #fef9c3);
    color: var(--haze-color-warning, #ca8a04);
  `,
  danger: css`
    background: var(--haze-color-danger-light, #fee2e2);
    color: var(--haze-color-danger, #dc2626);
  `,
};

const closeBtn = css`
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  font-size: var(--haze-text-lg);
  padding: 0 var(--haze-space-1);
  line-height: 1;

  &:hover {
    opacity: 1;
  }
`;

const content = css`
  flex: 1;
`;

export default function Banner({
  visible: visibleControl,
  onClose,
  variant = 'info',
  children,
  className,
}: BannerProps) {
  const [visible, setVisible] = useControl(visibleControl as Control<boolean>, true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div x-class={[banner, variants[variant], className]} role="alert">
      <div x-class={[content]}>{children}</div>
      {onClose && (
        <button x-class={[closeBtn]} type="button" onClick={handleClose} aria-label="Close">
          x
        </button>
      )}
    </div>
  );
}

export type { BannerProps };
