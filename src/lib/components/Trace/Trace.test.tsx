import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useControl } from 'react-use-control';

import Trace, { TraceDetails, TraceItem } from './Trace';

describe('Trace', () => {
  it('renders TraceItem children as lines', () => {
    render(
      <Trace>
        <TraceItem title='Plan' />
        <TraceItem title='Search' />
      </Trace>,
    );
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('applies className and forwards native props to the root', () => {
    render(
      <Trace className='custom' data-testid='trace' aria-label='Reasoning'>
        <TraceItem title='S' />
      </Trace>,
    );
    const root = screen.getByTestId('trace');
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('aria-label', 'Reasoning');
  });
});

describe('TraceItem statuses', () => {
  it('renders the four statuses with data-status markers', () => {
    render(
      <Trace>
        <TraceItem title='Queued' />
        <TraceItem title='Working' status='running' />
        <TraceItem title='Finished' status='done' />
        <TraceItem title='Failed' status='error' />
      </Trace>,
    );
    const statusOf = (text: string) =>
      screen.getByText(text).closest('[data-slot="item"]');
    expect(statusOf('Queued')).toHaveAttribute('data-status', 'pending');
    expect(statusOf('Working')).toHaveAttribute('data-status', 'running');
    expect(statusOf('Finished')).toHaveAttribute('data-status', 'done');
    expect(statusOf('Failed')).toHaveAttribute('data-status', 'error');
    // done/error carry their glyph; pending/running stay glyph-free
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('renders a running marker on the line', () => {
    render(<TraceItem title='Working' status='running' />);
    const itemEl = screen.getByText('Working').closest('[data-slot="item"]');
    expect(itemEl?.querySelector('[data-slot="indicator"]')).toBeTruthy();
  });

  it('renders a custom icon component replacing the status glyph', () => {
    const StarIcon = () => <svg data-testid='star-icon' />;
    render(<TraceItem title='Custom' status='done' icon={StarIcon} />);
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('applies className and forwards native props to the item', () => {
    render(
      <TraceItem title='S' className='custom' data-testid='step' aria-label='Step one' />,
    );
    const root = screen.getByTestId('step');
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('aria-label', 'Step one');
  });
});

describe('TraceItem details disclosure', () => {
  it('wires aria-expanded and aria-controls to the hidden panel', () => {
    render(<TraceItem title='read_file' details='Payload' />);
    const toggle = screen.getByRole('button', { name: 'read_file' });
    const panel = screen.getByText('Payload').closest('[data-slot="panel"]');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', panel?.id);
    expect(panel).toHaveAttribute('hidden');
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(<TraceItem title='read_file' details='Payload' />);
    const toggle = screen.getByRole('button', { name: 'read_file' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Payload')).toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Payload')).not.toBeVisible();
  });

  it('toggles with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<TraceItem title='read_file' details='Payload' />);
    const toggle = screen.getByRole('button', { name: 'read_file' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Payload')).toBeVisible();
    // user-event does not perform the native space-to-click step for
    // buttons (StepTimeline/DropdownMenu precedent): dispatch the UA
    // click by hand after the keydown — the native button needs no key
    // handlers.
    toggle.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
    );
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Payload')).not.toBeVisible();
  });

  it('treats a plain open value as the uncontrolled default', () => {
    render(<TraceItem title='read_file' open details='Payload' />);
    expect(screen.getByRole('button', { name: 'read_file' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Payload')).toBeVisible();
  });

  it('drives a controlled open control and fires onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [, , openCtrl] = useControl(undefined, false);
      return (
        <TraceItem
          title='read_file'
          details='Payload'
          open={openCtrl}
          onOpenChange={onOpenChange}
        />
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole('button', { name: 'read_file' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders no toggle when details is absent', () => {
    render(<TraceItem title='Plain' />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Plain')).toBeInTheDocument();
  });
});

describe('TraceItem status announcements', () => {
  it('exposes a sr-only status live region marked as the live-region slot', () => {
    render(<TraceItem title='Search' />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('data-slot', 'live-region');
  });

  it('announces a running-to-done transition with the title', () => {
    const { rerender } = render(<TraceItem title='Search' status='running' />);
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('');
    rerender(<TraceItem title='Search' status='done' />);
    expect(region).toHaveTextContent('Search: Done');
  });

  it('announces a running-to-error transition', () => {
    const { rerender } = render(<TraceItem title='Build' status='running' />);
    rerender(<TraceItem title='Build' status='error' />);
    expect(screen.getByRole('status')).toHaveTextContent('Build: Error');
  });

  it('announces a step starting', () => {
    const { rerender } = render(<TraceItem title='Search' status='pending' />);
    rerender(<TraceItem title='Search' status='running' />);
    expect(screen.getByRole('status')).toHaveTextContent('Search: Running...');
  });

  it('never rewrites the region while the status holds', () => {
    const { rerender } = render(<TraceItem title='Search' status='running' />);
    rerender(<TraceItem title='Search' status='done' />);
    rerender(<TraceItem title='Search' status='done' />);
    rerender(<TraceItem title='Search' status='done' />);
    expect(screen.getByRole('status')).toHaveTextContent('Search: Done');
  });

  it('stays silent for a step mounted with a terminal status', () => {
    render(<TraceItem title='Search' status='done' />);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('keeps the live region outside the disclosure button', () => {
    render(<TraceItem title='read_file' details='Payload' />);
    expect(screen.getByRole('status').closest('button')).toBeNull();
  });
});

describe('TraceDetails', () => {
  it('renders children with the details slot', () => {
    render(
      <TraceItem
        title='read_file'
        details={<TraceDetails>{'{"path": "src/index.ts"}'}</TraceDetails>}
      />,
    );
    expect(screen.getByText('{"path": "src/index.ts"}')).toHaveAttribute(
      'data-slot',
      'details',
    );
  });

  it('applies className and forwards native props', () => {
    render(
      <TraceDetails className='custom' data-testid='payload'>
        body
      </TraceDetails>,
    );
    const root = screen.getByTestId('payload');
    expect(root).toHaveClass('custom');
  });
});

describe('data-slot coverage', () => {
  it('marks every part with a semantic slot', () => {
    const { container } = render(
      <Trace>
        <TraceItem
          title='read_file'
          status='done'
          details={<TraceDetails>payload</TraceDetails>}
        />
        <TraceItem title='Plain' />
      </Trace>,
    );
    const slots = Array.from(
      container.querySelectorAll('[data-slot]'),
    ).map((el) => el.getAttribute('data-slot'));
    for (const slot of [
      'trace',
      'item',
      'live-region',
      'indicator',
      'title',
      'header',
      'icon',
      'panel',
      'details',
    ]) {
      expect(slots).toContain(slot);
    }
  });
});

describe('axe', () => {
  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const StarIcon = () => <svg data-testid='star-icon' />;
    render(
      <Trace>
        <TraceItem title='Plan' status='done' />
        <TraceItem
          title='read_file'
          status='running'
          icon={StarIcon}
          open
          details={<TraceDetails>{'{"path": "src/lib/index.ts"}'}</TraceDetails>}
        />
        <TraceItem
          title='Validate'
          status='error'
          details={<TraceDetails>schema mismatch</TraceDetails>}
        />
        <TraceItem title='Summarize' />
      </Trace>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
