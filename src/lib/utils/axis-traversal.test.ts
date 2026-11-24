import { axisMove, axisMoveTarget, findWrapIndex } from './axis-traversal';

describe('axisMove', () => {
  it('maps the vertical arrows to steps and Home/End to edge jumps', () => {
    expect(axisMove('ArrowDown', 'vertical', 'ltr')).toEqual({ step: 1 });
    expect(axisMove('ArrowUp', 'vertical', 'rtl')).toEqual({ step: -1 });
    expect(axisMove('Home', 'vertical', 'ltr')).toEqual({ edge: 'first' });
    expect(axisMove('End', 'vertical', 'rtl')).toEqual({ edge: 'last' });
  });

  it('mirrors the horizontal arrows under RTL and keeps Home/End invariant', () => {
    expect(axisMove('ArrowRight', 'horizontal', 'ltr')).toEqual({ step: 1 });
    expect(axisMove('ArrowLeft', 'horizontal', 'ltr')).toEqual({ step: -1 });
    // In a dir="rtl" row ArrowLeft is the visually-forward arrow
    expect(axisMove('ArrowLeft', 'horizontal', 'rtl')).toEqual({ step: 1 });
    expect(axisMove('ArrowRight', 'horizontal', 'rtl')).toEqual({ step: -1 });
    expect(axisMove('Home', 'horizontal', 'rtl')).toEqual({ edge: 'first' });
    expect(axisMove('End', 'horizontal', 'rtl')).toEqual({ edge: 'last' });
  });

  it('ignores off-axis arrows and every other key', () => {
    expect(axisMove('ArrowLeft', 'vertical', 'ltr')).toBeNull();
    expect(axisMove('ArrowUp', 'horizontal', 'ltr')).toBeNull();
    expect(axisMove('Enter', 'vertical', 'ltr')).toBeNull();
    expect(axisMove('a', 'horizontal', 'rtl')).toBeNull();
  });
});

describe('findWrapIndex', () => {
  it('returns the start index when it matches', () => {
    expect(findWrapIndex(3, 1, (index) => index === 1)).toBe(1);
  });

  it('searches forward and wraps past the end back to the front', () => {
    expect(findWrapIndex(3, 2, (index) => index === 0)).toBe(0);
    expect(findWrapIndex(3, 0, (index) => index === 2)).toBe(2);
  });

  it('searches backward and wraps past the front back to the end', () => {
    expect(findWrapIndex(3, 1, (index) => index === 0, -1)).toBe(0);
    expect(findWrapIndex(3, 0, (index) => index === 2, -1)).toBe(2);
  });

  it('visits start, then forward, then the wrapped front in order', () => {
    const visited: number[] = [];
    const found = findWrapIndex(3, 1, (index) => {
      visited.push(index);
      return false;
    });
    expect(found).toBe(-1);
    expect(visited).toEqual([1, 2, 0]);
  });

  it('visits start, then backward, then the wrapped end in order', () => {
    const visited: number[] = [];
    const found = findWrapIndex(
      3,
      1,
      (index) => {
        visited.push(index);
        return false;
      },
      -1
    );
    expect(found).toBe(-1);
    expect(visited).toEqual([1, 0, 2]);
  });

  it('normalizes negative and overflowing start values', () => {
    // Menu's virtualized rows use -1 for "focus not on a row"
    expect(findWrapIndex(3, -1, (index) => index === 2)).toBe(2);
    expect(findWrapIndex(3, -4, (index) => index === 2)).toBe(2);
    expect(findWrapIndex(3, 3, (index) => index === 0)).toBe(0);
  });

  it('returns -1 when nothing matches or the list is empty', () => {
    expect(findWrapIndex(3, 0, () => false)).toBe(-1);
    expect(findWrapIndex(0, 0, () => true)).toBe(-1);
    expect(findWrapIndex(3, 0, () => false, -1)).toBe(-1);
  });
});

describe('axisMoveTarget', () => {
  it('steps from the focused item, wrapping past both ends', () => {
    expect(axisMoveTarget({ step: 1 }, { current: 1, length: 3 })).toBe(2);
    expect(axisMoveTarget({ step: -1 }, { current: 1, length: 3 })).toBe(0);
    expect(axisMoveTarget({ step: 1 }, { current: 2, length: 3 })).toBe(0);
    expect(axisMoveTarget({ step: -1 }, { current: 0, length: 3 })).toBe(2);
  });

  it('enters from the matching end while focus sits on no item', () => {
    expect(axisMoveTarget({ step: 1 }, { current: -1, length: 3 })).toBe(0);
    expect(axisMoveTarget({ step: -1 }, { current: -1, length: 3 })).toBe(2);
  });

  it('steps from `entry` while focus sits on no item; edge jumps ignore it', () => {
    // Segmented: the arrows step relative to the selected stop
    expect(axisMoveTarget({ step: 1 }, { current: -1, length: 4, entry: 1 })).toBe(2);
    expect(axisMoveTarget({ step: -1 }, { current: -1, length: 4, entry: 1 })).toBe(0);
    expect(axisMoveTarget({ edge: 'first' }, { current: -1, length: 4, entry: 1 })).toBe(0);
    expect(axisMoveTarget({ edge: 'last' }, { current: -1, length: 4, entry: 1 })).toBe(3);
  });

  it('skips rejected indices in the walk direction, wrapping to reach one', () => {
    const enabled = (index: number) => index !== 1;
    expect(axisMoveTarget({ step: 1 }, { current: 0, length: 3, isFocusable: enabled })).toBe(2);
    expect(axisMoveTarget({ step: -1 }, { current: 2, length: 3, isFocusable: enabled })).toBe(0);
    // Only index 1 is enabled: every walk wraps around to it
    const onlyMiddle = (index: number) => index === 1;
    expect(axisMoveTarget({ step: 1 }, { current: 1, length: 3, isFocusable: onlyMiddle })).toBe(1);
    expect(axisMoveTarget({ step: 1 }, { current: -1, length: 3, isFocusable: onlyMiddle })).toBe(1);
    expect(axisMoveTarget({ step: -1 }, { current: -1, length: 3, isFocusable: onlyMiddle })).toBe(1);
  });

  it('jumps to the first/last focusable item from wherever focus sits', () => {
    const enabled = (index: number) => index % 2 === 0; // 0, 2, 4
    expect(
      axisMoveTarget({ edge: 'first' }, { current: 3, length: 5, isFocusable: enabled })
    ).toBe(0);
    expect(
      axisMoveTarget({ edge: 'last' }, { current: 1, length: 5, isFocusable: enabled })
    ).toBe(4);
  });

  it('yields -1 when nothing qualifies or the list is empty', () => {
    expect(
      axisMoveTarget({ step: 1 }, { current: 1, length: 3, isFocusable: () => false })
    ).toBe(-1);
    expect(
      axisMoveTarget({ edge: 'first' }, { current: 1, length: 3, isFocusable: () => false })
    ).toBe(-1);
    expect(axisMoveTarget({ step: 1 }, { current: 0, length: 0 })).toBe(-1);
  });
});
