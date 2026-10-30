import type { ComponentProps } from 'react';

import { expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from './index';
import { commandItemScore, commandItemText, fuzzyMatch } from './command-filter';

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

  it('filters from a consumer-provided initial query', () => {
    render(
      <Command query='App'>
        <CommandInput />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('filters by explicit value when children are not plain text', () => {
    render(
      <Command query='cher'>
        <CommandInput />
        <CommandList>
          <CommandItem value='cherry'>
            <span>🍒</span> Cherry
          </CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText(/Cherry/)).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('extracts children text recursively as the default value', () => {
    render(
      <Command query='cher'>
        <CommandInput />
        <CommandList>
          <CommandItem>
            <span>🍒</span> Cherry
          </CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText(/Cherry/)).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('matches items through keywords beyond their text', () => {
    render(
      <Command query='pref'>
        <CommandInput />
        <CommandList>
          <CommandItem keywords={['preferences']}>Settings</CommandItem>
          <CommandItem>Editor</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.queryByText('Editor')).not.toBeInTheDocument();
  });

  it('orders matching items best fuzzy score first', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandItem>Mesa</CommandItem>
          <CommandItem>Banana</CommandItem>
          <CommandItem>Save</CommandItem>
        </CommandList>
      </Command>
    );
    await user.type(screen.getByPlaceholderText('Search'), 'sa');
    // Prefix hit (Save) outranks the middle hit (Mesa); the miss (Banana) drops.
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Save', 'Mesa']);
  });

  it('ranks contiguous runs ahead of scattered matches', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandItem>Status</CommandItem>
          <CommandItem>User</CommandItem>
        </CommandList>
      </Command>
    );
    await user.type(screen.getByPlaceholderText('Search'), 'us');
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['User', 'Status']);
  });

  it('matches and orders case-insensitively', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandItem>Mesa</CommandItem>
          <CommandItem>Save</CommandItem>
        </CommandList>
      </Command>
    );
    await user.type(screen.getByPlaceholderText('Search'), 'SA');
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Save', 'Mesa']);
  });

  it('keeps source order while the query is empty', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem>Save</CommandItem>
          <CommandItem>Mesa</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Save', 'Mesa', 'Banana']);
  });

  it('orders matching items within a group by score', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandGroup heading='Recent'>
            <CommandItem>Mesa</CommandItem>
            <CommandItem>Save</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    await user.type(screen.getByPlaceholderText('Search'), 'sa');
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Save', 'Mesa']);
  });

  it('shows all items and no empty row when shouldFilter is false', () => {
    render(
      <Command query='zzz' shouldFilter={false}>
        <CommandInput />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Apple', 'Banana']);
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  it('renders the empty message when nothing matches', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandItem>Apple</CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandList>
      </Command>
    );
    await user.type(screen.getByPlaceholderText('Search'), 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('renders a custom empty message', () => {
    render(
      <Command query='zzz'>
        <CommandInput />
        <CommandList empty='Nothing here'>
          <CommandItem>Apple</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders group headings and hides fully filtered groups', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandGroup heading='Fruit'>
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
          </CommandGroup>
          <CommandGroup heading='Vegetables'>
            <CommandItem>Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search'), 'car');
    expect(screen.queryByText('Fruit')).not.toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Carrot')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('hides a group with no children at all', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandGroup heading='Fruit'>
            <CommandItem>Apple</CommandItem>
          </CommandGroup>
          <CommandGroup heading='Empty' />
        </CommandList>
      </Command>
    );
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('keeps keyboard focus continuous across groups', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList>
          <CommandGroup heading='Fruit'>
            <CommandItem>Apple</CommandItem>
            <CommandItem>Banana</CommandItem>
          </CommandGroup>
          <CommandGroup heading='Vegetables'>
            <CommandItem>Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    await user.click(screen.getByPlaceholderText('Search'));
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(screen.getByText('Carrot')).toHaveFocus();
  });

  it('renders the shortcut badge on the item', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem shortcut='⌘N'>New File</CommandItem>
        </CommandList>
      </Command>
    );
    expect(screen.getByText('⌘N').tagName).toBe('KBD');
  });

  it('forwards CommandInput ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Command>
        <CommandInput ref={ref} placeholder='Search' />
      </Command>
    );
    expect(ref.current).toBe(screen.getByPlaceholderText('Search'));
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

describe('CommandList virtualized', () => {
  const manyItems = Array.from({ length: 300 }, (_, index) => `Command ${index + 1}`);

  function renderMany(listProps?: Partial<ComponentProps<typeof CommandList>>) {
    return render(
      <Command>
        <CommandInput placeholder='Search' />
        <CommandList virtualized {...listProps}>
          {manyItems.map((label) => (
            <CommandItem key={label}>{label}</CommandItem>
          ))}
        </CommandList>
      </Command>
    );
  }

  it('renders only the visible window of a long flat list', () => {
    renderMany();
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    // 300 mounted rows would defeat the point of virtualization.
    expect(options.length).toBeLessThan(50);
    expect(screen.getByText('Command 1')).toBeInTheDocument();
    expect(screen.queryByText('Command 300')).not.toBeInTheDocument();
  });

  it('windows the list as the scrollport scrolls', () => {
    const { container } = renderMany();
    const port = container.querySelector<HTMLElement>('[data-virtualized]');
    expect(port).not.toBeNull();
    if (!port) throw new Error('virtualized scrollport missing');
    // Row height 37 × item 250 — deep in the list.
    port.scrollTop = 37 * 250;
    fireEvent.scroll(port);
    expect(screen.getByText('Command 251')).toBeInTheDocument();
    expect(screen.queryByText('Command 1')).not.toBeInTheDocument();
  });

  it('filters and ranks through the virtual path', async () => {
    const user = userEvent.setup();
    renderMany();
    await user.type(screen.getByPlaceholderText('Search'), 'Command 29');
    const options = screen.getAllByRole('option');
    expect(options.length).toBeLessThan(50);
    // Best score first: the contiguous 'Command 29' outranks 'Command 209'
    // (scattered digits); ties keep source order.
    expect(options[0]?.textContent).toBe('Command 29');
    expect(screen.queryByText('Command 5')).not.toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderMany();
    await user.type(screen.getByPlaceholderText('Search'), 'zzz');
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Command 1' })).not.toBeInTheDocument();
  });

  it('keeps windows unfiltered when shouldFilter is false', () => {
    render(
      <Command query='zzz' shouldFilter={false}>
        <CommandInput />
        <CommandList virtualized>
          {manyItems.map((label) => (
            <CommandItem key={label}>{label}</CommandItem>
          ))}
        </CommandList>
      </Command>
    );
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThan(50);
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  it('moves focus into the virtual window with ArrowDown', async () => {
    const user = userEvent.setup();
    renderMany();
    await user.click(screen.getByPlaceholderText('Search'));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Command 1')).toHaveFocus();
  });

  it('warns and falls back to plain rendering for grouped children', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Command>
        <CommandInput />
        <CommandList virtualized>
          <CommandGroup heading='Fruit'>
            <CommandItem>Apple</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('virtualized'));
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    // Plain path: no VirtualList port mounted.
    expect(
      screen.getByRole('listbox').querySelector('[data-virtualized]')
    ).toBeNull();
    warn.mockRestore();
  });
});

describe('command-filter fuzzy scoring', () => {
  it('matches empty queries and rejects misses', () => {
    expect(fuzzyMatch('', 'anything')).toEqual({ matched: true, score: 0 });
    expect(fuzzyMatch('zzz', 'Apple').matched).toBe(false);
  });

  it('scores prefix hits above middle hits', () => {
    expect(fuzzyMatch('sa', 'Save').score).toBeGreaterThan(
      fuzzyMatch('sa', 'Mesa').score
    );
  });

  it('scores contiguous runs above scattered matches', () => {
    expect(fuzzyMatch('us', 'User').score).toBeGreaterThan(
      fuzzyMatch('us', 'Status').score
    );
  });

  it('scores word starts and camelCase humps above word middles', () => {
    expect(fuzzyMatch('fb', 'fooBar').score).toBeGreaterThan(
      fuzzyMatch('fb', 'foobar').score
    );
    expect(fuzzyMatch('fb', 'foo-bar').score).toBeGreaterThan(
      fuzzyMatch('fb', 'foobar').score
    );
  });

  it('scores earlier matches above later ones', () => {
    expect(fuzzyMatch('z', 'za').score).toBeGreaterThan(
      fuzzyMatch('z', 'az').score
    );
  });

  it('matches case-insensitively at equal scores', () => {
    expect(fuzzyMatch('APP', 'apple').matched).toBe(true);
    expect(fuzzyMatch('app', 'Apple').score).toBe(fuzzyMatch('app', 'apple').score);
  });

  it('scores items through value, children text and keywords', () => {
    expect(commandItemScore({ value: 'cherry' }, 'cher')).not.toBeNull();
    expect(commandItemScore({ children: ['🍒', ' Cherry'] }, 'cher')).not.toBeNull();
    expect(commandItemScore({ keywords: ['preferences'] }, 'pref')).not.toBeNull();
    expect(commandItemScore({ value: 'Settings' }, 'zzz')).toBeNull();
    expect(commandItemScore({}, '')).toBe(0);
  });
});

describe('commandItemText', () => {
  it('drops boolean children like React does', () => {
    expect(commandItemText(true)).toBe('');
    expect(commandItemText(false)).toBe('');
  });

  it('walks mixed children depth-first in document order', () => {
    expect(commandItemText(['🍒', ' Cherry'])).toBe('🍒 Cherry');
    expect(commandItemText([true, <span key="s">pie {false}</span>])).toBe(
      'pie '
    );
  });
});
