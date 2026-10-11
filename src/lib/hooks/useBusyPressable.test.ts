import { renderHook } from '@testing-library/react';

import { useBusyPressable } from './useBusyPressable';

describe('useBusyPressable', () => {
  it('passes through idle state without busy props', () => {
    const { result } = renderHook(() => useBusyPressable(false, false));
    expect(result.current.disabled).toBe(false);
    expect(result.current['aria-busy']).toBeUndefined();
  });

  it('forces disabled and aria-busy while busy', () => {
    const { result } = renderHook(() => useBusyPressable(true, false));
    expect(result.current.disabled).toBe(true);
    expect(result.current['aria-busy']).toBe(true);
  });

  it('busy never re-enables an explicitly disabled control', () => {
    const { result } = renderHook(() => useBusyPressable(true, true));
    expect(result.current.disabled).toBe(true);
  });

  it('keeps disabled when busy flips back', () => {
    const { result, rerender } = renderHook(
      ({ busy }) => useBusyPressable(busy, true),
      { initialProps: { busy: true } }
    );
    rerender({ busy: false });
    expect(result.current.disabled).toBe(true);
    expect(result.current['aria-busy']).toBeUndefined();
  });

  it('clears disabled when busy ends and no explicit disabled prop', () => {
    const { result, rerender } = renderHook(
      ({ busy }) => useBusyPressable(busy, false),
      { initialProps: { busy: true } }
    );
    rerender({ busy: false });
    expect(result.current.disabled).toBe(false);
  });
});
