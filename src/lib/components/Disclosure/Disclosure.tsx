import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useRef } from 'react';
import { useControl } from 'react-use-control';

import { disclosureContent, disclosureSummary } from '../../utils/disclosure-skin';

type DisclosureProps = {
  open?: ControlOrValue<boolean>;
  summary: ReactNode;
  className?: string;
  children: ReactNode;
};

const details = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
`;

/* Only the box inset differs from the shared content typography: the
   Disclosure is a standalone card, so its body carries the divider and
   its own block padding (AccordionItem's borderless variant pads
   differently). */
const contentInset = css`
  padding: var(--haze-space-3) var(--haze-space-4);
  border-top: 1px solid var(--haze-color-border);
`;

export default function Disclosure({
  open: openControl,
  summary,
  className,
  children,
}: DisclosureProps) {
  const [open] = useControl(openControl, false);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = open;
  }, [open]);

  return (
    <details ref={ref} data-slot='disclosure' x-class={[details, className]}>
      <summary data-slot='trigger' x-class={[disclosureSummary]}>{summary}</summary>
      <div data-slot='content' x-class={[disclosureContent, contentInset]}>{children}</div>
    </details>
  );
}

export type { DisclosureProps };
