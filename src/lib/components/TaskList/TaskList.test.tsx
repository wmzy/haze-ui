import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import TaskList, { TaskListItem } from './TaskList';

describe('TaskList', () => {
  it('renders titles and descriptions', () => {
    render(
      <TaskList>
        <TaskListItem
          title='Research sources'
          description='3 documents indexed'
        />
        <TaskListItem title='Draft outline' />
      </TaskList>,
    );
    expect(screen.getByText('Research sources')).toBeInTheDocument();
    expect(screen.getByText('3 documents indexed')).toBeInTheDocument();
    expect(screen.getByText('Draft outline')).toBeInTheDocument();
  });

  it('renders list semantics', () => {
    render(
      <TaskList>
        <TaskListItem title='A' />
      </TaskList>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('defaults to unchecked', () => {
    render(
      <TaskList>
        <TaskListItem title='A' />
      </TaskList>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'A' });
    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole('listitem')).toHaveAttribute('data-checked', 'false');
  });

  it('toggles uncontrolled state on checkbox click', async () => {
    const user = userEvent.setup();
    render(
      <TaskList>
        <TaskListItem title='Research sources' />
      </TaskList>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Research sources' });
    const item = screen.getByRole('listitem');
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(item).toHaveAttribute('data-checked', 'true');
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(item).toHaveAttribute('data-checked', 'false');
  });

  it('labels the checkbox with the title and toggles by clicking the row', async () => {
    const user = userEvent.setup();
    render(
      <TaskList>
        <TaskListItem title='Research sources' />
      </TaskList>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Research sources' });
    await user.click(screen.getByText('Research sources'));
    expect(checkbox).toBeChecked();
  });

  it('treats a plain checked value as the uncontrolled default', async () => {
    const user = userEvent.setup();
    render(
      <TaskList>
        <TaskListItem title='Done already' checked />
      </TaskList>,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Done already' });
    expect(checkbox).toBeChecked();
    expect(screen.getByRole('listitem')).toHaveAttribute('data-checked', 'true');
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('applies completion styling to the title when checked', async () => {
    const user = userEvent.setup();
    render(
      <TaskList>
        <TaskListItem title='Research sources' />
      </TaskList>,
    );
    const title = screen.getByText('Research sources');
    const before = title.className;
    await user.click(screen.getByRole('checkbox', { name: 'Research sources' }));
    expect(title.className).not.toBe(before);
    expect(screen.getByRole('listitem')).toHaveAttribute('data-checked', 'true');
  });

  it('drives a controlled checked control and fires onCheckedChange', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    function Controlled() {
      const [, , checkedCtrl] = useControl(undefined, false);
      return (
        <TaskListItem
          title='Ship release'
          checked={checkedCtrl}
          onCheckedChange={onCheckedChange}
        />
      );
    }
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Ship release' });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox).toBeChecked();
    expect(screen.getByRole('listitem')).toHaveAttribute('data-checked', 'true');
    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(checkbox).not.toBeChecked();
  });

  it('applies className to root and item', () => {
    render(
      <TaskList className='custom-root'>
        <TaskListItem title='A' className='custom-item' />
      </TaskList>,
    );
    expect(screen.getByRole('list')).toHaveClass('custom-root');
    expect(screen.getByRole('listitem')).toHaveClass('custom-item');
  });

  it('forwards native props to root and item', () => {
    render(
      <TaskList data-testid='task-root'>
        <TaskListItem title='A' id='entry-1' />
      </TaskList>,
    );
    expect(screen.getByTestId('task-root')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveAttribute('id', 'entry-1');
  });

  it('renders a custom indicator instead of the checkbox', () => {
    render(
      <TaskList>
        <TaskListItem
          title='Running task'
          indicator={<span data-testid='spinner'>…</span>}
        />
      </TaskList>,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders actions outside the toggle label', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <TaskList>
        <TaskListItem
          title='Research sources'
          actions={
            <button type='button' onClick={onAction}>
              View
            </button>
          }
        />
      </TaskList>,
    );
    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    // Activating an action must never toggle the task.
    expect(screen.getByRole('checkbox', { name: 'Research sources' })).not.toBeChecked();
  });

  it('renders the data-driven items with independent toggles', async () => {
    const user = userEvent.setup();
    render(
      <TaskList
        items={[
          { key: 'a', title: 'Research sources', description: '3 documents' },
          { key: 'b', title: 'Draft outline' },
        ]}
      />,
    );
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    expect(screen.getByText('3 documents')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Draft outline' }));
    expect(listItems[1]).toHaveAttribute('data-checked', 'true');
    expect(listItems[0]).toHaveAttribute('data-checked', 'false');
  });

  it('warns when items and compound children are both given', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      render(
        <TaskList items={[{ key: 'a', title: 'From items' }]}>
          <TaskListItem title='From children' />
        </TaskList>,
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('mutually exclusive'),
      );
      expect(screen.getByText('From items')).toBeInTheDocument();
      expect(screen.queryByText('From children')).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <TaskList>
        <TaskListItem
          title='Research sources'
          description='3 documents indexed'
        />
        <TaskListItem
          title='Draft outline'
          checked
          actions={
            <button type='button' aria-label='View draft'>
              View
            </button>
          }
        />
        <TaskListItem
          title='Running task'
          indicator={<span aria-label='Task running'>…</span>}
        />
      </TaskList>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations on the data-driven path', async () => {
    const { axe } = await import('jest-axe');
    render(
      <TaskList
        items={[
          { key: 'a', title: 'Research sources', description: 'indexed' },
          { key: 'b', title: 'Draft outline', checked: true },
        ]}
      />,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// Re-export sanity: the compound member ships under both spellings.
describe('TaskList compound surface', () => {
  it('renders TaskListItem standalone inside any list parent', () => {
    render(
      <ul>
        <TaskListItem title='Standalone' />
      </ul>,
    );
    const item = screen.getByRole('listitem');
    expect(within(item).getByRole('checkbox', { name: 'Standalone' })).toBeInTheDocument();
  });
});
