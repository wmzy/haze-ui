import type {ReactNode} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useId} from 'react';
import {useControl} from 'react-use-control';

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
  margin-top: var(--pbl-space-1);
  padding: var(--pbl-space-3);
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-lg);
  background: var(--pbl-color-bg);
  color: var(--pbl-color-text);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  box-shadow: var(--pbl-shadow-lg);
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
      <div
        id={id}
        x-class={[panel, !open && hidden, className]}
      >
        {content}
      </div>
    </span>
  );
}

export type {PopoverProps};
