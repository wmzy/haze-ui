import type { CollisionStrategy } from './collision';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';

import {
  FloatingPanel,
  floatingHidden,
  placeFloatingPanel,
  useFloating,
  type FloatingPlacement,
} from './floating';

/**
 * Covers the collision/animated extensions of the floating primitives:
 * placeFloatingPanel's 4th strategy argument (tier 2), the animated
 * exit semantics (fallback + native), the first-open visibility gating
 * of the JS positioning, and the tier-1 cross-axis nudge. The
 * pixel-parity of the unpadded path is guarded by the tier-2 cases in
 * Popover.test.tsx and the parity cases in collision.test.ts.
 */

// ---------------------------------------------------------------------------
// jsdom popover API mocks (same approach as Popover.test.tsx)
// ---------------------------------------------------------------------------

class ToggleEventPolyfill extends Event {
  newState: string;
  constructor(type: string, init: {newState: string}) {
    super(type);
    this.newState = init.newState;
  }
}

const showPopoverMock = vi.fn(function (this: HTMLElement) {
  this.setAttribute('data-popover-open', '');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', {newState: 'open'}));
});

const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('data-popover-open')) return;
  this.removeAttribute('data-popover-open');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', {newState: 'closed'}));
});

function installNativePopover() {
  Object.defineProperty(HTMLElement.prototype, 'popover', {
    configurable: true,
    value: 'manual',
  });
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
}

type PopoverProtoPatch = {
  popover?: unknown;
  showPopover?: () => void;
  hidePopover?: () => void;
};

function removeNativePopover() {
  const proto = HTMLElement.prototype as PopoverProtoPatch;
  delete proto.popover;
  delete proto.showPopover;
  delete proto.hidePopover;
}

// ---------------------------------------------------------------------------
// Rect mocks: jsdom layout is all-zero, so feed controlled geometry.
// ---------------------------------------------------------------------------

type MockRect = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

const zeroRect = () =>
  ({top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({})});

/**
 * Point elements at controlled rects. The panel rect may be computed
 * lazily so tests can make measurability depend on actual popover
 * visibility (a native popover is display:none until shown).
 */
function mockRects(panelRect: MockRect | (() => MockRect), triggerRect: MockRect) {
  const panel = typeof panelRect === 'function' ? panelRect : () => panelRect;
  return vi
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      if (this.dataset.rect === 'panel' || this.hasAttribute('popover'))
        return {...zeroRect(), ...panel()};
      if (this.dataset.rect === 'trigger' || this.getAttribute('role') === 'button')
        return {...zeroRect(), ...triggerRect};
      return zeroRect();
    });
}

/** Panel/trigger pair mounted as bare elements for direct placement calls. */
function mountForPlace(panelRect: MockRect, triggerRect: MockRect) {
  const panelEl = document.createElement('div');
  panelEl.dataset.rect = 'panel';
  const triggerEl = document.createElement('span');
  triggerEl.dataset.rect = 'trigger';
  document.body.append(panelEl, triggerEl);
  const spy = mockRects(panelRect, triggerRect);
  return {
    panelEl,
    triggerEl,
    restore: () => {
      spy.mockRestore();
      panelEl.remove();
      triggerEl.remove();
    },
  };
}

// ---------------------------------------------------------------------------
// Harness: minimal floating pair driven through the real hooks
// ---------------------------------------------------------------------------

type HarnessProps = {
  placement?: FloatingPlacement;
  animated?: boolean;
  collision?: CollisionStrategy;
};

function FloatingHarness({
  placement = 'bottom',
  animated = true,
  collision,
}: HarnessProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated,
    collision,
  });
  return (
    <>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        data-rect="trigger"
        onPointerDown={floating.onTriggerPointerDown}
        onClick={floating.onTriggerClick}
      >
        Trigger
      </span>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement={placement}
        collision={collision}
        data-testid="panel"
        data-rect="panel"
      >
        Panel
      </FloatingPanel>
      <output data-testid="exited">{String(floating.exited)}</output>
    </>
  );
}

