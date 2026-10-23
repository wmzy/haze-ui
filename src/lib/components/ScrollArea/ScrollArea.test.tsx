import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ScrollArea from './ScrollArea';
import Scrollbar from './Scrollbar';
import ScrollThumb from './ScrollThumb';
import ScrollViewport from './ScrollViewport';
import {
  MIN_THUMB_SIZE,
  axisGeometry,
  thumbDragToScroll,
  trackPageToScroll,
} from './scroll-math';

/** jsdom reports 0 extents: install fixed ones on a live element. */
function mockExtents(
  el: HTMLElement,
  extents: Partial<{
    clientHeight: number;
    scrollHeight: number;
    clientWidth: number;
    scrollWidth: number;
  }>
) {
  for (const [key, value] of Object.entries(extents)) {
    Object.defineProperty(el, key, { value, configurable: true });
  }
}

/** jsdom rects are all-zero: give the track a real extent. */
function mockRect(
  el: HTMLElement,
  rect: { width?: number; height?: number; top?: number; left?: number; right?: number }
) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    ...rect,
    toJSON: () => ({}),
  } as DOMRect);
}

type Parts = {
  root: HTMLElement;
  viewport: HTMLElement;
  track: HTMLElement;
  thumb: HTMLElement;
};

/** Scroll-area parts of the last render that contains the text `Content`. */
function getParts(): Parts {
  const root = screen.getByText('Content').closest<HTMLElement>(
    '[data-slot="scroll-area"]'
  )!;
  const viewport = root.querySelector<HTMLElement>(
    '[data-slot="scroll-viewport"]'
  )!;
  const track = root.querySelector<HTMLElement>(
    '[data-slot="scrollbar"][data-orientation="vertical"]'
  )!;
  const thumb = track.querySelector<HTMLElement>(
    '[data-slot="scroll-thumb"]'
  )!;
  return { root, viewport, track, thumb };
}

/** Mount with vertically overflowing content (client 100 / scroll 400 / track 100). */
function setupOverflow(
  props: { type?: 'hover' | 'always' | 'scroll' } = {}
): Parts {
  render(
    <ScrollArea {...props}>
      <div>Content</div>
    </ScrollArea>
  );
  const parts = getParts();
  mockExtents(parts.viewport, { clientHeight: 100, scrollHeight: 400 });
  mockRect(parts.track, { height: 100, width: 8, top: 0 });
  return parts;
}

/** Re-measure with mocked extents (fires the viewport's scroll listener). */
function remeasure(viewport: HTMLElement) {
  fireEvent.scroll(viewport);
}

