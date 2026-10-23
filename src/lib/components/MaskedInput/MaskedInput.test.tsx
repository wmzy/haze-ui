import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import MaskedInput from './MaskedInput';
import MaskedInputCore from './MaskedInputCore';
import { applyEdit, formatMask, unmask } from './mask';

const PHONE = '(999) 999-9999';

describe('mask engine', () => {
  it('formats progressively — literals only up to the filled slots', () => {
    expect(formatMask('', PHONE)).toBe('');
    expect(formatMask('1', PHONE)).toBe('(1');
    expect(formatMask('123', PHONE)).toBe('(123');
    expect(formatMask('1234', PHONE)).toBe('(123) 4');
    expect(formatMask('1234567890', PHONE)).toBe('(123) 456-7890');
  });

  it('drops chars that do not fit their slot kind', () => {
    expect(formatMask('1a2', PHONE)).toBe('(12');
    expect(formatMask('12x45', '999999')).toBe('1245');
  });

  it('uppercases A-slots and keeps a-slots as typed', () => {
    expect(formatMask('ab1', 'AAA')).toBe('AB');
    expect(formatMask('aB', 'A a')).toBe('A B');
    expect(formatMask('ab', 'aa')).toBe('ab');
  });

  it('unmask extracts the raw slot content of a masked value', () => {
    expect(unmask('(123) 456-7890', PHONE)).toBe('1234567890');
    expect(unmask('(123', PHONE)).toBe('123');
    expect(unmask('', PHONE)).toBe('');
    // Values without literals resolve positionally.
    expect(unmask('1234567890', PHONE)).toBe('1234567890');
  });

  it('round-trips unmask through formatMask', () => {
    const value = '(123) 456-78';
    expect(formatMask(unmask(value, PHONE), PHONE)).toBe(value);
  });

  it('parses escaped literals', () => {
    expect(formatMask('1', '\\9 9')).toBe('9 1');
    expect(formatMask('12', '\\9 999')).toBe('9 12');
  });
});

describe('applyMaskEdit engine', () => {
  it('accepts a digit at the end and places the caret after it', () => {
    expect(applyEdit('123', '1234', 4, PHONE)).toEqual({
      type: 'edit',
      value: '(123) 4',
      caret: 7,
    });
  });

  it('accepts a digit mid-string keeping later content and caret', () => {
    // Caret before the 5, typing 9 inserts into slot 3.
    expect(applyEdit('(123) 456', '(123) 9456', 7, PHONE)).toEqual({
      type: 'edit',
      value: '(123) 945-6',
      caret: 7,
    });
  });

  it('rejects a letter into a digit slot as a hard no-op', () => {
    expect(applyEdit('(123', '(123x', 5, PHONE)).toEqual({
      type: 'reject',
      caret: 4,
    });
  });

  it('accepts a whole pasted formatted number', () => {
    expect(applyEdit('', '(123) 456-7890', 14, PHONE)).toEqual({
      type: 'edit',
      value: '(123) 456-7890',
      caret: 14,
    });
  });

  it('drops pasted separators the mask does not supply', () => {
    expect(applyEdit('', '123-456', 7, '999999')).toEqual({
      type: 'edit',
      value: '123456',
      caret: 6,
    });
  });

  it('skips over a literal the user typed themselves', () => {
    // '(' belongs to the mask — no value change, caret jumps to the slot.
    expect(applyEdit('(123) 456', '(123)) 456', 5, PHONE)).toEqual({
      type: 'skip',
      caret: 6,
    });
  });

  it('backspaces a slot char mid-string with the caret at the hole', () => {
    // Deleting the '4' of (123) 456.
    expect(applyEdit('(123) 456', '(123) 56', 6, PHONE)).toEqual({
      type: 'edit',
      value: '(123) 56',
      caret: 6,
    });
  });

  it('backspace over a literal deletes the preceding slot char', () => {
    // Caret after the space of (123) 45, backspacing hits the literal.
    expect(applyEdit('(123) 45', '(123)45', 5, PHONE, 'backward')).toEqual({
      type: 'edit',
      value: '(124) 5',
      caret: 3,
    });
  });

  it('Delete over a literal is a no-op', () => {
    expect(applyEdit('(123) 45', '(123)45', 5, PHONE, 'forward')).toEqual({
      type: 'reject',
      caret: 5,
    });
  });

  it('rejects typing when the mask is full', () => {
    expect(
      applyEdit('(123) 456-7890', '(123) 456-78900', 15, PHONE)
    ).toEqual({ type: 'reject', caret: 14 });
  });

  it('replaces a selection in one edit', () => {
    // User selected '456' and typed '789'.
    expect(applyEdit('(123) 456-7890', '(123) 789-7890', 9, PHONE)).toEqual({
      type: 'edit',
      value: '(123) 789-7890',
      caret: 9,
    });
  });
});

