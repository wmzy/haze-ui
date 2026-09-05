import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { useControl } from 'react-use-control';

import Dialog from './Dialog';

beforeEach(() => {
  // jsdom does not implement showModal/close for HTMLDialogElement
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

describe('Dialog', () => {
  it('renders a dialog element', () => {
    render(<Dialog>Content</Dialog>);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Dialog open>Dialog body</Dialog>);
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Dialog className="custom">Content</Dialog>);
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass('custom');
  });

  it('reflects open state via data-state', () => {
    render(<Dialog open>Dialog body</Dialog>);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
  });

  it('calls onClose when dialog fires close event', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close', { bubbles: false }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('fires onClose exactly once when clicking the backdrop', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });
    // backdrop 点击只 setOpen(false)；onClose 由 effect 中 el.close() 触发
    // 的原生 close 事件统一发出——退场跨 rAF，异步等待。
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('prevents native cancel and closes through the animated path on Esc', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      // 模拟浏览器 Esc 行为：先发 cancel 请求关闭
      dialog.dispatchEvent(cancel);
    });
    // 原生立即关闭被拦截，统一改走 React 状态 → 退场动画 → el.close()
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('fires onClose exactly once on programmatic close()', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    act(() => {
      dialog.close();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog open during the exit and closes it after it settles', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    expect(dialog).toHaveAttribute('open');
    act(() => {
      fireEvent.click(dialog);
    });
    // 状态已翻 closed，但退场期间 open 属性保留（等待 whenExitSettles）
    expect(dialog).toHaveAttribute('data-state', 'closed');
    expect(dialog).toHaveAttribute('open');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('labels the dialog via aria-labelledby when title is set', () => {
    render(
      <Dialog open title="Confirm action">
        Content
      </Dialog>
    );
    const heading = screen.getByRole('heading', { name: 'Confirm action' });
    expect(heading.tagName).toBe('H2');
    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      heading.id
    );
  });

  it('does not set aria-labelledby without a title', () => {
    render(<Dialog open>Content</Dialog>);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
  });

  it('moves initial focus into the dialog when opened', () => {
    function Harness() {
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open dialog</button>
          <Dialog open={openCtrl}>
            <button type="button">Inner</button>
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    act(() => {
      fireEvent.click(screen.getByText('Open dialog'));
    });
    expect(screen.getByText('Inner')).toHaveFocus();
  });

  it('restores focus to the opener when the dialog closes', () => {
    function Harness() {
      // Dialog 的 open 传 Control 才是受控语义（普通 boolean 只是初值）
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open dialog</button>
          <Dialog open={openCtrl} onClose={() => setOpen(false)}>
            <button type="button">Inner</button>
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByText('Open dialog');
    opener.focus();
    act(() => {
      fireEvent.click(opener);
    });
    // showModal 在真实浏览器会把焦点移进 dialog；jsdom 不会，手动模拟，
    // 这样下面的断言才真正验证“归还”而不是焦点从未离开。
    act(() => {
      screen.getByText('Inner').focus();
    });
    expect(screen.getByText('Inner')).toHaveFocus();
    // Esc/cancel、backdrop 点击、close() 都以原生 close 事件收口
    // （先取引用：关闭后 dialog 隐藏，getByRole 查不到了）
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close'));
    });
    expect(opener).toHaveFocus();
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Dialog open title="Confirm action">
        <p>Dialog body</p>
      </Dialog>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
