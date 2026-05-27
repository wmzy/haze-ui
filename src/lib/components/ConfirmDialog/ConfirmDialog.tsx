import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type ConfirmDialogProps = {
  open?: Control<boolean> | boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: ReactNode;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  className?: string;
};

const overlay = css`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
`;

const dialog = css`
  background: var(--haze-color-bg);
  border-radius: var(--haze-radius-xl);
  padding: var(--haze-space-6);
  box-shadow: var(--haze-shadow-xl);
  max-width: 480px;
  width: 100%;
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
`;

const header = css`
  margin-bottom: var(--haze-space-4);
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-semibold);
`;

const body = css`
  margin-bottom: var(--haze-space-6);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  line-height: var(--haze-leading-relaxed);
`;

const footer = css`
  display: flex;
  justify-content: flex-end;
  gap: var(--haze-space-3);
`;

const btn = css`
  padding: var(--haze-space-2) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
`;

const cancelBtn = css`
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  color: var(--haze-color-text);

  &:hover {
    background: var(--haze-color-muted);
  }
`;

const confirmBtn = css`
  background: var(--haze-color-primary);
  border: 1px solid var(--haze-color-primary);
  color: var(--haze-color-bg);

  &:hover {
    opacity: 0.9;
  }
`;

const dangerBtn = css`
  background: var(--haze-color-danger, #dc2626);
  border: 1px solid var(--haze-color-danger, #dc2626);
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

export default function ConfirmDialog({
  open: openControl,
  onClose,
  onConfirm,
  onCancel,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  className,
}: ConfirmDialogProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  return (
    <div x-class={[overlay, className]} onClick={handleClose}>
      <div x-class={[dialog]} onClick={(e) => e.stopPropagation()}>
        {title && <div x-class={[header]}>{title}</div>}
        <div x-class={[body]}>{children}</div>
        <div x-class={[footer]}>
          <button x-class={[btn, cancelBtn]} type="button" onClick={handleCancel}>
            {cancelText}
          </button>
          <button x-class={[btn, variant === 'danger' ? dangerBtn : confirmBtn]} type="button" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { ConfirmDialogProps };
