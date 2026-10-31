import { createElement } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';

import {
  TYPEAHEAD_WINDOW_MS,
  findWrapIndex,
  focusListEdge,
  useTypeahead,
} from './menuKeyboard';

describe('useTypeahead', () => {
  it('accumulates pushed characters case-insensitively', () => {
    const { result } = renderHook(() => useTypeahead());
    act(() => {
      expect(result.current('F')).toBe('f');
      expect(result.current('O')).toBe('fo');
      expect(result.current('x')).toBe('fox');
    });
  });

  it('resets the buffer after the window lapses', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useTypeahead());
      act(() => expect(result.current('g')).toBe('g'));
      act(() => {
        vi.advanceTimersByTime(TYPEAHEAD_WINDOW_MS + 100);
      });
      // Fresh buffer: 'a' alone, not a continuation of 'ga'
      act(() => expect(result.current('a')).toBe('a'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('restarts the window on every push', () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useTypeahead());
      act(() => expect(result.current('f')).toBe('f'));
      // Almost at the end of the first window — the push must restart it
      act(() => {
        vi.advanceTimersByTime(TYPEAHEAD_WINDOW_MS - 100);
      });
      act(() => expect(result.current('i')).toBe('fi'));
      // Past the first push's window, still inside the restarted one
      act(() => {
        vi.advanceTimersByTime(TYPEAHEAD_WINDOW_MS - 100);
      });
      act(() => expect(result.current('x')).toBe('fix'));
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears the reset timer on unmount without error', () => {
    const { result, unmount } = renderHook(() => useTypeahead());
    act(() => {
      result.current('a');
    });
    expect(() => unmount()).not.toThrow();
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

  it('visits start, then forward, then the wrapped front in order', () => {
    const visited: number[] = [];
    const found = findWrapIndex(3, 1, (index) => {
      visited.push(index);
      return false;
    });
    expect(found).toBe(-1);
    expect(visited).toEqual([1, 2, 0]);
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
  });
});

describe('focusListEdge', () => {
  /** A menu with a disabled first item, mirroring the DOM the menu keyboard layer walks. */
  function renderMenu() {
    const { container } = render(
      createElement(
        'div',
        { role: 'menu' },
        createElement('button', { type: 'button', role: 'menuitem', disabled: true }, 'Hidden'),
        createElement('button', { type: 'button', role: 'menuitem' }, 'Alpha'),
        createElement('button', { type: 'button', role: 'menuitem' }, 'Omega')
      )
    );
    return container.querySelector<HTMLElement>('[role="menu"]');
  }

  it('focuses the first enabled item and returns it', () => {
    const menu = renderMenu();
    const focused = focusListEdge(menu, 'first');
    expect(focused?.textContent).toBe('Alpha');
    expect(focused).toHaveFocus();
  });

  it('focuses the last enabled item', () => {
    const menu = renderMenu();
    focusListEdge(menu, 'last');
    expect(screen.getByText('Omega')).toHaveFocus();
  });

  it('honors a custom selector (TreeSelect treeitem variant)', () => {
    const { container } = render(
      createElement(
        'div',
        { role: 'tree' },
        createElement('div', { role: 'treeitem', 'aria-disabled': 'true', tabIndex: -1 }, 'Off'),
        createElement('div', { role: 'treeitem', tabIndex: -1 }, 'On')
      )
    );
    const tree = container.querySelector<HTMLElement>('[role="tree"]');
    const focused = focusListEdge(
      tree,
      'first',
      '[role="treeitem"]:not([aria-disabled="true"])'
    );
    expect(focused?.textContent).toBe('On');
    expect(focused).toHaveFocus();
  });

  it('returns null when no item matches or the container is missing', () => {
    const menu = renderMenu();
    expect(focusListEdge(menu, 'first', '[role="option"]')).toBeNull();
    expect(focusListEdge(null, 'first')).toBeNull();
  });
});
