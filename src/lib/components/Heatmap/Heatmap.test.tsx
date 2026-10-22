import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import Heatmap from './Heatmap';

// One aligned week: Sun 2026-01-04 .. Sat 2026-01-10 (Jan 1 2026 is a
// Thursday) — the grid is exactly 7 cells, no alignment padding.
const WEEK = { startDate: '2026-01-04', endDate: '2026-01-10' };

const cell = (
  container: ReturnType<typeof render>['container'],
  date: string
): HTMLElement => container.querySelector(`[data-date='${date}']`)!;

describe('Heatmap', () => {
  it('renders role img named by summary', () => {
    render(<Heatmap {...WEEK} data={[]} summary='Q1 activity' />);
    expect(screen.getByRole('img', { name: 'Q1 activity' })).toBeInTheDocument();
  });

  it('falls back to a default summary', () => {
    render(<Heatmap {...WEEK} data={[]} />);
    expect(
      screen.getByRole('img', { name: 'Activity heatmap' })
    ).toBeInTheDocument();
  });

  it('bins values into data-level against the max (levels default 4)', () => {
    const { container } = render(
      <Heatmap
        {...WEEK}
        data={[
          { date: '2026-01-05', value: 4 }, // max → 4
          { date: '2026-01-06', value: 2 }, // ceil(0.5·4) → 2
          { date: '2026-01-07', value: 1 }, // ceil(0.25·4) → 1
          { date: '2026-01-08', value: 3 }, // → 3
          { date: '2026-01-09', value: 0 }, // no activity → 0
        ]}
      />
    );
    expect(cell(container, '2026-01-05')).toHaveAttribute('data-level', '4');
    expect(cell(container, '2026-01-06')).toHaveAttribute('data-level', '2');
    expect(cell(container, '2026-01-07')).toHaveAttribute('data-level', '1');
    expect(cell(container, '2026-01-08')).toHaveAttribute('data-level', '3');
    expect(cell(container, '2026-01-09')).toHaveAttribute('data-level', '0');
  });

  it('drives the color mix from the bin (100% primary at the top level)', () => {
    const { container } = render(
      <Heatmap
        {...WEEK}
        data={[
          { date: '2026-01-05', value: 4 },
          { date: '2026-01-06', value: 2 },
        ]}
      />
    );
    expect(cell(container, '2026-01-05').style.getPropertyValue('--haze-heatmap-mix')).toBe('100%');
    expect(cell(container, '2026-01-06').style.getPropertyValue('--haze-heatmap-mix')).toBe('50%');
  });

  it('marks dates without data as level 0', () => {
    const { container } = render(
      <Heatmap {...WEEK} data={[{ date: '2026-01-05', value: 2 }]} />
    );
    expect(cell(container, '2026-01-04')).toHaveAttribute('data-level', '0');
    expect(cell(container, '2026-01-10')).toHaveAttribute('data-level', '0');
  });

  it('renders every cell at level 0 for empty data', () => {
    const { container } = render(<Heatmap {...WEEK} data={[]} />);
    const cells = container.querySelectorAll("[data-slot='cell']");
    expect(cells).toHaveLength(7);
    expect(
      Array.from(cells).every((el) => el.getAttribute('data-level') === '0')
    ).toBe(true);
  });

  it('supports a custom levels count', () => {
    const { container } = render(
      <Heatmap
        {...WEEK}
        levels={2}
        data={[
          { date: '2026-01-05', value: 4 }, // max → 2
          { date: '2026-01-06', value: 2 }, // ceil(0.5·2) → 1
          { date: '2026-01-07', value: 3 }, // ceil(0.75·2) → 2
        ]}
      />
    );
    expect(cell(container, '2026-01-05')).toHaveAttribute('data-level', '2');
    expect(cell(container, '2026-01-06')).toHaveAttribute('data-level', '1');
    expect(cell(container, '2026-01-07')).toHaveAttribute('data-level', '2');
  });

  it('accepts the Record data shape', () => {
    const { container } = render(
      <Heatmap {...WEEK} data={{ '2026-01-05': 3 }} />
    );
    expect(cell(container, '2026-01-05')).toHaveAttribute('data-level', '4');
  });

  it('renders month labels for the covered months', () => {
    const { container } = render(
      <Heatmap
        startDate='2026-01-01'
        endDate='2026-03-31'
        data={[{ date: '2026-02-15', value: 1 }]}
      />
    );
    const months = container.querySelectorAll("[data-slot='month']");
    const labels = Array.from(months).map((el) => el.textContent);
    expect(labels).toContain('Jan');
    expect(labels).toContain('Feb');
    expect(labels).toContain('Mar');
  });

  it('renders weekday labels and honors getWeekdayLabel', () => {
    const withDefaults = render(<Heatmap {...WEEK} data={[]} />);
    expect(
      Array.from(
        withDefaults.container.querySelectorAll("[data-slot='weekday']")
      ).map((el) => el.textContent)
    ).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    withDefaults.unmount();

    const { container } = render(
      <Heatmap
        {...WEEK}
        data={[]}
        getWeekdayLabel={(weekday) => (weekday === 1 ? '周一' : '')}
      />
    );
    expect(
      Array.from(container.querySelectorAll("[data-slot='weekday']")).map(
        (el) => el.textContent
      )
    ).toEqual(['', '周一', '', '', '', '', '']);
  });

  it('labels cells through getLabel (title tooltip)', () => {
    const { container } = render(
      <Heatmap
        {...WEEK}
        data={[{ date: '2026-01-05', value: 3 }]}
        getLabel={({ date, value }) => `${value} 条动态 ${date}`}
      />
    );
    expect(cell(container, '2026-01-05')).toHaveAttribute(
      'title',
      '3 条动态 2026-01-05'
    );
  });

  it('uses getMonthLabel for the header', () => {
    const { container } = render(
      <Heatmap
        startDate='2026-01-01'
        endDate='2026-01-31'
        data={[]}
        getMonthLabel={(month) => `${month + 1}月`}
      />
    );
    const labels = Array.from(
      container.querySelectorAll("[data-slot='month']")
    ).map((el) => el.textContent);
    expect(labels).toContain('1月');
  });

  it('applies className and classNames slots', () => {
    const { container } = render(
      <Heatmap
        {...WEEK}
        data={[{ date: '2026-01-05', value: 1 }]}
        className='c-root'
        classNames={{
          root: 's-root',
          month: 's-month',
          weekday: 's-weekday',
          cell: 's-cell',
        }}
      />
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('c-root');
    expect(root).toHaveClass('s-root');
    expect(container.querySelector("[data-slot='month']")).toHaveClass('s-month');
    expect(container.querySelector("[data-slot='weekday']")).toHaveClass('s-weekday');
    expect(cell(container, '2026-01-05')).toHaveClass('s-cell');
  });

  it('forwards ref to the grid root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Heatmap ref={ref} {...WEEK} data={[]} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-slot', 'heatmap');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const options = { rules: { region: { enabled: false } } };
    const { unmount } = render(
      <Heatmap
        startDate='2026-01-01'
        endDate='2026-02-28'
        summary='January and February activity'
        data={[
          { date: '2026-01-05', value: 3 },
          { date: '2026-02-10', value: 1 },
        ]}
      />
    );
    const results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
    unmount();
  });
});
