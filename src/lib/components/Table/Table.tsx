import type { ReactNode, Ref } from 'react';
import type { TableClassNames } from './TableContext';

import { css } from '@linaria/core';

import { compact } from '../../tokens/density';
import { spacing } from '../../tokens/spacing';
import { useConfigDefaults, useConfigDensity } from '../ConfigProvider/useConfigDefaults';

import { TableClassNamesProvider } from './TableContext';
import { baseStyle, borderedStyle, stripedStyle } from './table-styles';

type TableProps = {
  /** Zebra-stripe even body rows (default off, ConfigProvider
   * `Table.striped` under it). */
  striped?: boolean;
  /** Full cell borders on every th/td (default off, ConfigProvider
   * `Table.bordered` under it). */
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

export default function Table({
  striped,
  bordered,
  classNames,
  className,
  children,
  ref,
}: TableProps) {
  // Three tiers per wired prop: explicit prop → ConfigProvider `Table`
  // section → built-in off. A missing provider stays byte-identical.
  const config = useConfigDefaults('Table');
  const resolvedStriped = striped ?? config.striped ?? false;
  const resolvedBordered = bordered ?? config.bordered ?? false;

  // Global density (ConfigProvider `density`): 'compact' re-declares the
  // spacing scale for the table subtree — a compact island. Both token
  // classes land on the table element because unregistered custom
  // properties substitute var() eagerly at the declaring element: the
  // spacing class re-declares --haze-space-N there and compact answers
  // the --haze-density-space-N references, independent of whatever the
  // app root declared (see tokens/density.ts). 'normal' adds nothing —
  // the table keeps the ambient scale (including a root-level compact).
  // Table has no explicit density prop of its own (DataTable's
  // sm/md/lg `size` is a different, padding-step axis that composes).
  const density = useConfigDensity();
  const compactIsland = density === 'compact';

  return (
    <TableClassNamesProvider value={classNames}>
      <div x-class={[wrapper, classNames?.wrapper]} data-slot="table-container">
        <table
          ref={ref}
          data-slot="table"
          x-class={[
            baseStyle,
            resolvedStriped && stripedStyle,
            resolvedBordered && borderedStyle,
            compactIsland && spacing,
            compactIsland && compact,
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
