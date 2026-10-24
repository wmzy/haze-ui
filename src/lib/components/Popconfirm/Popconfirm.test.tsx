import type { PopconfirmHandle } from './Popconfirm';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { useControl } from 'react-use-control';

import LocaleProvider from '../LocaleProvider';

import Popconfirm from './Popconfirm';

/** The floating panel element, reached through the trigger's aria-controls. */
function getPanel() {
  const trigger = screen.getByRole('button', { name: 'Trigger' });
  return document.getElementById(trigger.getAttribute('aria-controls')!)!;
}

describe('Popconfirm', () => {
  it('renders the trigger, title, description and actions', () => {
    render(
      <Popconfirm title='Delete this item?' description='This cannot be undone.'>
        Trigger
      </Popconfirm>
    );
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByText('Delete this item?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('exposes dialog semantics with the title as name and the description as describedby', () => {
    render(
      <Popconfirm title='Delete this item?' description='This cannot be undone.'>
        Trigger
      </Popconfirm>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger.getAttribute('aria-controls')).toBeTruthy();

    const panel = getPanel();
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel.getAttribute('aria-labelledby')).toBe(
      screen.getByText('Delete this item?').id
    );
    expect(panel.getAttribute('aria-describedby')).toBe(
      screen.getByText('This cannot be undone.').id
    );
  });

  it('renders default button text from the locale section', () => {
    render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(
      <Popconfirm title='Sure?' okText='Yes' cancelText='No'>
        Trigger
      </Popconfirm>
    );
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('picks up LocaleProvider overrides for the shared confirmDialog section', () => {
    render(
      <LocaleProvider
        strings={{ confirmDialog: { confirm: 'Provider OK', cancel: 'Provider Cancel' } }}
      >
        <Popconfirm title='Sure?'>Trigger</Popconfirm>
      </LocaleProvider>
    );
    expect(screen.getByRole('button', { name: 'Provider OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Provider Cancel' })).toBeInTheDocument();
  });

  it('opens on trigger click and closes on a second click', async () => {
    const user = userEvent.setup();
    render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens with Enter and Space on the trigger', async () => {
    const user = userEvent.setup();
    render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Animated exit: the closed state lands immediately, the hidden
    // handover settles asynchronously.
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus into the panel when opened, Tab reaches the actions', async () => {
    const user = userEvent.setup();
    render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(getPanel()).toHaveFocus();

    // panel (tabindex -1) → Cancel → OK
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });

  it('confirms on Enter at the panel level and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Popconfirm title='Sure?' onConfirm={onConfirm} onCancel={onCancel}>
        Trigger
      </Popconfirm>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('confirms through the OK button click', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Popconfirm title='Sure?' onConfirm={onConfirm}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cancels through the Cancel button click', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<Popconfirm title='Sure?' onCancel={onCancel}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cancels on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<Popconfirm title='Sure?' onCancel={onCancel}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.tab();
    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('cancels on Escape from the trigger while open (Shift+Tab edge)', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<Popconfirm title='Sure?' onCancel={onCancel}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.tab();
    await user.keyboard('{Enter}');
    await user.tab({ shift: true });
    expect(trigger).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('runs the async confirm through the OK button busy phase, closing on resolve', async () => {
    const user = userEvent.setup();
    let resolveConfirm: () => void = () => undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        })
    );
    render(<Popconfirm title='Sure?' onConfirm={onConfirm}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.click(trigger);

    const ok = screen.getByRole('button', { name: 'Confirm' });
    await user.click(ok);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    // Busy phase: disabled + aria-busy (Button loading contract), panel stays
    expect(ok).toBeDisabled();
    expect(ok).toHaveAttribute('aria-busy', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    act(() => resolveConfirm());
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    );
    expect(trigger).toHaveFocus();
  });

  it('keeps the panel open when an async confirm rejects, lifting busy', async () => {
    const user = userEvent.setup();
    let rejectConfirm: (reason: unknown) => void = () => undefined;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectConfirm = reject;
        })
    );
    render(<Popconfirm title='Sure?' onConfirm={onConfirm}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.click(trigger);
    const ok = screen.getByRole('button', { name: 'Confirm' });
    await user.click(ok);
    expect(ok).toBeDisabled();

    act(() => rejectConfirm(new Error('nope')));
    await waitFor(() => expect(ok).not.toBeDisabled());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('runs the async cancel through the cancel button busy phase', async () => {
    const user = userEvent.setup();
    let resolveCancel: () => void = () => undefined;
    const onCancel = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCancel = resolve;
        })
    );
    render(<Popconfirm title='Sure?' onCancel={onCancel}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await user.click(trigger);

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancel);
    expect(cancel).toBeDisabled();
    expect(cancel).toHaveAttribute('aria-busy', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    act(() => resolveCancel());
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    );
  });

  it('does not open a disabled trigger by click or keyboard', async () => {
    const user = userEvent.setup();
    render(
      <Popconfirm title='Sure?' disabled>
        Trigger
      </Popconfirm>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).toHaveAttribute('tabindex', '-1');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('drives a controlled open control', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open via control
          </button>
          <Popconfirm title="Sure?" open={openCtrl}>
            Trigger
          </Popconfirm>
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('button', { name: 'Open via control' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The engine writes the trigger toggle through to the control
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies className to the panel', () => {
    render(
      <Popconfirm title='Sure?' className='custom'>
        Trigger
      </Popconfirm>
    );
    expect(getPanel()).toHaveClass('custom');
  });

  it('forwards native props onto the panel', () => {
    render(
      <Popconfirm title='Sure?' data-testid='pc-panel' data-flag='on'>
        Trigger
      </Popconfirm>
    );
    const panel = getPanel();
    expect(panel).toHaveAttribute('data-testid', 'pc-panel');
    expect(panel).toHaveAttribute('data-flag', 'on');
  });

  it('marks every structural part with its data-slot', () => {
    const { container } = render(
      <Popconfirm
        title='Sure?'
        description='Explains the stakes.'
        icon={<svg data-testid='glyph' />}
      >
        Trigger
      </Popconfirm>
    );
    expect(container.querySelector("[data-slot='popconfirm']")).not.toBeNull();
    expect(container.querySelector("[data-slot='trigger']")).not.toBeNull();
    expect(screen.getByText('Sure?')).toHaveAttribute('data-slot', 'title');
    expect(screen.getByText('Explains the stakes.')).toHaveAttribute(
      'data-slot',
      'description'
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute(
      'data-slot',
      'ok'
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'data-slot',
      'cancel'
    );
    const actions = container.querySelector("[data-slot='actions']");
    expect(actions).not.toBeNull();
    expect(actions).toContainElement(screen.getByRole('button', { name: 'Confirm' }));
    const icon = container.querySelector("[data-slot='icon']");
    expect(icon).toContainElement(screen.getByTestId('glyph'));
  });

  it('applies placement classes to the panel', () => {
    const { unmount } = render(
      <Popconfirm title='Sure?' placement='top'>
        Trigger
      </Popconfirm>
    );
    const topPanel = getPanel();
    unmount();

    render(
      <Popconfirm title='Sure?' placement='bottom'>
        Trigger
      </Popconfirm>
    );
    const bottomPanel = getPanel();
    expect(topPanel.className).not.toBe(bottomPanel.className);
  });

  it('recolors the OK button for okVariant danger', () => {
    const { unmount } = render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    const primaryOk = screen.getByRole('button', { name: 'Confirm' });
    unmount();

    render(
      <Popconfirm title='Sure?' okVariant='danger'>
        Trigger
      </Popconfirm>
    );
    const dangerOk = screen.getByRole('button', { name: 'Confirm' });
    // The danger class is appended after the shared skin classes
    expect(dangerOk.className.startsWith(primaryOk.className)).toBe(true);
    expect(dangerOk.className).not.toBe(primaryOk.className);
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Popconfirm title='Delete this item?' description='This cannot be undone.'>
        Trigger
      </Popconfirm>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(
      <Popconfirm title='Delete this item?' description='This cannot be undone.'>
        Trigger
      </Popconfirm>
    );
    await user.click(screen.getByRole('button', { name: 'Trigger' }));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('Popconfirm imperative handle', () => {
  it('opens and closes through the handle', () => {
    const ref = createRef<PopconfirmHandle>();
    render(
      <Popconfirm ref={ref} title='Sure?'>
        Trigger
      </Popconfirm>
    );
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    act(() => ref.current!.open());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    act(() => ref.current!.close());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('respects disabled through handle.open', () => {
    const ref = createRef<PopconfirmHandle>();
    render(
      <Popconfirm ref={ref} title='Sure?' disabled>
        Trigger
      </Popconfirm>
    );
    act(() => ref.current!.open());
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('focuses the trigger through focusTrigger()', () => {
    const ref = createRef<PopconfirmHandle>();
    render(
      <>
        <button type="button">Elsewhere</button>
        <Popconfirm ref={ref} title='Sure?'>
          Trigger
        </Popconfirm>
      </>
    );
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    elsewhere.focus();
    expect(elsewhere).toHaveFocus();

    act(() => ref.current!.focusTrigger());
    expect(trigger).toHaveFocus();
  });
});

// jsdom implements neither the Popover API nor ToggleEvent; polyfill the
// minimal surface the component relies on (same approach as Popover's
// tests) to exercise the native path.
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

describe('Popconfirm (native popover API)', () => {
  beforeEach(() => {
    installNativePopover();
  });

  afterEach(() => {
    removeNativePopover();
    vi.restoreAllMocks();
  });

  it('renders the panel as a popover=auto element', () => {
    render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    expect(getPanel()).toHaveAttribute('popover', 'auto');
  });

  it('drives showPopover from state and moves focus into the panel', async () => {
    const user = userEvent.setup();
    render(<Popconfirm title='Sure?'>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });

    await user.click(trigger);
    expect(showPopoverMock).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(getPanel()).toHaveFocus();
  });

  it('closes through hidePopover on confirm (animated exit handover)', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Popconfirm title='Sure?' onConfirm={onConfirm}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });

    await user.click(trigger);
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();
    // jsdom's UA sheet hides [popover]:not(:popover-open) via
    // display:none even while the panel is logically open (the mock
    // has no :popover-open state machine), so the role query needs
    // hidden:true to see into the subtree.
    await user.click(
      screen.getByRole('button', { name: 'Confirm', hidden: true })
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
    // Animated exit: hidePopover is deferred until the exit animation
    // settles — immediate in jsdom (no CSS durations), but still across
    // the double rAF of whenExitSettles, hence waitFor.
    await waitFor(() => expect(hidePopoverMock).toHaveBeenCalledTimes(1));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('syncs a browser-side light-dismiss close back to state without onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<Popconfirm title='Sure?' onCancel={onCancel}>Trigger</Popconfirm>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    // user.click (not fireEvent): a real click focuses the trigger
    // first, which is what the focus-return contract keys off.
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Browser closes the popover without React (light dismiss on an
    // outside pointerdown); Escape in-panel never reaches this path
    // because the panel's own handler prevents the default close.
    act(() => {
      getPanel().dispatchEvent(
        new ToggleEventPolyfill('toggle', { newState: 'closed' })
      );
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onCancel).not.toHaveBeenCalled();
    // Focus was inside the panel: the close hands it back to the trigger
    expect(trigger).toHaveFocus();
  });
});
