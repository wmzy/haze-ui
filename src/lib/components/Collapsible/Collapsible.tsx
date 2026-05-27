import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { createContext, useContext } from 'react';
import { useControl } from 'react-use-control';

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | undefined>(undefined);

function useCollapsibleContext() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('Collapsible sub-components must be used within <Collapsible>');
  return ctx;
}

// Collapsible
type CollapsibleProps = {
  open?: Control<boolean> | boolean;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

const base = css`
  font-family: var(--haze-font-sans);
`;

export function Collapsible({
  open: openControl,
  defaultOpen = false,
  children,
  className,
}: CollapsibleProps) {
  const [open, setOpen] = useControl(openControl as Control<boolean>, defaultOpen);
  const toggle = () => setOpen((v) => !v);

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      <div x-class={[base, className]}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

// CollapsibleTrigger
type CollapsibleTriggerProps = {
  children: ReactNode;
  className?: string;
};

const triggerStyle = css`
  cursor: pointer;
  user-select: none;
`;

export function CollapsibleTrigger({ children, className }: CollapsibleTriggerProps) {
  const { toggle } = useCollapsibleContext();
  return (
    <button type="button" x-class={[triggerStyle, className]} onClick={toggle}>
      {children}
    </button>
  );
}

// CollapsibleContent
type CollapsibleContentProps = {
  children: ReactNode;
  className?: string;
};

const contentStyle = css`
  overflow: hidden;
`;

export function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const { open } = useCollapsibleContext();
  if (!open) return null;
  return (
    <div x-class={[contentStyle, className]}>
      {children}
    </div>
  );
}

export type { CollapsibleProps, CollapsibleTriggerProps, CollapsibleContentProps };
