import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { useRef } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';

import {
  TYPEAHEAD_WINDOW_MS,
  focusListEdge,
  moveFocusInAxis,
  resolveMenuKey,
  typeaheadTarget,
  useMenuKeyboard,
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

describe('typeaheadTarget', () => {
  const text = (index: number) => ['Alpha', 'Beta', 'Apple'][index];

  it('lands on the first item after the current one starting with the buffer', () => {
    expect(typeaheadTarget(3, 0, 'a', text)).toBe(2);
    expect(typeaheadTarget(3, 1, 'a', text)).toBe(2);
    expect(typeaheadTarget(3, 1, 'b', text)).toBe(1);
  });

  it('wraps, with the current item the last candidate', () => {
    expect(typeaheadTarget(3, 2, 'a', text)).toBe(0);
    expect(typeaheadTarget(3, 0, 'al', text)).toBe(0);
    expect(typeaheadTarget(1, 0, 'a', text)).toBe(0);
  });

  it('searches from the top while focus sits on no item', () => {
    expect(typeaheadTarget(3, -1, 'ap', text)).toBe(2);
  });

  it('matches the item text case-insensitively, skips non-candidates, or yields -1', () => {
    // The buffer arrives lower-cased (useTypeahead); the item text may not be
    const mixedCase = (index: number) => ['ALPHA', 'beta'][index];
    expect(typeaheadTarget(2, 0, 'b', mixedCase)).toBe(1);
    expect(typeaheadTarget(2, 1, 'al', mixedCase)).toBe(0);
    // Disabled items and dividers answer undefined
    const noFirst = (index: number) => (index === 0 ? undefined : text(index));
    expect(typeaheadTarget(3, 0, 'a', noFirst)).toBe(2);
    expect(typeaheadTarget(3, 0, 'z', text)).toBe(-1);
    expect(typeaheadTarget(0, -1, 'a', text)).toBe(-1);
  });
});

/** The event slice `resolveMenuKey` reads. */
function keyEvent(
  key: string,
  init: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; target?: Element | null } = {}
) {
  return { key, ctrlKey: false, metaKey: false, altKey: false, target: null, ...init };
}

const vertical = { orientation: 'vertical', dir: 'ltr' } as const;

describe('resolveMenuKey', () => {
  it('maps the axis keys to moves and Escape/Tab to close', () => {
    expect(resolveMenuKey(keyEvent('ArrowDown'), vertical)).toEqual({
      kind: 'move',
      move: { step: 1 },
    });
    expect(resolveMenuKey(keyEvent('ArrowUp'), vertical)).toEqual({
      kind: 'move',
      move: { step: -1 },
    });
    expect(resolveMenuKey(keyEvent('Home'), vertical)).toEqual({
      kind: 'move',
      move: { edge: 'first' },
    });
    expect(resolveMenuKey(keyEvent('End'), vertical)).toEqual({
      kind: 'move',
      move: { edge: 'last' },
    });
    expect(resolveMenuKey(keyEvent('Escape'), vertical)).toEqual({ kind: 'close' });
    expect(resolveMenuKey(keyEvent('Tab'), vertical)).toEqual({ kind: 'close' });
  });

  it('mirrors the horizontal arrows under RTL', () => {
    const rtlRow = { orientation: 'horizontal', dir: 'rtl' } as const;
    expect(resolveMenuKey(keyEvent('ArrowLeft'), rtlRow)).toEqual({
      kind: 'move',
      move: { step: 1 },
    });
    expect(resolveMenuKey(keyEvent('ArrowRight'), rtlRow)).toEqual({
      kind: 'move',
      move: { step: -1 },
    });
  });

  it('closes a submenu level on the inline-start arrow only', () => {
    expect(
      resolveMenuKey(keyEvent('ArrowLeft'), { ...vertical, closeToStart: true })
    ).toEqual({ kind: 'close-to-start' });
    // The inline-end arrow is not this level's to handle
    expect(
      resolveMenuKey(keyEvent('ArrowRight'), { ...vertical, closeToStart: true })
    ).toBeNull();
    // A root menu leaves both horizontal arrows inert
    expect(resolveMenuKey(keyEvent('ArrowLeft'), vertical)).toBeNull();
    // Under RTL the inline-start arrow is ArrowRight
    expect(
      resolveMenuKey(keyEvent('ArrowRight'), {
        orientation: 'vertical',
        dir: 'rtl',
        closeToStart: true,
      })
    ).toEqual({ kind: 'close-to-start' });
  });

  it('feeds printable characters to the typeahead', () => {
    expect(resolveMenuKey(keyEvent('a'), vertical)).toEqual({
      kind: 'typeahead',
      char: 'a',
    });
    // Space on a plain item stays a typeahead character (no label
    // starts with a space, so focus stays put)
    const plain = document.createElement('button');
    plain.setAttribute('role', 'menuitem');
    expect(resolveMenuKey(keyEvent(' ', { target: plain }), vertical)).toEqual({
      kind: 'typeahead',
      char: ' ',
    });
  });

  it('hands Space on a checkable item to the native activation', () => {
    for (const role of ['menuitemcheckbox', 'menuitemradio']) {
      const item = document.createElement('button');
      item.setAttribute('role', role);
      expect(resolveMenuKey(keyEvent(' ', { target: item }), vertical)).toEqual({
        kind: 'activate',
      });
    }
  });

  it('owns neither modified shortcuts nor non-character keys', () => {
    expect(resolveMenuKey(keyEvent('a', { ctrlKey: true }), vertical)).toBeNull();
    expect(resolveMenuKey(keyEvent('c', { metaKey: true }), vertical)).toBeNull();
    expect(resolveMenuKey(keyEvent('a', { altKey: true }), vertical)).toBeNull();
    expect(resolveMenuKey(keyEvent('Enter'), vertical)).toBeNull();
    expect(resolveMenuKey(keyEvent('Shift'), vertical)).toBeNull();
  });
});

