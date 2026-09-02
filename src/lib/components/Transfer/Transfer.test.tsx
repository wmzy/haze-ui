import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Transfer from './Transfer';
import TransferCore from './TransferCore';

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

  it('no-ops when move buttons are clicked with nothing selected', () => {
    const onChange = vi.fn();
    render(<Transfer dataSource={items} targetKeys={['a']} onChange={onChange} />);
    // buttons render disabled for empty selection; a programmatic click
    // still reaches the handlers, exercising the empty-selection guards
    const right = screen.getByRole('button', { name: '>' });
    const left = screen.getByRole('button', { name: '<' });
    (right as HTMLButtonElement).disabled = false;
    (left as HTMLButtonElement).disabled = false;
    fireEvent.click(right);
    fireEvent.click(left);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Source (2)')).toBeInTheDocument();
    expect(screen.getByText('Target (1)')).toBeInTheDocument();
  });

  it('disables checkbox for disabled items', () => {
    render(
      <Transfer
        dataSource={[{ key: 'x', title: 'Item X', disabled: true }]}
        targetKeys={[]}
      />
    );
    expect(screen.getByRole('checkbox', { name: 'Item X' })).toBeDisabled();
  });

  it('updates both panels after moving (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<Transfer dataSource={items} targetKeys={[]} />);
    await user.click(screen.getByRole('checkbox', { name: 'Item B' }));
    await user.click(screen.getByRole('button', { name: '>' }));
    expect(screen.getByText('Source (2)')).toBeInTheDocument();
    expect(screen.getByText('Target (1)')).toBeInTheDocument();
    // Item B moved into the target panel
    expect(screen.getByRole('checkbox', { name: 'Item B' })).toBeInTheDocument();
  });

  it('deselects source items after moving', async () => {
    const user = userEvent.setup();
    render(<Transfer dataSource={items} targetKeys={[]} />);
    await user.click(screen.getByRole('checkbox', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: '>' }));
    // move it back: selection must have been cleared, then reselect
    await user.click(screen.getByRole('checkbox', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: '<' }));
    expect(screen.getByText('Source (3)')).toBeInTheDocument();
    expect(screen.getByText('Target (0)')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Transfer dataSource={items} targetKeys={['a']} />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations after moving an item', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<Transfer dataSource={items} targetKeys={[]} />);
    await user.click(screen.getByRole('checkbox', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: '>' }));
    expect(screen.getByText('Target (1)')).toBeInTheDocument();
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('TransferCore', () => {
  it('renders panels straight from the value prop', () => {
    render(<TransferCore dataSource={items} value={['a']} onChange={() => undefined} />);
    expect(screen.getByText('Source (2)')).toBeInTheDocument();
    expect(screen.getByText('Target (1)')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <TransferCore dataSource={items} value={[]} onChange={() => undefined} className="custom" />
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('emits the next value with direction and moveKeys on move right', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TransferCore dataSource={items} value={['b']} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: '>' }));
    expect(onChange).toHaveBeenCalledWith(['b', 'a'], 'right', ['a']);
  });

  it('emits the next value with direction and moveKeys on move left', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TransferCore dataSource={items} value={['a', 'b']} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: 'Item A' }));
    await user.click(screen.getByRole('button', { name: '<' }));
    expect(onChange).toHaveBeenCalledWith(['b'], 'left', ['a']);
  });

  it('stays fully controlled: panels follow external value changes', () => {
    const { rerender } = render(
      <TransferCore dataSource={items} value={[]} onChange={() => undefined} />
    );
    expect(screen.getByText('Target (0)')).toBeInTheDocument();
    rerender(
      <TransferCore dataSource={items} value={['a', 'c']} onChange={() => undefined} />
    );
    expect(screen.getByText('Source (1)')).toBeInTheDocument();
    expect(screen.getByText('Target (2)')).toBeInTheDocument();
  });

  it('forwards bridge props (id, aria, blur) to the root container', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const { container } = render(
      <TransferCore
        dataSource={items}
        value={[]}
        onChange={() => undefined}
        id="members"
        aria-invalid
        aria-describedby="members-error"
        onBlur={onBlur}
      />
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('id', 'members');
    expect(root).toHaveAttribute('aria-invalid', 'true');
    expect(root).toHaveAttribute('aria-describedby', 'members-error');
    // React's synthetic blur bubbles from the inner checkboxes
    await user.click(screen.getByRole('checkbox', { name: 'Item A' }));
    await user.click(document.body);
    expect(onBlur).toHaveBeenCalled();
  });
});
