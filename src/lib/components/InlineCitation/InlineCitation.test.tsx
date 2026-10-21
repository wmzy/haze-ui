import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InlineCitation from './InlineCitation';

function getTrigger(name = '[1]') {
  return screen.getByRole('button', { name });
}

function getPanel(trigger: HTMLElement) {
  return document.getElementById(trigger.getAttribute('aria-controls')!)!;
}

describe('InlineCitation', () => {
  it('renders a superscript badge with the default index', () => {
    const { container } = render(
      <p>
        Some claim<InlineCitation /> follows.
      </p>,
    );
    const sup = container.querySelector('sup');
    expect(sup).toBeInTheDocument();
    expect(getTrigger()).toBeInTheDocument();
    expect(getTrigger()).toHaveTextContent('[1]');
  });

  it('renders a custom index', () => {
    render(<InlineCitation index={3} />);
    expect(getTrigger('[3]')).toBeInTheDocument();
  });

  it('links the trigger to the panel via aria-controls', () => {
    render(<InlineCitation title='Source' />);
    const trigger = getTrigger();
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toBeInTheDocument();
  });

  it('exposes aria-haspopup and toggles on trigger click', async () => {
    const user = userEvent.setup();
    render(<InlineCitation title='Source' snippet='Quoted text' />);
    const trigger = getTrigger();
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = getPanel(trigger);
    expect(within(panel).getByText('Source')).toBeInTheDocument();
    expect(within(panel).getByText('Quoted text')).toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on focus + Enter and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<InlineCitation title='Source' />);
    const trigger = getTrigger();

    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside pointerdown in the fallback path', () => {
    render(<InlineCitation title='Source' />);
    const trigger = getTrigger();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the title as a safe external link when href is set', () => {
    render(<InlineCitation index={2} href='https://example.com/page' title='Example page' />);
    const trigger = getTrigger('[2]');
    fireEvent.click(trigger);
    const link = within(getPanel(trigger)).getByRole('link', { name: 'Example page' });
    expect(link).toHaveAttribute('href', 'https://example.com/page');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the title without a link when href is omitted', () => {
    render(<InlineCitation title='Offline source' />);
    const trigger = getTrigger();
    fireEvent.click(trigger);
    expect(within(getPanel(trigger)).getByText('Offline source')).toBeInTheDocument();
    expect(within(getPanel(trigger)).queryByRole('link')).not.toBeInTheDocument();
  });

  it('starts open from a plain open value', () => {
    render(<InlineCitation open title='Source' />);
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies className to the superscript root', () => {
    const { container } = render(<InlineCitation className='custom' />);
    expect(container.querySelector('sup')).toHaveClass('custom');
  });

  it('forwards native span props', () => {
    const { container } = render(<InlineCitation data-testid='citation' />);
    expect(screen.getByTestId('citation')).toBeInTheDocument();
    expect(container.querySelector('sup')).toBe(screen.getByTestId('citation'));
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { unmount } = render(
      <InlineCitation index={1} href='https://example.com' title='Example page' snippet='Quoted text' />,
    );
    let results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
    unmount();

    const user = userEvent.setup();
    render(<InlineCitation index={1} title='Example page' snippet='Quoted text' />);
    await user.click(getTrigger());
    results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Native popover API tier: jsdom ships no popover machinery, so the minimal
// surface the floating engine relies on is mocked here (same approach as
// Popover.test.tsx / Dialog.test.tsx) to exercise the native path.
// ---------------------------------------------------------------------------

class ToggleEventPolyfill extends Event {
  newState: string;
  constructor(type: string, init: { newState: string }) {
    super(type);
    this.newState = init.newState;
  }
}

const showPopoverMock = vi.fn(function (this: HTMLElement) {
  this.setAttribute('data-popover-open', '');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'open' }));
});

const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('data-popover-open')) return;
  this.removeAttribute('data-popover-open');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'closed' }));
});

type PopoverProtoPatch = {
  popover?: unknown;
  showPopover?: () => void;
  hidePopover?: () => void;
};

function installNativePopover() {
  Object.defineProperty(HTMLElement.prototype, 'popover', {
    configurable: true,
    value: 'manual',
  });
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
}

function removeNativePopover() {
  const proto = HTMLElement.prototype as PopoverProtoPatch;
  delete proto.popover;
  delete proto.showPopover;
  delete proto.hidePopover;
}

describe('InlineCitation (native popover API)', () => {
  beforeEach(() => {
    installNativePopover();
  });

  afterEach(() => {
    removeNativePopover();
    vi.restoreAllMocks();
  });

  it('renders the panel as a popover=auto element', () => {
    render(<InlineCitation title='Source' />);
    expect(getPanel(getTrigger())).toHaveAttribute('popover', 'auto');
  });

  it('drives showPopover/hidePopover from state on trigger clicks', async () => {
    const user = userEvent.setup();
    render(<InlineCitation title='Source' />);
    const trigger = getTrigger();

    await user.click(trigger);
    expect(showPopoverMock).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    // Animated exit: hidePopover is deferred until the exit animation
    // settles — immediate in jsdom (no CSS durations), but still across
    // the double rAF of whenExitSettles, hence waitFor.
    await waitFor(() => expect(hidePopoverMock).toHaveBeenCalledTimes(1));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
