import { describe, expect, it } from 'vitest';

import { clamp, quantize } from './math';

describe('clamp', () => {
  it('constrains into the inclusive range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('yields max for an inverted range', () => {
    expect(clamp(5, 10, 0)).toBe(0);
  });
});

describe('quantize', () => {
  it('strips float noise at the default magnitude', () => {
    expect(quantize(0.1 + 0.2)).toBe(0.3);
    expect(quantize(1 / 3)).toBeCloseTo(1 / 3, 6);
  });

  it('honors a custom magnitude (percent strings)', () => {
    expect(quantize(0.333333, 100)).toBe(0.33);
    expect(quantize(1234.5678, 1e10)).toBeCloseTo(1234.5678, 10);
  });
});
