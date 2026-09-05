import { computeFloatingPosition, resolvePadding } from './collision';

// Rect samples mirror the tier-2 cases in Popover.test.tsx (jsdom viewport
// 1024x768, panel 150x200, trigger 80x30) so the baseline math stays
// pixel-identical with placeFloatingPanel. Zero gaps match the computed
// margins those cases run with (CSS processing is disabled in tests).
const panel = {width: 150, height: 200};
const viewport = {width: 1024, height: 768};
const trigger = {
  top: 300,
  right: 180,
  bottom: 330,
  left: 100,
  width: 80,
  height: 30,
};
const noGap = {below: 0, above: 0, before: 0, after: 0};
const noPad = {flip: true, shift: true, padding: resolvePadding()};
const pad16 = {flip: true, shift: true, padding: resolvePadding(16)};

type Placement = Parameters<typeof computeFloatingPosition>[0]['placement'];
type Strategy = Parameters<typeof computeFloatingPosition>[0]['strategy'];

function place(
  placement: Placement,
  {
    trigger: triggerRect = trigger,
    panel: panelSize = panel,
    gap = noGap,
    strategy = noPad,
  }: {
    trigger?: typeof trigger;
    panel?: typeof panel;
    gap?: typeof noGap;
    strategy?: Strategy;
  } = {}
) {
  return computeFloatingPosition({
    trigger: triggerRect,
    panel: panelSize,
    viewport,
    placement,
    gap,
    strategy,
  });
}

describe('resolvePadding', () => {
  it('expands a number to all four sides', () => {
    expect(resolvePadding(16)).toEqual({
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    });
  });

  it('fills missing sides of a partial with 0', () => {
    expect(resolvePadding({top: 8, left: 16})).toEqual({
      top: 8,
      right: 0,
      bottom: 0,
      left: 16,
    });
  });

  it('treats an absent value as no padding', () => {
    expect(resolvePadding()).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });
});

describe('computeFloatingPosition: parity with placeFloatingPanel', () => {
  it('keeps the plain position when the panel fits (bottom)', () => {
    expect(place('bottom')).toEqual({
      top: 330,
      left: 100,
      placement: 'bottom',
    });
  });

  it('flips bottom-span above the trigger at the bottom edge', () => {
    expect(
      place('bottom-span', {trigger: {...trigger, top: 700, bottom: 730}})
    ).toEqual({top: 500, left: 100, placement: 'top'});
  });

  it('flips top below the trigger at the top edge, center alignment kept', () => {
    expect(
      place('top', {
        trigger: {...trigger, top: 10, bottom: 40, left: 462, right: 562},
      })
    ).toEqual({top: 40, left: 427, placement: 'bottom'});
  });

  it('flips right to the left side at the right edge', () => {
    expect(
      place('right', {
        trigger: {...trigger, top: 100, bottom: 130, left: 980, right: 1060},
      })
    ).toEqual({top: 15, left: 830, placement: 'left'});
  });

  it('flips left to the right side at the left edge', () => {
    expect(
      place('left', {
        trigger: {...trigger, top: 100, bottom: 130, left: -40, right: 40},
      })
    ).toEqual({top: 15, left: 40, placement: 'right'});
  });

  it('clamps on the primary axis when neither side fits', () => {
    expect(
      place('bottom', {
        trigger: {...trigger, top: 700, bottom: 730},
        panel: {width: 150, height: 900},
      })
    ).toEqual({top: 0, left: 100, placement: 'bottom'});
  });

  it('clamps on the cross axis at the right edge without flipping', () => {
    expect(
      place('bottom-span', {trigger: {...trigger, left: 950, right: 1030}})
    ).toEqual({top: 330, left: 874, placement: 'bottom'});
  });

  it('carries gaps through the baseline and flip math', () => {
    expect(place('bottom', {gap: {below: 8, above: 0, before: 0, after: 0}}))
      .toEqual({top: 338, left: 100, placement: 'bottom'});
    // flipped above with gap.above clearance: 700 - 200 - 12
    expect(
      place('bottom-span', {
        trigger: {...trigger, top: 700, bottom: 730},
        gap: {below: 0, above: 12, before: 0, after: 0},
      })
    ).toEqual({top: 488, left: 100, placement: 'top'});
    // beside the trigger with gap.after: right + 6, vertically centered
    expect(place('right', {gap: {below: 0, above: 0, before: 0, after: 6}}))
      .toEqual({top: 215, left: 186, placement: 'right'});
  });
});

