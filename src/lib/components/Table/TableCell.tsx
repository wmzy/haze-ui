import type {ReactNode, ComponentPropsWithoutRef} from 'react';

import { useTableClassNames } from './TableContext';

type TableCellProps = {
  as?: 'td' | 'th';
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'td'>, 'children'>;

export default function TableCell({
  as: Tag = 'td',
  className,
  children,
  ...rest
}: TableCellProps) {
  const classNames = useTableClassNames();
  return (
    <Tag data-slot="cell" x-class={[classNames?.cell, className]} {...rest}>
      {children}
    </Tag>
  );
}

export type {TableCellProps};
