import type {ReactNode} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useEffect, useRef} from 'react';
import {useControl} from 'react-use-control';

type DialogProps = {
  open?: Control<boolean> | boolean;
  onClose?: () => void;
  className?: string;
  children: ReactNode;
};

const overlay = css`
  border: none;
  border-radius: var(--pbl-radius-xl);
  padding: var(--pbl-space-6);
  background: var(--pbl-color-bg);
  color: var(--pbl-color-text);
  font-family: var(--pbl-font-sans);
  box-shadow: var(--pbl-shadow-xl);
  max-width: 480px;
  width: 100%;

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--pbl-shadow-xl), 0 0 0 3px var(--pbl-color-focus-ring);
  }
`;

export default function Dialog({
  open: openControl,
  onClose,
  className,
  children,
}: DialogProps) {
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
      x-class={[overlay, className]}
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

export type {DialogProps};