describe('computeFloatingPosition: collisionPadding', () => {
  it('clamps the cross axis into the padded viewport (number form)', () => {
    expect(
      place('bottom-span', {
        trigger: {...trigger, left: 950, right: 1030},
        strategy: pad16,
      })
    ).toEqual({top: 330, left: 858, placement: 'bottom'});
  });

  it('clamps the primary axis at the padded edge when neither side fits', () => {
    expect(
      place('bottom', {
        trigger: {...trigger, top: 700, bottom: 730},
        panel: {width: 150, height: 900},
        strategy: pad16,
      })
    ).toEqual({top: 16, left: 100, placement: 'bottom'});
  });

  it('honors per-side padding from the partial form', () => {
    expect(
      place('bottom-span', {
        trigger: {...trigger, left: -50, right: 30},
        strategy: {flip: true, shift: true, padding: resolvePadding({left: 32})},
      })
    ).toEqual({top: 330, left: 32, placement: 'bottom'});
    expect(
      place('bottom-span', {
        trigger: {...trigger, left: 950, right: 1030},
        strategy: {
          flip: true,
          shift: true,
          padding: resolvePadding({right: 24}),
        },
      })
    ).toEqual({top: 330, left: 850, placement: 'bottom'});
  });

  it('counts padding as overflow for the flip decision', () => {
    // Panel bottom edge lands exactly on the viewport edge: fine without
    // padding, an overflow once 16px of padding is reserved — so it flips.
    const atEdge = {...trigger, top: 538, bottom: 568};
    expect(place('bottom', {trigger: atEdge})).toEqual({
      top: 568,
      left: 100,
      placement: 'bottom',
    });
    expect(place('bottom', {trigger: atEdge, strategy: pad16})).toEqual({
      top: 338,
      left: 100,
      placement: 'top',
    });
  });

  it('requires the flipped side to clear the padded edge', () => {
    // Below-space is 753px: fits the plain viewport (768) but not with 16px
    // padding reserved (752) — the flip is refused and the panel clamps.
    const nearTop = {...trigger, top: 23, bottom: 53};
    const tall = {width: 150, height: 700};
    expect(place('top', {trigger: nearTop, panel: tall})).toEqual({
      top: 53,
      left: 65,
      placement: 'bottom',
    });
    expect(place('top', {trigger: nearTop, panel: tall, strategy: pad16}))
      .toEqual({top: 16, left: 65, placement: 'top'});
  });
});

describe('computeFloatingPosition: strategy toggles', () => {
  it('does not flip when flip is disabled', () => {
    expect(
      place('bottom', {
        trigger: {...trigger, top: 700, bottom: 730},
        strategy: {flip: false, shift: true, padding: resolvePadding()},
      })
    ).toEqual({top: 568, left: 100, placement: 'bottom'});
  });

  it('does not slide the cross axis when shift is disabled', () => {
    expect(
      place('bottom-span', {
        trigger: {...trigger, left: 950, right: 1030},
        strategy: {flip: true, shift: false, padding: resolvePadding()},
      })
    ).toEqual({top: 330, left: 950, placement: 'bottom'});
  });

  it('still flips and clamps the primary axis when shift is disabled', () => {
    const atBottom = {trigger: {...trigger, top: 700, bottom: 730}};
    const noShift = {flip: true, shift: false, padding: resolvePadding()};
    expect(place('bottom-span', {...atBottom, strategy: noShift})).toEqual({
      top: 500,
      left: 100,
      placement: 'top',
    });
    expect(
      place('bottom', {
        ...atBottom,
        panel: {width: 150, height: 900},
        strategy: noShift,
      })
    ).toEqual({top: 0, left: 100, placement: 'bottom'});
  });
});

describe('accessibility', () => {
  it('has no axe violations', async () => {
    // collision.ts is a pure geometry module with no DOM footprint of its
    // own, so axe scans a minimal host element standing in for a consumer.
    const { axe } = await import('jest-axe');
    const host = document.createElement('div');
    host.textContent = 'floating panel host';
    document.body.append(host);
    const results = await axe(host, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
    host.remove();
  });
});
