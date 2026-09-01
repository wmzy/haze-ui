import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useId, useRef } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';

type PopoverProps = {
  content: ReactNode;
  open?: ControlOrValue<boolean>;
  className?: string;
  children: ReactNode;
};

const container = css`
  position: relative;
  display: inline-flex;
`;

/** Visual skin applied on every rendering tier of the panel. */
const panelVisuals = css`
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

export default function Popover({
  content,
  open: openControl,
  className,
  children,
}: PopoverProps) {
  const [open, setOpen] = useControl(openControl, false);
  const id = useId();

  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const floating = useFloating({ open, setOpen, triggerRef, panelRef });

  return (
    <span className={container}>
      <span
        ref={triggerRef}
        style={floating.triggerStyle}
        // aria-expanded requires an interactive role; a bare span resolves
        // to role=generic, which ARIA 1.2 does not allow it on (axe
        // aria-allowed-attr). The trigger span is the clickable popover
        // trigger — role=button is its honest semantics.
        role='button'
        aria-expanded={open}
        aria-controls={id}
        onPointerDown={floating.onTriggerPointerDown}
        onClick={floating.onTriggerClick}
      >
        {children}
      </span>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom-span"
        id={id}
        visualClass={panelVisuals}
        className={className}
      >
        {content}
      </FloatingPanel>
    </span>
  );
}

export type { PopoverProps };
