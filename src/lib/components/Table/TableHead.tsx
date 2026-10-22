import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { useTableClassNames } from './TableContext';

type TableHeadProps = {
  className?: string;
  children: ReactNode;
};

const head = css`
  border-bottom: 2px solid var(--haze-color-border);

  & th {
    text-align: start;
    padding: var(--haze-space-2) var(--haze-space-3);
    font-weight: var(--haze-weight-semibold);
    color: var(--haze-color-text);
  }
`;

export default function TableHead({ className, children }: TableHeadProps) {
  const classNames = useTableClassNames();
  return (
    <thead data-slot="header" x-class={[head, classNames?.head, className]}>
      {children}
    </thead>
  );
}

export type { TableHeadProps };
