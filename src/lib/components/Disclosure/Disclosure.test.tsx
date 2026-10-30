import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import Disclosure from './Disclosure';

/** Controlled harness exposing the open state, like a page would. */
function ControlledDisclosure() {
  const [open, setOpen, openCtrl] = useControl(undefined, false);
  return (
    <>
      <Disclosure summary="Summary" open={openCtrl}>
        Content
      </Disclosure>
      <output data-testid="open-state">{String(open)}</output>
      <button type="button" onClick={() => setOpen((prev) => !prev)}>
        External flip
      </button>
    </>
  );
}

function detailsEl() {
  return document.querySelector('details')!;
}

describe('Disclosure', () => {
  it('renders summary and content', () => {
    render(<Disclosure summary="Click to expand">Hidden content</Disclosure>);
    expect(screen.getByText('Click to expand')).toBeInTheDocument();
    expect(screen.getByText('Hidden content')).toBeInTheDocument();
  });

  it('renders as a details element', () => {
    const { container } = render(
      <Disclosure summary="Summary">Content</Disclosure>
    );
    expect(container.querySelector('details')).toBeInTheDocument();
    expect(container.querySelector('summary')).toHaveTextContent('Summary');
  });

  it('is closed by default', () => {
    const { container } = render(
      <Disclosure summary="Summary">Content</Disclosure>
    );
    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });

  it('opens when open prop is true', () => {
    const { container } = render(
      <Disclosure summary="Summary" open>Content</Disclosure>
    );
    expect(container.querySelector('details')?.open).toBe(true);
  });

  it('applies className', () => {
    const { container } = render(
      <Disclosure summary="S" className="custom">C</Disclosure>
    );
    expect(container.querySelector('details')).toHaveClass('custom');
  });

  it('stays closed when open is false', () => {
    const { container } = render(
      <Disclosure summary="S" open={false}>C</Disclosure>
    );
    expect(container.querySelector('details')?.open).toBe(false);
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Disclosure summary="Click to expand">Hidden content</Disclosure>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('toggles open on summary clicks in uncontrolled usage', async () => {
    const user = userEvent.setup();
    render(<Disclosure summary="Summary">Content</Disclosure>);
    await user.click(screen.getByText('Summary'));
    expect(detailsEl().open).toBe(true);
    await user.click(screen.getByText('Summary'));
    expect(detailsEl().open).toBe(false);
  });

  it('writes summary clicks back to the control', async () => {
    const user = userEvent.setup();
    render(<ControlledDisclosure />);
    await user.click(screen.getByText('Summary'));
    expect(screen.getByTestId('open-state')).toHaveTextContent('true');
    expect(detailsEl().open).toBe(true);
    await user.click(screen.getByText('Summary'));
    expect(screen.getByTestId('open-state')).toHaveTextContent('false');
    expect(detailsEl().open).toBe(false);
  });

  it('syncs the DOM when the control changes externally', async () => {
    const user = userEvent.setup();
    render(<ControlledDisclosure />);
    await user.click(screen.getByRole('button', { name: 'External flip' }));
    expect(screen.getByTestId('open-state')).toHaveTextContent('true');
    expect(detailsEl().open).toBe(true);
    await user.click(screen.getByRole('button', { name: 'External flip' }));
    expect(screen.getByTestId('open-state')).toHaveTextContent('false');
    expect(detailsEl().open).toBe(false);
  });

  it('stays in lockstep after a click plus external changes', async () => {
    const user = userEvent.setup();
    render(<ControlledDisclosure />);
    // Open via the summary, then drive externally — no desync where a
    // native attribute flip shadows the controlled value.
    await user.click(screen.getByText('Summary'));
    await user.click(screen.getByRole('button', { name: 'External flip' }));
    expect(screen.getByTestId('open-state')).toHaveTextContent('false');
    expect(detailsEl().open).toBe(false);
  });

  it('forwards native props to the details element', () => {
    render(
      <Disclosure summary="S" data-testid="disclosure" data-section="info" id="d1">
        C
      </Disclosure>
    );
    expect(detailsEl()).toHaveAttribute('data-testid', 'disclosure');
    expect(detailsEl()).toHaveAttribute('data-section', 'info');
    expect(detailsEl()).toHaveAttribute('id', 'd1');
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<Disclosure summary="Click to expand">Hidden content</Disclosure>);
    await user.click(screen.getByText('Click to expand'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
