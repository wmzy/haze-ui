import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { confirm } from './confirm';

describe('confirm()', () => {
  it('mounts a dialog into document.body', async () => {
    const pending = confirm({ title: 'Delete?', children: 'This cannot be undone.' });
    expect(await screen.findByRole('dialog', { name: 'Delete?' })).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    // settle so the promise/host cleanup doesn't leak across tests
    const user = userEvent.setup();
    await user.click(screen.getByText('Cancel'));
    expect(await pending).toBe(false);
  });

  it('resolves true on confirm and false on cancel', async () => {
    const user = userEvent.setup();
    const okPending = confirm({ children: 'go?' });
    await user.click(await screen.findByText('Confirm'));
    await expect(okPending).resolves.toBe(true);

    const noPending = confirm({ children: 'really?' });
    await user.click(await screen.findByText('Cancel'));
    await expect(noPending).resolves.toBe(false);
  });

  it('invokes onConfirm / onCancel callbacks', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const first = confirm({ children: 'one', onConfirm });
    await user.click(await screen.findByText('Confirm'));
    await first;
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();

    const second = confirm({ children: 'two', onCancel });
    await user.click(await screen.findByText('Cancel'));
    await second;
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('unmounts the host element after settle', async () => {
    const user = userEvent.setup();
    expect(document.querySelectorAll('[data-haze-confirm-host]')).toHaveLength(0);
    const pending = confirm({ children: 'gone soon' });
    await screen.findByText('gone soon');
    await user.click(screen.getByText('Confirm'));
    await pending;
    expect(document.querySelectorAll('[data-haze-confirm-host]')).toHaveLength(0);
  });
});