// ---------------------------------------------------------------------------
// placeFloatingPanel: collision strategy (tier 2)
// ---------------------------------------------------------------------------

describe('placeFloatingPanel: collision strategy', () => {
  // jsdom viewport: 1024 x 768.
  const panel = {top: 0, left: 0, bottom: 200, right: 150, width: 150, height: 200};
  const trigger = {top: 300, left: 100, bottom: 330, right: 180, width: 80, height: 30};

  it('shifts the cross axis to respect collisionPadding', () => {
    const {panelEl, triggerEl, restore} = mountForPlace(panel, {
      ...trigger,
      left: 950,
      right: 1030,
    });
    try {
      placeFloatingPanel(panelEl, triggerEl, 'bottom-span');
      // Unpadded legacy clamp: 1024 − 150 = 874.
      expect(panelEl.style.left).toBe('874px');
      placeFloatingPanel(panelEl, triggerEl, 'bottom-span', {
        collisionPadding: 16,
      });
      // Padded: 1024 − 16 − 150 = 858.
      expect(panelEl.style.left).toBe('858px');
    } finally {
      restore();
    }
  });

  it('flips a bottom placement earlier with bottom padding', () => {
    // 560 + 200 = 760 ≤ 768 fits unpadded; against a padded bottom edge
    // (768 − 16 = 752) it overflows and flips (above fits: 530 ≥ 16).
    const {panelEl, triggerEl, restore} = mountForPlace(panel, {
      ...trigger,
      top: 530,
      bottom: 560,
    });
    try {
      placeFloatingPanel(panelEl, triggerEl, 'bottom');
      expect(panelEl.style.top).toBe('560px');
      placeFloatingPanel(panelEl, triggerEl, 'bottom', {
        collisionPadding: {bottom: 16},
      });
      expect(panelEl.style.top).toBe('330px');
      // start alignment survives the flip
      expect(panelEl.style.left).toBe('100px');
    } finally {
      restore();
    }
  });

  it('respects per-side padding objects', () => {
    const {panelEl, triggerEl, restore} = mountForPlace(panel, {
      ...trigger,
      left: 950,
      right: 1030,
    });
    try {
      placeFloatingPanel(panelEl, triggerEl, 'bottom-span', {
        collisionPadding: {right: 100},
      });
      // 1024 − 100 − 150 = 774.
      expect(panelEl.style.left).toBe('774px');
    } finally {
      restore();
    }
  });

  it('clamps on the primary axis instead of flipping when flip is off', () => {
    const {panelEl, triggerEl, restore} = mountForPlace(panel, {
      ...trigger,
      top: 700,
      bottom: 730,
    });
    try {
      placeFloatingPanel(panelEl, triggerEl, 'bottom', {flip: false});
      // No flip; primary clamp keeps the panel in view: 768 − 200 = 568.
      expect(panelEl.style.top).toBe('568px');
      expect(panelEl.style.left).toBe('100px');
    } finally {
      restore();
    }
  });

  it('leaves the cross axis overflowing when shift is off', () => {
    const {panelEl, triggerEl, restore} = mountForPlace(panel, {
      ...trigger,
      left: 950,
      right: 1030,
    });
    try {
      placeFloatingPanel(panelEl, triggerEl, 'bottom-span', {shift: false});
      expect(panelEl.style.top).toBe('330px');
      expect(panelEl.style.left).toBe('950px');
    } finally {
      restore();
    }
  });
});

// ---------------------------------------------------------------------------
// Animated exit — fallback path (jsdom default, no popover API)
// ---------------------------------------------------------------------------