// ─── pure geometry ──────────────────────────────────────────────
describe('scroll-math', () => {
  it('marks non-overflowing axes as unscrollable and hides the thumb', () => {
    const geometry = axisGeometry({
      viewportSize: 100,
      scrollSize: 100,
      trackSize: 100,
      scrollOffset: 0,
    });
    expect(geometry.scrollable).toBe(false);
    expect(geometry.thumbSize).toBe(0);
    expect(geometry.thumbOffset).toBe(0);
  });

  it('sizes the thumb proportionally and parks it at the start', () => {
    const geometry = axisGeometry({
      viewportSize: 100,
      scrollSize: 400,
      trackSize: 200,
      scrollOffset: 0,
    });
    expect(geometry.scrollable).toBe(true);
    expect(geometry.ratio).toBeCloseTo(0.25);
    expect(geometry.thumbSize).toBeCloseTo(50);
    expect(geometry.thumbOffset).toBe(0);
  });

  it('maps scroll progress onto the thumb offset', () => {
    const geometry = axisGeometry({
      viewportSize: 100,
      scrollSize: 400,
      trackSize: 100,
      scrollOffset: 150,
    });
    // maxScroll 300, progress 0.5, maxThumbOffset 75.
    expect(geometry.thumbSize).toBeCloseTo(25);
    expect(geometry.thumbOffset).toBeCloseTo(37.5);
  });

  it('clamps the thumb to the minimum grab size', () => {
    const geometry = axisGeometry({
      viewportSize: 100,
      scrollSize: 10000,
      trackSize: 100,
      scrollOffset: 0,
    });
    expect(geometry.thumbSize).toBe(MIN_THUMB_SIZE);
  });

  it('clamps offsets at both scroll ends', () => {
    const base = { viewportSize: 100, scrollSize: 400, trackSize: 100 };
    expect(axisGeometry({ ...base, scrollOffset: -50 }).thumbOffset).toBe(0);
    expect(axisGeometry({ ...base, scrollOffset: 999 }).thumbOffset).toBeCloseTo(75);
  });

  it('mirrors the thumb for RTL horizontal scrolling', () => {
    const base = { viewportSize: 100, scrollSize: 400, trackSize: 100, scrollOffset: 75 };
    // progress 0.25 → logical 18.75 of 75 physical, mirrored to 56.25.
    expect(axisGeometry({ ...base, rtl: true }).thumbOffset).toBeCloseTo(56.25);
    expect(axisGeometry({ ...base, rtl: false }).thumbOffset).toBeCloseTo(18.75);
  });

  it('maps a drag to the matching scroll offset and clamps it', () => {
    const base = { viewportSize: 100, scrollSize: 400, trackSize: 100 };
    // thumb 25px of a 100px track → maxThumbOffset 75, maxScroll 300.
    expect(
      thumbDragToScroll({ ...base, thumbStart: 0, pointerDelta: 37.5 })
    ).toBeCloseTo(150);
    expect(
      thumbDragToScroll({ ...base, thumbStart: 60, pointerDelta: 100 })
    ).toBeCloseTo(300);
    expect(
      thumbDragToScroll({ ...base, thumbStart: 10, pointerDelta: -100 })
    ).toBe(0);
  });

  it('mirrors drag direction in RTL', () => {
    // Dragging the thumb leftward (negative delta) scrolls toward the end.
    const value = thumbDragToScroll({
      viewportSize: 100,
      scrollSize: 400,
      trackSize: 100,
      thumbStart: 0,
      pointerDelta: -37.5,
      rtl: true,
    });
    expect(value).toBeCloseTo(150);
  });

  it('pages a full viewport toward the press', () => {
    const base = {
      viewportSize: 100,
      scrollSize: 400,
      thumbOffset: 0,
      thumbSize: 25,
    };
    expect(
      trackPageToScroll({ ...base, scrollOffset: 0, trackPos: 90 })
    ).toBeCloseTo(100);
    expect(
      trackPageToScroll({ ...base, scrollOffset: 300, trackPos: 5 })
    ).toBeCloseTo(200);
  });

  it('never leaves the scroll range', () => {
    expect(
      trackPageToScroll({
        viewportSize: 100,
        scrollSize: 400,
        scrollOffset: 0,
        thumbOffset: 0,
        thumbSize: 25,
        trackPos: 0,
      })
    ).toBe(0);
  });
});

