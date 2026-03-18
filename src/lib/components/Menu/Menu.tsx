import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useRef } from 'react';
import { useControl } from 'react-use-control';

type MenuProps = {
  open?: Control<boolean> | boolean;
  trigger?: ReactNode;
  className?: string;
  children: ReactNode;
};

const container = css`
  position: relative;
  display: inline-flex;
`;

const panel = css`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: var(--haze-space-1);
  min-width: 160px;
  padding: var(--haze-space-1) 0;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

const hidden = css`
  display: none;
`;

export default function Menu({
  open: openControl,
  trigger,
  className,
  children,
}: MenuProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  return (
    <div ref={ref} className={container}>
      <span onClick={() => setOpen((prev) => !prev)}>{trigger}</span>
      <div role='menu' x-class={[panel, !open && hidden, className]}>
        {children}
      </div>
    </div>
  );
}

export type { MenuProps };
