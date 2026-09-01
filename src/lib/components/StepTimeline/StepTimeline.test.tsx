import { render, screen } from '@testing-library/react';

import StepTimeline, { StepTimelineItem } from './StepTimeline';

describe('StepTimeline', () => {
  it('renders children', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" />
      </StepTimeline>,
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<StepTimeline className="custom"><StepTimelineItem label="S" /></StepTimeline>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders multiple items', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" />
        <StepTimelineItem label="Step 2" />
        <StepTimelineItem label="Step 3" />
      </StepTimeline>,
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" description="Details here" />
      </StepTimeline>,
    );
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('renders done status with checkmark', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Done" status="done" />
      </StepTimeline>,
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error status with exclamation', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Error" status="error" />
      </StepTimeline>,
    );
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('applies className to item', () => {
    render(<StepTimelineItem label="S" className="custom" />);
    expect(screen.getByText('S').closest('[class*="custom"]')).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" status="done" />
        <StepTimelineItem label="Step 2" status="active" description="In progress" />
        <StepTimelineItem label="Step 3" status="error" description="Failed" />
      </StepTimeline>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