// ─── component wiring ───────────────────────────────────────────
describe('ScrollArea', () => {
  it('renders children', () => {
    render(<ScrollArea>Content</ScrollArea>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ScrollArea className="custom">X</ScrollArea>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('sets max-height via style', () => {
    const { container } = render(<ScrollArea maxHeight={200}>X</ScrollArea>);
    expect(container.firstChild).toHaveStyle({ maxHeight: '200px' });
  });

  it('sets max-height as string', () => {
    const { container } = render(<ScrollArea maxHeight="50vh">X</ScrollArea>);
    // jsdom 30+ 的 getComputedStyle 会把 vh 解析为像素，故直接断言 inline style
    expect((container.firstChild as HTMLElement).style.maxHeight).toBe('50vh');
  });

  it('merges a consumer style with the maxHeight prop', () => {
    const { container } = render(
      <ScrollArea maxHeight={200} style={{ width: '50%' }}>
        X
      </ScrollArea>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.maxHeight).toBe('200px');
    expect(el.style.width).toBe('50%');
  });

  it('forwards native props to the root element', () => {
    render(
      <ScrollArea data-testid='sa' id='scroll-host' data-kind='overlay'>
        X
      </ScrollArea>
    );
    const root = screen.getByTestId('sa');
    expect(root).toContainElement(screen.getByText('X'));
    expect(root.id).toBe('scroll-host');
    expect(root).toHaveAttribute('data-kind', 'overlay');
  });

  it('accepts a ref to the root element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<ScrollArea ref={ref}>X</ScrollArea>);
    expect(ref.current?.getAttribute('data-slot')).toBe('scroll-area');
  });

  it('sugar path wraps children in a viewport with overlay scrollbars', () => {
    const { root } = setupOverflow();
    const viewport = root.querySelector('[data-slot="scroll-viewport"]');
    expect(viewport).toContainElement(screen.getByText('Content'));
    expect(root.querySelectorAll('[data-slot="scrollbar"]')).toHaveLength(2);
    expect(
      root.querySelector(
        '[data-slot="scrollbar"][data-orientation="vertical"] [data-slot="scroll-thumb"]'
      )
    ).toBeInTheDocument();
    expect(
      root.querySelector('[data-slot="scrollbar"][data-orientation="horizontal"]')
    ).toBeInTheDocument();
  });

  it('compound composition renders the same DOM as the sugar path', () => {
    const { container: sugar } = render(<ScrollArea>Content</ScrollArea>);
    const { container: compound } = render(
      <ScrollArea>
        <ScrollViewport>Content</ScrollViewport>
      </ScrollArea>
    );
    expect(compound.firstElementChild?.innerHTML).toBe(
      sugar.firstElementChild?.innerHTML
    );
  });

  it('an explicit scrollbar suppresses the auto-appended pair', () => {
    render(
      <ScrollArea>
        <ScrollViewport>
          <div>Content</div>
        </ScrollViewport>
        <Scrollbar />
      </ScrollArea>
    );
    const root = getParts().root;
    const bars = root.querySelectorAll('[data-slot="scrollbar"]');
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveAttribute('data-orientation', 'vertical');
  });

  it('forwards viewport props and accepts a viewport ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ScrollArea>
        <ScrollViewport ref={ref} aria-label='Transcript' data-testid='vp'>
          Content
        </ScrollViewport>
      </ScrollArea>
    );
    const viewport = screen.getByTestId('vp');
    expect(ref.current).toBe(viewport);
    expect(viewport).toHaveAttribute('aria-label', 'Transcript');
  });

  it('root label names the sugar viewport; a viewport aria-label wins', () => {
    const { container, rerender } = render(
      <ScrollArea label='Transcript'>X</ScrollArea>
    );
    expect(
      container.querySelector('[data-slot="scroll-viewport"]')
    ).toHaveAttribute('aria-label', 'Transcript');

    rerender(
      <ScrollArea label='Transcript'>
        <ScrollViewport aria-label='Chat log'>X</ScrollViewport>
      </ScrollArea>
    );
    expect(
      container.querySelector('[data-slot="scroll-viewport"]')
    ).toHaveAttribute('aria-label', 'Chat log');
  });

  it('compound parts outside <ScrollArea> throw', () => {
    // Clean up the failed mounts' DOM so later queries stay unambiguous.
    expect(() => render(<ScrollViewport>X</ScrollViewport>)).toThrow(
      /within <ScrollArea>/
    );
    expect(() => render(<Scrollbar />)).toThrow(/within <ScrollArea>/);
    expect(() => render(<ScrollThumb />)).toThrow(/within <ScrollArea>/);
  });

  it('declares the scrollbar mode via data-type', () => {
    render(
      <ScrollArea type='always'>
        <div>Content</div>
      </ScrollArea>
    );
    expect(
      screen.getByText('Content').closest('[data-slot="scroll-area"]')
    ).toHaveAttribute('data-type', 'always');
  });
});

// ─── keyboard focus contract ────────────────────────────────────
describe('ScrollArea keyboard focus', () => {
  it('is not focusable while nothing overflows', async () => {
    const { viewport } = setupOverflow();
    mockExtents(viewport, { clientHeight: 100, scrollHeight: 100 });
    remeasure(viewport);
    await waitFor(() =>
      expect(viewport).toHaveAttribute('data-scrollable', 'false')
    );
    expect(viewport).not.toHaveAttribute('tabindex');
  });

  it('becomes focusable when content overflows', async () => {
    const { viewport } = setupOverflow();
    remeasure(viewport);
    await waitFor(() => {
      expect(viewport).toHaveAttribute('data-scrollable', 'true');
      expect(viewport).toHaveAttribute('tabindex', '0');
    });
    // Native arrow/space/page scrolling follows from focusability —
    // jsdom has no layout engine, so the contract ends at the focus.
    viewport.focus();
    expect(viewport).toHaveFocus();
  });

  it('a consumer tabIndex always wins', async () => {
    render(
      <ScrollArea>
        <ScrollViewport tabIndex={-1}>
          <div>Content</div>
        </ScrollViewport>
      </ScrollArea>
    );
    const { viewport } = getParts();
    mockExtents(viewport, { clientHeight: 100, scrollHeight: 400 });
    remeasure(viewport);
    await waitFor(() =>
      expect(viewport).toHaveAttribute('data-scrollable', 'true')
    );
    expect(viewport).toHaveAttribute('tabindex', '-1');
  });
});