type MenuHarnessProps = {
  onClose: () => void;
  onCloseToStart?: () => void;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
};

/** A four-item menu: a disabled item, two plain items and a checkable one. */
function KeyboardMenu({ onClose, onCloseToStart, orientation, dir }: MenuHarnessProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const onKeyDown = useMenuKeyboard({ menuRef, onClose, onCloseToStart, orientation });
  return (
    <div ref={menuRef} role="menu" onKeyDown={onKeyDown} dir={dir}>
      <button type="button" role="menuitem" disabled>
        Hidden
      </button>
      <button type="button" role="menuitem">
        Alpha
      </button>
      <button type="button" role="menuitemcheckbox" aria-checked="false">
        Beta
      </button>
      <button type="button" role="menuitem">
        Omega
      </button>
    </div>
  );
}

function renderKeyboardMenu(props: Partial<MenuHarnessProps> = {}) {
  const onClose = vi.fn();
  render(<KeyboardMenu {...props} onClose={onClose} />);
  return { onClose, menu: screen.getByRole('menu') };
}

/** Dispatches a keydown; true when it went through uncancelled (the
 *  menu did not own the key). */
function press(element: Element, key: string, init: { ctrlKey?: boolean } = {}) {
  return fireEvent.keyDown(element, { key, ...init });
}