describe('useFloating animated exit (fallback path)', () => {
  it('keeps the panel un-hidden through the exit and hides it once settled', async () => {
    render(<FloatingHarness />);
    expect(screen.getByTestId('exited').textContent).toBe('true');
    fireEvent.click(screen.getByText('Trigger'));
    const panel = screen.getByTestId('panel');
    expect(panel).not.toHaveClass(floatingHidden);
    expect(screen.getByTestId('exited').textContent).toBe('false');

    fireEvent.click(screen.getByText('Trigger'));
    // Exit in flight: no hidden class yet (jsdom settles the double rAF
    // only ~32ms later), so the fade-out has a visible panel to run on.
    expect(panel).not.toHaveClass(floatingHidden);
    await waitFor(() => expect(panel).toHaveClass(floatingHidden));
    expect(screen.getByTestId('exited').textContent).toBe('true');
  });

  it('mirrors data-state through the open/close cycle', () => {
    render(<FloatingHarness />);
    const panel = screen.getByTestId('panel');
    expect(panel).toHaveAttribute('data-state', 'closed');
    fireEvent.click(screen.getByText('Trigger'));
    expect(panel).toHaveAttribute('data-state', 'open');
    fireEvent.click(screen.getByText('Trigger'));
    expect(panel).toHaveAttribute('data-state', 'closed');
  });

  it('cancels the pending hide when reopened mid-exit', async () => {
    render(<FloatingHarness />);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    fireEvent.click(trigger); // close → exit pending
    fireEvent.click(trigger); // reopen before the exit settles
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 64));
    });
    const panel = screen.getByTestId('panel');
    expect(panel).not.toHaveClass(floatingHidden);
    expect(panel).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('exited').textContent).toBe('false');
  });

  it('hides immediately when not animated (legacy behavior)', () => {
    render(<FloatingHarness animated={false} />);
    fireEvent.click(screen.getByText('Trigger'));
    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByTestId('panel')).toHaveClass(floatingHidden);
    expect(screen.getByTestId('panel')).not.toHaveAttribute('data-state');
  });
});

// ---------------------------------------------------------------------------
// Animated exit — native path (mocked popover API)
// ---------------------------------------------------------------------------

describe('useFloating animated exit (native path)', () => {
  beforeEach(() => {
    installNativePopover();
  });

  afterEach(() => {
    removeNativePopover();
    vi.restoreAllMocks();
    // restoreAllMocks only touches vi.spyOn spies; the vi.fn popover
    // mocks keep their call history across tests unless cleared.
    vi.clearAllMocks();
  });

  it('defers hidePopover until the exit settles', async () => {
    render(<FloatingHarness />);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    expect(showPopoverMock).toHaveBeenCalledTimes(1);

    fireEvent.click(trigger);
    expect(hidePopoverMock).not.toHaveBeenCalled();
    await waitFor(() => expect(hidePopoverMock).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('exited').textContent).toBe('true');
  });

  it('cancels the pending hidePopover when reopened mid-exit', async () => {
    render(<FloatingHarness />);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger); // show #1
    fireEvent.click(trigger); // close → deferred hide pending
    fireEvent.click(trigger); // reopen before the exit settles
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 64));
    });
    expect(hidePopoverMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('panel')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('exited').textContent).toBe('false');
  });

  it('marks the panel exited when the browser closes it directly', () => {
    render(<FloatingHarness />);
    fireEvent.click(screen.getByText('Trigger'));
    act(() => {
      screen
        .getByTestId('panel')
        .dispatchEvent(
          new ToggleEventPolyfill('toggle', {newState: 'closed'})
        );
    });
    expect(screen.getByTestId('exited').textContent).toBe('true');
  });

  it('does not resurrect the open state when a queued show-echo lands after a rapid close', async () => {
    // Real browsers QUEUE popover toggle events (delivered before the
    // next paint), so a rapid close can commit before the showPopover
    // echo arrives. Simulate that by deferring the echo one macrotask.
    // Regression: the echo used to run the browser-side-open sync-back
    // (setOpen(true)) and resurrect the closed state — reproduced by
    // Enter→Space under parallel e2e load.
    HTMLElement.prototype.showPopover = function (this: HTMLElement) {
      this.setAttribute('data-popover-open', '');
      setTimeout(() => {
        this.dispatchEvent(
          new ToggleEventPolyfill('toggle', {newState: 'open'})
        );
      }, 0);
    };
    render(<FloatingHarness />);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger); // open — echo queued, not yet delivered
    fireEvent.click(trigger); // close before the echo lands
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 64));
    });
    expect(screen.getByTestId('panel')).toHaveAttribute('data-state', 'closed');
    await waitFor(() => expect(hidePopoverMock).toHaveBeenCalledTimes(1));
    expect(screen.getByTestId('exited').textContent).toBe('true');
  });

  it('does not kill a rapid reopen when the queued hide-echo lands late', async () => {
    // Mirror race: our own hidePopover() echo can land after a reopen
    // committed. It must reconcile by re-showing, not sync the closed
    // state back into React.
    HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
      if (!this.hasAttribute('data-popover-open')) return;
      this.removeAttribute('data-popover-open');
      setTimeout(() => {
        this.dispatchEvent(
          new ToggleEventPolyfill('toggle', {newState: 'closed'})
        );
      }, 0);
    };
    render(<FloatingHarness />);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger); // show (sync echo)
    fireEvent.click(trigger); // close → exit settles → hide, echo queued
    fireEvent.click(trigger); // reopen before the echo lands
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 64));
    });
    expect(screen.getByTestId('panel')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('panel')).toHaveAttribute('data-popover-open');
    expect(screen.getByTestId('exited').textContent).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Tier 2: placement waits for actual visibility (first-open timing fix)
