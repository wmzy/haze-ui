import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useEffect, useCallback } from 'react';

import { getEnabledMenuItems, useMenuKeyboard } from './useMenuKeyboard';
import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuContentProps = {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
};

const content = css`
  position: absolute;
  top: 100%;
  min-width: 10rem;
  margin-top: var(--haze-space-1);
  padding: var(--haze-space-1);
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  box-shadow: var(--haze-shadow-md);
  z-index: 50;
`;

const alignStart = css`left: 0;`;
const alignCenter = css`left: 50%; transform: translateX(-50%);`;
const alignEnd = css`right: 0;`;

const alignMap = { start: alignStart, center: alignCenter, end: alignEnd };

export default function DropdownMenuContent({ children, align = 'start', className }: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef, contentRef, contentId, focusRequestRef } =
    useDropdownMenuContext();

  const closeMenu = useCallback(() => {
    setOpen(false);
    // The menu unmounts on close; hand focus back so keyboard users
    // never land on <body>.
    triggerRef.current?.focus();
  }, [setOpen, triggerRef]);

  const handleKeyDown = useMenuKeyboard({ menuRef: contentRef, onClose: closeMenu });

  // Roving tabindex initialization + trigger-requested focus handoff.
  // Runs when the menu opens: this component always renders (it returns
  // null while closed), so the effect keys on `open` to fire after the
  // items have mounted.
  useEffect(() => {
    if (!open) return;
    const menu = contentRef.current;
    if (!menu) return;
    const items = getEnabledMenuItems(menu);
    items.forEach((el) => {
      el.tabIndex = -1;
    });
    if (items[0]) items[0].tabIndex = 0;

    const request = focusRequestRef.current;
    focusRequestRef.current = null;
    if (request) {
      const target = request === 'first' ? items[0] : items[items.length - 1];
      target?.focus();
    }

    // Keep the roving tabindex in sync as focus moves: the newly focused
    // item becomes the single tab stop. Queried live — the item set may
    // change between opens.
    const handleFocusIn = (event: FocusEvent) => {
      getEnabledMenuItems(menu).forEach((el) => {
        el.tabIndex = el === event.target ? 0 : -1;
      });
    };
    menu.addEventListener('focusin', handleFocusIn);
    return () => menu.removeEventListener('focusin', handleFocusIn);
  }, [open, contentRef, focusRequestRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="menu"
      x-class={[content, alignMap[align], className]}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

export type { DropdownMenuContentProps };
