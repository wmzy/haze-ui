import { describe, expect, it, vi } from 'vitest';

import {
  axisKeyDelta,
  endPointerDrag,
  gripMirrored,
  PARK_DELTA,
} from './grip-gesture';
import { clamp } from './math';

function makeElement(overrides: Partial<Record<'releasePointerCapture' | 'hasPointerCapture', ReturnType<typeof vi.fn>>> = {}): {
  el: Element;
  releaseSpy: ReturnType<typeof vi.fn>;
} {
  const releaseSpy = overrides.releasePointerCapture ?? vi.fn();
  const hasSpy = overrides.hasPointerCapture ?? vi.fn(() => true);
  const el = { releasePointerCapture: releaseSpy, hasPointerCapture: hasSpy } as unknown as Element;
  return { el, releaseSpy };
}

describe('axisKeyDelta', () => {
  it('maps the grow/shrink arrows onto the layout axis', () => {
    expect(
      axisKeyDelta('ArrowRight', { orientation: 'horizontal', rtl: false, step: 5 })
    ).toBe(5);
    expect(
      axisKeyDelta('ArrowLeft', { orientation: 'horizontal', rtl: false, step: 5 })
    ).toBe(-5);
    expect(
      axisKeyDelta('ArrowDown', { orientation: 'vertical', rtl: false, step: 16 })
    ).toBe(16);
    expect(
      axisKeyDelta('ArrowUp', { orientation: 'vertical', rtl: false, step: 16 })
    ).toBe(-16);
  });

  it('uses the caller-supplied step (Splitter 5 percent vs Resizable 16 px)', () => {
    expect(
      axisKeyDelta('ArrowRight', { orientation: 'horizontal', rtl: false, step: 5 })
    ).toBe(5);
    expect(
      axisKeyDelta('ArrowRight', { orientation: 'horizontal', rtl: false, step: 16 })
    ).toBe(16);
  });

  it('swaps the horizontal arrows under RTL (screen-space meaning is kept)', () => {
    expect(
      axisKeyDelta('ArrowRight', { orientation: 'horizontal', rtl: true, step: 16 })
    ).toBe(-16);
    expect(
      axisKeyDelta('ArrowLeft', { orientation: 'horizontal', rtl: true, step: 16 })
    ).toBe(16);
  });

  it('leaves vertical groups direction-invariant', () => {
    expect(
      axisKeyDelta('ArrowDown', { orientation: 'vertical', rtl: true, step: 16 })
    ).toBe(16);
    expect(
      axisKeyDelta('ArrowUp', { orientation: 'vertical', rtl: true, step: 16 })
    ).toBe(-16);
  });

  it('parks Home/End at the saturated clamp delta', () => {
    expect(
      axisKeyDelta('Home', { orientation: 'horizontal', rtl: false, step: 5 })
    ).toBe(-PARK_DELTA);
    expect(
      axisKeyDelta('End', { orientation: 'horizontal', rtl: false, step: 5 })
    ).toBe(PARK_DELTA);
    // RTL does not remap parking keys: Home always parks the lead at lo.
    expect(
      axisKeyDelta('Home', { orientation: 'horizontal', rtl: true, step: 5 })
    ).toBe(-PARK_DELTA);
    expect(
      axisKeyDelta('End', { orientation: 'vertical', rtl: false, step: 16 })
    ).toBe(PARK_DELTA);
  });

  it('returns null for keys the platform should keep', () => {
    for (const key of ['Enter', 'Tab', ' ', 'a', 'ArrowDown']) {
      // ArrowDown is not a horizontal-axis key.
      expect(
        axisKeyDelta(key, { orientation: 'horizontal', rtl: false, step: 5 })
      ).toBeNull();
    }
    expect(
      axisKeyDelta('ArrowRight', { orientation: 'vertical', rtl: false, step: 5 })
    ).toBeNull();
  });
});

describe('PARK_DELTA clamp math', () => {
  it('saturates current ± PARK_DELTA onto the clamp without overflowing', () => {
    expect(PARK_DELTA).toBe(Number.MAX_SAFE_INTEGER);
    const current = 40;
    const lo = 10;
    const hi = 70;
    // Finite start + MAX_SAFE_INTEGER stays finite, so clamp saturates
    // exactly onto the pin instead of collapsing to Infinity.
    expect(Number.isFinite(current + PARK_DELTA)).toBe(true);
    expect(Number.isFinite(current - PARK_DELTA)).toBe(true);
    expect(clamp(current - PARK_DELTA, lo, hi)).toBe(lo);
    expect(clamp(current + PARK_DELTA, lo, hi)).toBe(hi);
  });

  it('parks an already-pinned lead as a no-op rather than an overshoot', () => {
    // Home on a lead already sitting at lo stays exactly at lo.
    expect(clamp(30 - PARK_DELTA, 30, 70)).toBe(30);
  });
});

describe('gripMirrored', () => {
  it('mirrors only horizontal groups under an rtl ancestor', () => {
    const root = document.createElement('div');
    root.setAttribute('dir', 'rtl');
    const el = document.createElement('div');
    root.appendChild(el);
    document.body.appendChild(root);

    expect(gripMirrored('horizontal', el)).toBe(true);
    expect(gripMirrored('vertical', el)).toBe(false);

    root.setAttribute('dir', 'ltr');
    expect(gripMirrored('horizontal', el)).toBe(false);
    root.remove();
  });

  it('defaults to ltr without a dir carrier or element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(gripMirrored('horizontal', el)).toBe(false);
    expect(gripMirrored('horizontal', null)).toBe(false);
    el.remove();
  });
});

describe('endPointerDrag', () => {
  it('ends the matching gesture: nulls the ref and releases capture', () => {
    const { el, releaseSpy } = makeElement();
    const dragRef = { current: { pointerId: 7, start: 100 } };
    const ended = endPointerDrag(dragRef, { pointerId: 7, currentTarget: el });

    expect(ended).toBe(true);
    expect(dragRef.current).toBeNull();
    expect(releaseSpy).toHaveBeenCalledWith(7);
  });

  it('ignores events from a pointer that is not the in-flight gesture', () => {
    const { el, releaseSpy } = makeElement();
    const drag = { pointerId: 7, start: 100 };
    const dragRef = { current: drag };

    expect(endPointerDrag(dragRef, { pointerId: 8, currentTarget: el })).toBe(
      false
    );
    expect(dragRef.current).toBe(drag);
    expect(releaseSpy).not.toHaveBeenCalled();
  });

  it('ignores end events when no gesture is in flight', () => {
    const { el } = makeElement();
    const dragRef = { current: null };
    expect(endPointerDrag(dragRef, { pointerId: 7, currentTarget: el })).toBe(
      false
    );
  });

  it('no-ops the release on engines without the API (jsdom contract)', () => {
    const { el } = makeElement();
    delete (el as Partial<Element>).releasePointerCapture;
    const dragRef = { current: { pointerId: 7 } };
    expect(() =>
      endPointerDrag(dragRef, { pointerId: 7, currentTarget: el })
    ).not.toThrow();
    expect(dragRef.current).toBeNull();
  });

  it('skips the release when the capture is already gone', () => {
    const { el, releaseSpy } = makeElement({ hasPointerCapture: vi.fn(() => false) });
    const dragRef = { current: { pointerId: 7 } };
    endPointerDrag(dragRef, { pointerId: 7, currentTarget: el });
    expect(releaseSpy).not.toHaveBeenCalled();
  });
});
