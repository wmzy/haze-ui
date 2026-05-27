import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type BottomSheetProps = {
  open?: Control<boolean> | boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

const overlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const sheet = css`
  background: var(--haze-color-bg);
  border-radius: var(--haze-radius-xl) var(--haze-radius-xl) 0 0;
  padding: var(--haze-space-4) var(--haze-space-6);
  max-width: 640px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  box-shadow: var(--haze-shadow-xl);
`;

const handle = css`
  width: 2rem;
  height: 0.25rem;
  background: var(--haze-color-border);
  border-radius: var(--haze-radius-full);
  margin: 0 auto var(--haze-space-4);
`;

export default function BottomSheet({
  open: openControl,
  onClose,
  children,
  className,
}: BottomSheetProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div x-class={[overlay, className]} onClick={handleClose}>
      <div x-class={[sheet]} onClick={(e) => e.stopPropagation()}>
        <div x-class={[handle]} />
        {children}
      </div>
    </div>
  );
}

export type { BottomSheetProps };