describe('MaskedInput', () => {
  it('renders an input wearing the InputCore skin', () => {
    render(<MaskedInput mask={PHONE} aria-label="phone" />);
    const input = screen.getByRole('textbox', { name: 'phone' });
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('accepts an initial masked value', () => {
    render(<MaskedInput mask={PHONE} value="(123) 45" aria-label="phone" />);
    expect(screen.getByRole('textbox')).toHaveValue('(123) 45');
  });

  it('masks digits as they are typed', async () => {
    const user = userEvent.setup();
    render(<MaskedInput mask={PHONE} aria-label="phone" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, '1234567890');
    expect(input).toHaveValue('(123) 456-7890');
  });

  it('keeps the caret after the edited character mid-string', async () => {
    const user = userEvent.setup();
    render(<MaskedInput mask={PHONE} value="(123) 456" aria-label="phone" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    input.focus();
    // Caret before the 5 (position 7): typing 8 inserts into slot 4 and
    // the caret lands right after the inserted 8 (position 8).
    await user.type(input, '8', { skipClick: true, initialSelectionStart: 7 });
    expect(input).toHaveValue('(123) 485-6');
    expect(input.selectionStart).toBe(8);
  });

  it('keeps the caret at the hole when backspacing mid-string', async () => {
    const user = userEvent.setup();
    render(<MaskedInput mask={PHONE} value="(123) 456" aria-label="phone" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    input.focus();
    // Backspacing the 4 (caret before the 5).
    await user.type(input, '{backspace}', {
      skipClick: true,
      initialSelectionStart: 7,
    });
    expect(input).toHaveValue('(123) 56');
    expect(input.selectionStart).toBe(6);
  });

  it('backspace over a literal removes the preceding slot char', async () => {
    const user = userEvent.setup();
    render(<MaskedInput mask={PHONE} value="(123) 45" aria-label="phone" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    input.focus();
    // Right before the 4 (position 6), after the space.
    await user.type(input, '{backspace}', {
      skipClick: true,
      initialSelectionStart: 6,
    });
    expect(input).toHaveValue('(124) 5');
  });

  it('rejected input is a no-op: value and caret restored', async () => {
    const user = userEvent.setup();
    render(<MaskedInput mask={PHONE} value="(123" aria-label="phone" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    input.focus();
    await user.type(input, 'x');
    expect(input).toHaveValue('(123');
    expect(input.selectionStart).toBe(4);
  });

  it('fires onChange with the native event and formats through the control', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MaskedInput mask={PHONE} value="(123" onChange={onChange} aria-label="phone" />
    );
    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, '4');
    expect(input).toHaveValue('(123) 4');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0]![0] as Event).target).toBe(input);
  });

  it('works controlled: masked values flow through the control and back', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, , ctrl] = useControl('');
      return (
        <>
          <MaskedInput mask={PHONE} value={ctrl} aria-label="phone" />
          <output data-testid="value">{value}</output>
        </>
      );
    }
    render(<Harness />);
    await user.type(screen.getByRole('textbox'), '12345');
    expect(screen.getByTestId('value')).toHaveTextContent('(123) 45');
  });

  it('re-formats the current content when the mask changes', () => {
    const { rerender } = render(
      <MaskedInput mask={PHONE} value="(123) 456-7890" aria-label="phone" />
    );
    rerender(
      <MaskedInput mask="9999 9999 9999 9999" value="(123) 456-7890" aria-label="phone" />
    );
    expect(screen.getByRole('textbox')).toHaveValue('1234 5678 90');
  });

  it('normalizes a non-conforming external value', () => {
    // Uncontrolled sugar ignores later plain `value` props by design —
    // the normalization contract lives on the controlled Core.
    const onChange = vi.fn();
    const { rerender } = render(
      <MaskedInputCore value="" onChange={onChange} mask={PHONE} aria-label="core" />
    );
    rerender(
      <MaskedInputCore value="5551234567" onChange={onChange} mask={PHONE} aria-label="core" />
    );
    expect(onChange).toHaveBeenCalledWith('(555) 123-4567');
    rerender(
      <MaskedInputCore
        value="(555) 123-4567"
        onChange={onChange}
        mask={PHONE}
        aria-label="core"
      />
    );
    expect(screen.getByRole('textbox')).toHaveValue('(555) 123-4567');
  });

  it('applies a full pasted number in one edit', () => {
    render(<MaskedInput mask={PHONE} aria-label="phone" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    fireEvent.input(input, { target: { value: '(201) 555-0123' } });
    expect(input).toHaveValue('(201) 555-0123');
  });

  it('applies className and forwards native props', () => {
    render(
      <MaskedInput
        mask={PHONE}
        className="custom"
        placeholder="(___) ___-____"
        disabled
        aria-label="phone"
      />
    );
    const input = screen.getByRole<HTMLInputElement>('textbox');
    expect(input).toHaveClass('custom');
    expect(input).toHaveAttribute('placeholder', '(___) ___-____');
    expect(input).toBeDisabled();
  });

  it('forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<MaskedInput mask={PHONE} ref={ref} aria-label="phone" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it('renders left/right sections through InputCore', () => {
    render(
      <MaskedInput
        mask="9999 9999 9999 9999"
        leftSection={<span data-testid="card-icon">💳</span>}
        aria-label="card"
      />
    );
    expect(screen.getByTestId('card-icon')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<MaskedInput mask={PHONE} value="(123) 45" aria-label="phone" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('MaskedInputCore', () => {
  it('is the plain-value channel FormItem binds', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MaskedInputCore value="(12" onChange={onChange} mask={PHONE} aria-label="core" />
    );
    const input = screen.getByRole<HTMLInputElement>('textbox');
    fireEvent.input(input, { target: { value: '(123' } });
    expect(onChange).toHaveBeenCalledWith('(123');
    // Controlled: the DOM follows the value the parent sends back.
    rerender(
      <MaskedInputCore value="(123" onChange={onChange} mask={PHONE} aria-label="core" />
    );
    expect(input).toHaveValue('(123');
  });

  it('does not call onChange for rejected edits', () => {
    const onChange = vi.fn();
    render(
      <MaskedInputCore value="(12" onChange={onChange} mask={PHONE} aria-label="core" />
    );
    fireEvent.input(screen.getByRole('textbox'), { target: { value: '(12x' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('(12');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<MaskedInputCore value="" onChange={() => undefined} mask={PHONE} aria-label="core" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
