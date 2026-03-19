import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Textarea from './Textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text').nodeName).toBe('TEXTAREA');
  });

  it('applies className', () => {
    render(<Textarea className="custom" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveClass('custom');
  });

  it('works as uncontrolled with default empty value', async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="test" />);
    const textarea = screen.getByPlaceholderText('test');
    await user.type(textarea, 'hello');
    expect(textarea).toHaveValue('hello');
  });

  it('works as uncontrolled with initial string value', () => {
    render(<Textarea value="initial" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveValue('initial');
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea placeholder="test" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('test'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards native props like disabled and rows', () => {
    render(<Textarea disabled rows={5} placeholder="test" />);
    const textarea = screen.getByPlaceholderText('test');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('rows', '5');
  });
});
