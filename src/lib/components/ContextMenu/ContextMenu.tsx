import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { ContextMenuClassNames } from './ContextMenuContext';

import { useCallback, useRef, useState } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { useFloating, useOpenWithChange } from '../../utils/floating';

import { ContextMenuProvider } from './ContextMenuContext';

type ContextMenuProps = {
  open?: ControlOrValue<boolean>;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every family part through context (see
   * {@link ContextMenuClassNames}). Slot classes are appended at the
   * end of each part's class list; per-part `className` props still
   * land after the slot class. Not passing it renders identical output.
   */
  classNames?: ContextMenuClassNames;
  className?: string;
  /**
   * Forwarded to the family's root wrapper `<div>`
   * (`data-slot='context-menu'`) — the container holding both the
   * right-click area and the floating panel. The panel itself is a
   * native popover with its own DOM; reach it through
   * `classNames.content` styling or panel queries (`role="menu"`), not
   * this ref.
   */
  ref?: Ref<HTMLDivElement>;
};

const wrapper = css`
  position: relative;
  display: inline-block;
`;

export default function ContextMenu({
  open: openControl,
  onOpenChange,
  children,
  classNames,
  className,
  ref,
}: ContextMenuProps) {
  const [open, setOpen] = useControl(openControl, false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  // Doubles as the floating trigger ref: the wrapper contains both the
  // trigger area and the panel, so outside-close treats clicks on the
  // host as inside.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSetOpen = useOpenWithChange(open, setOpen, onOpenChange);

  const setPosition = useCallback((px: number, py: number) => {
    setX(px);
    setY(py);
  }, []);

  const floating = useFloating({
    open,
    setOpen: handleSetOpen,
    triggerRef: wrapperRef,
    panelRef: contentRef,
    animated: true,
  });

  // The consumer ref and the internal floating trigger ref both land on
  // the wrapper: a callback fans the node out to each target.
  const setWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      wrapperRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  return (
    <ContextMenuProvider
      value={{
        open,
        setOpen: handleSetOpen,
        x,
        y,
        setPosition,
        contentRef,
        floating,
        classNames,
      }}
    >
      <div
        ref={setWrapperRef}
        data-slot='context-menu'
        x-class={[wrapper, classNames?.root, className]}
      >
        {children}
      </div>
    </ContextMenuProvider>
  );
}

export type { ContextMenuProps };
