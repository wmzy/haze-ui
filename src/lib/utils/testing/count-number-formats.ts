/**
 * Counts Intl.NumberFormat constructions for the co-located tests of the
 * formatter cache and its consumer NumberFormatter. The spy hands back
 * the real formatter, so rendered output stays the engine's own.
 * Test-only module — never import from library source and never re-export
 * through a barrel. Pair with vi.restoreAllMocks().
 */
import { vi } from 'vitest';

/** One `[locales, options]` entry per construction, in call order. */
export type NumberFormatConstructions = Parameters<
  Intl.NumberFormatConstructor
>[];

export function countNumberFormatConstructions(): NumberFormatConstructions {
  const RealNumberFormat = Intl.NumberFormat;
  const constructions: NumberFormatConstructions = [];
  vi.spyOn(Intl, 'NumberFormat').mockImplementation(
    function counting(locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
      constructions.push([locales, options]);
      return new RealNumberFormat(locales, options);
    }
  );
  return constructions;
}