// ─── thumb DOM wiring ───────────────────────────────────────────
describe('ScrollArea thumb', () => {
  it('sizes and positions the thumb from viewport geometry', async () => {
    const { viewport, thumb } = setupOverflow();
    remeasure(viewport);
    // client 100 / scroll 400 / track 100 → 25px thumb parked at 0.
    await waitFor(() => expect(thumb.style.height).toBe('25px'));
    expect(thumb.style.transform).toBe('translateY(0px)');
    expect(thumb).toHaveAttribute('data-visible', 'false');
  });

  it('re-positions the thumb on scroll', async () => {
    const { viewport, thumb } = setupOverflow();
    viewport.scrollTop = 150;
    remeasure(viewport);
    await waitFor(() =>
      expect(thumb.style.transform).toBe('translateY(37.5px)')
    );
  });

  it('stays hidden and inert when the axis does not overflow', () => {
    const { viewport, thumb, track } = setupOverflow();
    mockExtents(viewport, { clientHeight: 100, scrollHeight: 100 });
    remeasure(viewport);
    expect(thumb.style.height).toBe('0px');
    expect(thumb).toHaveAttribute('data-visible', 'false');
    expect(track).toHaveAttribute('data-scrollable', 'false');
  });

  it('type=always shows the thumb once the axis overflows', async () => {
    const { viewport, thumb } = setupOverflow({ type: 'always' });
    remeasure(viewport);
    await waitFor(() =>
      expect(thumb).toHaveAttribute('data-visible', 'true')
    );
  });

  it('type=hover reveals the thumb on pointer-over and hides on leave', () => {
    const { root, viewport, thumb } = setupOverflow();
    remeasure(viewport);
    root.dispatchEvent(new Event('pointerenter'));
    expect(thumb).toHaveAttribute('data-visible', 'true');
    root.dispatchEvent(new Event('pointerleave'));
    expect(thumb).toHaveAttribute('data-visible', 'false');
  });

  it('type=scroll flashes the thumb and hides it after the scroll stops', () => {
    vi.useFakeTimers();
    try {
      const { viewport, thumb } = setupOverflow({ type: 'scroll' });
      remeasure(viewport);
      expect(thumb).toHaveAttribute('data-visible', 'true');
      vi.advanceTimersByTime(700);
      expect(thumb).toHaveAttribute('data-visible', 'false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('drags the thumb through pointer capture', async () => {
    const { viewport, thumb, track } = setupOverflow();
    remeasure(viewport);
    await waitFor(() =>
      expect(track).toHaveAttribute('data-scrollable', 'true')
    );

    fireEvent.pointerDown(thumb, { pointerId: 7, clientY: 50, button: 0 });
    expect(thumb).toHaveAttribute('data-active', 'true');
    expect(thumb).toHaveAttribute('data-visible', 'true');

    // 32px of thumb travel ≙ 32/75 of the 300px scroll range = 128.
    fireEvent.pointerMove(thumb, { pointerId: 7, clientY: 82 });
    expect(viewport.scrollTop).toBe(128);

    fireEvent.pointerUp(thumb, { pointerId: 7 });
    expect(thumb).toHaveAttribute('data-active', 'false');
  });

  it('ignores pointer moves from other pointers', async () => {
    const { viewport, thumb, track } = setupOverflow();
    remeasure(viewport);
    await waitFor(() =>
      expect(track).toHaveAttribute('data-scrollable', 'true')
    );
    fireEvent.pointerDown(thumb, { pointerId: 7, clientY: 50, button: 0 });
    fireEvent.pointerMove(thumb, { pointerId: 9, clientY: 200 });
    expect(viewport.scrollTop).toBe(0);
  });

  it('pages on track presses and moves focus to the viewport', async () => {
    const { viewport, track } = setupOverflow();
    remeasure(viewport);
    await waitFor(() =>
      expect(track).toHaveAttribute('data-scrollable', 'true')
    );

    // Track 100px tall from y=0; thumb center at 12.5. Pressing at 90 is
    // below the thumb → one viewport page down, clamped to the range.
    fireEvent.pointerDown(track, { clientY: 90, button: 0 });
    expect(viewport.scrollTop).toBe(100);
    expect(viewport).toHaveFocus();
  });

  it('mirrors horizontal thumb geometry in RTL', async () => {
    render(
      <div dir="rtl">
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      </div>
    );
    const { viewport, track } = getParts();
    const horizontalTrack = track.parentElement!.querySelector<HTMLElement>(
      '[data-slot="scrollbar"][data-orientation="horizontal"]'
    )!;
    const thumb = horizontalTrack.querySelector<HTMLElement>(
      '[data-slot="scroll-thumb"]'
    )!;
    mockExtents(viewport, { clientWidth: 100, scrollWidth: 400 });
    mockRect(horizontalTrack, { width: 100, left: 0, right: 100 });
    // Spec-aligned RTL: scrollLeft reads 0 at the (right) start, negative
    // toward the end — 150 logical scrolled.
    viewport.scrollLeft = -150;
    remeasure(viewport);
    await waitFor(() =>
      expect(thumb.style.transform).toBe('translateX(37.5px)')
    );
  });
});

// ─── accessibility ──────────────────────────────────────────────
describe('ScrollArea a11y', () => {
  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ScrollArea maxHeight={200} label='Scrollable list'>
        Content
      </ScrollArea>
    );
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
