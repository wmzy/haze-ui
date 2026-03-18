import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type ListItemProps = {
  className?: string;
  children: ReactNode;
};

const item = css`
  padding: var(--pbl-space-1) 0;
`;

export default function ListItem({className, children}: ListItemProps) {
  return <li x-class={[item, className]}>{children}</li>;
}

export type {ListItemProps};
