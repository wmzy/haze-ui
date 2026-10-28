import { expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import { usePausableTimeout } from './use-pausable-timeout';

describe('usePausableTimeout', () => {
  it('fires once after the delay', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    renderHook(() => usePausableTimeout({ delay: 3000, onFire }));
    vi.advanceTimersByTime(2999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('banks the elapsed slice on pause and resumes with the remainder', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { result } = renderHook(() =>
      usePausableTimeout({ delay: 3000, onFire })
    );
    vi.advanceTimersByTime(1000);
    result.current.pause();
    vi.advanceTimersByTime(10_000); // paused: budget frozen
    expect(onFire).not.toHaveBeenCalled();
    result.current.resume();
    vi.advanceTimersByTime(1999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('pause is idempotent — a second pause never double-banks', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { result } = renderHook(() =>
      usePausableTimeout({ delay: 3000, onFire })
    );
    vi.advanceTimersByTime(1000);
    result.current.pause();
    vi.advanceTimersByTime(5000);
    result.current.pause(); // already paused: no-op
    result.current.resume();
    vi.advanceTimersByTime(1999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('resume while running is a no-op (no duplicate timers)', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { result } = renderHook(() =>
      usePausableTimeout({ delay: 3000, onFire })
    );
    result.current.resume(); // already armed
    result.current.resume();
    vi.advanceTimersByTime(3000);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('re-arms the full budget after every fire when recurring', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    renderHook(() => usePausableTimeout({ delay: 1000, onFire, recurring: true }));
    vi.advanceTimersByTime(1000);
    expect(onFire).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(onFire).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1000);
    expect(onFire).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it('keeps a recurring engine parked while paused across a fire point and re-arms on resume', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { result } = renderHook(() =>
      usePausableTimeout({ delay: 1000, onFire, recurring: true })
    );
    vi.advanceTimersByTime(400);
    result.current.pause(); // banks 400, 600 left
    vi.advanceTimersByTime(5000);
    expect(onFire).not.toHaveBeenCalled();
    result.current.resume();
    vi.advanceTimersByTime(599);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); // fires with the 600ms remainder…
    expect(onFire).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000); // …then re-arms the full budget
    expect(onFire).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('holds the fire at the minRemaining floor instead of stalling', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { result } = renderHook(() =>
      usePausableTimeout({ delay: 1000, onFire, minRemaining: 1 })
    );
    vi.advanceTimersByTime(999);
    result.current.pause(); // remaining would be 1 → kept at the floor
    result.current.resume();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('runs no timer while disabled, and enabling arms the fresh budget', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        usePausableTimeout({ delay: 1000, onFire, enabled }),
      { initialProps: { enabled: true } }
    );
    rerender({ enabled: false });
    vi.advanceTimersByTime(10_000);
    expect(onFire).not.toHaveBeenCalled();
    rerender({ enabled: true });
    vi.advanceTimersByTime(999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('never fires while disabled, even after pause/resume churn', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        usePausableTimeout({ delay: 1000, onFire, enabled }),
      { initialProps: { enabled: true } }
    );
    rerender({ enabled: false });
    result.current.resume();
    result.current.pause();
    vi.advanceTimersByTime(10_000);
    expect(onFire).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('restarts from the full budget when delay changes', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { rerender } = renderHook(
      ({ delay }: { delay: number }) => usePausableTimeout({ delay, onFire }),
      { initialProps: { delay: 3000 } }
    );
    vi.advanceTimersByTime(2000);
    rerender({ delay: 5000 });
    vi.advanceTimersByTime(4999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('restarts from the full budget when resetKey changes', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { rerender } = renderHook(
      ({ resetKey }: { resetKey: number }) =>
        usePausableTimeout({ delay: 1000, onFire, resetKey }),
      { initialProps: { resetKey: 1 } }
    );
    vi.advanceTimersByTime(800);
    rerender({ resetKey: 2 });
    vi.advanceTimersByTime(999);
    expect(onFire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onFire).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('keeps the countdown when the onFire identity changes', () => {
    vi.useFakeTimers();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ onFire }: { onFire: () => void }) => usePausableTimeout({ delay: 3000, onFire }),
      { initialProps: { onFire: first } }
    );
    vi.advanceTimersByTime(2000);
    rerender({ onFire: second }); // mid-countdown identity swap: no re-arm
    vi.advanceTimersByTime(999);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('returns stable pause/resume identities across renders', () => {
    const { result, rerender } = renderHook(() =>
      usePausableTimeout({ delay: 1000, onFire: () => undefined })
    );
    const before = result.current;
    rerender();
    expect(result.current.pause).toBe(before.pause);
    expect(result.current.resume).toBe(before.resume);
  });

  it('clears the timer on unmount', () => {
    vi.useFakeTimers();
    const onFire = vi.fn();
    const { unmount } = renderHook(() =>
      usePausableTimeout({ delay: 1000, onFire })
    );
    unmount();
    vi.advanceTimersByTime(10_000);
    expect(onFire).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
