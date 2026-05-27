import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InlineEdit from './InlineEdit';

describe('InlineEdit', () => {
  it('renders display text', () => {
    render(<InlineEdit value="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders placeholder when empty', () => {
    render(<InlineEdit />);
    expect(screen.getByText('Click to edit')).toBeInTheDocument();
  });

  it('enters edit mode on click', async () => {
    const user = userEvent.setup();
    render(<InlineEdit value="Hello" />);
    await user.click(screen.getByText('Hello'));
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
  });

  it('commits on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InlineEdit value="Hello" onChange={onChange} />);
    await user.click(screen.getByText('Hello'));
    const input = screen.getByDisplayValue('Hello');
    await user.clear(input);
    await user.type(input, 'World');
    await user.tab();
    expect(onChange).toHaveBeenCalledWith('World');
  });

  it('cancels on Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InlineEdit value="Hello" onChange={onChange} />);
    await user.click(screen.getByText('Hello'));
    const input = screen.getByDisplayValue('Hello');
    await user.clear(input);
    await user.type(input, 'World{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<InlineEdit value="Hello" className="custom" />);
    expect(screen.getByText('Hello')).toHaveClass('custom');
  });

  it('commits on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InlineEdit value="Hello" onChange={onChange} />);
    await user.click(screen.getByText('Hello'));
    const input = screen.getByDisplayValue('Hello');
    await user.clear(input);
    await user.type(input, 'World{Enter}');
    expect(onChange).toHaveBeenCalledWith('World');
  });

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    render(<InlineEdit value="Hello" disabled />);
    await user.click(screen.getByText('Hello'));
    expect(screen.queryByDisplayValue('Hello')).not.toBeInTheDocument();
  });
});
