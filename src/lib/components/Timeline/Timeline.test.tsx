import { render, screen } from '@testing-library/react';

import { Timeline, TimelineItem } from './index';

describe('Timeline', () => {
  it('renders items', () => {
    render(
      <Timeline>
        <TimelineItem title="Step 1" />
        <TimelineItem title="Step 2" />
      </Timeline>
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('applies className to Timeline', () => {
    const { container } = render(
      <Timeline className="custom">
        <TimelineItem title="Event" />
      </Timeline>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders description', () => {
    render(
      <Timeline>
        <TimelineItem title="Event" description="Details here" />
      </Timeline>
    );
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('renders time', () => {
    render(
      <Timeline>
        <TimelineItem title="Event" time="2024-01-01" />
      </Timeline>
    );
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('applies className to TimelineItem', () => {
    render(
      <Timeline>
        <TimelineItem title="Event" className="custom" />
      </Timeline>
    );
    expect(screen.getByText('Event').parentElement?.parentElement).toHaveClass('custom');
  });
});
