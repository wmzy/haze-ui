import { render, screen } from '@testing-library/react';

import Plan, { PlanItem } from './Plan';

describe('Plan', () => {
  it('renders title and items', () => {
    render(
      <Plan title='Deployment plan'>
        <PlanItem label='Build' status='done' />
        <PlanItem label='Deploy' />
      </Plan>,
    );
    expect(screen.getByText('Deployment plan')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders list semantics', () => {
    render(
      <Plan>
        <PlanItem label='A' />
      </Plan>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders item descriptions', () => {
    render(
      <Plan>
        <PlanItem label='A' description='Details here' />
      </Plan>,
    );
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('computes progress from item statuses', () => {
    render(
      <Plan>
        <PlanItem label='A' status='done' />
        <PlanItem label='B' status='done' />
        <PlanItem label='C' status='active' />
      </Plan>,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('does not count skipped or errored items as done', () => {
    render(
      <Plan>
        <PlanItem label='A' status='skipped' />
        <PlanItem label='B' status='error' />
      </Plan>,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '2');
  });

  it('renders a custom summary via the summary prop', () => {
    render(
      <Plan summary={(done, total) => `${done} of ${total} steps complete`}>
        <PlanItem label='A' status='done' />
        <PlanItem label='B' />
      </Plan>,
    );
    expect(screen.getByText('1 of 2 steps complete')).toBeInTheDocument();
  });

  it('hides the progress UI when there are no items', () => {
    render(<Plan title='Empty' />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders per-status indicators', () => {
    render(
      <Plan>
        <PlanItem label='Pending' status='pending' />
        <PlanItem label='Active' status='active' />
        <PlanItem label='Done' status='done' />
        <PlanItem label='Error' status='error' />
        <PlanItem label='Skipped' status='skipped' />
      </Plan>,
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
    // indicator glyphs are decorative
    expect(screen.getByText('✓').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('applies className to root and item', () => {
    render(
      <Plan className='custom-root'>
        <PlanItem label='A' className='custom-item' />
      </Plan>,
    );
    expect(screen.getByRole('list').parentElement).toHaveClass('custom-root');
    expect(screen.getByRole('listitem')).toHaveClass('custom-item');
  });

  it('forwards native props to root and item', () => {
    render(
      <Plan data-testid='plan-root'>
        <PlanItem label='A' id='step-1' />
      </Plan>,
    );
    expect(screen.getByTestId('plan-root')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveAttribute('id', 'step-1');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Plan title='Deployment plan'>
        <PlanItem label='Build' description='Compiled' status='done' />
        <PlanItem label='Test' description='Running' status='active' />
        <PlanItem label='Deploy' status='pending' />
        <PlanItem label='Notify' status='skipped' />
        <PlanItem label='Rollback' description='Failed' status='error' />
      </Plan>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
