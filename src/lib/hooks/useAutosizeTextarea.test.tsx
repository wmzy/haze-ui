import { act, renderHook } from '@testing-library/react';

import { useAutosizeTextarea } from './useAutosizeTextarea';

/** jsdom has no layout: fabricate the content extent the hook measures. */
function giveScrollHeight(el: HTMLElement, value: number) {
  Object.defineProperty(el, 'scrollHeight', {
    value,
    configurable: true,
  });
}

/** Stub the computed metrics the row cap reads (line height + padding). */
function stubComputed(metrics: Partial<CSSStyleDeclaration>) {
  const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
    () => metrics as CSSStyleDeclaration,
  );
  return () => spy.mockRestore();
}

/** Mounted textarea the hook's ref can attach to. */
function mountTextarea() {
  const el = document.createElement('textarea');
  document.body.appendChild(el);
  return el;
}

describe('useAutosizeTextarea', () => {
  it('applies the measured content height on resize', () => {
    const { result } = renderHook(() => useAutosizeTextarea());
    const el = mountTextarea();
    act(() => {
      result.current.ref(el);
    });
    giveScrollHeight(el, 123);
    act(() => {
      result.current.resize();
    });
    expect(el.style.height).toBe('123px');
    el.remove();
  });

  it('resets the height before measuring so it never feeds back', () => {
    const { result } = renderHook(() => useAutosizeTextarea());
    const el = mountTextarea();
    act(() => {
      result.current.ref(el);
    });
    el.style.height = '400px';
    giveScrollHeight(el, 90);
    act(() => {
      result.current.resize();
    });
    expect(el.style.height).toBe('90px');
    el.remove();
  });

  it('clamps the height to maxRows via the computed line height', () => {
    const restore = stubComputed({
      lineHeight: '20px',
      fontSize: '16px',
      paddingTop: '4px',
      paddingBottom: '4px',
    });
    try {
      const { result } = renderHook(() => useAutosizeTextarea({ maxRows: 3 }));
      const el = mountTextarea();
      act(() => {
        result.current.ref(el);
      });
      giveScrollHeight(el, 500);
      act(() => {
        result.current.resize();
      });
      // 3 rows × 20px + 4px + 4px of block padding
      expect(el.style.height).toBe('68px');
      el.remove();
    } finally {
      restore();
    }
  });

  it('falls back to 1.5 × font size when line height is normal', () => {
    const restore = stubComputed({
      lineHeight: 'normal',
      fontSize: '16px',
      paddingTop: '0px',
      paddingBottom: '0px',
    });
    try {
      const { result } = renderHook(() => useAutosizeTextarea({ maxRows: 2 }));
      const el = mountTextarea();
      act(() => {
        result.current.ref(el);
      });
      giveScrollHeight(el, 100);
      act(() => {
        result.current.resize();
      });
      expect(el.style.height).toBe('48px');
      el.remove();
    } finally {
      restore();
    }
  });

  it('skips the row cap when no computed metric resolves', () => {
    // a style sheet that resolves nothing: every length reads as
    // undefined → readablePx 0 → the clamp cannot compute and steps aside
    const restore = stubComputed({});
    try {
      const { result } = renderHook(() => useAutosizeTextarea({ maxRows: 3 }));
      const el = mountTextarea();
      act(() => {
        result.current.ref(el);
      });
      giveScrollHeight(el, 500);
      act(() => {
        result.current.resize();
      });
      expect(el.style.height).toBe('500px');
      el.remove();
    } finally {
      restore();
    }
  });

  it('collapses to the intrinsic height on reset', () => {
    const { result } = renderHook(() => useAutosizeTextarea());
    const el = mountTextarea();
    act(() => {
      result.current.ref(el);
    });
    giveScrollHeight(el, 200);
    act(() => {
      result.current.resize();
    });
    expect(el.style.height).toBe('200px');
    act(() => {
      result.current.reset();
    });
    expect(el.style.height).toBe('auto');
    el.remove();
  });

  it('is a safe no-op before the ref attaches', () => {
    const { result } = renderHook(() => useAutosizeTextarea({ maxRows: 2 }));
    expect(() => {
      result.current.resize();
      result.current.reset();
    }).not.toThrow();
  });

  it('keeps the handle referentially stable per maxRows', () => {
    const { result, rerender } = renderHook(
      ({ maxRows }) => useAutosizeTextarea({ maxRows }),
      { initialProps: { maxRows: 4 } },
    );
    const first = result.current;
    rerender({ maxRows: 4 });
    expect(result.current).toBe(first);
    rerender({ maxRows: 5 });
    expect(result.current).not.toBe(first);
    // the ref callback itself survives the maxRows change
    expect(result.current.ref).toBe(first.ref);
  });
});
