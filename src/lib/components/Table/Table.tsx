import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type TableProps = {
  striped?: boolean;
  bordered?: boolean;
  className?: string;
  children: ReactNode;
};

const base = css`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
`;

const stripedStyle = css`
  & tbody tr:nth-child(even) {
    background: var(--pbl-color-bg-subtle);
  }
`;

const borderedStyle = css`
  & th,
  & td {
    border: 1px solid var(--pbl-color-border);
  }
`;

export default function Table({
  striped = false,
  bordered = false,
  className,
  children,
}: TableProps) {
  return (
    <table x-class={[base, striped && stripedStyle, bordered && borderedStyle, className]}>
      {children}
    </table>
  );
}

export type {TableProps};
