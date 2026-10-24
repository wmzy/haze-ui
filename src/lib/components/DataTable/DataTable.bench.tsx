import type { SortingState } from '@tanstack/react-table';

import type { DataTableColumnDef } from './DataTable';

import { act, render } from '@testing-library/react';
import { useControl } from 'react-use-control';

// Explicit vitest import (not the ambient globals): the TestContext
// parameter (`bench`) needs vitest's own `it` typing — @types/node also
// declares a global `it` whose callback shape would win the overload.
import { describe, it } from 'vitest';

import DataTable from './DataTable';

// Runtime benchmarks (`pnpm bench` → vitest bench): pure JS-side render and
// update costs of the table engine under jsdom — no layout, no CSS (the
// suite runs with `css: false`). Sizes are index-derived, so every run and
// every machine measures the exact same data. Informational numbers only —
// CI runs this job non-blocking.

type BenchRow = {
  id: string;
  name: string;
  age: number;
  city: string;
};

/** Deterministic dataset: every field is a pure function of the index. */
function makeRows(count: number): BenchRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    name: `user-${String(index).padStart(4, '0')}`,
    age: 20 + (index % 50),
    city: `city-${index % 97}`,
  }));
}

const rows = makeRows(1000);

const columns: DataTableColumnDef<BenchRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'city', header: 'City' },
];

// The sorting control lives in a harness component so the bench can flip
// the sort from outside the table — the same controlled-state contract
// (`Control<T>`) the unit tests exercise, avoiding synthetic event overhead
// in the measured loop. The Ref-suffixed box hands the setter out (the
// component itself is declared inside the test, the repo's harness pattern).
const sortingSetterRef: {
  current?: (next: SortingState) => void;
} = {};

const ascending: SortingState = [{ id: 'name', desc: false }];
const descending: SortingState = [{ id: 'name', desc: true }];

describe('DataTable benchmarks', () => {
  // Run options (time/iterations caps) go to `.run()`: they are tinybench
  // engine knobs, not per-benchmark hooks. At ~200ms per mount, the
  // 64-iteration default alone would push this file past its time budget.
  const heavy = { time: 2000, iterations: 15, warmupTime: 400, warmupIterations: 3 };

  it('renders 1000 rows', async ({ bench }) => {
    await bench('mount + unmount 1000 rows', () => {
      const view = render(<DataTable columns={columns} data={rows} />);
      view.unmount();
    }).run(heavy);
  });

  it('rerenders 1000 rows on sorting flips', async ({ bench }) => {
    function SortingHarness() {
      const [, setSorting, sortingControl] = useControl<SortingState>(
        undefined,
        []
      );
      sortingSetterRef.current = setSorting;
      return (
        <DataTable
          columns={columns}
          data={rows}
          sortable
          sorting={sortingControl}
        />
      );
    }

    const view = render(<SortingHarness />);
    const flip = { desc: false };

    await bench('sorting flip rerender (asc ⇄ desc)', () => {
      flip.desc = !flip.desc;
      const sorting = flip.desc ? descending : ascending;
      act(() => {
        sortingSetterRef.current?.(sorting);
      });
    }).run(heavy);

    view.unmount();
  });
});
