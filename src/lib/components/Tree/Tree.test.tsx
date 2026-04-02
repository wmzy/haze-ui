import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tree from './Tree';

const basicData = [
  {
    key: '0-0',
    title: 'parent 0',
    children: [
      { key: '0-0-0', title: 'leaf 0-0-0' },
      { key: '0-0-1', title: 'leaf 0-0-1' },
    ],
  },
  {
    key: '0-1',
    title: 'parent 1',
    children: [{ key: '0-1-0', title: 'leaf 0-1-0' }],
  },
];

describe('Tree', () => {
  it('renders tree nodes', () => {
    render(<Tree treeData={basicData} />);
    expect(screen.getByText('parent 0')).toBeInTheDocument();
    expect(screen.getByText('parent 1')).toBeInTheDocument();
  });

  it('expands node on click', async () => {
    const user = userEvent.setup();
    render(<Tree treeData={basicData} />);
    await user.click(screen.getByText('parent 0'));
    expect(screen.getByText('leaf 0-0-0')).toBeInTheDocument();
    expect(screen.getByText('leaf 0-0-1')).toBeInTheDocument();
  });

  it('selects node on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Tree treeData={basicData} onSelect={onSelect} />);
    await user.click(screen.getByText('parent 0'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders checkboxes when checkable', () => {
    render(<Tree treeData={basicData} checkable />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('checks node and children', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(<Tree treeData={basicData} checkable onCheck={onCheck} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    expect(onCheck).toHaveBeenCalled();
  });

  it('applies className', () => {
    render(<Tree treeData={basicData} className='custom' />);
    expect(screen.getByRole('tree')).toHaveClass('custom');
  });

  it('respects expandedKeys', () => {
    render(<Tree treeData={basicData} expandedKeys={['0-0']} />);
    expect(screen.getByText('leaf 0-0-0')).toBeInTheDocument();
    expect(screen.getByText('leaf 0-0-1')).toBeInTheDocument();
  });

  it('disables tree when disabled', async () => {
    const user = userEvent.setup();
    render(<Tree treeData={basicData} disabled />);
    await user.click(screen.getByText('parent 0'));
    expect(screen.queryByText('leaf 0-0-0')).not.toBeInTheDocument();
  });

  it('supports blockNode mode', () => {
    render(<Tree treeData={basicData} blockNode />);
    expect(screen.getByText('parent 0')).toBeInTheDocument();
  });

  it('supports showLine mode', () => {
    render(<Tree treeData={basicData} showLine />);
    expect(screen.getByText('parent 0')).toBeInTheDocument();
  });

  it('supports showIcon mode', () => {
    render(<Tree treeData={basicData} showIcon />);
    expect(screen.getByText('parent 0')).toBeInTheDocument();
  });

  it('supports multiple selection', async () => {
    const user = userEvent.setup();
    render(<Tree treeData={basicData} multiple />);
    await user.click(screen.getByText('parent 0'));
    await user.click(screen.getByText('parent 1'));
  });

  it('supports custom switcherIcon', () => {
    render(<Tree treeData={basicData} switcherIcon={<span>→</span>} />);
    expect(screen.getAllByText('→')).toHaveLength(2);
  });

  it('supports titleRender', () => {
    render(
      <Tree
        treeData={basicData}
        titleRender={(node) => <span data-testid='custom'>{node.title}</span>}
      />
    );
    expect(screen.getAllByTestId('custom')).toHaveLength(2);
  });

  it('supports checkStrictly mode', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(
      <Tree treeData={basicData} checkable checkStrictly onCheck={onCheck} />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    expect(onCheck).toHaveBeenCalled();
  });

  it('checks parent checks all children', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(<Tree treeData={basicData} checkable onCheck={onCheck} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    const result = onCheck.mock.calls[0]![0] as {
      checked: string[];
      halfChecked: string[];
    };
    expect(result.checked).toContain('0-0');
    expect(result.checked).toContain('0-0-0');
    expect(result.checked).toContain('0-0-1');
  });

  it('unchecks parent unchecks all children', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(
      <Tree
        treeData={basicData}
        checkable
        checkedKeys={['0-0', '0-0-0', '0-0-1']}
        onCheck={onCheck}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]!);
    const result = onCheck.mock.calls[0]![0] as {
      checked: string[];
      halfChecked: string[];
    };
    expect(result.checked).not.toContain('0-0');
    expect(result.checked).not.toContain('0-0-0');
    expect(result.checked).not.toContain('0-0-1');
  });

  it('shows halfChecked when some children are checked', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(
      <Tree
        treeData={basicData}
        checkable
        checkedKeys={['0-0-0']}
        onCheck={onCheck}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]!);
    const result = onCheck.mock.calls[0]![0] as {
      checked: string[];
      halfChecked: string[];
    };
    expect(result.halfChecked).toContain('0-0');
  });

  it('supports controlled expandedKeys', async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    render(
      <Tree treeData={basicData} expandedKeys={['0-0']} onExpand={onExpand} />
    );
    expect(screen.getByText('leaf 0-0-0')).toBeInTheDocument();
    await user.click(screen.getByText('parent 0'));
    expect(onExpand).toHaveBeenCalled();
    const expandCall = onExpand.mock.calls[0]![0] as string[];
    expect(expandCall).not.toContain('0-0');
  });

  it('supports controlled selectedKeys', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Tree treeData={basicData} selectedKeys={['0-0']} onSelect={onSelect} />
    );
    await user.click(screen.getByText('parent 1'));
    expect(onSelect).toHaveBeenCalledWith(
      ['0-1'],
      expect.objectContaining({ selected: true })
    );
  });

  it('supports controlled checkedKeys', async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(
      <Tree
        treeData={basicData}
        checkable
        checkedKeys={['0-0-0']}
        onCheck={onCheck}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]!);
    expect(onCheck).toHaveBeenCalled();
  });
});
