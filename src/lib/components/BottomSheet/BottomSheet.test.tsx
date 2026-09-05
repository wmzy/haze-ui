import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import BottomSheet from './BottomSheet';

describe('BottomSheet', () => {
  it('renders when open', () => {
    render(<BottomSheet open>Content</BottomSheet>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<BottomSheet>Content</BottomSheet>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<BottomSheet open className="custom">Content</BottomSheet>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('has dialog role with aria-modal', () => {
    render(<BottomSheet open aria-label="Actions">Content</BottomSheet>);
    expect(screen.getByRole('dialog', { name: 'Actions' })).toHaveAttribute(
      'aria-modal',
      'true'
    );
  });

  it('closes on overlay click after the exit settles', async () => {
    const user = userEvent.setup();
    render(<BottomSheet open>Content</BottomSheet>);
    const overlay = screen.getByText('Content').closest('[class]')?.parentElement;
    if (overlay) await user.click(overlay);
    // Presence 退场跨 rAF，jsdom 无 CSS 时长也需异步等待卸载
    await waitFor(() =>
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    );
  });

  it('does not close on content click', async () => {
    const user = userEvent.setup();
    render(<BottomSheet open>Content</BottomSheet>);
    await user.click(screen.getByText('Content'));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    );
  });

  it('moves initial focus into the sheet when opened', () => {
    render(
      <BottomSheet open>
        <button type="button">Sheet action</button>
      </BottomSheet>
    );
    expect(screen.getByText('Sheet action')).toHaveFocus();
  });

  it('restores focus to the opener when closed', async () => {
    function Harness() {
      const [, setOpen, openCtrl] = useControl(undefined, false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open sheet</button>
          <BottomSheet open={openCtrl} onClose={() => setOpen(false)}>
            <button type="button">Sheet action</button>
          </BottomSheet>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByText('Open sheet');
    await user.click(opener);
    expect(screen.getByText('Sheet action')).toHaveFocus();
    await user.click(screen.getByRole('dialog').parentElement!);
    expect(opener).toHaveFocus();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('traps Tab focus within the sheet', () => {
    render(
      <BottomSheet open>
        <button type="button">First</button>
        <button type="button">Last</button>
      </BottomSheet>
    );
    const first = screen.getByText('First');
    const last = screen.getByText('Last');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    render(
      <BottomSheet open aria-label="Actions">
        <h2>Sheet title</h2>
        <p>Sheet content</p>
      </BottomSheet>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
