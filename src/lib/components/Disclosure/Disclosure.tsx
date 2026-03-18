import type {ReactNode} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useEffect, useRef} from 'react';
import {useControl} from 'react-use-control';

type DisclosureProps = {
  open?: Control<boolean> | boolean;
  summary: ReactNode;
  className?: string;
  children: ReactNode;
};

const details = css`
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-md);
  overflow: hidden;
`;

const summaryStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pbl-space-3) var(--pbl-space-4);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  font-weight: var(--pbl-weight-medium);
  color: var(--pbl-color-text);
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: background 0.15s;

  &:hover {
    background: var(--pbl-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 3px var(--pbl-color-focus-ring);
  }

  &::marker,
  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--pbl-color-text-muted);
    border-bottom: 2px solid var(--pbl-color-text-muted);
    transform: rotate(-45deg);
    transition: transform 0.2s;
    flex-shrink: 0;
  }

  details[open] > &::after {
    transform: rotate(45deg);
  }
`;

const content = css`
  padding: var(--pbl-space-3) var(--pbl-space-4);
  border-top: 1px solid var(--pbl-color-border);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text-secondary);
  line-height: var(--pbl-leading-normal);
`;

export default function Disclosure({
  open: openControl,
  summary,
  className,
  children,
}: DisclosureProps) {
  const [open] = useControl(openControl as Control<boolean>, false);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = open;
  }, [open]);

  return (
    <details ref={ref} x-class={[details, className]}>
      <summary className={summaryStyle}>{summary}</summary>
      <div className={content}>{children}</div>
    </details>
  );
}

export type {DisclosureProps};
