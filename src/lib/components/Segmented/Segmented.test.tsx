import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import {Form, FormItem, createForm, getValue} from '../../form';

import Segmented from './Segmented';
import SegmentedCore from './SegmentedCore';

describe('Segmented', () => {
  it('renders options', () => {
    render(<Segmented options={['A', 'B', 'C']} />);
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Segmented options={['A']} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('calls onChange on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented options={['A', 'B']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('renders object options with label', () => {
    render(<Segmented options={[{ value: 'a', label: 'Alpha' }]} />);
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('disables option', () => {
    render(<Segmented options={[{ value: 'a', label: 'A', disabled: true }, 'B']} />);
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Segmented options={['A', 'B']} value="A" />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('SegmentedCore', () => {
  it('renders the given value as the active option', () => {
    const { container } = render(
      <SegmentedCore options={['A', 'B']} value="B" onChange={() => undefined} />
    );
    const buttons = container.querySelectorAll('button');
    const a = buttons[0]!;
    const b = buttons[1]!;
    // the active option (B) carries an extra class the inactive one lacks
    expect(b.className.split(' ').length).toBeGreaterThan(
      a.className.split(' ').length
    );
  });

  it('calls onChange with the clicked option value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedCore options={['A', 'B']} value="A" onChange={onChange} />);
    await user.click(screen.getByRole('button', {name: 'B'}));
    expect(onChange).toHaveBeenCalledWith('B');
  });
});

describe('Segmented ref forwarding', () => {
  it('forwards ref to the selected option button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Segmented ref={ref} options={['day', 'week']} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
    expect(ref.current).toHaveTextContent('day');
  });
});

const views = [
  {value: 'day', label: 'Day'},
  {value: 'week', label: 'Week'},
  {value: 'month', label: 'Month'},
];

describe('Segmented native form participation', () => {

  it('submits the selected value under name', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Segmented name="view" options={views} value="week" />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).get('view')).toBe('week');
  });

  it('follows selection changes', async () => {
    const user = userEvent.setup();
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Segmented name="view" options={views} value="day" />
      </form>
    );
    const form = container.querySelector('form')!;
    await user.click(screen.getByRole('button', {name: 'Month'}));
    expect(new FormData(form).get('view')).toBe('month');
  });

  it('submits nothing for the empty no-selection sentinel and no bridge without name', () => {
    const empty = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Segmented name="view" options={views} />
      </form>
    );
    expect(new FormData(empty.container.querySelector('form')!).get('view')).toBeNull();

    const unnamed = render(<Segmented options={views} value="day" />);
    expect(unnamed.container.querySelector("[data-slot='native-input']")).toBeNull();
  });
});

describe('Segmented + react-f0rm FormItem coexistence', () => {
  it('FormItem-driven usage unchanged: value flows through the form store, bridge stays inert', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {view: 'day'}});

    const {container} = render(
      <Form form={form} onSubmit={() => undefined}>
        <FormItem form={form} name="view" label="View">
          {({value, onChange}) => (
            <Segmented options={views} value={value} onChange={onChange} />
          )}
        </FormItem>
      </Form>
    );

    // FormItem never passes a component name — no bridge input renders
    expect(container.querySelector("[data-slot='native-input']")).toBeNull();
    // and f0rm preventDefaults submission, so even a named bridge would
    // be inert there; the form store is the single value channel.
    await user.click(screen.getByRole('button', {name: 'Week'}));
    expect(getValue(form, 'view')).toBe('week');
  });
});

