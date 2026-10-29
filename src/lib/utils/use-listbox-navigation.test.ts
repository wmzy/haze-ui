import { act, renderHook } from '@testing-library/react';

import { useListboxNavigation } from './use-listbox-navigation';

/** A keydown surface with a spied preventDefault. */
const keyEvent = (key: string) => ({
  key,
  preventDefault: vi.fn(),
});

describe('useListboxNavigation', () => {
  it('starts unhighlighted and steps down one by one', async () => {
    const { result } = renderHook(() => useListboxNavigation(3));
    expect(result.current.activeIndex).toBe(-1);
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(result.current.activeIndex).toBe(0);
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(result.current.activeIndex).toBe(1);
  });

  it('clamps at both ends', async () => {
    const { result } = renderHook(() => useListboxNavigation(2));
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('End'))));
    expect(result.current.activeIndex).toBe(1);
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(result.current.activeIndex).toBe(1);
    for (let i = 0; i < 3; i++) {
      await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowUp'))));
    }
    expect(result.current.activeIndex).toBe(0);
  });

  it('lands on the first option from -1 in both arrow directions', async () => {
    const down = renderHook(() => useListboxNavigation(3));
    await act(() => Promise.resolve(down.result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(down.result.current.activeIndex).toBe(0);

    const up = renderHook(() => useListboxNavigation(3));
    await act(() => Promise.resolve(up.result.current.handleNavigationKey(keyEvent('ArrowUp'))));
    expect(up.result.current.activeIndex).toBe(0);
  });

  it('jumps to the edges with Home/End', async () => {
    const { result } = renderHook(() => useListboxNavigation(5));
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('End'))));
    expect(result.current.activeIndex).toBe(4);
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('Home'))));
    expect(result.current.activeIndex).toBe(0);
  });

  it('keeps an empty list unhighlighted under every navigation key', () => {
    const { result } = renderHook(() => useListboxNavigation(0));
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
      const event = keyEvent(key);
      act(() => {
        result.current.handleNavigationKey(event);
      });
      expect(result.current.activeIndex).toBe(-1);
    }
  });

  it('prevents the default and reports consumption only for navigation keys', () => {
    const { result } = renderHook(() => useListboxNavigation(3));
    const navKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    for (const key of navKeys) {
      const event = keyEvent(key);
      act(() => {
        expect(result.current.handleNavigationKey(event)).toBe(true);
      });
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    }
    const other = keyEvent('Enter');
    act(() => {
      expect(result.current.handleNavigationKey(other)).toBe(false);
    });
    expect(other.preventDefault).not.toHaveBeenCalled();
    // Enter is not a navigation key: the highlight the loop left at
    // End's target (count - 1) survives untouched.
    expect(result.current.activeIndex).toBe(2);
  });

  it('invokes onNavigate once per consumed navigation key', async () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() => useListboxNavigation(2, onNavigate));
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('Home'))));
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('Enter'))));
    expect(onNavigate).toHaveBeenCalledTimes(2);
  });

  it('re-highlights the first match on a changed query in first-match mode', async () => {
    const { result, rerender } = renderHook(
      ({ count, query }: { count: number; query: string }) =>
        useListboxNavigation(count, undefined, { query, reset: 'first-match' }),
      { initialProps: { count: 3, query: '' } }
    );
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('End'))));
    expect(result.current.activeIndex).toBe(2);
    rerender({ count: 3, query: 'a' });
    expect(result.current.activeIndex).toBe(0);
    // An unchanged query never re-fires the reset.
    rerender({ count: 3, query: 'a' });
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(result.current.activeIndex).toBe(1);
    rerender({ count: 3, query: 'a' });
    expect(result.current.activeIndex).toBe(1);
    // An empty result set resets to -1, not a clamped 0.
    rerender({ count: 0, query: 'zz' });
    expect(result.current.activeIndex).toBe(-1);
  });

  it('clears the highlight on a changed query in none mode', async () => {
    const { result, rerender } = renderHook(
      ({ count, query }: { count: number; query: string }) =>
        useListboxNavigation(count, undefined, { query, reset: 'none' }),
      { initialProps: { count: 3, query: '' } }
    );
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('End'))));
    expect(result.current.activeIndex).toBe(2);
    rerender({ count: 3, query: 'a' });
    expect(result.current.activeIndex).toBe(-1);
  });

  it('tracks a shrinking option count without resurrecting a stale index', async () => {
    const { result, rerender } = renderHook(
      ({ count, query }: { count: number; query: string }) =>
        useListboxNavigation(count, undefined, { query, reset: 'none' }),
      { initialProps: { count: 4, query: '' } }
    );
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('End'))));
    expect(result.current.activeIndex).toBe(3);
    // The filtered list shrank to one option: the query-reset path is
    // how sites reseed the highlight; a step from the stale index stays
    // clamped into the new bounds.
    rerender({ count: 1, query: 'a' });
    expect(result.current.activeIndex).toBe(-1);
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(result.current.activeIndex).toBe(0);
    await act(() => Promise.resolve(result.current.handleNavigationKey(keyEvent('ArrowDown'))));
    expect(result.current.activeIndex).toBe(0);
  });
});
