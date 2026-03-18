import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useId } from 'react';
import { useControl } from 'react-use-control';

type PopoverProps = {
  content: ReactNode;
  open?: Control<boolean> | boolean;
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
  padding: var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  box-shadow: var(--haze-shadow-lg);
  min-width: 200px;
`;

const hidden = css`
  display: none;
`;

export default function Popover({
  content,
  open: openControl,
  className,
  children,
}: PopoverProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, false);
  const id = useId();

  return (
    <span className={container}>
      <span
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((prev) => !prev)}
      >
        {children}
      </span>
      <div id={id} x-class={[panel, !open && hidden, className]}>
        {content}
      </div>
    </span>
  );
}

export type { PopoverProps };
