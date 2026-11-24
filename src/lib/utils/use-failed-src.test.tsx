import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFailedSrc } from './use-failed-src';

/** Drives the hook through its public surface: `failed` is echoed into a
 * status line, `markFailed` sits behind a button. */
function Probe({ src }: { src?: string }) {
  const [failed, markFailed] = useFailedSrc(src);
  return (
    <>
      <output data-testid='status'>{failed ? 'failed' : 'ok'}</output>
      <button type='button' onClick={markFailed}>
        mark-failed
      </button>
    </>
  );
}

describe('useFailedSrc', () => {
  it('reports no failure until a source is marked', () => {
    render(<Probe src='a.png' />);
    expect(screen.getByTestId('status')).toHaveTextContent('ok');
  });

  it('fails the marked src, recovers on a src change and fails the new src again', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Probe src='a.png' />);
    await user.click(screen.getByRole('button', { name: 'mark-failed' }));
    expect(screen.getByTestId('status')).toHaveTextContent('failed');

    // The failure is keyed to the exact address, never a sticky boolean:
    // a changed src is healthy again.
    rerender(<Probe src='b.png' />);
    expect(screen.getByTestId('status')).toHaveTextContent('ok');

    // Failing the new src brings the fallback back.
    await user.click(screen.getByRole('button', { name: 'mark-failed' }));
    expect(screen.getByTestId('status')).toHaveTextContent('failed');
  });

  it('never reports an undefined src as failed', async () => {
    const user = userEvent.setup();
    render(<Probe />);
    await user.click(screen.getByRole('button', { name: 'mark-failed' }));
    expect(screen.getByTestId('status')).toHaveTextContent('ok');
  });
});
