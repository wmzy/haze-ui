import type { ReactNode, Ref } from 'react';
import type { TableClassNames } from './TableContext';

import { css } from '@linaria/core';

import { TableClassNamesProvider } from './TableContext';

type TableProps = {
  striped?: boolean;
  bordered?: boolean;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every family part through context (see
   * {@link TableClassNames}). Slot classes are appended at the end of
   * each part's class list; per-part `className` props still land after
   * the slot class. Not passing it renders identical output.
   */
  classNames?: TableClassNames;
  className?: string;
  children: ReactNode;
  /** Forwarded to the underlying `<table>` element. */
  ref?: Ref<HTMLTableElement>;
};

const wrapper = css`
  overflow-x: auto;
`;

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
  classNames,
  className,
  children,
  ref,
}: TableProps) {
  return (
    <TableClassNamesProvider value={classNames}>
      <div x-class={[wrapper, classNames?.wrapper]} data-slot="table-container">
        <table
          ref={ref}
          data-slot="table"
          x-class={[
            base,
            striped && stripedStyle,
            bordered && borderedStyle,
            className,
          ]}
        >
          {children}
        </table>
      </div>
    </TableClassNamesProvider>
  );
}

export type { TableProps };
