import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TagInput from './TagInput';

describe('TagInput', () => {
  it('renders input with placeholder', () => {
    render(<TagInput placeholder="Add tag" />);
    expect(screen.getByPlaceholderText('Add tag')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<TagInput className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('adds tag on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'react{Enter}');
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('renders initial tags', () => {
    render(<TagInput value={['react', 'vue']} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('removes tag on button click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={['react', 'vue']} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]!);
    expect(onChange).toHaveBeenCalledWith(['vue']);
  });

  it('does not add duplicate tags', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={['react']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'react{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes last tag on Backspace with empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={['react', 'vue']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['react']);
  });
});
