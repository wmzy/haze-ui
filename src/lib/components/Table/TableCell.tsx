import type {ReactNode, ComponentPropsWithoutRef} from 'react';

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
  return <Tag x-class={[className]} {...rest}>{children}</Tag>;
}

export type {TableCellProps};
