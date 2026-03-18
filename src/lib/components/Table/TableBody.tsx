import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type TableBodyProps = {
  className?: string;
  children: ReactNode;
};

const body = css`
  & td {
    padding: var(--pbl-space-2) var(--pbl-space-3);
    border-bottom: 1px solid var(--pbl-color-border);
    color: var(--pbl-color-text-secondary);
  }
`;

export default function TableBody({className, children}: TableBodyProps) {
  return <tbody x-class={[body, className]}>{children}</tbody>;
}

export type {TableBodyProps};
