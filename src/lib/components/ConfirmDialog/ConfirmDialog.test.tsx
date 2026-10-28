import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import ConfirmDialog from './ConfirmDialog';

beforeEach(() => {
  // jsdom does not implement showModal/close for HTMLDialogElement (same
  // stub shape as Dialog.test.tsx: showModal sets the open attribute,
  // close removes it and dispatches the native close event).
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(<ConfirmDialog open>Are you sure?</ConfirmDialog>);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<ConfirmDialog open title="Confirm Action">Body</ConfirmDialog>);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('is a native modal dialog labeling itself via the title', () => {
    render(<ConfirmDialog open title="Confirm Action">Body</ConfirmDialog>);
    const dialog = screen.getByRole('dialog', { name: 'Confirm Action' });
    expect(dialog.tagName).toBe('DIALOG');
    // showModal path: the open attribute is only set by the modal effect
    expect(dialog).toHaveAttribute('open');
  });

  it('renders default button text', () => {
    render(<ConfirmDialog open>Body</ConfirmDialog>);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(<ConfirmDialog open confirmText="Yes" cancelText="No">Body</ConfirmDialog>);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onConfirm={onConfirm}>Body</ConfirmDialog>);
    await user.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmDialog open onCancel={onCancel}>Body</ConfirmDialog>);
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('fires onClose exactly once on confirm, after the exit settles', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ConfirmDialog open onClose={onClose}>Body</ConfirmDialog>);
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    await user.click(screen.getByText('Confirm'));
    // 状态已翻 closed，退场期间 open 属性保留（等待 whenExitSettles）；
    // onClose 由 el.close() 触发的原生 close 事件统一发出
    expect(dialog).toHaveAttribute('data-state', 'closed');
    expect(dialog).toHaveAttribute('open');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click after the exit settles', async () => {
    const onClose = vi.fn();
    render(<ConfirmDialog open onClose={onClose}>Body</ConfirmDialog>);
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    // 真实浏览器里 ::backdrop 上的点击以 dialog 元素自身为 target
    act(() => {
      fireEvent.click(dialog);
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  });

  it('closes through the animated path when Esc requests a cancel', async () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog open onClose={onClose}>
        Body
      </ConfirmDialog>
    );
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      // 模拟浏览器 Esc 行为：先发 cancel 请求关闭
      dialog.dispatchEvent(cancel);
    });
    // 原生立即关闭被拦截，统一改走 React 状态 → 退场动画 → el.close()
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  });

  it('moves initial focus to the first action when opened', () => {
    render(<ConfirmDialog open>Body</ConfirmDialog>);
    expect(screen.getByText('Cancel')).toHaveFocus();
  });

  it('restores focus to the opener when closed', async () => {
    function Harness() {
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open confirm</button>
          <ConfirmDialog open={openCtrl} onClose={() => setOpen(false)}>
            Body
          </ConfirmDialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByText('Open confirm');
    await user.click(opener);
    expect(screen.getByText('Cancel')).toHaveFocus();
    await user.click(screen.getByText('Cancel'));
    expect(opener).toHaveFocus();
  });

  it('applies className to the dialog panel', () => {
    render(<ConfirmDialog open className="custom">Body</ConfirmDialog>);
    expect(screen.getByRole('dialog')).toHaveClass('custom');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ConfirmDialog open title="Confirm Action" onCancel={() => undefined}>
        Are you sure?
      </ConfirmDialog>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
