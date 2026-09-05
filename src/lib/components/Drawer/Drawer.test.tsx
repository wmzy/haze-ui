import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { useControl } from 'react-use-control';

import Drawer from './Drawer';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('Drawer', () => {
  it('renders a dialog element', () => {
    render(<Drawer>Content</Drawer>);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Drawer open>Drawer body</Drawer>);
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Drawer className="custom">Content</Drawer>);
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass('custom');
  });

  it('reflects open state via data-state', () => {
    render(<Drawer open>Drawer body</Drawer>);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
  });

  it('calls onClose when dialog fires close event', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close', { bubbles: false }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when clicking backdrop', async () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // backdrop 点击只 setOpen(false)；onClose 由 effect 中 el.close() 触发
    // 的原生 close 事件统一发出——退场跨 rAF，异步等待。
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('prevents native cancel and closes through the animated path on Esc', async () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const drawer = screen.getByRole<HTMLDialogElement>('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      drawer.dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('keeps the drawer open during the exit and closes it after it settles', async () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const drawer = screen.getByRole<HTMLDialogElement>('dialog');
    expect(drawer).toHaveAttribute('open');
    act(() => {
      fireEvent.click(drawer);
    });
    expect(drawer).toHaveAttribute('data-state', 'closed');
    expect(drawer).toHaveAttribute('open');
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves initial focus into the drawer when opened', () => {
    function Harness() {
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open drawer</button>
          <Drawer open={openCtrl}>
            <button type="button">Inner</button>
          </Drawer>
        </>
      );
    }
    render(<Harness />);
    act(() => {
      fireEvent.click(screen.getByText('Open drawer'));
    });
    expect(screen.getByText('Inner')).toHaveFocus();
  });

  it('restores focus to the opener when the drawer closes', () => {
    function Harness() {
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open drawer</button>
          <Drawer open={openCtrl} onClose={() => setOpen(false)}>
            <button type="button">Inner</button>
          </Drawer>
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByText('Open drawer');
    opener.focus();
    act(() => {
      fireEvent.click(opener);
    });
    act(() => {
      screen.getByText('Inner').focus();
    });
    expect(screen.getByText('Inner')).toHaveFocus();
    const drawer = screen.getByRole('dialog');
    act(() => {
      drawer.dispatchEvent(new Event('close'));
    });
    expect(opener).toHaveFocus();
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Drawer open>
        <p>Drawer body</p>
      </Drawer>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
