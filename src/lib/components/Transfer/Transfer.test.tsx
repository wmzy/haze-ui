import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Transfer from './Transfer';

const items = [
  { key: 'a', title: 'Item A' },
  { key: 'b', title: 'Item B' },
  { key: 'c', title: 'Item C' },
];

describe('Transfer', () => {
  it('renders source and target lists', () => {
    render(<Transfer dataSource={items} targetKeys={[]} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Transfer dataSource={items} targetKeys={[]} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('moves item to target on arrow click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Transfer dataSource={items} targetKeys={[]} onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Item A' });
    await user.click(checkbox);
    const rightBtn = screen.getByRole('button', { name: '>' });
    await user.click(rightBtn);
    expect(onChange).toHaveBeenCalledWith(['a'], 'right', ['a']);
  });

  it('moves item back to source on left arrow click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Transfer dataSource={items} targetKeys={['a']} onChange={onChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Item A' });
    await user.click(checkbox);
    const leftBtn = screen.getByRole('button', { name: '<' });
    await user.click(leftBtn);
    expect(onChange).toHaveBeenCalledWith([], 'left', ['a']);
  });
});
