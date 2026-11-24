import { floatingPlacementClasses, supportsNativePopover } from './floating';

// `bottom-span` is the panel-width flavor of `bottom`: start-aligned under
// the trigger on every tier, so it must resolve to the same class as
// `bottom` wherever the placement maps to one (it carried a byte-identical
// copy of the anchored class once).
//
// This file never installs the popover API, so the anchored tier resolves
// its physical classes (anchoredPlacements) — the map that used to hold the
// duplicate. In floating.test.tsx the native-path suites install it, and
// the logical-position-area probe is cached per module instance: once it
// has succeeded there, the lookup routes to the logical map instead.
describe("floatingPlacementClasses: 'bottom-span' is 'bottom'", () => {
  const tiers = [
    { native: false, anchored: false },
    { native: true, anchored: false },
    { native: true, anchored: true },
  ] as const;

  beforeEach(() => {
    expect(supportsNativePopover()).toBe(false);
  });

  it.each(tiers)('shares the class on the $native/$anchored tier', (tier) => {
    expect(floatingPlacementClasses(tier, 'bottom-span')).toEqual(
      floatingPlacementClasses(tier, 'bottom')
    );
  });

  // The gap tier (native, not anchored) has one class for every
  // under-anchor alignment, so only these two tell alignments apart.
  it.each([
    { native: false, anchored: false },
    { native: true, anchored: true },
  ])('stays distinct from bottom-end on the $native/$anchored tier', (tier) => {
    expect(floatingPlacementClasses(tier, 'bottom-span')).not.toEqual(
      floatingPlacementClasses(tier, 'bottom-end')
    );
  });

  it('keeps the physical anchored map under test', () => {
    // The physical map mirrors through the placement lookup (the logical
    // one does not): this only holds while the logical probe is off.
    const anchored = { native: true, anchored: true };
    expect(floatingPlacementClasses(anchored, 'bottom-end', 'rtl')).toEqual(
      floatingPlacementClasses(anchored, 'bottom')
    );
  });
});
