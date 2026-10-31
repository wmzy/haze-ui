import {
  dayButtons,
  nextGridRovingAction,
  type GridRovingOptions,
} from './grid-roving';

/** A never-disabled 3×3 grid. */
const plain = (): GridRovingOptions => ({
  columns: 3,
  count: 9,
  isDisabled: () => false,
});

describe('nextGridRovingAction', () => {
  it('moves one cell on the inline axis and one row on the block axis', () => {
    expect(nextGridRovingAction('ArrowRight', 4, false, plain())).toEqual({
      type: 'move',
      target: 5,
    });
    expect(nextGridRovingAction('ArrowLeft', 4, false, plain())).toEqual({
      type: 'move',
      target: 3,
    });
    expect(nextGridRovingAction('ArrowDown', 1, false, plain())).toEqual({
      type: 'move',
      target: 4,
    });
    expect(nextGridRovingAction('ArrowUp', 7, false, plain())).toEqual({
      type: 'move',
      target: 4,
    });
  });

  it('mirrors the horizontal arrows under rtl; the vertical axis is direction-invariant', () => {
    expect(nextGridRovingAction('ArrowLeft', 4, true, plain())).toEqual({
      type: 'move',
      target: 5,
    });
    expect(nextGridRovingAction('ArrowRight', 4, true, plain())).toEqual({
      type: 'move',
      target: 3,
    });
    expect(nextGridRovingAction('ArrowDown', 1, true, plain())).toEqual({
      type: 'move',
      target: 4,
    });
  });

  it('blocks at the grid edges and ignores non-roving keys', () => {
    expect(nextGridRovingAction('ArrowUp', 1, false, plain())).toEqual({
      type: 'blocked',
    });
    expect(nextGridRovingAction('ArrowDown', 7, false, plain())).toEqual({
      type: 'blocked',
    });
    expect(nextGridRovingAction('ArrowLeft', 0, false, plain())).toEqual({
      type: 'blocked',
    });
    expect(nextGridRovingAction('Enter', 4, false, plain())).toBe(null);
    expect(nextGridRovingAction(' ', 4, false, plain())).toBe(null);
  });

  it('Home/End land on the focused row edges (grid pattern)', () => {
    expect(nextGridRovingAction('Home', 5, false, plain())).toEqual({
      type: 'move',
      target: 3,
    });
    expect(nextGridRovingAction('End', 4, false, plain())).toEqual({
      type: 'move',
      target: 5,
    });
    expect(nextGridRovingAction('End', 5, false, plain())).toEqual({
      type: 'move',
      target: 5,
    });
  });

  it("Home/End land on the group's first/last enabled cell in group mode", () => {
    const options: GridRovingOptions = {
      columns: 3,
      count: 9,
      isDisabled: (i) => i === 0,
      homeEnd: 'group',
    };
    expect(nextGridRovingAction('Home', 4, false, options)).toEqual({
      type: 'move',
      target: 1,
    });
    expect(nextGridRovingAction('End', 4, false, options)).toEqual({
      type: 'move',
      target: 8,
    });
  });

  it('skips disabled cells in the direction of travel, keeping the stride', () => {
    const options: GridRovingOptions = {
      columns: 3,
      count: 9,
      isDisabled: (i) => i === 4,
    };
    // Down from 1: landing cell 4 is disabled → same column, row below.
    expect(nextGridRovingAction('ArrowDown', 1, false, options)).toEqual({
      type: 'move',
      target: 7,
    });
    // Right from 3 steps straight over the disabled 4.
    expect(nextGridRovingAction('ArrowRight', 3, false, options)).toEqual({
      type: 'move',
      target: 5,
    });
  });

  it('resolves PageUp/PageDown to page actions', () => {
    expect(nextGridRovingAction('PageUp', 4, false, plain())).toEqual({
      type: 'page',
      delta: -1,
    });
    expect(nextGridRovingAction('PageDown', 4, false, plain())).toEqual({
      type: 'page',
      delta: 1,
    });
  });

  it('treats a container-focused (index -1) origin as the grid start', () => {
    // The virtual origin is cell 0: forward lands on 1 (the former
    // Calendar walker's behavior), backward is blocked at the edge.
    expect(nextGridRovingAction('ArrowRight', -1, false, plain())).toEqual({
      type: 'move',
      target: 1,
    });
    expect(nextGridRovingAction('ArrowLeft', -1, false, plain())).toEqual({
      type: 'blocked',
    });
    expect(nextGridRovingAction('Home', -1, false, plain())).toEqual({
      type: 'move',
      target: 0,
    });
    expect(nextGridRovingAction('End', -1, false, plain())).toEqual({
      type: 'move',
      target: 2,
    });
  });
});

describe('dayButtons', () => {
  it('lists the container buttons in DOM order, disabled included', () => {
    const grid = document.createElement('div');
    grid.innerHTML = '<span><button>a</button></span><button disabled>b</button>';
    expect(dayButtons(grid).map((b) => b.textContent)).toEqual(['a', 'b']);
    expect(dayButtons(null)).toEqual([]);
  });
});
