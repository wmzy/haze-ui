import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Command, CommandInput, CommandList, CommandItem } from './index';

describe('Command', () => {
  it('renders children', () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandItem>Item 1</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <Command className="custom">
        <CommandInput />
      </Command>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('filters items on input', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    const input = screen.getByPlaceholderText('Search');
    await user.type(input, 'App');
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows all items when input is empty', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('moves focus into the list with ArrowDown from the input', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    const input = screen.getByPlaceholderText('Search');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Apple')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Banana')).toHaveFocus();
  });

  it('activates the focused option with Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem onSelect={onSelect}>Apple</CommandItem>
        </CommandList>
      </Command>
    );
    await user.click(screen.getByPlaceholderText('Search'));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('returns focus to the input on Escape from the list', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>Apple</CommandItem>
        </CommandList>
      </Command>
    );
    const input = screen.getByPlaceholderText('Search');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Apple')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(input).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
