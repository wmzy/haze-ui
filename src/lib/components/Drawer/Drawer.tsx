import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useRef } from 'react';
import { useControl } from 'react-use-control';

type DrawerProps = {
  open?: Control<boolean> | boolean;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  onClose?: () => void;
  className?: string;
  children: ReactNode;
};

const overlay = css`
  border: none;
  padding: 0;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  max-height: 100vh;
  max-width: 100vw;
  overflow: auto;

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const placements = {
  left: css`
    height: 100vh;
    width: 320px;
    min-width: 280px;
    max-width: 85vw;
    margin-left: 0;
  `,
  right: css`
    height: 100vh;
    width: 320px;
    min-width: 280px;
    max-width: 85vw;
    margin-left: auto;
  `,
  top: css`
    width: 100vw;
    height: 320px;
    margin-top: 0;
  `,
  bottom: css`
    width: 100vw;
    height: 320px;
    margin-top: auto;
  `,
} as const;

export default function Drawer({
  open: openControl,
  placement = 'right',
  onClose,
  className,
  children,
}: DrawerProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      x-class={[overlay, placements[placement], className]}
      onClose={() => {
        setOpen(false);
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          setOpen(false);
          onClose?.();
        }
      }}
    >
      {children}
    </dialog>
  );
}

export type { DrawerProps };