describe('useMenuKeyboard', () => {
  it('enters on the last item for ArrowUp while focus sits on no item', () => {
    const { menu } = renderKeyboardMenu();
    expect(press(menu, 'ArrowUp')).toBe(false);
    expect(screen.getByText('Omega')).toHaveFocus();
  });

  it('enters on the first enabled item for ArrowDown while focus sits on no item', () => {
    const { menu } = renderKeyboardMenu();
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByText('Alpha')).toHaveFocus();
  });

  it('steps with wrapping and skips disabled items', () => {
    renderKeyboardMenu();
    const alpha = screen.getByText('Alpha');
    const omega = screen.getByText('Omega');
    alpha.focus();
    fireEvent.keyDown(alpha, { key: 'ArrowDown' });
    expect(screen.getByText('Beta')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Beta'), { key: 'ArrowUp' });
    expect(alpha).toHaveFocus();
    fireEvent.keyDown(alpha, { key: 'ArrowUp' });
    expect(omega).toHaveFocus();
    fireEvent.keyDown(omega, { key: 'ArrowDown' });
    expect(alpha).toHaveFocus();
  });

  it('jumps to the enabled edges on Home/End', () => {
    const { menu } = renderKeyboardMenu();
    fireEvent.keyDown(menu, { key: 'End' });
    expect(screen.getByText('Omega')).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(screen.getByText('Alpha')).toHaveFocus();
  });

  it('closes on Escape and Tab', () => {
    const { onClose } = renderKeyboardMenu();
    const alpha = screen.getByText('Alpha');
    alpha.focus();
    expect(press(alpha, 'Escape')).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(press(alpha, 'Tab')).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes a submenu level on its inline-start arrow and leaves the other arrow to the axis', () => {
    const onCloseToStart = vi.fn();
    const { onClose } = renderKeyboardMenu({ onCloseToStart });
    const alpha = screen.getByText('Alpha');
    alpha.focus();
    fireEvent.keyDown(alpha, { key: 'ArrowLeft' });
    expect(onCloseToStart).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(alpha, { key: 'ArrowDown' });
    expect(onCloseToStart).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Beta')).toHaveFocus();
  });

  it('mirrors the close arrow under dir="rtl"', () => {
    const onCloseToStart = vi.fn();
    renderKeyboardMenu({ onCloseToStart, dir: 'rtl' });
    fireEvent.keyDown(screen.getByText('Alpha'), { key: 'ArrowRight' });
    expect(onCloseToStart).toHaveBeenCalledTimes(1);
  });

  it('moves focus by typeahead from the top while focus sits on no item', () => {
    const { menu } = renderKeyboardMenu();
    fireEvent.keyDown(menu, { key: 'o' });
    expect(screen.getByText('Omega')).toHaveFocus();
  });

  it('wraps the typeahead search past the last item', () => {
    renderKeyboardMenu();
    const omega = screen.getByText('Omega');
    omega.focus();
    fireEvent.keyDown(omega, { key: 'a' });
    expect(screen.getByText('Alpha')).toHaveFocus();
  });

  it('skips disabled items in typeahead and stays put without a match', () => {
    // 'Hidden' is disabled: not a candidate, so 'h' matches nothing
    renderKeyboardMenu();
    screen.getByText('Alpha').focus();
    fireEvent.keyDown(screen.getByText('Alpha'), { key: 'h' });
    expect(screen.getByText('Alpha')).toHaveFocus();
  });

  it('reaches a checkable item by typeahead', () => {
    renderKeyboardMenu();
    screen.getByText('Alpha').focus();
    fireEvent.keyDown(screen.getByText('Alpha'), { key: 'b' });
    expect(screen.getByText('Beta')).toHaveFocus();
  });

  it('lets Space on a checkable item through untouched', () => {
    const { onClose } = renderKeyboardMenu();
    const beta = screen.getByText('Beta');
    const omega = screen.getByText('Omega');
    beta.focus();
    expect(press(beta, ' ')).toBe(true);
    expect(beta).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
    // Space on a plain item is an (unmatched) typeahead character
    omega.focus();
    expect(press(omega, ' ')).toBe(false);
    expect(omega).toHaveFocus();
  });

  it('leaves Enter and modified shortcuts untouched', () => {
    const { onClose } = renderKeyboardMenu();
    const alpha = screen.getByText('Alpha');
    alpha.focus();
    expect(press(alpha, 'Enter')).toBe(true);
    // Unmodified this would type ahead to Omega; the modifier hands it back
    expect(press(alpha, 'o', { ctrlKey: true })).toBe(true);
    expect(alpha).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('moveFocusInAxis', () => {
  /** A toolbar with a disabled leading button — the selector's default skip. */
  function renderStrip(dir?: 'ltr' | 'rtl') {
    const { container } = render(
      <div role="toolbar" dir={dir}>
        <button type="button" disabled>
          Cut
        </button>
        <button type="button">Copy</button>
        <button type="button">Paste</button>
        <button type="button">Undo</button>
      </div>
    );
    return container.querySelector<HTMLElement>('[role="toolbar"]');
  }

  /** Runs the traversal for `key` and reports whether it owned the key. */
  function walk(
    container: HTMLElement | null,
    key: string,
    orientation: 'horizontal' | 'vertical'
  ) {
    const preventDefault = vi.fn();
    const handled = moveFocusInAxis(
      { key, preventDefault } as unknown as ReactKeyboardEvent,
      { container, selector: 'button:not([disabled])', orientation }
    );
    return { handled, prevented: preventDefault.mock.calls.length > 0 };
  }

  it('enters on the last item for the backward arrow while focus sits on no item', () => {
    expect(walk(renderStrip(), 'ArrowLeft', 'horizontal')).toEqual({
      handled: true,
      prevented: true,
    });
    expect(screen.getByText('Undo')).toHaveFocus();
  });

  it('enters on the first enabled item for the forward arrow', () => {
    walk(renderStrip(), 'ArrowRight', 'horizontal');
    expect(screen.getByText('Copy')).toHaveFocus();
  });

  it('steps with wrapping and jumps to the enabled edges', () => {
    const strip = renderStrip();
    screen.getByText('Undo').focus();
    walk(strip, 'ArrowRight', 'horizontal');
    expect(screen.getByText('Copy')).toHaveFocus();
    walk(strip, 'ArrowLeft', 'horizontal');
    expect(screen.getByText('Undo')).toHaveFocus();
    walk(strip, 'Home', 'horizontal');
    expect(screen.getByText('Copy')).toHaveFocus();
    walk(strip, 'End', 'horizontal');
    expect(screen.getByText('Undo')).toHaveFocus();
  });

  it('mirrors the arrows under dir="rtl"', () => {
    const strip = renderStrip('rtl');
    walk(strip, 'ArrowLeft', 'horizontal');
    expect(screen.getByText('Copy')).toHaveFocus();
    walk(strip, 'ArrowRight', 'horizontal');
    expect(screen.getByText('Undo')).toHaveFocus();
  });

  it('leaves off-axis arrows and other keys untouched', () => {
    expect(walk(renderStrip(), 'ArrowDown', 'horizontal')).toEqual({
      handled: false,
      prevented: false,
    });
    expect(walk(renderStrip(), 'Enter', 'horizontal')).toEqual({
      handled: false,
      prevented: false,
    });
    expect(walk(null, 'ArrowRight', 'horizontal')).toEqual({
      handled: false,
      prevented: false,
    });
  });
});

describe('focusListEdge', () => {
  /** A menu with a disabled first item, mirroring the DOM the menu keyboard layer walks. */
  function renderMenu() {
    const { container } = render(
      <div role="menu">
        <button type="button" role="menuitem" disabled>
          Hidden
        </button>
        <button type="button" role="menuitem">
          Alpha
        </button>
        <button type="button" role="menuitem">
          Omega
        </button>
      </div>
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
      <div role="tree">
        <div role="treeitem" aria-disabled="true" tabIndex={-1}>
          Off
        </div>
        <div role="treeitem" tabIndex={-1}>
          On
        </div>
      </div>
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
