import { render } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';

import OTPInputCore from './OTPInputCore';

// Stateful harness so the parent echoes onChange back into value —
// mirrors OTPInput's useControl wiring for multi-keystroke flows.
function CoreHarness({
  initial,
  onChange,
}: {
  initial: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <OTPInputCore
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('OTPInputCore non-sequential input', () => {
  it('pads the gap with spaces when a later cell is filled first', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <OTPInputCore value="1" length={6} onChange={onChange} />
    );
    const inputs = container.querySelectorAll('input');
    await user.type(inputs[3]!,'4');
    // '4' must stay in cell 4 — the two untouched cells in between
    // become space placeholders instead of collapsing. The old
    // sparse-array join produced '14': the digit landed in cell 2
    // while focus still advanced to cell 5.
    expect(onChange).toHaveBeenCalledWith('1  4');
    expect(document.activeElement).toBe(inputs[4]);
  });

  it('lands the digit in the focused cell after the value round-trips', async () => {
    const user = userEvent.setup();
    const { container } = render(<CoreHarness initial="1" />);
    const inputs = container.querySelectorAll('input');
    await user.type(inputs[3]!,'4');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('');
    expect(inputs[2]).toHaveValue('');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('');
    expect(document.activeElement).toBe(inputs[4]);
  });

  it('keeps sequential typing compact — no padding', async () => {
    const user = userEvent.setup();
    const { container } = render(<CoreHarness initial="" />);
    const inputs = container.querySelectorAll('input');
    await user.type(inputs[0]!,'1');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('');
    await user.type(inputs[1]!,'2');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('');
  });

  it('lets the user type over a space-padded cell', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<CoreHarness initial="1  4" onChange={onChange} />);
    const inputs = container.querySelectorAll('input');
    await user.type(inputs[2]!,'7');
    expect(onChange).toHaveBeenCalledWith('1 74');
    expect(inputs[2]).toHaveValue('7');
  });

  it('moves focus back on Backspace over a space-padded cell without collapsing it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <OTPInputCore value="1  4" length={6} onChange={onChange} />
    );
    const inputs = container.querySelectorAll('input');
    await user.type(inputs[2]!,'{Backspace}');
    // A space-padded cell counts as blank: Backspace walks focus back
    // instead of deleting the placeholder and left-shifting '4'.
    expect(document.activeElement).toBe(inputs[1]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<OTPInputCore value="1  4" length={6} onChange={() => undefined} />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
