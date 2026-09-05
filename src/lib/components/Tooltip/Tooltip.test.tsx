import type { ReactNode } from 'react';

import type { TooltipProps } from './Tooltip';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { useControl } from 'react-use-control';

import Tooltip from './Tooltip';

/**
 * Controlled harness exposing the internal open state — jsdom applies no
 * CSS, so the hidden-class toggle is not observable directly.
 */
function TooltipHarness(
  props: Omit<Partial<TooltipProps>, 'children' | 'open' | 'content'> & {
    content: ReactNode;
  } = { content: '' }
) {
  const [open, , openCtrl] = useControl(undefined, false);
  return (
    <>
      <Tooltip {...props} open={openCtrl}>
        <button>Hover me</button>
      </Tooltip>
      <output data-testid="open-state">{String(open)}</output>
    </>
  );
}

function hover() {
  // React synthesizes onMouseEnter from mouseover (mouseenter itself does
  // not bubble), so drive the synthetic pair.
  fireEvent.mouseOver(screen.getByText('Hover me'));
}

function leave() {
  fireEvent.mouseOut(screen.getByText('Hover me'));
}

function openState() {
  return screen.getByTestId('open-state').textContent;
}

describe('Tooltip', () => {
  it('renders children and tooltip content', () => {
    render(<Tooltip content="Help text">Hover me</Tooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Help text');
  });

  it('links trigger to tooltip via aria-describedby', () => {
    render(<Tooltip content="Help">Trigger</Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('applies className to wrapper', () => {
    const { container } = render(
      <Tooltip content="Tip" className="custom">Child</Tooltip>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('shows after the hover delay', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" />);
      hover();
      expect(openState()).toBe('false');
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(openState()).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels a pending show when the pointer leaves before the delay', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" />);
      hover();
      act(() => {
        vi.advanceTimersByTime(100);
      });
      leave();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(openState()).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('hides immediately on mouse leave once shown', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" />);
      hover();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(openState()).toBe('true');
      leave();
      expect(openState()).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('respects a custom delay', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" delay={300} />);
      hover();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(openState()).toBe('false');
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(openState()).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows on focus and hides on blur', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" />);
      fireEvent.focus(screen.getByText('Hover me'));
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(openState()).toBe('true');
      fireEvent.blur(screen.getByText('Hover me'));
      expect(openState()).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes on Escape while shown', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" />);
      hover();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(openState()).toBe('true');
      fireEvent.keyDown(document.body, { key: 'Escape' });
      expect(openState()).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('mirrors the animated lifecycle as data-state on the bubble', () => {
    vi.useFakeTimers();
    try {
      render(<TooltipHarness content="Tip" />);
      const bubble = screen.getByRole('tooltip');
      expect(bubble).toHaveAttribute('data-state', 'closed');
      hover();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(bubble).toHaveAttribute('data-state', 'open');
      leave();
      // 'closed' lands immediately — it drives the fade-out; the hidden
      // handover is what waits out the exit animation.
      expect(bubble).toHaveAttribute('data-state', 'closed');
    } finally {
      vi.useRealTimers();
    }
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Tooltip content="Helpful tip"><button>Hover me</button></Tooltip>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations while shown', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Tooltip content="Helpful tip" open>
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Anchored-tier collision: the bubble span is nudged back into the
// padded viewport via `translate` (jsdom's permissive CSS.supports keeps
// the anchor branch active once the popover API is installed).
// ---------------------------------------------------------------------------

class ToggleEventPolyfill extends Event {
  newState: string;
  constructor(type: string, init: { newState: string }) {
    super(type);
    this.newState = init.newState;
  }
}

function installNativePopover() {
  Object.defineProperty(HTMLElement.prototype, 'popover', {
    configurable: true,
    value: 'manual',
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.setAttribute('data-popover-open', '');
    this.dispatchEvent(
      new ToggleEventPolyfill('toggle', { newState: 'open' })
    );
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    if (!this.hasAttribute('data-popover-open')) return;
    this.removeAttribute('data-popover-open');
    this.dispatchEvent(
      new ToggleEventPolyfill('toggle', { newState: 'closed' })
    );
  };
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

describe('Tooltip (anchored-tier collision)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('nudges the bubble inside the padded viewport with collisionPadding', () => {
    installNativePopover();
    // Bubble overflows the right edge by 50px: left 924 + width 150 > 1024.
    const rectSpy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute('role') === 'tooltip') {
          return {
            top: 300, left: 924, bottom: 350, right: 1074,
            width: 150, height: 50, x: 0, y: 0, toJSON: () => ({}),
          };
        }
        return {
          top: 0, left: 0, bottom: 0, right: 0,
          width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}),
        };
      });
    try {
      render(
        <Tooltip content="Tip" collisionPadding={24} open>
          <button>Hover me</button>
        </Tooltip>
      );
      // jsdom's UA sheet gives a not-really-open [popover] element
      // display:none, so the role query must opt into hidden results.
      const bubble = screen.getByRole('tooltip', { hidden: true });
      // 1024 − 24 − 150 − 924 = −74 on the cross axis; 'top' placement
      // keeps the primary axis to position-try-fallbacks.
      expect(bubble.style.translate).toBe('-74px 0px');
    } finally {
      rectSpy.mockRestore();
      removeNativePopover();
    }
  });
});
