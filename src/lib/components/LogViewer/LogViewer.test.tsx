import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LogViewer from './LogViewer';

const logs = [
  { level: 'info' as const, message: 'Started', timestamp: '10:00:00' },
  { level: 'error' as const, message: 'Failed', timestamp: '10:00:01' },
  { level: 'debug' as const, message: 'Debug info', timestamp: '10:00:02' },
];

describe('LogViewer', () => {
  it('renders log entries', () => {
    render(<LogViewer logs={logs} />);
    expect(screen.getByText('Started')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<LogViewer logs={[]} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders timestamps', () => {
    render(<LogViewer logs={logs} />);
    expect(screen.getByText('10:00:00')).toBeInTheDocument();
  });

  it('renders level badges', () => {
    const { container } = render(<LogViewer logs={logs} />);
    const badges = container.querySelectorAll('[class*="levelBadge"]');
    expect(badges.length).toBe(3);
  });

  it('filters by level', async () => {
    const user = userEvent.setup();
    render(<LogViewer logs={logs} />);
    const filterBtns = screen.getAllByText('error');
    await user.click(filterBtns[0]); // click the filter button, not the badge
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.queryByText('Started')).not.toBeInTheDocument();
  });

  it('shows all logs with All filter', async () => {
    const user = userEvent.setup();
    render(<LogViewer logs={logs} />);
    const filterBtns = screen.getAllByText('error');
    await user.click(filterBtns[0]);
    await user.click(screen.getByText('All'));
    expect(screen.getByText('Started')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<LogViewer logs={[]} />);
    expect(screen.getByText('No logs')).toBeInTheDocument();
  });

  it('renders logs without timestamp', () => {
    const noTs = [{ level: 'info' as const, message: 'No timestamp' }];
    render(<LogViewer logs={noTs} />);
    expect(screen.getByText('No timestamp')).toBeInTheDocument();
  });
});
