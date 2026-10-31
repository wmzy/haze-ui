import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { useControl } from 'react-use-control';

import TimeGrid from './TimeGrid';

const radio = (name: string) => screen.getByRole('radio', { name });

describe('TimeGrid', () => {
  it('generates slots from from/to/step (inclusive endpoints)', () => {
    render(<TimeGrid aria-label='Meeting time' from='09:00' to='18:00' step={60} />);
    const slots = screen.getAllByRole('radio');
    expect(slots).toHaveLength(10);
    expect(slots[0]).toHaveTextContent('09:00');
    expect(slots[9]).toHaveTextContent('18:00');
  });

  it('honors a sub-hour step', () => {
    render(<TimeGrid aria-label='Shift' from='09:00' to='10:00' step={30} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(radio('09:30')).toBeInTheDocument();
  });

  it('renders nothing for an empty or malformed window', () => {
    const { container } = render(
      <>
        <TimeGrid aria-label='A' from='18:00' to='09:00' />
        <TimeGrid aria-label='B' from='not-a-time' to='10:00' />
      </>
    );
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('selects on click in uncontrolled mode and notifies onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeGrid aria-label='Pick' from='09:00' to='12:00' onChange={onChange} />
    );
    await user.click(radio('10:00'));
    expect(radio('10:00')).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledWith('10:00');
    await user.click(radio('11:00'));
    expect(radio('11:00')).toHaveAttribute('aria-checked', 'true');
    expect(radio('10:00')).toHaveAttribute('aria-checked', 'false');
  });

  it('treats a plain value prop as the initial uncontrolled selection', () => {
    render(<TimeGrid aria-label='Pick' value='10:00' from='09:00' to='12:00' />);
    expect(radio('10:00')).toHaveAttribute('aria-checked', 'true');
    expect(radio('09:00')).toHaveAttribute('aria-checked', 'false');
  });

  it('follows a control: external updates move the selection, clicks write back', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, setValue, valueCtrl] = useControl<string>(undefined, '');
      return (
        <>
          <TimeGrid aria-label='Pick' value={valueCtrl} from='09:00' to='12:00' />
          <button
            type='button'
            data-testid='set-eleven'
            onClick={() => setValue('11:00')}
          >
            set 11:00
          </button>
          <output data-testid='mirror'>{value}</output>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByTestId('mirror')).toHaveTextContent('');

    // External control update → the grid follows.
    await user.click(screen.getByTestId('set-eleven'));
    expect(radio('11:00')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('mirror')).toHaveTextContent('11:00');

    // Click → writes back through the control.
    await user.click(radio('10:00'));
    expect(radio('10:00')).toHaveAttribute('aria-checked', 'true');
    expect(radio('11:00')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('mirror')).toHaveTextContent('10:00');
  });

  it('disables listed slots and ignores clicks on them', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeGrid
        aria-label='Pick'
        from='09:00'
        to='12:00'
        disabledValues={['10:00', '11:00']}
        onChange={onChange}
      />
    );
    expect(radio('10:00')).toBeDisabled();
    expect(radio('09:00')).toBeEnabled();
    await user.click(radio('10:00'));
    expect(onChange).not.toHaveBeenCalled();
    expect(radio('10:00')).toHaveAttribute('aria-checked', 'false');
  });

  it('keeps a single tab stop — the selected slot, else the first enabled', () => {
    const { unmount } = render(
      <TimeGrid aria-label='Pick' from='09:00' to='12:00' disabledValues={['09:00']} />
    );
    const tabs = screen
      .getAllByRole('radio')
      .filter((el) => el.tabIndex === 0);
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toHaveTextContent('10:00');
    unmount();

    // A plain value is the initial selection — the stop starts there.
    render(
      <TimeGrid
        aria-label='Pick'
        value='12:00'
        from='09:00'
        to='12:00'
        disabledValues={['09:00']}
      />
    );
    const tabsAfter = screen
      .getAllByRole('radio')
      .filter((el) => el.tabIndex === 0);
    expect(tabsAfter).toHaveLength(1);
    expect(tabsAfter[0]).toHaveTextContent('12:00');
  });

  it('keyboard: arrows move focus and select, skipping disabled slots', async () => {
    const user = userEvent.setup();
    render(
      <TimeGrid
        aria-label='Pick'
        from='09:00'
        to='12:00'
        step={60}
        columns={3}
        disabledValues={['10:00']}
      />
    );
    await user.tab();
    expect(radio('09:00')).toHaveFocus();
    expect(radio('09:00')).toHaveAttribute('aria-checked', 'false');

    // Right skips the disabled 10:00 straight to 11:00 and selects it.
    await user.keyboard('{ArrowRight}');
    expect(radio('11:00')).toHaveFocus();
    expect(radio('11:00')).toHaveAttribute('aria-checked', 'true');

    // Down moves one row (columns=3): 11:00 → 14:00 is past the end → stays.
    await user.keyboard('{ArrowDown}');
    expect(radio('11:00')).toHaveFocus();

    // Home/End jump the edges.
    await user.keyboard('{End}');
    expect(radio('12:00')).toHaveFocus();
    expect(radio('12:00')).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Home}');
    expect(radio('09:00')).toHaveFocus();
    expect(radio('09:00')).toHaveAttribute('aria-checked', 'true');
  });

  it('keyboard: ArrowUp/ArrowDown move by the column count', async () => {
    const user = userEvent.setup();
    render(
      <TimeGrid aria-label='Pick' from='09:00' to='14:00' step={60} columns={4} />
    );
    await user.tab();
    expect(radio('09:00')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(radio('13:00')).toHaveFocus();
    expect(radio('13:00')).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowUp}');
    expect(radio('09:00')).toHaveFocus();
    expect(radio('09:00')).toHaveAttribute('aria-checked', 'true');
  });

  it('keyboard: a column move onto a disabled slot skips a whole row (same column)', async () => {
    const user = userEvent.setup();
    render(
      <TimeGrid
        aria-label='Pick'
        from='09:00'
        to='15:00'
        step={60}
        columns={3}
        disabledValues={['12:00']}
      />
    );
    await user.tab();
    expect(radio('09:00')).toHaveFocus();
    // One row down from 09:00 (index 0) is the disabled 12:00 (index 3)
    // — the walker keeps its stride, staying in-column onto 15:00
    // (index 6) instead of crawling to the adjacent 13:00, matching
    // Calendar's grid walker (utils/grid-roving).
    await user.keyboard('{ArrowDown}');
    expect(radio('15:00')).toHaveFocus();
    expect(radio('15:00')).toHaveAttribute('aria-checked', 'true');
  });

  it('keyboard: dir="rtl" mirrors the horizontal arrows to the painted column order', async () => {
    const user = userEvent.setup();
    render(
      <div dir='rtl'>
        <TimeGrid aria-label='Pick' from='09:00' to='14:00' step={60} columns={3} />
      </div>
    );
    await user.tab();
    expect(radio('09:00')).toHaveFocus();

    // Under dir="rtl" the CSS grid paints columns right-to-left, so the
    // visually-forward arrow is ArrowLeft: it advances to the DOM-order
    // next slot (commit + focus), ArrowRight retreats.
    await user.keyboard('{ArrowLeft}');
    expect(radio('10:00')).toHaveFocus();
    expect(radio('10:00')).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowRight}');
    expect(radio('09:00')).toHaveFocus();
    expect(radio('09:00')).toHaveAttribute('aria-checked', 'true');
    // The vertical axis is direction-invariant: one row down (columns=3).
    await user.keyboard('{ArrowDown}');
    expect(radio('12:00')).toHaveFocus();
    expect(radio('12:00')).toHaveAttribute('aria-checked', 'true');
  });

  it('formats slot text through formatLabel', () => {
    render(
      <TimeGrid
        aria-label='Pick'
        from='09:00'
        to='09:00'
        step={60}
        formatLabel={(v) => {
          const [h, m] = v.split(':');
          const hour = Number(h) % 12 === 0 ? 12 : Number(h) % 12;
          return `${hour}:${m} PM`;
        }}
      />
    );
    expect(radio('9:00 PM')).toBeInTheDocument();
  });

  it('applies className and classNames slots', () => {
    const { container } = render(
      <TimeGrid
        aria-label='Pick'
        from='09:00'
        to='10:00'
        className='c-root'
        classNames={{ root: 's-root', cell: 's-cell' }}
      />
    );
    const root = container.querySelector("[data-slot='time-grid']")!;
    expect(root).toHaveClass('c-root');
    expect(root).toHaveClass('s-root');
    expect(container.querySelector("[data-slot='cell']")).toHaveClass('s-cell');
  });

  it('forwards ref to the group focus target', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<TimeGrid ref={ref} aria-label='Pick' from='09:00' to='10:00' />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('09:00');
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it('submits the selected slot under name', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <TimeGrid aria-label='Pick' name='meeting' from='09:00' to='10:00' />
      </form>
    );
    await user.click(radio('10:00'));
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('meeting')).toBe('10:00');
  });

  it('submits nothing without a selection', () => {
    const { container } = render(
      <form>
        <TimeGrid aria-label='Pick' name='meeting' from='09:00' to='10:00' />
      </form>
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('meeting')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const options = { rules: { region: { enabled: false } } };
    const { unmount } = render(
      <TimeGrid
        aria-label='Pick a time'
        from='09:00'
        to='12:00'
        value='10:00'
        disabledValues={['11:00']}
      />
    );
    const results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
    unmount();
  });
});
