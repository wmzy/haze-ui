import { nextEnabledIndex } from './skip-walker';

/** A disabled predicate over the given indices. */
const disabledAt = (...indices: number[]) => {
  const set = new Set(indices);
  return (index: number) => set.has(index);
};

describe('nextEnabledIndex', () => {
  it('steps by delta onto the next enabled cell', () => {
    expect(nextEnabledIndex(4, disabledAt(), 1, 1)).toBe(2);
    expect(nextEnabledIndex(4, disabledAt(), 2, -1)).toBe(1);
    // One row down on a 3-column grid.
    expect(nextEnabledIndex(7, disabledAt(), 0, 3)).toBe(3);
  });

  it('skips a run of consecutive disabled cells in the direction of travel', () => {
    expect(nextEnabledIndex(4, disabledAt(1, 2), 0, 1)).toBe(3);
    expect(nextEnabledIndex(4, disabledAt(1, 2), 3, -1)).toBe(0);
  });

  it('keeps its stride for column moves — skips whole rows, not adjacent cells', () => {
    // One row down from 0 is 3; with 3 disabled the walk stays
    // in-column and lands on 6, not the adjacent 4.
    expect(nextEnabledIndex(7, disabledAt(3), 0, 3)).toBe(6);
    // A disabled neighbor is irrelevant when the landing is enabled.
    expect(nextEnabledIndex(7, disabledAt(4), 0, 3)).toBe(3);
  });

  it('supports virtual origins: -1 before the start, length past the end', () => {
    // Home/End pass the slot just outside their row; -1 is the
    // routine Home origin on the first row.
    expect(nextEnabledIndex(3, disabledAt(), -1, 1)).toBe(0);
    expect(nextEnabledIndex(3, disabledAt(0), -1, 1)).toBe(1);
    expect(nextEnabledIndex(3, disabledAt(), 3, -1)).toBe(2);
    expect(nextEnabledIndex(3, disabledAt(2), 3, -1)).toBe(1);
  });

  it('returns null walking off either edge — never wraps', () => {
    expect(nextEnabledIndex(3, disabledAt(), 0, -1)).toBeNull();
    expect(nextEnabledIndex(3, disabledAt(), 2, 1)).toBeNull();
    // Earlier cells stay enabled — past the end is still null.
    expect(nextEnabledIndex(3, disabledAt(1), 2, 2)).toBeNull();
    // A virtual origin striding further out of range.
    expect(nextEnabledIndex(3, disabledAt(), -2, 1)).toBeNull();
  });

  it('returns null when every cell in range is disabled', () => {
    expect(nextEnabledIndex(3, disabledAt(0, 1, 2), 1, 1)).toBeNull();
    expect(nextEnabledIndex(3, disabledAt(0, 1, 2), 1, -1)).toBeNull();
  });

  it('returns null for an empty range', () => {
    expect(nextEnabledIndex(0, disabledAt(), -1, 1)).toBeNull();
    expect(nextEnabledIndex(0, disabledAt(), 0, 1)).toBeNull();
  });

  it('returns null for a zero stride (no move to make)', () => {
    expect(nextEnabledIndex(3, disabledAt(), 1, 0)).toBeNull();
  });

  it('never consults the predicate for out-of-range indices', () => {
    const seen: number[] = [];
    const isDisabled = (index: number) => {
      seen.push(index);
      return index === 1;
    };
    expect(nextEnabledIndex(3, isDisabled, 0, 1)).toBe(2);
    // Consulted for each in-range landing (1 disabled, 2 enabled) —
    // never for the out-of-range -1 or 3.
    expect(seen).toEqual([1, 2]);
    // Walking off the end stops before the predicate sees index 3.
    seen.length = 0;
    expect(nextEnabledIndex(3, isDisabled, 2, 1)).toBeNull();
    expect(seen).toEqual([]);
  });
});
