import type {ReactNode} from 'react';

type TableRowProps = {
  className?: string;
  children: ReactNode;
};

export default function TableRow({className, children}: TableRowProps) {
  return <tr x-class={[className]}>{children}</tr>;
}

export type {TableRowProps};
