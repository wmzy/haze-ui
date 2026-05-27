import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import OTPInput from './OTPInput';

describe('OTPInput', () => {
  it('renders correct number of inputs', () => {
    const { container } = render(<OTPInput />);
    expect(container.querySelectorAll('input')).toHaveLength(6);
  });

  it('renders custom length', () => {
    const { container } = render(<OTPInput length={4} />);
    expect(container.querySelectorAll('input')).toHaveLength(4);
  });

  it('applies className', () => {
    const { container } = render(<OTPInput className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('accepts value', () => {
    const { container } = render(<OTPInput value="123" length={4} />);
    const inputs = container.querySelectorAll('input');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('');
  });

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<OTPInput onChange={onChange} />);
    const input = container.querySelector('input')!;
    await user.type(input, '5');
    expect(onChange).toHaveBeenCalledWith('5');
  });
});
