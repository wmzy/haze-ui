import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StatusBar, StatusItem } from './index';

function groupSlots(): string[] {
  const bar = screen.getByRole('contentinfo');
  return Array.from(
    bar.querySelectorAll(
      "[data-slot='status-bar-left'], [data-slot='status-bar-right']",
    ),
  ).map((group) => group.getAttribute('data-slot') ?? '');
}

describe('StatusBar', () => {
  it('renders a footer landmark', () => {
    render(
      <StatusBar aria-label="Status" left={<StatusItem>Ready</StatusItem>} />
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('places left and right items in dedicated groups, left leading', () => {
    render(
      <StatusBar
        left={<StatusItem>main.tsx</StatusItem>}
        right={<StatusItem>UTF-8</StatusItem>}
      />
    );
    expect(groupSlots()).toEqual(['status-bar-left', 'status-bar-right']);
    expect(screen.getByText('main.tsx').parentElement).toHaveAttribute(
      'data-slot',
      'status-bar-left',
    );
    expect(screen.getByText('UTF-8').parentElement).toHaveAttribute(
      'data-slot',
      'status-bar-right',
    );
  });

  it('omits the group for a missing side', () => {
    render(<StatusBar right={<StatusItem>UTF-8</StatusItem>} />);
    expect(groupSlots()).toEqual(['status-bar-right']);
  });

  it('marks priority items so lesser items fold away below the mobile breakpoint', () => {
    render(
      <StatusBar
        left={
          <>
            <StatusItem priority>main.tsx</StatusItem>
            <StatusItem>Ln 42, Col 8</StatusItem>
          </>
        }
      />
    );
    expect(screen.getByText('main.tsx')).toHaveAttribute('data-priority', 'true');
    expect(screen.getByText('Ln 42, Col 8')).not.toHaveAttribute('data-priority');
  });

  it('renders items as spans without onSelect', () => {
    render(<StatusBar left={<StatusItem>Ready</StatusItem>} />);
    const item = screen.getByText('Ready');
    expect(item.tagName).toBe('SPAN');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders items with onSelect as buttons that fire on click and keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <StatusBar
        right={
          <StatusItem onSelect={onSelect}>Run tests</StatusItem>
        }
      />
    );
    const button = screen.getByRole('button', { name: 'Run tests' });
    expect(button).toHaveAttribute('type', 'button');
    await user.click(button);
    expect(onSelect).toHaveBeenCalledOnce();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('applies className to the bar and items', () => {
    render(
      <StatusBar className="bar-custom" data-testid="bar" left={<StatusItem className="item-custom">Ready</StatusItem>} />
    );
    expect(screen.getByTestId('bar')).toHaveClass('bar-custom');
    expect(screen.getByText('Ready')).toHaveClass('item-custom');
  });

  it('forwards native props to the footer and items', () => {
    render(
      <StatusBar
        aria-label="Editor status"
        data-testid="bar"
        id="status"
        left={
          <>
            <StatusItem data-testid="item" title="Encoding">UTF-8</StatusItem>
            <StatusItem data-testid="action" title="Notifications" onSelect={() => undefined}>
              Bell
            </StatusItem>
          </>
        }
      />
    );
    expect(screen.getByTestId('bar')).toHaveAttribute('id', 'status');
    expect(screen.getByRole('contentinfo')).toHaveAccessibleName('Editor status');
    expect(screen.getByTestId('item')).toHaveAttribute('title', 'Encoding');
    expect(screen.getByTestId('action')).toHaveAttribute('title', 'Notifications');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <StatusBar
        aria-label="Status"
        left={
          <>
            <StatusItem priority>main.tsx</StatusItem>
            <StatusItem>Ln 42</StatusItem>
          </>
        }
        right={
          <>
            <StatusItem onSelect={() => undefined}>Run tests</StatusItem>
            <StatusItem>UTF-8</StatusItem>
          </>
        }
      />
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
