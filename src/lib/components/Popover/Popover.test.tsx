import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Popover from './Popover';

describe('Popover', () => {
  it('renders trigger and content', () => {
    render(<Popover content="Popover body">Trigger</Popover>);
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('toggles on trigger click', async () => {
    const user = userEvent.setup();
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('links trigger to panel via aria-controls', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toBeInTheDocument();
  });

  it('applies className to panel', () => {
    render(<Popover content="Body" className="custom">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    const panelId = trigger.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).toHaveClass('custom');
  });

  it('closes on outside pointerdown in the fallback path', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape in the fallback path', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Popover content="Popover body">Trigger</Popover>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<Popover content="Popover body">Trigger</Popover>);
    await user.click(screen.getByText('Trigger'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('toggles on trigger clicks early in a page\'s life (performance.now ≈ 0)', () => {
    // Regression: the light-dismiss race sentinels once used 0 as
    // "never", but in a browser performance.now() counts from navigation
    // start — so every trigger click in the first CLICK_WINDOW of a page
    // load was swallowed as a supposed post-dismiss click. jsdom's clock
    // starts at process spawn and never shows it; mock the clock.
    const clock = vi.spyOn(performance, 'now').mockReturnValue(10);
    try {
      render(<Popover content="Body">Trigger</Popover>);
      const trigger = screen.getByText('Trigger');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    } finally {
      clock.mockRestore();
    }
  });
});

// jsdom implements neither the Popover API nor ToggleEvent; polyfill the
// minimal surface the component relies on (same approach as Dialog's
// showModal/close mocks) to exercise the native path.
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
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
}

const showPopoverMock = vi.fn(function (this: HTMLElement) {
  this.setAttribute('data-popover-open', '');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'open' }));
});

const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('data-popover-open')) return;
  this.removeAttribute('data-popover-open');
  this.dispatchEvent(
    new ToggleEventPolyfill('toggle', { newState: 'closed' })
  );
});

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

describe('Popover (native popover API)', () => {
  beforeEach(() => {
    installNativePopover();
  });

  afterEach(() => {
    removeNativePopover();
    vi.restoreAllMocks();
  });

  function getPanel() {
    const trigger = screen.getByText('Trigger');
    return document.getElementById(trigger.getAttribute('aria-controls')!)!;
  }

  it('renders the panel as a popover=auto element', () => {
    render(<Popover content="Body">Trigger</Popover>);
    expect(getPanel()).toHaveAttribute('popover', 'auto');
  });

  it('drives showPopover/hidePopover from state on trigger clicks', async () => {
    const user = userEvent.setup();
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');

    await user.click(trigger);
    expect(showPopoverMock).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(hidePopoverMock).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('syncs a browser-side close (Escape/light dismiss) back to state', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Browser closes the popover without React (e.g. Escape key).
    act(() => {
      getPanel().dispatchEvent(
        new ToggleEventPolyfill('toggle', { newState: 'closed' })
      );
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not reopen on the click whose pointerdown light-dismissed it', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Real sequence when clicking a non-invoker trigger while open:
    // pointerdown → browser light-dismiss → click.
    fireEvent.pointerDown(trigger);
    act(() => {
      getPanel().dispatchEvent(
        new ToggleEventPolyfill('toggle', { newState: 'closed' })
      );
    });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('reopens on click after a browser-side close without pointerdown (Escape)', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);

    act(() => {
      getPanel().dispatchEvent(
        new ToggleEventPolyfill('toggle', { newState: 'closed' })
      );
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('wires CSS anchor positioning when supported', () => {
    // jsdom's CSS.supports is permissive, so the anchor branch is active.
    render(<Popover content="Body">Trigger</Popover>);
    // The panel receives the trigger's anchor name through the custom
    // property the anchored styles resolve. (The trigger's own
    // `anchor-name` declaration cannot be asserted here: jsdom's CSSOM
    // silently drops unknown camelCase properties.)
    expect(getPanel().style.getPropertyValue('--haze-floating-anchor')).toMatch(
      /^--haze-floating-/
    );
  });

  it('falls back to JS positioning from the trigger rect without anchor support', () => {
    vi.spyOn(CSS, 'supports').mockReturnValue(false);
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');

    fireEvent.click(trigger);
    const panel = getPanel();
    expect(panel.style.top).not.toBe('');
    expect(panel.style.left).not.toBe('');
    // anchor wiring is absent in this mode
    expect(panel.style.getPropertyValue('--haze-floating-anchor')).toBe('');
    expect(trigger.getAttribute('style')).toBeNull();
  });
});
