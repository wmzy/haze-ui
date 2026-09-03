import { render, screen, act, fireEvent } from '@testing-library/react';
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

  it('calls onClose when dialog fires close event', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close', { bubbles: false }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('fires onClose exactly once when clicking the backdrop', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });
    // backdrop 点击只 setOpen(false)；onClose 由 effect 中 el.close() 触发
    // 的原生 close 事件统一发出——修复前 onClick 里会先多调一次。
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fires onClose exactly once on Esc (cancel → close)', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole<HTMLDialogElement>('dialog');
    act(() => {
      // 模拟浏览器 Esc 行为：先 cancel（未阻止则关闭），关闭发出 close
      dialog.dispatchEvent(new Event('cancel'));
      dialog.close();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
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
