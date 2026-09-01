import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { FloatingPanel } from '../../utils/floating';
import { useMenuKeyboard, useRovingTabindex } from '../../utils/menuKeyboard';

import { useContextMenuContext } from './ContextMenuContext';

type ContextMenuContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Point-positioned panel: fixed at the cursor coordinates recorded by the
 * trigger, so no anchor/JS placement runs (`placement` stays unset).
 */
const content = css`
  position: fixed;
  min-width: 10rem;
  padding: var(--haze-space-1);
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  box-shadow: var(--haze-shadow-md);
  z-index: 100;
`;

export default function ContextMenuContent({
  children,
  className,
}: ContextMenuContentProps) {
  const { open, setOpen, x, y, contentRef, floating } = useContextMenuContext();

  const handleKeyDown = useMenuKeyboard({
    menuRef: contentRef,
    onClose: () => setOpen(false),
  });

  useRovingTabindex({ menuRef: contentRef, active: open });

  if (!open) return null;

  return (
    <FloatingPanel
      ref={contentRef}
      behavior={floating}
      role="menu"
      visualClass={content}
      className={className}
      style={{ left: x, top: y }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </FloatingPanel>
  );
}

export type { ContextMenuContentProps };
