import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type TableHeadProps = {
  className?: string;
  children: ReactNode;
};

const head = css`
  border-bottom: 2px solid var(--pbl-color-border);

  & th {
    text-align: left;
    padding: var(--pbl-space-2) var(--pbl-space-3);
    font-weight: var(--pbl-weight-semibold);
    color: var(--pbl-color-text);
  }
`;

export default function TableHead({className, children}: TableHeadProps) {
  return <thead x-class={[head, className]}>{children}</thead>;
}

export type {TableHeadProps};
