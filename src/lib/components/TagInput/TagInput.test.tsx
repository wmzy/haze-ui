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

  it('exposes list semantics with per-tag remove labels', () => {
    render(<TagInput value={['react', 'vue']} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remove react' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove vue' })).toBeInTheDocument();
  });

  it('describes the tag count on the input aria-label', () => {
    // Uncontrolled default: value only seeds on mount, so use fresh
    // renders per case.
    const first = render(<TagInput value={['react']} placeholder="Add tag" />);
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Add tag, 1 tag'
    );
    first.unmount();
    const second = render(
      <TagInput value={['react', 'vue']} placeholder="Add tag" />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-label',
      'Add tag, 2 tags'
    );
    second.unmount();
    render(<TagInput value={[]} placeholder="Add tag" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Add tag');
  });

  it('moves focus to the neighboring remove button after Backspace removal', async () => {
    const user = userEvent.setup();
    render(<TagInput value={['react', 'vue', 'ng']} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Backspace}');
    // 'ng' removed; focus lands on the new last tag's remove button
    expect(screen.getByRole('button', { name: 'Remove vue' })).toHaveFocus();
  });

  it('supports consecutive Backspace removals with coherent focus', async () => {
    const user = userEvent.setup();
    render(<TagInput value={['react', 'vue', 'ng']} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Backspace}');
    expect(screen.getByRole('button', { name: 'Remove vue' })).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(screen.getByRole('button', { name: 'Remove react' })).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('returns focus to the input when the last tag is removed', async () => {
    const user = userEvent.setup();
    render(<TagInput value={['react']} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '{Backspace}');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('moves focus to the neighbor after clicking a middle remove button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput value={['react', 'vue', 'ng']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Remove vue' }));
    expect(onChange).toHaveBeenCalledWith(['react', 'ng']);
    // the tag after the removed one shifts into its place and takes focus
    expect(screen.getByRole('button', { name: 'Remove ng' })).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<TagInput value={['react', 'vue']} placeholder="Add tag" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
