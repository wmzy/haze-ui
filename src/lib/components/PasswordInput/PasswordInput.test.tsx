import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
  it('renders a password input', () => {
    const { container } = render(<PasswordInput />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    const { container } = render(<PasswordInput value="secret" />);
    expect(container.querySelector('input')).toHaveValue('secret');
  });

  it('applies className', () => {
    const { container } = render(<PasswordInput className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('calls onChange on input change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<PasswordInput onChange={onChange} />);
    await user.type(container.querySelector('input')!, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput value="secret" />);
    expect(container.querySelector('input')).toHaveAttribute('type', 'password');
    const button = screen.getByRole('button');
    await user.click(button);
    expect(container.querySelector('input')).toHaveAttribute('type', 'text');
    await user.click(button);
    expect(container.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('renders with placeholder', () => {
    const { container } = render(<PasswordInput placeholder="Enter password" />);
    expect(container.querySelector('input[placeholder="Enter password"]')).toBeInTheDocument();
  });
});