describe('Segmented keyboard navigation (roving tabindex + select-on-move)', () => {
  it('keeps a single tab stop on the selected option', () => {
    render(<Segmented options={['A', 'B', 'C']} value="B" />);
    const [a, b, c] = screen.getAllByRole('button');
    expect(a!).toHaveAttribute('tabindex', '-1');
    expect(b!).toHaveAttribute('tabindex', '0');
    expect(c!).toHaveAttribute('tabindex', '-1');
  });

  it('falls back to the first enabled option for the tab stop', () => {
    const disabledFirst = [
      {value: 'a', label: 'A', disabled: true},
      {value: 'b', label: 'B'},
      {value: 'c', label: 'C'},
    ];
    const {rerender} = render(<Segmented options={disabledFirst} />);
    const [a, b] = screen.getAllByRole('button');
    expect(a!).toHaveAttribute('tabindex', '-1');
    expect(b!).toHaveAttribute('tabindex', '0');

    // a selected-but-disabled option cannot hold the stop either
    rerender(<Segmented options={disabledFirst} value="a" />);
    const [a2, b2] = screen.getAllByRole('button');
    expect(a2!).toHaveAttribute('tabindex', '-1');
    expect(b2!).toHaveAttribute('tabindex', '0');
  });

  it('selects and focuses with ArrowRight/ArrowLeft, wrapping (LTR)', async () => {
    const user = userEvent.setup();
    render(<Segmented options={['A', 'B', 'C']} value="A" />);
    const [a, b, c] = screen.getAllByRole('button');
    a!.focus();
    await user.keyboard('{ArrowRight}');
    expect(b!).toHaveFocus();
    // the roving stop follows the selection, proving the value moved
    expect(b!).toHaveAttribute('tabindex', '0');
    expect(a!).toHaveAttribute('tabindex', '-1');
    await user.keyboard('{ArrowRight}');
    expect(c!).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(a!).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(c!).toHaveFocus();
  });

  it('moves selection to Home/End', async () => {
    const user = userEvent.setup();
    render(<Segmented options={['A', 'B', 'C']} value="B" />);
    const [a, , c] = screen.getAllByRole('button');
    screen.getByRole('button', {name: 'B'}).focus();
    await user.keyboard('{Home}');
    expect(a!).toHaveFocus();
    expect(a!).toHaveAttribute('tabindex', '0');
    await user.keyboard('{End}');
    expect(c!).toHaveFocus();
    expect(c!).toHaveAttribute('tabindex', '0');
  });

  it('mirrors the arrow keys under dir=rtl', async () => {
    const user = userEvent.setup();
    // Custom containers are not auto-appended to body — focus needs the
    // tree attached (same pattern as src/lib/rtl.test.tsx).
    const rtl = document.createElement('div');
    rtl.setAttribute('dir', 'rtl');
    document.body.appendChild(rtl);
    try {
      render(<Segmented options={['A', 'B', 'C']} value="A" />, {container: rtl});
      const [a, b] = screen.getAllByRole('button');
      a!.focus();
      // RTL: the visually-forward arrow is ArrowLeft
      await user.keyboard('{ArrowLeft}');
      expect(b!).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(a!).toHaveFocus();
    } finally {
      rtl.remove();
    }
  });

  it('skips disabled options when moving', async () => {
    const user = userEvent.setup();
    render(
      <Segmented
        options={[
          {value: 'a', label: 'A'},
          {value: 'b', label: 'B', disabled: true},
          {value: 'c', label: 'C'},
        ]}
        value="a"
      />
    );
    const [a, , c] = screen.getAllByRole('button');
    a!.focus();
    await user.keyboard('{ArrowRight}');
    expect(c!).toHaveFocus();
    await user.keyboard('{Home}');
    expect(a!).toHaveFocus();
    await user.keyboard('{End}');
    // End lands on the last enabled option, not the disabled middle
    expect(c!).toHaveFocus();
  });

  it('arrows update a controlled value through the shared control', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [, , control] = useControl('day');
      return (
        <form onSubmit={(e) => e.preventDefault()}>
          <Segmented name="view" options={views} value={control} />
        </form>
      );
    }
    const {container} = render(<Controlled />);
    const form = container.querySelector('form')!;
    screen.getByRole('button', {name: 'Day'}).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', {name: 'Week'})).toHaveFocus();
    // the hidden form bridge mirrors the parent-owned state — the
    // arrow selection flowed through setValue, not a local copy
    expect(new FormData(form).get('view')).toBe('week');
  });
});