// ---------------------------------------------------------------------------

describe('tier-2 positioning: visibility-gated placement', () => {
  const PANEL = {top: 0, left: 0, bottom: 200, right: 150, width: 150, height: 200};
  const TRIGGER = {top: 300, left: 462, bottom: 330, right: 542, width: 80, height: 30};

  beforeEach(() => {
    installNativePopover();
    // Tier 2: popover API present, anchor positioning not.
    vi.spyOn(CSS, 'supports').mockReturnValue(false);
  });

  afterEach(() => {
    removeNativePopover();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('places from the measured panel rect on first open, not the open commit', () => {
    // Regression: place() used to run on the `open` commit, before
    // showPopover() — a display:none panel measures a zero rect, and
    // center/end alignments compute from garbage (real Firefox/Safari;
    // jsdom's permissive mocks used to hide it). The panel rect here is
    // only measurable once the popover mock marks it shown.
    const rectSpy = mockRects(
      () =>
        document.querySelector('[popover]')?.hasAttribute('data-popover-open')
          ? PANEL
          : zeroRect(),
      TRIGGER
    );
    try {
      render(<FloatingHarness placement="top" />);
      fireEvent.click(screen.getByText('Trigger'));
      const panel = screen.getByTestId('panel');
      // centerX = 462 + 80/2 − 150/2 = 427; a zero-width measurement
      // would place the centered panel at 502.
      expect(panel.style.left).toBe('427px');
      expect(panel.style.top).toBe('100px');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('re-places on scroll while shown', () => {
    const trig = {...TRIGGER};
    const rectSpy = mockRects(PANEL, trig);
    try {
      render(<FloatingHarness placement="top" />);
      fireEvent.click(screen.getByText('Trigger'));
      const panel = screen.getByTestId('panel');
      expect(panel.style.top).toBe('100px');
      trig.top = 500;
      trig.bottom = 530;
      fireEvent.scroll(window);
      expect(panel.style.top).toBe('300px');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('places again on reopen', async () => {
    const trig = {...TRIGGER};
    const rectSpy = mockRects(PANEL, trig);
    try {
      render(<FloatingHarness placement="top" />);
      const trigger = screen.getByText('Trigger');
      fireEvent.click(trigger);
      expect(screen.getByTestId('panel').style.top).toBe('100px');

      fireEvent.click(trigger);
      await waitFor(() => expect(hidePopoverMock).toHaveBeenCalledTimes(1));
      trig.top = 500;
      trig.bottom = 530;
      fireEvent.click(trigger);
      expect(screen.getByTestId('panel').style.top).toBe('300px');
    } finally {
      rectSpy.mockRestore();
    }
  });
});

// ---------------------------------------------------------------------------
// Tier 1 (anchored): cross-axis nudge via translate
// ---------------------------------------------------------------------------

describe('tier-1 anchored nudge', () => {
  const TRIGGER = {top: 300, left: 462, bottom: 330, right: 542, width: 80, height: 30};
  // Overflows the right viewport edge by 50px.
  const OVERFLOW = {top: 300, left: 924, bottom: 500, right: 1074, width: 150, height: 200};
  const FITS = {top: 300, left: 100, bottom: 500, right: 250, width: 150, height: 200};

  beforeEach(() => {
    installNativePopover();
    // jsdom's CSS.supports is permissive → anchor branch is active.
  });

  afterEach(() => {
    removeNativePopover();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('nudges the panel back inside the viewport on the cross axis', () => {
    const rectSpy = mockRects(OVERFLOW, TRIGGER);
    try {
      render(<FloatingHarness placement="bottom-span" />);
      fireEvent.click(screen.getByText('Trigger'));
      expect(screen.getByTestId('panel').style.translate).toBe('-50px 0px');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('honors collisionPadding in the nudge', () => {
    const rectSpy = mockRects(OVERFLOW, TRIGGER);
    try {
      render(
        <FloatingHarness placement="bottom-span" collision={{collisionPadding: 24}} />
      );
      fireEvent.click(screen.getByText('Trigger'));
      // 1024 − 24 − 150 − 924 = −74.
      expect(screen.getByTestId('panel').style.translate).toBe('-74px 0px');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('clears the nudge when the panel fits', () => {
    const rectSpy = mockRects(FITS, TRIGGER);
    try {
      render(<FloatingHarness placement="bottom-span" />);
      fireEvent.click(screen.getByText('Trigger'));
      expect(screen.getByTestId('panel').style.translate).toBe('');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('leaves the panel overflowing when shift is off', () => {
    const rectSpy = mockRects(OVERFLOW, TRIGGER);
    try {
      render(
        <FloatingHarness placement="bottom-span" collision={{shift: false}} />
      );
      fireEvent.click(screen.getByText('Trigger'));
      expect(screen.getByTestId('panel').style.translate).toBe('');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('re-nudges on scroll', () => {
    const box = {...FITS};
    const rectSpy = mockRects(() => box, TRIGGER);
    try {
      render(<FloatingHarness placement="bottom-span" />);
      fireEvent.click(screen.getByText('Trigger'));
      expect(screen.getByTestId('panel').style.translate).toBe('');
      box.left = 924;
      box.right = 1074;
      fireEvent.scroll(window);
      expect(screen.getByTestId('panel').style.translate).toBe('-50px 0px');
    } finally {
      rectSpy.mockRestore();
    }
  });

  it('clears the nudge when the panel closes', async () => {
    const rectSpy = mockRects(OVERFLOW, TRIGGER);
    try {
      render(<FloatingHarness placement="bottom-span" />);
      fireEvent.click(screen.getByText('Trigger'));
      expect(screen.getByTestId('panel').style.translate).toBe('-50px 0px');
      fireEvent.click(screen.getByText('Trigger'));
      // Animated close: the nudge is cleared once hidePopover settled.
      await waitFor(() => expect(hidePopoverMock).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(screen.getByTestId('panel').style.translate).toBe('')
      );
    } finally {
      rectSpy.mockRestore();
    }
  });
});

describe('FloatingHarness accessibility', () => {
  it('has no axe violations while open', async () => {
    const {axe} = await import('jest-axe');
    render(<FloatingHarness />);
    fireEvent.click(screen.getByText('Trigger'));
    const results = await axe(document.body, {
      rules: {region: {enabled: false}},
    });
    expect(results.violations).toEqual([]);
  });
});
