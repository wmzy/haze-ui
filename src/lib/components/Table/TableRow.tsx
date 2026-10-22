import type {ReactNode} from 'react';

import { useTableClassNames } from './TableContext';

type TableRowProps = {
  className?: string;
  children: ReactNode;
};

export default function TableRow({className, children}: TableRowProps) {
  const classNames = useTableClassNames();
  return (
    <tr data-slot="row" x-class={[classNames?.row, className]}>
      {children}
    </tr>
  );
}

export type {TableRowProps};
