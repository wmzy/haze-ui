import type { MockInstance } from 'vitest';

import { render, screen, fireEvent } from '@testing-library/react';
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
    await user.click(filterBtns[0]!); // click the filter button, not the badge
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.queryByText('Started')).not.toBeInTheDocument();
  });

  it('shows all logs with All filter', async () => {
    const user = userEvent.setup();
    render(<LogViewer logs={logs} />);
    const filterBtns = screen.getAllByText('error');
    await user.click(filterBtns[0]!);
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

  describe('onLoadMore', () => {
    // The end-reached check reads the body's scroll metrics during the
    // mount effect, before the element is reachable from the test — so
    // they are mocked on the prototype (the VirtualList reverse-suite
    // pattern). jsdom's clientHeight stays 0 without the spy.
    let scrollHeightSpy: MockInstance;
    let clientHeightSpy: MockInstance;

    beforeEach(() => {
      scrollHeightSpy = vi
        .spyOn(Element.prototype, 'scrollHeight', 'get')
        .mockReturnValue(4000);
      clientHeightSpy = vi
        .spyOn(Element.prototype, 'clientHeight', 'get')
        .mockReturnValue(400);
    });

    afterEach(() => {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    });

    it('calls onLoadMore when the body scrolls within 200px of its end', () => {
      const onLoadMore = vi.fn();
      const { container } = render(
        <LogViewer logs={logs} onLoadMore={onLoadMore} />,
      );
      const body = container.querySelector<HTMLElement>(
        '[data-slot="body"]',
      )!;
      // 4000 total − 400 port − 200 threshold: offset 3399 is 1px short
      // of the zone, 3400 lands exactly on its boundary.
      body.scrollTop = 3399;
      fireEvent.scroll(body);
      expect(onLoadMore).not.toHaveBeenCalled();
      body.scrollTop = 3400;
      fireEvent.scroll(body);
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      // Staying inside the zone does not re-fire.
      body.scrollTop = 3500;
      fireEvent.scroll(body);
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('re-arms on scroll-out and re-fires on growth while still in-zone', () => {
      const onLoadMore = vi.fn();
      const { container, rerender } = render(
        <LogViewer logs={logs} onLoadMore={onLoadMore} />,
      );
      const body = container.querySelector<HTMLElement>(
        '[data-slot="body"]',
      )!;
      body.scrollTop = 3400;
      fireEvent.scroll(body);
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      body.scrollTop = 0;
      fireEvent.scroll(body);
      body.scrollTop = 3400;
      fireEvent.scroll(body);
      expect(onLoadMore).toHaveBeenCalledTimes(2);

      // Growth that clears the zone stays silent; growth that leaves the
      // list short fires the next page right away (chain loading).
      scrollHeightSpy.mockReturnValue(500);
      rerender(
        <LogViewer
          logs={[...logs, { level: 'info' as const, message: 'Next page' }]}
          onLoadMore={onLoadMore}
        />,
      );
      expect(onLoadMore).toHaveBeenCalledTimes(3);
    });
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<LogViewer logs={logs} />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
