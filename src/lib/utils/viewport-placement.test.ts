import { expect } from 'vitest';

import { addViewportPlacementListener } from './viewport-placement';

/** Capture the internal listener the wiring registers for each event. */
function captureListeners(subscribe: () => () => void) {
  const addSpy = vi.spyOn(window, 'addEventListener');
  const removeSpy = vi.spyOn(window, 'removeEventListener');
  const teardown = subscribe();
  const listeners = new Map<string, EventListener>();
  for (const [type, listener, options] of addSpy.mock.calls) {
    if (typeof listener === 'function') listeners.set(type, listener);
    expect(options).toBe(type === 'scroll' ? true : undefined);
  }
  return {
    listeners,
    teardown: () => {
      teardown();
      return removeSpy.mock.calls.filter(
        ([type, listener]) => listeners.get(type) === listener
      ).length;
    },
  };
}

/** 假 rAF：只排队回调，cancel 按 handle 真正丢帧，测试显式逐帧驱动。 */
function installFakeRaf() {
  const frames = new Map<number, FrameRequestCallback>();
  let nextHandle = 0;
  const raf = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback: FrameRequestCallback) => {
      nextHandle += 1;
      frames.set(nextHandle, callback);
      return nextHandle;
    });
  const cancel = vi
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation((handle: number) => {
      frames.delete(handle);
    });
  return {
    raf,
    cancel,
    flush: () => {
      for (const frame of [...frames.values()]) frame(0);
      frames.clear();
    },
    pending: () => frames.size,
  };
}

describe('addViewportPlacementListener', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listens for captured scroll and resize, synchronously placing', () => {
    const place = vi.fn();
    const { listeners, teardown } = captureListeners(() =>
      addViewportPlacementListener(place)
    );
    expect(listeners.has('scroll')).toBe(true);
    expect(listeners.has('resize')).toBe(true);

    listeners.get('scroll')!(new Event('scroll'));
    listeners.get('resize')!(new Event('resize'));
    expect(place).toHaveBeenCalledTimes(2);
    teardown();
  });

  it('throttle coalesces a burst into one placement per frame', () => {
    const fakeRaf = installFakeRaf();
    const place = vi.fn();
    const { listeners, teardown } = captureListeners(() =>
      addViewportPlacementListener(place, { throttle: true })
    );

    listeners.get('scroll')!(new Event('scroll'));
    listeners.get('scroll')!(new Event('scroll'));
    listeners.get('resize')!(new Event('resize'));
    expect(fakeRaf.pending()).toBe(1);
    expect(place).not.toHaveBeenCalled();

    fakeRaf.flush();
    expect(place).toHaveBeenCalledOnce();

    // Frame done — the next burst schedules a fresh one.
    listeners.get('scroll')!(new Event('scroll'));
    expect(fakeRaf.pending()).toBe(1);
    fakeRaf.flush();
    expect(place).toHaveBeenCalledTimes(2);
    teardown();
  });

  it('teardown removes both listeners and cancels a pending frame', () => {
    const fakeRaf = installFakeRaf();
    const place = vi.fn();
    const { listeners, teardown } = captureListeners(() =>
      addViewportPlacementListener(place, { throttle: true })
    );
    listeners.get('scroll')!(new Event('scroll'));
    expect(fakeRaf.pending()).toBe(1);

    const removed = teardown();
    expect(removed).toBe(2);
    expect(fakeRaf.pending()).toBe(0);

    // A frame fired after teardown must not place.
    fakeRaf.flush();
    expect(place).not.toHaveBeenCalled();
  });
});
