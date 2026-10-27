import { act, renderHook } from '@testing-library/react';

import { useStreamingAnnouncements } from './useStreamingAnnouncements';

describe('useStreamingAnnouncements', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('announces the start cue when the stream becomes active', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useStreamingAnnouncements({ active, getText: () => 'partial' }),
      { initialProps: { active: false } },
    );
    expect(result.current).toBe('');
    rerender({ active: true });
    expect(result.current).toBe('Generating');
  });

  it('stays silent for a region that never streamed', () => {
    const { result } = renderHook(() =>
      useStreamingAnnouncements({ active: false, getText: () => 'settled text' }),
    );
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe('');
  });

  it('snapshots getText() at most once per intervalMs', () => {
    let text = 'one';
    const { result } = renderHook(() =>
      useStreamingAnnouncements({ active: true, getText: () => text, intervalMs: 200 }),
    );
    expect(result.current).toBe('Generating');
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe('Generating');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('one');
    // mid-interval, content growth stays silent — per-change updates are
    // exactly what the throttle exists to suppress
    text = 'two';
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe('one');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('two');
  });

  it('keeps the snapshot loop alive across identical snapshots', () => {
    let text = 'same';
    const { result } = renderHook(() =>
      useStreamingAnnouncements({ active: true, getText: () => text, intervalMs: 100 }),
    );
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('same');
    // equal text makes setState bail without a re-render — the next
    // boundary must still fire and pick up the growth
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('same');
    text = 'grown';
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('grown');
  });

  it('defaults to the 1200ms cadence', () => {
    const { result } = renderHook(() =>
      useStreamingAnnouncements({ active: true, getText: () => 'text' }),
    );
    act(() => {
      vi.advanceTimersByTime(1199);
    });
    expect(result.current).toBe('Generating');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('text');
  });

  it('reads getText lazily at each boundary, not at arm time', () => {
    let text = 'stale';
    const { result } = renderHook(() =>
      useStreamingAnnouncements({ active: true, getText: () => text, intervalMs: 100 }),
    );
    text = 'fresh';
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('fresh');
  });

  it('announces the final text exactly once when the stream ends', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useStreamingAnnouncements({ active, getText: () => 'the full answer' }),
      { initialProps: { active: true } },
    );
    rerender({ active: false });
    expect(result.current).toBe('the full answer');
    // settled: nothing further mutates the region
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe('the full answer');
  });

  it('cancels a pending snapshot when the stream ends', () => {
    let text = 'early';
    const { result, rerender } = renderHook(
      ({ active }) =>
        useStreamingAnnouncements({ active, getText: () => text, intervalMs: 500 }),
      { initialProps: { active: true } },
    );
    rerender({ active: false });
    expect(result.current).toBe('early');
    text = 'late';
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe('early');
  });

  it('re-cues when the stream restarts over its final text', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useStreamingAnnouncements({ active, getText: () => 'next answer' }),
      { initialProps: { active: true } },
    );
    rerender({ active: false });
    expect(result.current).toBe('next answer');
    rerender({ active: true });
    expect(result.current).toBe('Generating');
  });

  it('restarts the lifecycle when resetKey changes mid-stream', () => {
    let text = 'first';
    const { result, rerender } = renderHook(
      ({ resetKey }) =>
        useStreamingAnnouncements({ active: true, getText: () => text, resetKey }),
      { initialProps: { resetKey: 'first-stream' } },
    );
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current).toBe('first');
    text = 'second';
    rerender({ resetKey: 'second-stream' });
    // blanked during the render that observed the change, then re-cued
    expect(result.current).toBe('Generating');
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current).toBe('second');
  });

  it('leaves no armed timer behind on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useStreamingAnnouncements({ active: true, getText: () => 'x' }),
    );
    expect(result.current).toBe('Generating');
    unmount();
    // the pending snapshot would fire setState on an unmounted hook
    expect(() =>
      act(() => {
        vi.advanceTimersByTime(5000);
      }),
    ).not.toThrow();
  });
});
