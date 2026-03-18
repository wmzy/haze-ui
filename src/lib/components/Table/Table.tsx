import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type TableProps = {
  striped?: boolean;
  bordered?: boolean;
  className?: string;
  children: ReactNode;
};

const base = css`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

const stripedStyle = css`
  & tbody tr:nth-child(even) {
    background: var(--haze-color-bg-subtle);
  }
`;

const borderedStyle = css`
  & th,
  & td {
    border: 1px solid var(--haze-color-border);
  }
`;

export default function Table({
  striped = false,
  bordered = false,
  className,
  children,
}: TableProps) {
  return (
    <table
      x-class={[
        base,
        striped && stripedStyle,
        bordered && borderedStyle,
        className,
      ]}
    >
      {children}
    </table>
  );
}

export type { TableProps };
