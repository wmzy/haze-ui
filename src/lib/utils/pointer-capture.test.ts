import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { capturePointer, releasePointerCaptureSafe } from './pointer-capture';

type CaptureSpies = {
  setPointerCapture: ReturnType<typeof vi.fn>;
  releasePointerCapture: ReturnType<typeof vi.fn>;
  hasPointerCapture: ReturnType<typeof vi.fn>;
};

function makeElement(overrides: Partial<Record<keyof CaptureSpies, ReturnType<typeof vi.fn>>> = {}): {
  el: Element;
  spies: CaptureSpies;
} {
  const spies: CaptureSpies = {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    hasPointerCapture: vi.fn(() => true),
    ...overrides,
  };
  const el = spies as unknown as Element;
  return { el, spies };
}

describe('capturePointer', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('captures when the engine supports it', () => {
    const { el, spies } = makeElement();
    capturePointer(el, 7);
    expect(spies.setPointerCapture).toHaveBeenCalledWith(7);
  });

  it('no-ops on engines without the API (jsdom contract)', () => {
    const { el } = makeElement();
    delete (el as Partial<Element>).setPointerCapture;
    expect(() => capturePointer(el, 7)).not.toThrow();
  });

  it('swallows a raced release (InvalidPointerId)', () => {
    const { el } = makeElement({
      setPointerCapture: vi.fn(() => {
        throw new DOMException('InvalidPointerId', 'InvalidPointerId');
      }),
    });
    expect(() => capturePointer(el, 7)).not.toThrow();
  });
});

describe('releasePointerCaptureSafe', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('releases an active capture', () => {
    const { el, spies } = makeElement();
    releasePointerCaptureSafe(el, 7);
    expect(spies.releasePointerCapture).toHaveBeenCalledWith(7);
  });

  it('skips release when the capture is already gone', () => {
    const { el, spies } = makeElement({ hasPointerCapture: vi.fn(() => false) });
    releasePointerCaptureSafe(el, 7);
    expect(spies.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('no-ops on engines without the API', () => {
    const { el } = makeElement();
    delete (el as Partial<Element>).releasePointerCapture;
    expect(() => releasePointerCaptureSafe(el, 7)).not.toThrow();
  });
});
