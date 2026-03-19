import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Input className="custom" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveClass('custom');
  });

  it('works as uncontrolled with default empty value', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="test" />);
    const input = screen.getByPlaceholderText('test');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('works as uncontrolled with initial string value', () => {
    render(<Input value="initial" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveValue('initial');
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="test" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('test'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards native props like disabled', () => {
    render(<Input disabled placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toBeDisabled();
  });
});
