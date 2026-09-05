import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(<ConfirmDialog open>Are you sure?</ConfirmDialog>);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<ConfirmDialog open title="Confirm Action">Body</ConfirmDialog>);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('has dialog role with aria-modal and labels itself via the title', () => {
    render(<ConfirmDialog open title="Confirm Action">Body</ConfirmDialog>);
    const dialog = screen.getByRole('dialog', { name: 'Confirm Action' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
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

  it('unmounts after the exit settles when confirmed', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog open>Body</ConfirmDialog>);
    await user.click(screen.getByText('Confirm'));
    // Presence 退场跨 rAF，jsdom 无 CSS 时长也需异步等待卸载
    await waitFor(() =>
      expect(screen.queryByText('Body')).not.toBeInTheDocument()
    );
  });

  it('closes on overlay click after the exit settles', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ConfirmDialog open onClose={onClose}>Body</ConfirmDialog>);
    await user.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText('Body')).not.toBeInTheDocument()
    );
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog open onClose={onClose}>
        Body
      </ConfirmDialog>
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByText('Body')).not.toBeInTheDocument()
    );
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
    await waitFor(() =>
      expect(screen.queryByText('Body')).not.toBeInTheDocument()
    );
  });

  it('traps Tab focus within the dialog', () => {
    render(<ConfirmDialog open>Body</ConfirmDialog>);
    const cancel = screen.getByText('Cancel');
    const confirm = screen.getByText('Confirm');
    confirm.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(confirm).toHaveFocus();
  });

  it('applies className', () => {
    const { container } = render(<ConfirmDialog open className="custom">Body</ConfirmDialog>);
    expect(container.firstChild).toHaveClass('custom');
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
